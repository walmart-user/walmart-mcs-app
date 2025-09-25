import {useEffect, useState} from 'react';
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
  InlineStack,
  Badge,
  Divider,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {i18n, close, data} = useApi(TARGET);
  console.log({data});
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: '',
    totalPrice: '',
    customerEmail: '',
    fulfillmentStatus: ''
  });
  const [walmartSync, setWalmartSync] = useState({
    synced: false,
    walmartOrderId: null,
    lastSync: null
  });

  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getOrderInfo() {
      const getOrderQuery = {
        query: `query Order($id: ID!) {
          order(id: $id) {
            name
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            customer {
              email
            }
            displayFulfillmentStatus
          }
        }`,
        variables: {id: data.selected[0].id},
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getOrderQuery),
      });

      if (!res.ok) {
        console.error('Network error');
      }

      const orderData = await res.json();
      const order = orderData.data.order;
      setOrderInfo({
        orderNumber: order.name,
        totalPrice: `${order.totalPriceSet.shopMoney.amount} ${order.totalPriceSet.shopMoney.currencyCode}`,
        customerEmail: order.customer?.email || 'Guest',
        fulfillmentStatus: order.displayFulfillmentStatus
      });

      // Simulate checking Walmart sync status (this would be a real API call in production)
      setWalmartSync({
        synced: Math.random() > 0.5, // Random for demo
        walmartOrderId: `WM${Date.now().toString().slice(-6)}`,
        lastSync: new Date().toLocaleString()
      });
    })();
  }, [data.selected]);

  const handleSyncToWalmart = () => {
    console.log('Syncing order to Walmart...', orderInfo.orderNumber);
    // Here you would make an API call to your Vercel app to sync with Walmart
    setWalmartSync({
      synced: true,
      walmartOrderId: `WM${Date.now().toString().slice(-6)}`,
      lastSync: new Date().toLocaleString()
    });
  };

  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={
        <Button
          onPress={handleSyncToWalmart}
          disabled={walmartSync.synced}
        >
          {walmartSync.synced ? 'Synced' : 'Sync to Walmart'}
        </Button>
      }
      secondaryAction={
        <Button
          onPress={() => {
            console.log('closing');
            close();
          }}
        >
          Close
        </Button>
      }
    >
      <BlockStack gap="300">
        <Text fontWeight="bold">🛒 Walmart Order Tracker</Text>
        
        <Divider />
        
        <BlockStack gap="200">
          <Text fontWeight="semibold">Order Details</Text>
          <InlineStack gap="200">
            <Text>Order:</Text>
            <Text fontWeight="bold">{orderInfo.orderNumber}</Text>
          </InlineStack>
          <InlineStack gap="200">
            <Text>Total:</Text>
            <Text>{orderInfo.totalPrice}</Text>
          </InlineStack>
          <InlineStack gap="200">
            <Text>Customer:</Text>
            <Text>{orderInfo.customerEmail}</Text>
          </InlineStack>
          <InlineStack gap="200">
            <Text>Status:</Text>
            <Badge tone={orderInfo.fulfillmentStatus === 'FULFILLED' ? 'success' : 'attention'}>
              {orderInfo.fulfillmentStatus}
            </Badge>
          </InlineStack>
        </BlockStack>

        <Divider />

        <BlockStack gap="200">
          <Text fontWeight="semibold">Walmart Integration</Text>
          <InlineStack gap="200">
            <Text>Sync Status:</Text>
            <Badge tone={walmartSync.synced ? 'success' : 'critical'}>
              {walmartSync.synced ? 'Synced' : 'Not Synced'}
            </Badge>
          </InlineStack>
          {walmartSync.synced && (
            <>
              <InlineStack gap="200">
                <Text>Walmart Order ID:</Text>
                <Text fontWeight="bold">{walmartSync.walmartOrderId}</Text>
              </InlineStack>
              <InlineStack gap="200">
                <Text>Last Sync:</Text>
                <Text>{walmartSync.lastSync}</Text>
              </InlineStack>
            </>
          )}
        </BlockStack>
      </BlockStack>
    </AdminAction>
  );
}