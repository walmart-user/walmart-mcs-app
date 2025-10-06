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
import { WalmartAccountCard, MultichannelConfigurationGuide, FrequentlyAskedQuestions } from "../components/walmart";

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

  // Hardcoded data for the Walmart interface
  const walmartAccountData = {
    name: "mpcoee2 test",
    id: "10001118203",
    email: "mpcoee2@gmail.com",
    isConnected: true
  };

  const configurationSteps = [
    {
      id: "shopify-channel",
      title: "Create / connect your Shopify channel",
      description: "We need to connect your current \"shopify\" channel, if you've not create the channel we will created on behalf of you",
      completed: false,
      inProgress: true
    },
    {
      id: "sync-inventory",
      title: "Sync Walmart WFS inventory",
      description: "Synchronize your Walmart Fulfillment Services inventory with your Shopify store",
      completed: false,
      inProgress: false
    },
    {
      id: "shipping-options",
      title: "Configure your shipping options",
      description: "Set up shipping methods and delivery options for your Walmart marketplace orders",
      completed: false,
      inProgress: false
    }
  ];

  const faqItems = [
    {
      id: "walmart-fees",
      question: "Walmart fees",
      answer: "Walmart charges various fees including referral fees, fulfillment fees, and optional services fees. Referral fees vary by category and typically range from 6% to 20% of the item's sale price. Additional fees may apply for Walmart Fulfillment Services (WFS)."
    },
    {
      id: "inventory-works",
      question: "How inventory works",
      answer: "Inventory is automatically synchronized between your Shopify store and Walmart Marketplace. When you update inventory levels in Shopify, the changes are reflected on Walmart within minutes. You can also manage inventory directly through the Walmart Seller Center."
    },
    {
      id: "terms-conditions",
      question: "Terms and conditions",
      answer: "By using this integration, you agree to both Shopify's and Walmart's terms of service. You are responsible for ensuring your products comply with Walmart's marketplace policies, including product quality standards, shipping requirements, and customer service expectations."
    }
  ];

  const completedTasks = configurationSteps.filter(step => step.completed).length;
  const totalTasks = configurationSteps.length;

  return (
    <Page>
      <TitleBar title="Walmart Multichannel Services App" />
      <BlockStack gap="500">
        {/* Walmart Account Card */}
        <WalmartAccountCard
          name={walmartAccountData.name}
          id={walmartAccountData.id}
          email={walmartAccountData.email}
          isConnected={walmartAccountData.isConnected}
          onChangeAccount={() => shopify.toast.show("Change account functionality coming soon!")}
        />

        {/* Multichannel Configuration Guide */}
        <MultichannelConfigurationGuide
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          steps={configurationSteps}
        />

        {/* Frequently Asked Questions */}
        <FrequentlyAskedQuestions items={faqItems} />
      </BlockStack>
    </Page>
  );
}
