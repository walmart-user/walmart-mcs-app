import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/ActionExtension.jsx' {
  const shopify: import('@shopify/ui-extensions/admin.order-details.action.render').Api;
  const globalThis: { shopify: typeof shopify };
}
