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
      console.log('🏪 Fetching Walmart data via proxy...');
      
      // Call our Remix API route (proxy to avoid CORS)
      const response = await fetch('https://walmart-mcs-app.vercel.app/api/walmart', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📡 Proxy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API responded with status: ${response.status}`);
      }

      const apiData = await response.json();
      console.log('✅ Walmart data received:', apiData);
      
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