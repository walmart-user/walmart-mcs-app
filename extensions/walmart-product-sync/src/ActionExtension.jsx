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
const TARGET = 'admin.product-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {i18n, close, data} = useApi(TARGET);
  console.log({data});
  const [productInfo, setProductInfo] = useState({
    title: '',
    price: '',
    status: '',
    inventory: ''
  });
  const [walmartSync, setWalmartSync] = useState({
    synced: false,
    walmartItemId: null,
    lastSync: null,
    category: ''
  });

  // Use direct API calls to fetch data from Shopify.
  // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
            status
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            totalInventory
          }
        }`,
        variables: {id: data.selected[0].id},
      };

      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error('Network error');
      }

      const productData = await res.json();
      const product = productData.data.product;
      setProductInfo({
        title: product.title,
        price: `${product.priceRangeV2.minVariantPrice.amount} ${product.priceRangeV2.minVariantPrice.currencyCode}`,
        status: product.status,
        inventory: product.totalInventory
      });

      // Simulate checking Walmart sync status (this would be a real API call in production)
      setWalmartSync({
        synced: Math.random() > 0.3, // Random for demo
        walmartItemId: `WM${Date.now().toString().slice(-8)}`,
        lastSync: new Date().toLocaleString(),
        category: 'Electronics' // This would come from your API
      });
    })();
  }, [data.selected]);

  const handleSyncToWalmart = () => {
    console.log('Syncing product to Walmart...', productInfo.title);
    // Here you would make an API call to your Vercel app to sync with Walmart
    setWalmartSync({
      synced: true,
      walmartItemId: `WM${Date.now().toString().slice(-8)}`,
      lastSync: new Date().toLocaleString(),
      category: 'Electronics'
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
          {walmartSync.synced ? 'Synced to Walmart' : 'Sync to Walmart'}
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
        <Text fontWeight="bold">🛍️ Walmart Product Sync</Text>
        
        <Divider />
        
        <BlockStack gap="200">
          <Text fontWeight="semibold">Product Details</Text>
          <InlineStack gap="200">
            <Text>Title:</Text>
            <Text fontWeight="bold">{productInfo.title}</Text>
          </InlineStack>
          <InlineStack gap="200">
            <Text>Price:</Text>
            <Text>{productInfo.price}</Text>
          </InlineStack>
          <InlineStack gap="200">
            <Text>Status:</Text>
            <Badge tone={productInfo.status === 'ACTIVE' ? 'success' : 'attention'}>
              {productInfo.status}
            </Badge>
          </InlineStack>
          <InlineStack gap="200">
            <Text>Inventory:</Text>
            <Text>{productInfo.inventory} units</Text>
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
                <Text>Walmart Item ID:</Text>
                <Text fontWeight="bold">{walmartSync.walmartItemId}</Text>
              </InlineStack>
              <InlineStack gap="200">
                <Text>Category:</Text>
                <Text>{walmartSync.category}</Text>
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