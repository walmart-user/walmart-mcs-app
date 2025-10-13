import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { isLocalDevelopment } from "./config";

// Create a mock session storage for local development
class MockSessionStorage {
  sessions: Record<string, any> = {};

  async storeSession(session: any) {
    this.sessions[session.id] = session;
    return true;
  }

  async loadSession(id: string) {
    return this.sessions[id] || undefined;
  }

  async deleteSession(id: string) {
    delete this.sessions[id];
    return true;
  }

  async deleteSessions(ids: string[]) {
    ids.forEach(id => delete this.sessions[id]);
    return true;
  }

  async findSessionsByShop(shop: string) {
    return Object.values(this.sessions).filter((session: any) => session.shop === shop);
  }
}

// Choose session storage based on environment
const appSessionStorage = isLocalDevelopment 
  ? new MockSessionStorage()
  : new PrismaSessionStorage(prisma as any); // Type assertion needed for mock client

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "mock-api-key",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "mock-secret-key",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(",") || ["write_products", "read_orders"],
  appUrl: process.env.SHOPIFY_APP_URL || "http://localhost:3000",
  authPathPrefix: "/auth",
  sessionStorage: appSessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
// Create a mock authentication object for local development
const mockAuthenticate = {
  // Mock admin authentication
  admin: async (request: Request) => {
    // Return a mock admin object
    return {
      admin: {
        graphql: async () => ({
          json: async () => ({
            data: {
              productCreate: {
                product: {
                  id: "gid://shopify/Product/mock-id",
                  title: "Mock Product",
                  handle: "mock-product",
                  status: "ACTIVE",
                  variants: {
                    edges: [
                      {
                        node: {
                          id: "gid://shopify/ProductVariant/mock-variant-id",
                          price: "100.00",
                          barcode: "mock-barcode",
                          createdAt: new Date().toISOString()
                        }
                      }
                    ]
                  }
                }
              },
              productVariantsBulkUpdate: {
                productVariants: [
                  {
                    id: "gid://shopify/ProductVariant/mock-variant-id",
                    price: "100.00",
                    barcode: "mock-barcode",
                    createdAt: new Date().toISOString()
                  }
                ]
              }
            }
          })
        })
      },
      session: {
        shop: "mock-shop.myshopify.com",
        accessToken: "mock-token"
      }
    };
  },
  // Keep the original authenticate methods for non-admin routes
  public: shopify.authenticate.public,
  webhook: shopify.authenticate.webhook
};

// Use real or mock authentication based on environment
export const authenticate = isLocalDevelopment ? mockAuthenticate : shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
