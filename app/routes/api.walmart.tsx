import { json, type LoaderFunctionArgs } from "@remix-run/node";

// Handle CORS preflight requests
export async function options() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://extensions.shopifycdn.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🏪 Walmart API proxy called');
    
    // Use the latest access token
    const accessToken = 'eyJraWQiOiIyNGE5MDc5YS01YzcyLTQwYjAtOWQyMi1kYzg3ZDAzNWQxM2MiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..Iql5yBv4CRk5pEVC.J00SzP6YTRcS4eNaHov8z0tnSlgN2jQ0zNNLsTjIYgXhtaTMSSXcfQ8BCTgAwHwUU88u92twpKrqiwxGlcFlyVvZLHucBDYImqrNSOfokZbbdsuYqqJkfVi55mitEJyaLzrRkvaJL4h4siumH11zSXUVRlprbPIdngqyE5ovlPDZ6bfxsNJTgIb4LILiDAAWbmj9UrptHjqeHXJ4NNgf-IHLXPopuhusVnWTl9FcGvctRaSPo49yGiL-39XyOvGykQUbjkzcrVM-7VuvMWRd8c-Hj-Tuueg_gUhx5dhuDmpFS8tCOw6E1U3Rq1-EcLSRefGAc5Um85_0QqebWj9fr_OWqwOMk4jzniLb3O0xTv9lJeffXJiWtNaBE4CHqCGAicE_7bNf7lfFke01UveUlgdKoD1JAOCgWvE8ZIwv4pEHQCbsygzD0howt1oR8LA0NRAc3rjKVcs1jYXY4Vc4G2vpsQDKydF__8eksvlc5x9px4z_U5OeQAIOAT-GQy3Zn-LDnSlXTF6c_TfoWEd94rY15irmKKLQdRAuYvoF3whMIN0IHyiB1aQ5rtl45_NBn2F0uaUxEc9yflN73vxLRsRICIGRUQtsexnRf-rMT9BpcgXS0pOUYSw1xIt_t9ZxAiEX9H17N-aPUjYuJ-uXGG8Mhu992nL6KIJC9hDHQnWO83Nr42RcQtm70SDC.IozRqY1Ca-RnZv46MXSArA';

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
    
    return json(data, {
      headers: {
        'Access-Control-Allow-Origin': 'https://extensions.shopifycdn.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
    });
    
  } catch (error) {
    console.error('❌ Walmart API proxy error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://extensions.shopifycdn.com',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
        },
      }
    );
  }
}
