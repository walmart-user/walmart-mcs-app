import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log('🔔 Fulfillment notification received');
  
  try {
    const webhookData = await authenticate.webhook(request);
    console.log('📦 Webhook data:', JSON.stringify(webhookData, null, 2));
    
    return new Response(JSON.stringify({ 
      status: 'success', 
      timestamp: new Date().toISOString()
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
