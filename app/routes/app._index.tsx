import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "getOrderData") {
    try {
      // GraphQL query for order fulfillment data - using hardcoded order ID that works with cURL
      const response = await admin.graphql(
        `#graphql
          query GetOrderDeliveryMethods {
            order(id: "gid://shopify/Order/10197564883236") {
              id
              name
              returns(first: 10) {
                edges {
                  node {
                    id
                    status
                    name
                    returnLineItems(first: 10) {
                      edges {
                        node {
                          quantity
                          returnReason
                          returnReasonNote
                          fulfillmentLineItem {
                            lineItem {
                              name
                            }
                          }
                          totalWeight {
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
              fulfillmentOrders(first: 10) {
                nodes {
                  id
                  createdAt
                  status
                  lineItems(first: 250) {
                    nodes {
                      id
                      totalQuantity
                      sku
                    }
                  }
                  deliveryMethod {
                    id
                    methodType
                  }
                  assignedLocation {
                    location{
                      id
                      name
                    }
                  }
                  destination {
                    address1
                    address2
                    city
                    province
                    countryCode
                    zip
                    company
                    firstName
                    lastName
                    phone
                    email
                  }
                }
              }
            }
          }
        `,
        {}
      );

      const responseJson = await response.json();
      
      if ((responseJson as any).errors) {
        console.error("GraphQL errors:", (responseJson as any).errors);
        return {
          actionType: "getOrderData",
          error: "Failed to fetch order details: " + JSON.stringify((responseJson as any).errors),
          orderData: null
        };
      }

      return {
        actionType: "getOrderData",
        orderData: responseJson.data
      };
    } catch (error) {
      console.error("Error in getOrderData:", error);
      return {
        actionType: "getOrderData",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        orderData: null
      };
    }
  }

  // Default action - generate product
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    actionType: "generateProduct",
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.actionType === "generateProduct" ? 
    (fetcher.data as any)?.product?.id.replace("gid://shopify/Product/", "") : 
    undefined;

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
    if (fetcher.data?.actionType === "getOrderData") {
      if ((fetcher.data as any)?.error) {
        shopify.toast.show("Error fetching order data", { isError: true });
      } else {
        shopify.toast.show("Order data fetched successfully");
      }
    }
  }, [productId, shopify, fetcher.data]);

  const generateProduct = () => fetcher.submit({ actionType: "generateProduct" }, { method: "POST" });
  const getOrderData = () => fetcher.submit({ actionType: "getOrderData" }, { method: "POST" });

  return (
    <Page>
      <TitleBar title="Walmart MCS App">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </TitleBar>
      <BlockStack gap="500">
        {/* Walmart Test Environment Banner - Prominent like Shopify's Test Order banner */}
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <Banner
            title="🧪 Test Environment - Walmart Integration"
            tone="warning"
            action={{
              content: "Configure Production",
              onAction: () => {
                // Navigate to settings or show modal
                shopify.toast.show("Production configuration coming soon!");
              },
            }}
          >
            <Text as="p">
              You're currently using the Walmart Marketplace integration in <strong>test mode</strong>. 
              Orders and product sync are simulated and will not affect live inventory or fulfillment.
            </Text>
          </Banner>
        </div>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to Walmart Marketplace Connector 🛒
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Connect your Shopify store with Walmart Marketplace to sync products, 
                    manage inventory, and handle order fulfillment seamlessly. This app provides 
                    real-time synchronization and automated fulfillment services between your 
                    Shopify store and Walmart's marketplace.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                      removeUnderline
                    >
                      productCreate
                    </Link>{" "}
                    mutation in our API references.
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading && !fetcher.data?.actionType} onClick={generateProduct}>
                    Generate a product
                  </Button>
                  <Button 
                    loading={isLoading && fetcher.data?.actionType === "getOrderData"} 
                    onClick={getOrderData}
                    variant="secondary"
                  >
                    Get Order Data
                  </Button>
                  {fetcher.data?.actionType === "generateProduct" && (fetcher.data as any)?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {/* Show Order Data Results */}
                {fetcher.data?.actionType === "getOrderData" && (
                  <>
                    {(fetcher.data as any)?.error ? (
                      <>
                        <Banner tone="critical" title="Error fetching order data">
                          <Text as="p">{(fetcher.data as any).error}</Text>
                          <Text as="p" variant="bodyMd">
                            Make sure your Shopify app has the necessary permissions (read_orders scope).
                          </Text>
                        </Banner>
                      </>
                    ) : (
                      <>
                        <Text as="h3" variant="headingMd">
                          Order Data Query Results (Order ID: gid://shopify/Order/10197564883236)
                        </Text>
                        <Box
                          padding="400"
                          background="bg-surface-active"
                          borderWidth="025"
                          borderRadius="200"
                          borderColor="border"
                          overflowX="scroll"
                        >
                          <pre style={{ margin: 0 }}>
                            <code>
                              {JSON.stringify((fetcher.data as any).orderData, null, 2)}
                            </code>
                          </pre>
                        </Box>
                      </>
                    )}
                  </>
                )}
                {fetcher.data?.actionType === "generateProduct" && (fetcher.data as any)?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify((fetcher.data as any).product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify((fetcher.data as any).variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    App template specs
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Framework
                      </Text>
                      <Link
                        url="https://remix.run"
                        target="_blank"
                        removeUnderline
                      >
                        Remix
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Database
                      </Text>
                      <Link
                        url="https://www.prisma.io/"
                        target="_blank"
                        removeUnderline
                      >
                        Prisma
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Interface
                      </Text>
                      <span>
                        <Link
                          url="https://polaris.shopify.com"
                          target="_blank"
                          removeUnderline
                        >
                          Polaris
                        </Link>
                        {", "}
                        <Link
                          url="https://shopify.dev/docs/apps/tools/app-bridge"
                          target="_blank"
                          removeUnderline
                        >
                          App Bridge
                        </Link>
                      </span>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        API
                      </Text>
                      <Link
                        url="https://shopify.dev/docs/api/admin-graphql"
                        target="_blank"
                        removeUnderline
                      >
                        GraphQL API
                      </Link>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Next steps
                  </Text>
                  <List>
                    <List.Item>
                      Build an{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                        target="_blank"
                        removeUnderline
                      >
                        {" "}
                        example app
                      </Link>{" "}
                      to get started
                    </List.Item>
                    <List.Item>
                      Explore Shopify’s API with{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                        target="_blank"
                        removeUnderline
                      >
                        GraphiQL
                      </Link>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
