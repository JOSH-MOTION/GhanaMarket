import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, seller_profiles!inner(user_id)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (order.buyer_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Only buyer can confirm delivery' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (order.status !== 'delivered') {
      return new Response(
        JSON.stringify({ success: false, error: 'Order must be delivered before releasing escrow' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (escrowError || !escrow) {
      return new Response(
        JSON.stringify({ success: false, error: 'Escrow not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (escrow.status !== 'holding') {
      return new Response(
        JSON.stringify({ success: false, error: 'Escrow already released or refunded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const releaseReference = `REL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await supabase
      .from('escrows')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
        release_reference: releaseReference,
        notes: 'Funds released to seller upon buyer confirmation',
      })
      .eq('id', escrow.id);

    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    await supabase
      .from('seller_profiles')
      .update({ total_sales: order.seller_profiles.total_sales + 1 })
      .eq('id', order.seller_id);

    await supabase.from('notifications').insert([
      {
        user_id: order.buyer_id,
        type: 'order_completed',
        title: 'Order Completed',
        message: 'Your order has been completed successfully. Thank you!',
        data: { order_id: orderId },
      },
      {
        user_id: order.seller_profiles.user_id,
        type: 'payment_released',
        title: 'Payment Released',
        message: `Payment of GHS ${escrow.amount} has been released to your account.`,
        data: { order_id: orderId, amount: escrow.amount, reference: releaseReference },
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Escrow released successfully',
        reference: releaseReference,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Escrow release error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Escrow release failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});