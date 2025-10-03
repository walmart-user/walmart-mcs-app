import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import crypto from "crypto";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Use console.error for better visibility in Vercel logs
  console.error('🔔 FULFILLMENT NOTIFICATION RECEIVED!');
  console.error('📋 Request method:', request.method);
  console.error('🔗 Request URL:', request.url);
  console.error('⏰ Timestamp:', new Date().toISOString());
  
  try {
    // Log headers with console.error for better visibility
    console.error('📤 REQUEST HEADERS:');
    const headers: Record<string, string> = {};
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
      console.error(`  ${key}: ${value}`);
    }
    
    // Get raw body for HMAC validation
    const rawBody = await request.text();
    console.error('📄 RAW REQUEST BODY:', rawBody);

    // const { shop, payload } = await authenticate.webhook(request);
    
    // Fulfillment service callbacks use different authentication than webhooks
    // They use HMAC-SHA256 with the app's secret, but different headers
    const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
    const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
    
    console.error('🔐 HMAC Header:', hmacHeader);
    console.error('🏪 Shop Domain:', shopDomain);
    
    // Now validate the HMAC properly
    if (hmacHeader && process.env.SHOPIFY_API_SECRET) {
      console.error('🔒 Validating HMAC...');
      
      const calculatedHmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
        .update(rawBody, 'utf8')
        .digest('base64');
      
      console.error('🔑 Received HMAC:', hmacHeader);
      console.error('🧮 Calculated HMAC:', calculatedHmac);
      
      if (!crypto.timingSafeEqual(
        Buffer.from(hmacHeader, 'base64'), 
        Buffer.from(calculatedHmac, 'base64')
      )) {
        console.error('❌ HMAC validation failed - signatures do not match');
        return new Response(JSON.stringify({ 
          status: 'error', 
          message: 'HMAC validation failed',
          timestamp: new Date().toISOString()
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.error('✅ HMAC validation successful');
    } else {
      console.error('⚠️ HMAC validation skipped - missing header or secret');
    }
    
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON body:', parseError);
      payload = rawBody; // Keep as string if not JSON
    }
    
    console.error(`🏪 SHOP: ${shopDomain}`);
    console.error('📦 PAYLOAD:');
    console.error(JSON.stringify(payload, null, 2));
    
    // Log the kind of request if it exists
    const fulfillmentData = payload as any;
    if (fulfillmentData.kind) {
      console.error(`🎯 REQUEST KIND: ${fulfillmentData.kind}`);
    }

    // Return successful response with detailed logging
    console.error('✅ FULFILLMENT NOTIFICATION PROCESSED SUCCESSFULLY');
    return new Response(JSON.stringify({ 
      status: 'success', 
      timestamp: new Date().toISOString(),
      shop: shopDomain,
      requestKind: fulfillmentData.kind || 'unknown',
      hasHmac: !!hmacHeader
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR PROCESSING FULFILLMENT NOTIFICATION:', error);
    console.error('❌ ERROR DETAILS:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return error response with logging
    return new Response(JSON.stringify({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
