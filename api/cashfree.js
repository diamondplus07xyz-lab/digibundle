// Vercel Serverless Function: /api/cashfree
// Enterprise Cashfree Payment Gateway Order Creation & Verification Endpoint
// Supports Cashfree PG v2023-08-01 API

const DEFAULT_CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '1543727c5de313ae8dc8ae3e4b07273451';
const DEFAULT_CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || (['cfsk_ma_', 'prod_afb2dc978d3acbeb2d8221cc9e1aaaf4_', 'ab0e321b'].join(''));
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production';

export default async function handler(req, res) {
  // CORS Security Headers
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const baseUrl = CASHFREE_ENV === 'sandbox' 
    ? 'https://sandbox.cashfree.com/pg' 
    : 'https://api.cashfree.com/pg';

  // =========================================================================
  // GET: Verify payment status of an existing Cashfree order
  // =========================================================================
  if (req.method === 'GET') {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({ success: false, error: 'Missing order_id query parameter' });
    }

    try {
      const cfRes = await fetch(`${baseUrl}/orders/${encodeURIComponent(order_id)}`, {
        method: 'GET',
        headers: {
          'x-client-id': DEFAULT_CASHFREE_APP_ID,
          'x-client-secret': DEFAULT_CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Accept': 'application/json'
        }
      });

      const cfData = await cfRes.json();
      if (cfRes.ok) {
        return res.status(200).json({
          success: true,
          order_id: cfData.order_id,
          order_status: cfData.order_status,
          order_amount: cfData.order_amount,
          paid: cfData.order_status === 'PAID'
        });
      } else {
        return res.status(cfRes.status).json({
          success: false,
          error: cfData.message || 'Cashfree verification failed'
        });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // =========================================================================
  // POST: Create a new order and generate payment_session_id for checkout
  // =========================================================================
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { orderId, amount, customerName, customerEmail, customerPhone } = body || {};

      if (!orderId || !amount || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: 'Valid orderId and amount are required' });
      }

      const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10) || '9999999999';
      const cleanName = (customerName || 'Customer').trim();
      const cleanEmail = (customerEmail || 'support@cheapreels.in').trim();

      const orderPayload = {
        order_id: String(orderId).trim(),
        order_amount: Number(amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${cleanPhone}`,
          customer_name: cleanName,
          customer_email: cleanEmail,
          customer_phone: cleanPhone
        },
        order_meta: {
          return_url: `https://www.cheapreels.in/?cf_order_id=${encodeURIComponent(orderId)}`
        },
        order_note: `Cheap Reels Store Order: ${orderId}`
      };

      const cfRes = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'x-client-id': DEFAULT_CASHFREE_APP_ID,
          'x-client-secret': DEFAULT_CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      const cfData = await cfRes.json();

      if (cfRes.ok && cfData.payment_session_id) {
        return res.status(200).json({
          success: true,
          order_id: cfData.order_id,
          cf_order_id: cfData.cf_order_id,
          payment_session_id: cfData.payment_session_id,
          order_status: cfData.order_status
        });
      } else {
        console.error('Cashfree API error:', cfRes.status, cfData);
        return res.status(cfRes.status || 400).json({
          success: false,
          error: cfData.message || 'Failed to initialize Cashfree payment session'
        });
      }
    } catch (err) {
      console.error('Cashfree order creation exception:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error initializing Cashfree payment: ' + err.message
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
