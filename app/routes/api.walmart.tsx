import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🏪 Walmart API proxy called');
    
    // Use the latest access token
    const accessToken = 'eyJraWQiOiIyNGE5MDc5YS01YzcyLTQwYjAtOWQyMi1kYzg3ZDAzNWQxM2MiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..GdKfnsZhKkJ6b26W.CIm3H9P62VrqBx0qGWAByEmYiD7T8nl0IloTYDtNVWlh7x3y2HM4LXNCVcG-bZtCQNWmdpkiIU91OXMO2gAzYBpuuN9y4K8QqTBMuIELSeZ5_OTrU5Y1_mKpiXLkLiZYzaL-7xVW6XNQUqYu7qbKS6Ewjv2K_ye3fcX6BhXmXnXJ_6x0a173X0v-H7lM24UZmAHRltGD9qwCjgKlwEvcCJe_6__2RaZ07Pe5E_C-WjsJGL2vblh3fqH4K-5RFT8LSun_Mwxs0iNQDalUGSHHpWuMj70qW72ONgxJPdmS65RUu-cc8nidxrrLpZmz_J94-va5cU-BRu2hmmfd41URF25_MKNThj8mwRGikS9ksh_XdfC0NOaVz0WOLShHkR5VIfmqjcQyfEm-0bUhoHFB4n4q_TSyojWr-3T-pYlKof6UiF4a9Cmhfwoek0xO2114o0gWxNhQFKsiFZYkIpFW4rJZ_pOdzBGPRY3M46ytYswjxx3mhPyfCBJ3zzshw9IO3V3iExhOP5SzJ24Q-B8ZJdQYMXwqsiqptEjS-lmoS6LUYVVAQQgmAk9ZmvinbyvkjxFuD6qbotBfqm9lixmf96E5dRwgOar8ecTEnzxZS61IsPOjOV2oIb8c-VgpQuJ4qXmbp1Wi6cR8VrYGUSQJC8gIV60GBw3iOOAstJHUMgdDrWgc9p5XH6mKSWgv.wy6EfXUCJxyykaapAfpFdA';

    const response = await fetch('https://marketplace.walmartapis.com/v3/fulfillment/orders-fulfillments/channel-details', {
      method: 'GET',
      headers: {
        'loggedInUser': 'Harsh',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'martId': '202',
        'WM_SEC.ACCESS_TOKEN': accessToken,
        'WM_QOS.CORRELATION_ID': 'Test Update Channel',
        'WM_SVC.NAME': 'Walmart Marketplace',
        'wm_mart_id': '202'
      },
    });

    console.log('📡 Walmart API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Walmart API error:', errorText);
      throw new Error(`Walmart API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Walmart API success');
    
    return json(data);
    
  } catch (error) {
    console.error('❌ Walmart API proxy error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
