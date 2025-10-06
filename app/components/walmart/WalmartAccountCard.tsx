import { Card, Text, InlineStack, Badge, Button, BlockStack } from "@shopify/polaris";

interface WalmartAccountCardProps {
  name: string;
  id: string;
  email: string;
  isConnected: boolean;
  onChangeAccount?: () => void;
}

export function WalmartAccountCard({ 
  name, 
  id, 
  email, 
  isConnected, 
  onChangeAccount 
}: WalmartAccountCardProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Walmart account
            </Text>
            <Badge tone={isConnected ? "success" : "critical"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </InlineStack>
          {onChangeAccount && (
            <Button variant="secondary" onClick={onChangeAccount}>
              Change account
            </Button>
          )}
        </InlineStack>
        
        <BlockStack gap="100">
          <Text as="p" variant="bodyMd">
            <Text as="span" variant="bodyMd" fontWeight="medium">Name:</Text> {name}
          </Text>
          <Text as="p" variant="bodyMd">
            <Text as="span" variant="bodyMd" fontWeight="medium">ID:</Text>{id}
          </Text>
          <Text as="p" variant="bodyMd">
            <Text as="span" variant="bodyMd" fontWeight="medium">Email:</Text>{email}
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
