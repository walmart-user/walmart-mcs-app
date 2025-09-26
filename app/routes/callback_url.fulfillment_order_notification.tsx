import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

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
    
    // Clone request to read body before authentication
    const requestClone = request.clone();
    const rawBody = await requestClone.text();
    console.error('📄 RAW REQUEST BODY:', rawBody);
    
    // Authenticate the callback request (same as webhook authentication)
    const { shop, payload } = await authenticate.webhook(request);
    
    console.error(`🏪 SHOP: ${shop}`);
    console.error('📦 AUTHENTICATED PAYLOAD:');
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
      shop: shop,
      requestKind: fulfillmentData.kind || 'unknown'
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
