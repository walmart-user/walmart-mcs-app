import { Card, Text, BlockStack, Collapsible, Button, InlineStack, Icon } from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FrequentlyAskedQuestionsProps {
  items: FAQItem[];
}

export function FrequentlyAskedQuestions({ items }: FrequentlyAskedQuestionsProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Frequent ask questions
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Find answers to common questions and get quick help on various topics.
          </Text>
        </BlockStack>

        <BlockStack gap="200">
          {items.map((item) => {
            const isOpen = openItems.has(item.id);
            return (
              <div key={item.id}>
                <Button
                  variant="plain"
                  textAlign="left"
                  fullWidth
                  onClick={() => toggleItem(item.id)}
                  disclosure={isOpen ? "up" : "down"}
                >
                  {item.question}
                </Button>
                
                <Collapsible
                  open={isOpen}
                  id={`faq-${item.id}`}
                  transition={{ duration: "200ms", timingFunction: "ease-in-out" }}
                >
                  <div style={{ 
                    paddingTop: '12px', 
                    paddingBottom: '12px',
                    paddingLeft: '16px',
                    borderLeft: '2px solid #E1E3E5',
                    marginLeft: '8px',
                    marginTop: '8px'
                  }}>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {item.answer}
                    </Text>
                  </div>
                </Collapsible>
              </div>
            );
          })}
        </BlockStack>

        {/* Support link */}
        <div style={{ 
          textAlign: 'center', 
          paddingTop: '16px',
          borderTop: '1px solid #E1E3E5'
        }}>
          <Text as="p" variant="bodyMd" tone="subdued">
            Need support? Create a ticket on{" "}
            <Text as="span" variant="bodyMd" tone="base">
              <a 
                href="http://walmarttestexample.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#005BD3', textDecoration: 'none' }}
              >
                http://walmarttestexample.com
              </a>
            </Text>
          </Text>
        </div>
      </BlockStack>
    </Card>
  );
}
