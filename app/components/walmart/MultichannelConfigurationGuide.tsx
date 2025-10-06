import { Card, Text, BlockStack, InlineStack, ProgressBar, Icon } from "@shopify/polaris";
import { CheckIcon, ClockIcon } from "@shopify/polaris-icons";

interface ConfigurationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  inProgress?: boolean;
}

interface MultichannelConfigurationGuideProps {
  completedTasks: number;
  totalTasks: number;
  steps: ConfigurationStep[];
}

export function MultichannelConfigurationGuide({ 
  completedTasks, 
  totalTasks, 
  steps 
}: MultichannelConfigurationGuideProps) {
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Card>
      <BlockStack gap="400">
        {/* Progress indicator */}
        <InlineStack gap="200" blockAlign="center">
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#E1E3E5',
            position: 'relative'
          }}>
            <div style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              height: '100%',
              borderRadius: '50%',
              backgroundColor: progressPercentage === 100 ? '#008060' : '#5C5F62',
              transition: 'all 0.3s ease'
            }} />
          </div>
          <Text as="p" variant="bodyMd" tone="subdued">
            {completedTasks} out of {totalTasks} tasks completed
          </Text>
        </InlineStack>

        {/* Title and description */}
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Multichannel configuration guide
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Complete all the steps on this setting to connect your Multichannel service into Shopify
          </Text>
        </BlockStack>

        {/* General configuration section */}
        <BlockStack gap="300">
          <Text as="h3" variant="headingSm" tone="subdued">
            General configuration
          </Text>
          
          <BlockStack gap="300">
            {steps.map((step) => (
              <InlineStack key={step.id} gap="300" blockAlign="start">
                <div style={{ marginTop: '2px' }}>
                  {step.completed ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#008060',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon source={CheckIcon} tone="base" />
                    </div>
                  ) : step.inProgress ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#FFC453',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon source={ClockIcon} tone="base" />
                    </div>
                  ) : (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid #E1E3E5',
                      backgroundColor: 'transparent'
                    }} />
                  )}
                </div>
                
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    {step.title}
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {step.description}
                  </Text>
                </BlockStack>
                
                {/* Placeholder for action button or status */}
                <div style={{ marginLeft: 'auto', marginTop: '2px' }}>
                  {step.inProgress && (
                    <div style={{
                      width: '100px',
                      height: '20px',
                      backgroundColor: '#F1F2F3',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '4px',
                        backgroundColor: '#E1E3E5',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '30%',
                          height: '100%',
                          backgroundColor: '#5C5F62',
                          borderRadius: '2px',
                          animation: 'loading 1.5s ease-in-out infinite'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </InlineStack>
            ))}
          </BlockStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
