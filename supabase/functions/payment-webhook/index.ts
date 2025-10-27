import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createHmac } from 'node:crypto';

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

    const body = await req.json();
    const signature = req.headers.get('x-paystack-signature') || req.headers.get('verif-hash');

    let provider: 'paystack' | 'flutterwave' = 'paystack';
    let reference = '';
    let status = '';
    let amount = 0;

    if (req.headers.get('x-paystack-signature')) {
      provider = 'paystack';
      const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
      
      if (paystackKey) {
        const hash = createHmac('sha512', paystackKey)
          .update(JSON.stringify(body))
          .digest('hex');
        
        if (hash !== signature) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid signature' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          );
        }
      }

      if (body.event === 'charge.success') {
        reference = body.data.reference;
        status = 'successful';
        amount = body.data.amount / 100;
      }
    } else if (req.headers.get('verif-hash')) {
      provider = 'flutterwave';
      const flutterwaveKey = Deno.env.get('FLUTTERWAVE_SECRET_HASH');
      
      if (flutterwaveKey && signature !== flutterwaveKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (body.event === 'charge.completed' && body.data.status === 'successful') {
        reference = body.data.tx_ref;
        status = 'successful';
        amount = body.data.amount;
      }
    }

    if (!reference) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid webhook data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({ status })
      .eq('provider_reference', reference)
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    if (status === 'successful') {
      const { data: order } = await supabase
        .from('orders')
        .update({ status: 'paid_in_escrow' })
        .eq('id', payment.order_id)
        .select()
        .single();

      if (order) {
        const holdUntil = new Date();
        holdUntil.setDate(holdUntil.getDate() + 14);

        await supabase.from('escrows').insert({
          order_id: order.id,
          amount: payment.amount,
          status: 'holding',
          hold_until: holdUntil.toISOString(),
        });

        await supabase.from('notifications').insert([
          {
            user_id: order.buyer_id,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment of GHS ${amount} has been received and held in escrow.`,
            data: { order_id: order.id },
          },
          {
            user_id: order.seller_id,
            type: 'new_order',
            title: 'New Order Received',
            message: `You have a new order. Please prepare for shipment.`,
            data: { order_id: order.id },
          },
        ]);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});