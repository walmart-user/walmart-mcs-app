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
      console.log('🏪 Fetching Walmart API data directly...');
      
      // Call Walmart API directly with updated access token
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