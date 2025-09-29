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
  Banner,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, data, and ui.
  const {i18n, data, ui} = useApi(TARGET);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveBarShown, setSaveBarShown] = useState(false);
  
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
      const orderQuery = `
        query Order($id: ID!) {
          order(id: $id) {
            id
            name
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              email
              displayName
            }
            fulfillmentStatus
            displayFulfillmentStatus
            displayFinancialStatus
            createdAt
            lineItems(first: 5) {
              nodes {
                title
                quantity
              }
            }
          }
        }
      `;

      try {
        const result = await data.query(orderQuery, {
          variables: {id: data.selected[0].id},
        });
        
        if (result.data?.order) {
          setOrderInfo(result.data.order);
          
          // Simulate checking Walmart sync status
          // In a real app, you'd call your backend API here
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
  if (!isLoading) {
    showContextualSaveBar();
  }
}, [walmartOrderStatus, isLoading]);

  const getSyncStatusBadge = () => {
    if (isLoading) {
      return <Badge tone="info">Checking...</Badge>;
    }
    
    if (walmartOrderStatus.synced) {
      return <Badge tone="success">Synced to Walmart</Badge>;
    }
    
    return <Badge tone="attention">Not Synced</Badge>;
  };

  const getFulfillmentBadge = () => {
    if (!walmartOrderStatus.synced || !walmartOrderStatus.fulfillmentStatus) {
      return null;
    }
    
    const status = walmartOrderStatus.fulfillmentStatus;
    const tone = status === 'Shipped' ? 'success' : 'info';
    
    return <Badge tone={tone}>{status}</Badge>;
  };

  const getLastSyncText = () => {
    if (isLoading || !walmartOrderStatus.syncDate) {
      return null;
    }
    
    const syncDate = new Date(walmartOrderStatus.syncDate);
    const timeAgo = Math.floor((Date.now() - syncDate.getTime()) / (1000 * 60)); // minutes ago
    
    if (timeAgo < 1) {
      return "Just now";
    } else if (timeAgo < 60) {
      return `${timeAgo}m ago`;
    } else if (timeAgo < 1440) {
      return `${Math.floor(timeAgo / 60)}h ago`;
    } else {
      return `${Math.floor(timeAgo / 1440)}d ago`;
    }
  };

  // Function to show contextual save bar based on order status
  const showContextualSaveBar = () => {
    if (isLoading || saveBarShown) {
      return; // Don't show if loading or already shown
    }

    // Show contextual save bar for unsynced orders
    if (!walmartOrderStatus.synced) {
      ui.contextualSaveBar.show({
        saveAction: {
          label: 'Sync to Walmart',
          onAction: async () => {
            console.log('Syncing order to Walmart...');
            // TODO: Implement actual sync logic here
            
            // Simulate sync process
            setTimeout(() => {
              setWalmartOrderStatus(prev => ({
                ...prev,
                synced: true,
                walmartOrderId: 'WM-ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                syncDate: new Date().toISOString()
              }));
              
              // Hide the save bar after successful sync
              ui.contextualSaveBar.hide();
              setSaveBarShown(false);
              
              // Show success toast
              ui.toast.show({
                message: 'Order successfully synced to Walmart!',
                duration: 3000
              });
            }, 2000);
          }
        },
        discardAction: {
          label: 'Dismiss',
          onAction: () => {
            ui.contextualSaveBar.hide();
            setSaveBarShown(false);
          }
        },
        message: '⚠️ This order requires Walmart synchronization to enable fulfillment'
      });
      
      setSaveBarShown(true);
    }

    // Show different save bar for sync errors (example)
    // You can add more conditions here based on your business logic
  };

  // Function to determine what banner to show based on order status (keeping for in-block banner)
  const getWalmartBanner = () => {
    if (isLoading) {
      return null; // Don't show banner while loading
    }

    // Since we're using contextual save bar for warnings, show informational banners here
    if (walmartOrderStatus.synced && !walmartOrderStatus.fulfillmentStatus) {
      return {
        tone: 'info',
        title: 'Walmart Sync Complete',
        children: 'Order successfully synchronized with Walmart. Awaiting fulfillment processing.'
      };
    }

    if (walmartOrderStatus.fulfillmentStatus === 'Shipped') {
      return {
        tone: 'success',
        title: 'Shipped via Walmart',
        children: `Order fulfilled by Walmart. Tracking: ${walmartOrderStatus.trackingNumber || 'Available soon'}`
      };
    }

    return null; // No banner needed
  };

  const bannerConfig = getWalmartBanner();

  return (
    <AdminBlock title="Walmart Order Integration">
      <BlockStack gap="300">
        {/* Conditional Warning Banner */}
        {bannerConfig && (
          <Banner tone={bannerConfig.tone} title={bannerConfig.title}>
            {bannerConfig.children}
          </Banner>
        )}

        {/* Order Info */}
        {orderInfo && (
          <>
            <InlineStack gap="200" blockAlignment="center">
              <Text appearance="subdued" size="small">Order:</Text>
              <Text size="small" fontWeight="medium">{orderInfo.name}</Text>
            </InlineStack>
            
            <InlineStack gap="200" blockAlignment="center">
              <Text appearance="subdued" size="small">Total:</Text>
              <Text size="small">
                {orderInfo.totalPriceSet.shopMoney.amount} {orderInfo.totalPriceSet.shopMoney.currencyCode}
              </Text>
            </InlineStack>
          </>
        )}

        <Divider />

        {/* Sync Status Row */}
        <InlineStack gap="200" blockAlignment="center">
          <Text appearance="subdued" size="small">Walmart Status:</Text>
          {getSyncStatusBadge()}
        </InlineStack>

        {/* Walmart Order ID Row (if synced) */}
        {walmartOrderStatus.synced && walmartOrderStatus.walmartOrderId && !isLoading && (
          <InlineStack gap="200" blockAlignment="center">
            <Text appearance="subdued" size="small">Walmart Order ID:</Text>
            <Text size="small" fontWeight="medium">{walmartOrderStatus.walmartOrderId}</Text>
          </InlineStack>
        )}

        {/* Fulfillment Status (if synced) */}
        {walmartOrderStatus.synced && walmartOrderStatus.fulfillmentStatus && !isLoading && (
          <InlineStack gap="200" blockAlignment="center">
            <Text appearance="subdued" size="small">Walmart Fulfillment:</Text>
            {getFulfillmentBadge()}
          </InlineStack>
        )}

        {/* Tracking Number (if available) */}
        {walmartOrderStatus.trackingNumber && !isLoading && (
          <InlineStack gap="200" blockAlignment="center">
            <Text appearance="subdued" size="small">Tracking:</Text>
            <Text size="small" fontWeight="medium">{walmartOrderStatus.trackingNumber}</Text>
          </InlineStack>
        )}

        {/* Last Sync Row */}
        {getLastSyncText() && (
          <InlineStack gap="200" blockAlignment="center">
            <Text appearance="subdued" size="small">Last sync:</Text>
            <Text size="small">{getLastSyncText()}</Text>
          </InlineStack>
        )}

        {/* Status Message */}
        {!isLoading && (
          <Text appearance="subdued" size="small">
            {walmartOrderStatus.synced 
              ? "Order is synchronized with Walmart Marketplace" 
              : "Order has not been synced to Walmart yet"
            }
          </Text>
        )}
      </BlockStack>
    </AdminBlock>
  );
}