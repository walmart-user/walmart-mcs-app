import {useEffect, useState} from 'react';
import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Icon,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {i18n, data} = useApi(TARGET);
  const [productTitle, setProductTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock Walmart sync status - in real app, this would come from your API
  const [walmartStatus, setWalmartStatus] = useState({
    synced: false,
    lastSync: null,
    walmartId: null,
  });

  // Use direct API calls to fetch data from Shopify.
  useEffect(() => {
    (async function getProductInfo() {
      const productQuery = `
        query Product($id: ID!) {
          product(id: $id) {
            id
            title
            status
            totalInventory
          }
        }
      `;

      try {
        const result = await data.query(productQuery, {
          variables: {id: data.selected[0].id},
        });
        
        if (result.data?.product) {
          setProductTitle(result.data.product.title);
          
          // Simulate checking Walmart sync status
          // In a real app, you'd call your backend API here
          setTimeout(() => {
            setWalmartStatus({
              synced: Math.random() > 0.5, // Random for demo
              lastSync: new Date().toISOString(),
              walmartId: Math.random() > 0.5 ? 'WM-' + Math.random().toString(36).substr(2, 9).toUpperCase() : null,
            });
            setIsLoading(false);
          }, 800);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setIsLoading(false);
      }
    })();
  }, [data]);

  const getSyncStatusBadge = () => {
    if (isLoading) {
      return <Badge tone="info">Checking...</Badge>;
    }
    
    if (walmartStatus.synced && walmartStatus.walmartId) {
      return <Badge tone="success">Synced</Badge>;
    }
    
    return <Badge tone="critical">Not Synced</Badge>;
  };

  const getLastSyncText = () => {
    if (isLoading || !walmartStatus.lastSync) {
      return null;
    }
    
    const lastSyncDate = new Date(walmartStatus.lastSync);
    const timeAgo = Math.floor((Date.now() - lastSyncDate.getTime()) / (1000 * 60)); // minutes ago
    
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

  return (
    <AdminBlock title="Walmart Integration">
      <BlockStack gap="300">
        {/* Sync Status Row */}
        <InlineStack gap="200" blockAlignment="center">
          <Text appearance="subdued" size="small">Status:</Text>
          {getSyncStatusBadge()}
        </InlineStack>

        {/* Walmart ID Row (if synced) */}
        {walmartStatus.synced && walmartStatus.walmartId && !isLoading && (
          <InlineStack gap="200" blockAlignment="center">
            <Text appearance="subdued" size="small">Walmart ID:</Text>
            <Text size="small" fontWeight="medium">{walmartStatus.walmartId}</Text>
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
            {walmartStatus.synced 
              ? "Product is synchronized with Walmart Marketplace" 
              : "Use the 'Walmart Product Sync' action to sync this product"
            }
          </Text>
        )}
      </BlockStack>
    </AdminBlock>
  );
}