import { Card, Text, BlockStack, Collapsible, InlineStack, Icon } from "@shopify/polaris";
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
    <Card padding="600" background="bg-surface-secondary">
      <BlockStack gap="500">
        <BlockStack gap="200">
          <Text as="h2" variant="headingLg" fontWeight="semibold">
            Frequent ask questions
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Find answers to common questions and get quick help on various topics.
          </Text>
        </BlockStack>

        <BlockStack gap="0">
          {items.map((item, index) => {
            const isOpen = openItems.has(item.id);
            const isLast = index === items.length - 1;
            
            return (
              <div 
                key={item.id}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid #E1E3E5'
                }}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="span" variant="bodyMd" fontWeight="medium">
                      {item.question}
                    </Text>
                    <Icon 
                      source={isOpen ? ChevronUpIcon : ChevronDownIcon} 
                      tone="subdued"
                    />
                  </InlineStack>
                </button>
                
                <Collapsible
                  open={isOpen}
                  id={`faq-${item.id}`}
                  transition={{ duration: "200ms", timingFunction: "ease-in-out" }}
                >
                  <div style={{ 
                    paddingBottom: '16px',
                    paddingRight: '24px'
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
          paddingTop: '24px'
        }}>
          <Text as="p" variant="bodyMd" tone="subdued">
            Need support? Create a ticket on{" "}
            <a 
              href="http://walmarttestexample.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#005BD3', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              http://walmarttestexample.com
            </a>
          </Text>
        </div>
      </BlockStack>
    </Card>
  );
}
