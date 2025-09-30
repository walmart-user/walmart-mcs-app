import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('🏪 Walmart API proxy called');
    
    // Hardcoded access token (same as in extension for now)
    const accessToken = 'eyJraWQiOiIyNGE5MDc5YS01YzcyLTQwYjAtOWQyMi1kYzg3ZDAzNWQxM2MiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..uyNmDIsqE8H_mc9w.iaM282D5K3TS41AHGm5nEH0r34pRVcwQyZKCICQohuOQZTqMAoj6g9gaSm6Z0PmsiuV5mtipQmNL8uoYe4eZ_nQbH61bmDtvq6hcQPemV38sJpgxcuDapffRMj3sRDTN2AWgpbIyyG6gnEIFY1fSS4iWW3VtINnj5c9Mj0q1M3OZ8P08lOjSqqTUlIlK6ROl773duPt5nBWOP-IpbbBkJVu8yo2otZwWCBX3jwwmayZ3_lwofcb9O9gucuUbA1ItCLR4FMOFJafxHjurdmckcLfCBdneeTCnrQdYw23XjTh5amxTvORUSwWVI3fzYJBgx93vkOpBP5mWPtppStXeQRG1HpqRNEiG9-oMcIlBMNr8DhXIOdDmdzs-FBcLGDPXDCVGjHov0DfKAgaHzJTAZMwTCrU1QWk7bsL6NtKK9OWvk5E0JSjypciSZu4t6wifvZES6UimNZs5z8aLACx6X50hBXm92HA9pCzc6KdLgQCxh7k-FX-McAq0PqSrir2uhAskrojm81TaAeZycpZJhBzJl0H_PaCGD33SetdbCfhIWcTbZGaWOTAgUXZ9D7QiKN8cDAy8MtOatCy8dagYyKwVak0Y0Ut9RW00NoK3Tyzdkrsd7dduLq1oy_2lyUY79ugibSGcRi80Vpm_eTXqIwGRf-jNwqG-oriNWWzrxqk2VLHMZHFXfclBulma.yH8lnpXZbP7xF2iP9FkO5g';

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
