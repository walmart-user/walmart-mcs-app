import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

export default async () => {
  render(<Extension />, document.body);
}

function Extension() {
  const {i18n, close, data, extension: {target}} = shopify;
  console.log('Order data:', data);
  
  const [orderInfo, setOrderInfo] = useState({
    id: '',
    name: '',
    lineItems: []
  });
  const [returnReason, setReturnReason] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch order information from Shopify
  useEffect(() => {
    (async function getOrderInfo() {
      try {
        const getOrderQuery = {
          query: `query Order($id: ID!) {
            order(id: $id) {
              id
              name
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      price
                    }
                    product {
                      id
                      title
                    }
                  }
                }
              }
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
          return;
        }

        const orderData = await res.json();
        const order = orderData.data.order;
        
        setOrderInfo({
          id: order.id,
          name: order.name,
          lineItems: order.lineItems.edges.map(edge => edge.node)
        });
        
        console.log('Fetched order info:', {
          orderId: order.id,
          orderName: order.name,
          lineItems: order.lineItems.edges.map(edge => edge.node)
        });
        
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [data.selected]);

  const handleReturnRequest = () => {
    // Console log all the required information
    console.log('=== RETURN REQUEST SUBMITTED ===');
    console.log('Reason for return:', returnReason);
    console.log('Order ID:', orderInfo.id);
    console.log('Order Name:', orderInfo.name);
    console.log('Order List (Line Items):', orderInfo.lineItems);
    console.log('Full order details:', {
      reason: returnReason,
      orderId: orderInfo.id,
      orderName: orderInfo.name,
      orderItems: orderInfo.lineItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        productTitle: item.product.title,
        variantTitle: item.variant?.title,
        price: item.variant?.price
      }))
    });
    console.log('================================');
    
    // Close the modal after logging
    close();
  };

  if (loading) {
    return (
      <s-admin-action>
        <s-stack direction="block">
          <s-text type="strong">{i18n.translate('welcome')}</s-text>
          <s-text>Loading order information...</s-text>
        </s-stack>
        <s-button slot="secondary-actions" onClick={close}>
          {i18n.translate('cancelButton')}
        </s-button>
      </s-admin-action>
    );
  }

  return (
    <s-admin-action>
      <s-stack direction="block" spacing="base">
        <s-text type="strong">{i18n.translate('welcome')}</s-text>
        <s-text>Order: {orderInfo.name}</s-text>
        
        {/* Reason for return text box */}
        <s-stack direction="block" spacing="tight">
          <s-text type="strong">{i18n.translate('reasonLabel')}</s-text>
          <s-text-area
            value={returnReason}
            onInput={(e) => setReturnReason(e.target.value)}
            placeholder={i18n.translate('reasonPlaceholder')}
            rows="3"
          />
        </s-stack>

        {/* Order items list */}
        <s-stack direction="block" spacing="tight">
          <s-text type="strong">{i18n.translate('orderItemsLabel')}</s-text>
          <s-stack direction="block" spacing="extra-tight">
            {orderInfo.lineItems.map((item, index) => (
              <s-stack key={item.id} direction="inline" alignment="center" spacing="tight">
                <s-text>
                  {item.quantity}x {item.title}
                  {item.variant?.title && item.variant.title !== 'Default Title' && 
                    ` (${item.variant.title})`
                  }
                  {item.variant?.price && ` - $${item.variant.price}`}
                </s-text>
              </s-stack>
            ))}
          </s-stack>
        </s-stack>
      </s-stack>

      {/* Action buttons */}
      <s-button 
        slot="primary-action" 
        onClick={handleReturnRequest}
        disabled={!returnReason.trim()}
      >
        {i18n.translate('returnButton')}
      </s-button>
      <s-button slot="secondary-actions" onClick={close}>
        {i18n.translate('cancelButton')}
      </s-button>
    </s-admin-action>
  );
}