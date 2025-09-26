import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    console.log('🔔 Fulfillment order notification received!');
    console.log('📋 Request method:', request.method);
    console.log('🔗 Request URL:', request.url);
    
    // Log headers
    console.log('📤 Request headers:');
    for (const [key, value] of request.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Authenticate the callback request (same as webhook authentication)
    const { shop, payload } = await authenticate.webhook(request);
    
    console.log(`🏪 Shop: ${shop}`);
    console.log('📦 Full payload received:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Log the kind of request if it exists
    const fulfillmentData = payload as any;
    if (fulfillmentData.kind) {
      console.log(`🎯 Request kind: ${fulfillmentData.kind}`);
    }

    // Just return OK for now - we're only logging
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('❌ Error processing fulfillment notification:', error);
    
    // Also try to log the raw request body if authentication fails
    try {
      const rawBody = await request.text();
      console.log('📄 Raw request body:', rawBody);
    } catch (bodyError) {
      console.error('❌ Could not read raw body:', bodyError);
    }
    
    return new Response('Error', { status: 500 });
  }
};
