import {useEffect, useState} from 'react';
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

const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const {i18n, data, ui} = useApi(TARGET);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contextualSaveBarShown, setContextualSaveBarShown] = useState(false);
  
  // Mock Walmart sync status - in real app, this would come from your API
  const [walmartOrderStatus, setWalmartOrderStatus] = useState({
    synced: false,
    walmartOrderId: null,
    syncDate: null,
    trackingNumber: null,
    fulfillmentStatus: null,
  });

  // Use direct API calls to fetch data from Shopify.
  useEffect(() => {
    (async function getOrderInfo() {
      try {
        console.log('🔄 Fetching order info for:', data?.selected?.[0]?.id);
        
        const result = await data.query(`
          query Order($id: ID!) {
            order(id: $id) {
              id
              name
              createdAt
              displayFulfillmentStatus
              fulfillmentOrders(first: 5) {
                nodes {
                  id
                  status
                  assignedLocation {
                    name
                  }
                }
              }
              customer {
                displayName
                email
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        `, {
          variables: {
            id: data?.selected?.[0]?.id || '',
          },
        });

        if (result.data?.order) {
          setOrderInfo(result.data.order);
          
          // Simulate checking Walmart sync status
          setTimeout(() => {
            const isSync = Math.random() > 0.5; // Random for demo
            setWalmartOrderStatus({
              synced: isSync,
              walmartOrderId: isSync ? 'WM-ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase() : null,
              syncDate: isSync ? new Date().toISOString() : null,
              trackingNumber: isSync && Math.random() > 0.5 ? '1Z999AA' + Math.random().toString(36).substr(2, 6).toUpperCase() : null,
              fulfillmentStatus: isSync ? (Math.random() > 0.5 ? 'Shipped' : 'Processing') : null,
            });
            setIsLoading(false);
          }, 800);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setIsLoading(false);
      }
    })();
  }, [data]);

  // Effect to show contextual save bar when order status changes
  useEffect(() => {
    if (!isLoading && !contextualSaveBarShown) {
      showContextualSaveBar();
    }
  }, [walmartOrderStatus, isLoading]);

  // Function to show contextual save bar for unsynced orders
  const showContextualSaveBar = () => {
    if (isLoading || contextualSaveBarShown) {
      return;
    }

    // Show contextual save bar for unsynced orders
    if (!walmartOrderStatus.synced) {
      console.log('🚨 Attempting to show contextual save bar');
      
      try {
        if (ui && ui.contextualSaveBar) {
          ui.contextualSaveBar.show({
            title: 'Walmart Sync Required',
            message: 'This order needs to be synchronized with Walmart Marketplace',
            saveAction: {
              label: 'Sync to Walmart',
              action: () => {
                console.log('Sync to Walmart clicked');
                // Here you would implement the actual sync logic
                ui.contextualSaveBar.hide();
              }
            },
            discardAction: {
              label: 'Skip for now',
              action: () => {
                console.log('Skip for now clicked');
                ui.contextualSaveBar.hide();
              }
            }
          });
          
          setContextualSaveBarShown(true);
          console.log('✅ Contextual save bar shown successfully');
        } else {
          console.log('❌ Contextual save bar API not available');
        }
      } catch (error) {
        console.error('❌ Error showing contextual save bar:', error);
      }
    } else {
      console.log('ℹ️ Order already synced, no contextual save bar needed');
    }
  };

  if (isLoading) {
    return (
      <AdminBlock title="Walmart Order Integration (Contextual)">
        <BlockStack gap="300">
          <Text>Loading order information...</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  if (!orderInfo) {
    return (
      <AdminBlock title="Walmart Order Integration (Contextual)">
        <BlockStack gap="300">
          <Text tone="critical">Failed to load order information</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  return (
    <AdminBlock title="Walmart Order Integration (Contextual)">
      <BlockStack gap="300">
        {/* Order Basic Info */}
        <BlockStack gap="200">
          <InlineStack gap="200" align="space-between">
            <Text variant="headingMd">Order: {orderInfo.name}</Text>
            <Badge tone={orderInfo.displayFulfillmentStatus === 'fulfilled' ? 'success' : 'attention'}>
              {orderInfo.displayFulfillmentStatus || 'Unfulfilled'}
            </Badge>
          </InlineStack>
          
          <Text tone="subdued">
            Customer: {orderInfo.customer?.displayName || 'N/A'} 
            {orderInfo.customer?.email && ` (${orderInfo.customer.email})`}
          </Text>
          
          <Text tone="subdued">
            Total: {orderInfo.totalPriceSet?.shopMoney?.amount} {orderInfo.totalPriceSet?.shopMoney?.currencyCode}
          </Text>
        </BlockStack>

        <Divider />

        {/* Walmart Integration Status */}
        <BlockStack gap="200">
          <InlineStack gap="200" align="space-between">
            <Text variant="headingMd">Walmart Status</Text>
            <Badge tone={walmartOrderStatus.synced ? 'success' : 'critical'}>
              {walmartOrderStatus.synced ? 'Synced' : 'Not Synced'}
            </Badge>
          </InlineStack>

          {walmartOrderStatus.synced ? (
            <BlockStack gap="100">
              <Text tone="subdued">Walmart Order ID: {walmartOrderStatus.walmartOrderId}</Text>
              <Text tone="subdued">Sync Date: {new Date(walmartOrderStatus.syncDate).toLocaleDateString()}</Text>
              {walmartOrderStatus.fulfillmentStatus && (
                <Text tone="subdued">Status: {walmartOrderStatus.fulfillmentStatus}</Text>
              )}
              {walmartOrderStatus.trackingNumber && (
                <Text tone="subdued">Tracking: {walmartOrderStatus.trackingNumber}</Text>
              )}
            </BlockStack>
          ) : (
            <Text tone="critical">
              Order requires synchronization with Walmart Marketplace. Use contextual save bar to sync.
            </Text>
          )}
        </BlockStack>

        <Divider />
        
        {/* Fulfillment Orders */}
        {orderInfo.fulfillmentOrders?.nodes?.length > 0 && (
          <BlockStack gap="200">
            <Text variant="headingMd">Fulfillment Orders</Text>
            {orderInfo.fulfillmentOrders.nodes.map((fo, index) => (
              <InlineStack key={fo.id} gap="200" align="space-between">
                <Text>#{index + 1} - {fo.assignedLocation?.name || 'No location'}</Text>
                <Badge tone={fo.status === 'open' ? 'attention' : 'success'}>{fo.status}</Badge>
              </InlineStack>
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </AdminBlock>
  );
}