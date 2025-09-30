import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🏪 Walmart API proxy called');
    
    // Use the latest access token
    const accessToken = 'eyJraWQiOiIyNGE5MDc5YS01YzcyLTQwYjAtOWQyMi1kYzg3ZDAzNWQxM2MiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..Gfc4aR66IIMiLuLf.2JkVAAgOXY8KF__r__IlisAgsvXcw5h8hBmeUAHpr4NUDkFl6spCZ53n9kBuTrbViD1V2vR_b9LUHONj9WJP4CnCkCvB84jblujZH0CurQieWgVk-qY3x1o5v3q9cw3hqKIWZuD1og4SP0mco8YTCR2apLWxKm8KJrUaD-72Q4XPw77JOdci992wOK7HuJ1BkTqF8wrZZPJ3mXMK2nA3GEz3-bLNFkSZVkhvZ2NiBf9X95DNcyj1HouSR11hfxNhXs000AOp0MldNb7ZUTd4cmPzp5L4c4oWRzOEKBSCKLYky_HpdHLxQzJuPdOChjitrVBYbPVdvSdsEWm6PoZdHJ-IjqpmehxcU3PpNkg5rIrNAu8CCEmzTZ2yenC-otiZnsf_nFGyd8pdKqpZ_N7xUBcN4-5iw3kSfngALqXCwYY0JTT0mKZWrDex4vbVWszH6GzFkoak2_JC8hyoAdKduZxx1xQF_87JhChH5rRFykF4H3XTM6uMReNETHNMG50lnazVCcWFv17zyw791fSmQjNARYmrOftoXenOa9mB2CqgxcRKweqzGICsXXZcYn6dkXlAJ28XAg93NVjrCtDijpO2U1gJQBV3A_qq98JOPddfFbiZuuGyi1QBInySL_xHMPuXjF6yf5lJK4glkygDt5THP5O83_yWJYaLjwJAg_NR1Rn9yl91ePI3XJgb.7fSA9FHD3HghWGcmPgpJbw';

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
