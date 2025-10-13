import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { isLocalDevelopment } from "../config";

// Import real components
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu as ShopifyNavMenu } from "@shopify/app-bridge-react";

// Import Polaris for mock components
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from '@shopify/polaris/locales/en.json';

// Mock components for local development
const MockAppProvider = ({ children, isEmbeddedApp, apiKey }: { children: React.ReactNode, isEmbeddedApp: boolean, apiKey: string }) => (
  <PolarisAppProvider i18n={enTranslations}>
    <div className="app-provider">{children}</div>
  </PolarisAppProvider>
);

const MockNavMenu = ({ children }: { children: React.ReactNode }) => (
  <nav style={{ padding: '16px', borderBottom: '1px solid #ddd', display: 'flex', gap: '16px' }}>
    {children}
  </nav>
);

// Use real or mock components based on environment
const AppProvider = isLocalDevelopment ? MockAppProvider : ShopifyAppProvider;
const NavMenu = isLocalDevelopment ? MockNavMenu : ShopifyNavMenu;

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
