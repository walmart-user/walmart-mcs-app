import { useState, useEffect } from 'react';
import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Divider,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const {i18n, data} = useApi(TARGET);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test weather API with hardcoded Bangalore location
  useEffect(() => {
    async function testWeatherAPI() {
      await fetchWeatherData();
    }

    testWeatherAPI();
  }, []);

  // Simple weather API test for Bangalore
  async function fetchWeatherData() {
    try {
      const location = 'Bangalore';
      const weatherUrl = `https://wttr.in/${location}?format=j1`;
      
      const response = await fetch(weatherUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const weatherData = await response.json();
      
      // Extract basic data
      const current = weatherData.current_condition?.[0];
      if (current) {
        const processedData = {
          location: 'Bangalore, India',
          temperature: parseInt(current.temp_C) || 25,
          humidity: parseInt(current.humidity) || 60,
          conditions: current.weatherDesc?.[0]?.value || 'Clear',
          windSpeed: parseInt(current.windspeedKmph) || 10,
          icon: '🌤️'
        };
        
        setWeatherData(processedData);
      } else {
        throw new Error('No weather data in response');
      }
      
    } catch (err) {
      setError(`Weather API failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }


  const getConditionsBadge = (conditions) => {
    const toneMap = {
      'Sunny': 'success',
      'Partly Cloudy': 'info', 
      'Cloudy': 'attention',
      'Rainy': 'critical'
    };
    return toneMap[conditions] || 'info';
  };

  if (loading) {
    return (
      <AdminBlock title={i18n.translate('name')}>
        <BlockStack>
          <InlineStack align="center">
            <Text>⏳ {i18n.translate('loading')}</Text>
          </InlineStack>
        </BlockStack>
      </AdminBlock>
    );
  }

  if (error) {
    return (
      <AdminBlock title={i18n.translate('name')}>
        <BlockStack>
          <Text tone="critical">{error}</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  if (!weatherData) {
    return (
      <AdminBlock title={i18n.translate('name')}>
        <BlockStack>
          <Text>{i18n.translate('error')}</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  return (
    <AdminBlock title={i18n.translate('name')}>
      <BlockStack gap="tight">
        <InlineStack align="space-between">
          <Text fontWeight="bold">{weatherData.icon} {weatherData.location}</Text>
          <Badge tone={getConditionsBadge(weatherData.conditions)}>
            {weatherData.conditions}
          </Badge>
        </InlineStack>
        
        <Divider />
        
        <BlockStack gap="extraTight">
          <InlineStack align="space-between">
            <Text>{i18n.translate('temperature')}:</Text>
            <Text fontWeight="semibold">{weatherData.temperature}°C</Text>
          </InlineStack>
          
          <InlineStack align="space-between">
            <Text>Feels like:</Text>
            <Text>{weatherData.feelsLike}°C</Text>
          </InlineStack>
          
          <InlineStack align="space-between">
            <Text>{i18n.translate('humidity')}:</Text>
            <Text>{weatherData.humidity}%</Text>
          </InlineStack>
          
          <InlineStack align="space-between">
            <Text>Wind Speed:</Text>
            <Text>{weatherData.windSpeed} km/h</Text>
          </InlineStack>
          
          {weatherData.visibility > 0 && (
            <InlineStack align="space-between">
              <Text>Visibility:</Text>
              <Text>{weatherData.visibility} km</Text>
            </InlineStack>
          )}
          
          {weatherData.pressure > 0 && (
            <InlineStack align="space-between">
              <Text>Pressure:</Text>
              <Text>{weatherData.pressure} mb</Text>
            </InlineStack>
          )}
          
          {weatherData.uvIndex > 0 && (
            <InlineStack align="space-between">
              <Text>UV Index:</Text>
              <Badge tone={weatherData.uvIndex > 7 ? 'critical' : weatherData.uvIndex > 5 ? 'attention' : 'success'}>
                {weatherData.uvIndex}
              </Badge>
            </InlineStack>
          )}
        </BlockStack>
        
        <Divider />
        
        <Text variant="bodySmall" tone="subdued">
          🧪 Test weather data for Bangalore, India
        </Text>
      </BlockStack>
    </AdminBlock>
  );
}