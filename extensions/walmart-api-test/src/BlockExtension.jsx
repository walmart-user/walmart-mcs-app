import { useState, useEffect } from 'react';
import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Divider,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const {i18n, data} = useApi(TARGET);
  const [walmartData, setWalmartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalmartData();
  }, []);

  async function fetchWalmartData() {
    try {
      console.log('🏪 Fetching Walmart API data...');
      
      // Hardcode the access token for now (we'll move to env vars later if needed)
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
        throw new Error(`Walmart API responded with status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('✅ Walmart API response:', apiData);
      
      setWalmartData(apiData);
      
    } catch (err) {
      console.error('❌ Walmart API error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminBlock title={i18n.translate('name')}>
        <BlockStack>
          <InlineStack align="center">
            <Text>⏳ {i18n.translate('loading')}</Text>
          </InlineStack>
        </BlockStack>
      </AdminBlock>
    );
  }

  if (error) {
    return (
      <AdminBlock title={i18n.translate('name')}>
        <BlockStack>
          <Text tone="critical">{i18n.translate('error')}</Text>
          <Text variant="bodySmall" tone="subdued">{error}</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  if (!walmartData) {
    return (
      <AdminBlock title={i18n.translate('name')}>
        <BlockStack>
          <Text>{i18n.translate('noData')}</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  return (
    <AdminBlock title={i18n.translate('name')}>
      <BlockStack gap="tight">
        <InlineStack align="space-between">
          <Text fontWeight="bold">🏪 {i18n.translate('welcome')}</Text>
          <Badge tone="success">Connected</Badge>
        </InlineStack>
        
        <Divider />
        
        <BlockStack gap="extraTight">
          <Text fontWeight="semibold">{i18n.translate('channelDetails')}</Text>
          
          {walmartData.channelDetails && (
            <BlockStack gap="extraTight">
              {Object.entries(walmartData.channelDetails).map(([key, value]) => (
                <InlineStack key={key} align="space-between">
                  <Text variant="bodySmall">{key}:</Text>
                  <Text variant="bodySmall" fontWeight="semibold">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Text>
                </InlineStack>
              ))}
            </BlockStack>
          )}
          
          {walmartData.fulfillmentOrders && walmartData.fulfillmentOrders.length > 0 && (
            <>
              <Divider />
              <Text fontWeight="semibold">{i18n.translate('fulfillmentOrders')} ({walmartData.fulfillmentOrders.length})</Text>
              <BlockStack gap="extraTight">
                {walmartData.fulfillmentOrders.slice(0, 3).map((order, index) => (
                  <InlineStack key={index} align="space-between">
                    <Text variant="bodySmall">Order {index + 1}:</Text>
                    <Text variant="bodySmall" fontWeight="semibold">
                      {order.orderId || order.id || 'N/A'}
                    </Text>
                  </InlineStack>
                ))}
                {walmartData.fulfillmentOrders.length > 3 && (
                  <Text variant="bodySmall" tone="subdued">
                    ... and {walmartData.fulfillmentOrders.length - 3} more
                  </Text>
                )}
              </BlockStack>
            </>
          )}
        </BlockStack>
        
        <Divider />
        
        <Text variant="bodySmall" tone="subdued">
          🔗 Live data from Walmart Marketplace API
        </Text>
      </BlockStack>
    </AdminBlock>
  );
}