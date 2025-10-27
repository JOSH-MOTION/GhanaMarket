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

    const { orderId, amount, method, provider, phoneNumber, email, metadata } = await req.json();

    if (!orderId || !amount || !method || !provider || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const reference = `GHM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        method,
        provider,
        provider_reference: reference,
        amount,
        status: 'pending',
        phone_number: phoneNumber,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    const paymentResponse: Record<string, unknown> = {
      success: true,
      paymentId: payment.id,
      reference,
    };

    if (provider === 'paystack') {
      const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
      
      if (!paystackKey) {
        paymentResponse.instructions = 'Payment provider configuration pending. Using test mode.';
        paymentResponse.authorizationUrl = `https://checkout.paystack.com/test-${reference}`;
      } else {
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            amount: amount * 100,
            reference,
            currency: 'GHS',
            channels: method === 'card' ? ['card'] : ['mobile_money'],
            metadata: {
              ...metadata,
              order_id: orderId,
              payment_method: method,
            },
          }),
        });

        const paystackData = await paystackResponse.json();
        
        if (paystackData.status) {
          paymentResponse.authorizationUrl = paystackData.data.authorization_url;
        } else {
          throw new Error(paystackData.message || 'Paystack initialization failed');
        }
      }
    } else if (provider === 'flutterwave') {
      const flutterwaveKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
      
      if (!flutterwaveKey) {
        paymentResponse.instructions = 'Payment provider configuration pending. Using test mode.';
        paymentResponse.authorizationUrl = `https://checkout.flutterwave.com/test-${reference}`;
      } else {
        const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${flutterwaveKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tx_ref: reference,
            amount,
            currency: 'GHS',
            redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
            payment_options: method === 'card' ? 'card' : 'mobilemoneyghana',
            customer: {
              email,
              phonenumber: phoneNumber,
            },
            customizations: {
              title: 'GhanaMarket',
              description: `Payment for order ${orderId}`,
            },
            meta: {
              ...metadata,
              order_id: orderId,
              payment_method: method,
            },
          }),
        });

        const flutterwaveData = await flutterwaveResponse.json();
        
        if (flutterwaveData.status === 'success') {
          paymentResponse.authorizationUrl = flutterwaveData.data.link;
        } else {
          throw new Error(flutterwaveData.message || 'Flutterwave initialization failed');
        }
      }
    }

    if (method !== 'card') {
      paymentResponse.instructions = `Complete payment using your ${method.replace('_', ' ')} account. Reference: ${reference}`;
    }

    return new Response(
      JSON.stringify(paymentResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Payment initiation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});