import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🏪 Walmart API proxy called');
    
    // Hardcoded access token (same as in extension for now)
    const accessToken = 'eyJraWQiOiIyNGE5MDc5YS01YzcyLTQwYjAtOWQyMi1kYzg3ZDAzNWQxM2MiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..lHfZf83-RVgq7kcX.N0rl3qyg4yc8Q-5n4PYhAfpYm1tN8UO9OfhPRIPPNvdNoBPPNPq3I5QUyfCMKcW4w97vJKsLoOkpac6MWsmxLRXZER8Vywy3vZHXXEHc6wNRsvZCmcU869AIUo2y83Pr2DFjh-szhsXJPvCAnAmosrJWCxBbPNsKflSkWARhk896qzth9jH4jMXZtlHlRQdsUebMtj3AVCXaHU585niRNPGXeS6ZeHWPyHXX-ZqrGok739gEMxxT8ZB6rcXE2ZXNkvs48M5EyWmSe-zLCs-A-cs6QLiUpuGRoVTiI9CHEnlu7Drc6N55yraWs4ed7ynTz5Vl5Ln4xPSxZEOAEmWck3Dd65tuqGl5C8Twg4j1OcNa_nI6uXWfFFLNpz5o8oRXZ29obOYjrqO-nlAJ8qLSxEAQkkZCqQgaPdXI9Wkruq8z2Xs3BxfgBxvTdQugYRq1Zfm_pAFvIWxYTYHvd1zlAO6J5Rm48eS92106RreQHLs3nKDIrnDFSOcVqLYeci_XVE9YFcGq2Recvpf1mlb7ll8EfO9OE81co6oY7cVJsOasLcqalHiUxUSW_hgMxaUsYufVWST0uJRrbSgo-QKlxuYj8Ewb7qp2Pk-OrLi0t81gHw72QMAu__HBG-QFoE_b2SUke9qekGMaN2ghYkWfHNp3Hg7rv8nGsIB7XeWlReG70dxqX7E-SjCBWmPA.FeoEqhxshuCSgE84tW43dQ';

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
