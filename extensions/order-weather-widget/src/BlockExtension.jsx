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
  Spinner,
  Icon,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.order-details.block.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  const {i18n, data} = useApi(TARGET);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderLocation, setOrderLocation] = useState(null);

  // Fetch order data to get shipping address
  useEffect(() => {
    async function fetchOrderData() {
      try {
        if (!data?.selected?.[0]?.id) return;
        
        const result = await data.query(`
          query Order($id: ID!) {
            order(id: $id) {
              id
              name
              shippingAddress {
                city
                province
                country
                zip
                latitude
                longitude
              }
            }
          }
        `, {
          variables: { id: data.selected[0].id }
        });

        const order = result?.data?.order;
        if (order?.shippingAddress) {
          setOrderLocation(order.shippingAddress);
          await fetchWeatherData(order.shippingAddress);
        } else {
          setError('No shipping address found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch order data');
        setLoading(false);
      }
    }

    fetchOrderData();
  }, [data]);

  // Fetch weather data using wttr.in API (free, no API key required)
  async function fetchWeatherData(address) {
    try {
      // Construct location string for API
      const location = address.city || address.province || address.country || 'Unknown';
      
      // Use wttr.in API - free weather service with no API key required
      // Format: https://wttr.in/LOCATION?format=j1
      const weatherUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
      
      console.log('Fetching weather for:', location, 'URL:', weatherUrl);
      
      const response = await fetch(weatherUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Weather API responded with status: ${response.status}`);
      }
      
      const weatherApiData = await response.json();
      console.log('Weather API response:', weatherApiData);
      
      // Parse wttr.in response format
      const current = weatherApiData.current_condition?.[0];
      const nearest = weatherApiData.nearest_area?.[0];
      
      if (!current) {
        throw new Error('No current weather data available');
      }
      
      // Map weather codes to emojis
      const getWeatherIcon = (code) => {
        const iconMap = {
          '113': '☀️', // Sunny
          '116': '⛅', // Partly cloudy
          '119': '☁️', // Cloudy
          '122': '☁️', // Overcast
          '143': '🌫️', // Mist
          '176': '🌦️', // Patchy rain possible
          '179': '🌨️', // Patchy snow possible
          '182': '🌧️', // Patchy sleet possible
          '185': '🌧️', // Patchy freezing drizzle possible
          '200': '⛈️', // Thundery outbreaks possible
          '227': '❄️', // Blowing snow
          '230': '❄️', // Blizzard
          '248': '🌫️', // Fog
          '260': '🌫️', // Freezing fog
          '263': '🌦️', // Patchy light drizzle
          '266': '🌧️', // Light drizzle
          '281': '🌧️', // Freezing drizzle
          '284': '🌧️', // Heavy freezing drizzle
          '293': '🌦️', // Patchy light rain
          '296': '🌧️', // Light rain
          '299': '🌧️', // Moderate rain at times
          '302': '🌧️', // Moderate rain
          '305': '🌧️', // Heavy rain at times
          '308': '🌧️', // Heavy rain
          '311': '🌧️', // Light freezing rain
          '314': '🌧️', // Moderate or heavy freezing rain
          '317': '🌧️', // Light sleet
          '320': '🌧️', // Moderate or heavy sleet
          '323': '🌨️', // Patchy light snow
          '326': '❄️', // Light snow
          '329': '❄️', // Patchy moderate snow
          '332': '❄️', // Moderate snow
          '335': '❄️', // Patchy heavy snow
          '338': '❄️', // Heavy snow
          '350': '🌧️', // Ice pellets
          '353': '🌦️', // Light rain shower
          '356': '🌧️', // Moderate or heavy rain shower
          '359': '🌧️', // Torrential rain shower
          '362': '🌨️', // Light sleet showers
          '365': '🌨️', // Moderate or heavy sleet showers
          '368': '🌨️', // Light snow showers
          '371': '❄️', // Moderate or heavy snow showers
          '374': '🌧️', // Light showers of ice pellets
          '377': '🌧️', // Moderate or heavy showers of ice pellets
          '386': '⛈️', // Patchy light rain with thunder
          '389': '⛈️', // Moderate or heavy rain with thunder
          '392': '⛈️', // Patchy light snow with thunder
          '395': '⛈️', // Moderate or heavy snow with thunder
        };
        return iconMap[code] || '🌤️';
      };
      
      const processedWeatherData = {
        location: nearest ? 
          `${nearest.areaName?.[0]?.value || location}, ${nearest.country?.[0]?.value || address.country}` : 
          `${address.city}, ${address.province || address.country}`,
        temperature: parseInt(current.temp_C) || 0,
        humidity: parseInt(current.humidity) || 0,
        conditions: current.weatherDesc?.[0]?.value || 'Unknown',
        windSpeed: parseInt(current.windspeedKmph) || 0,
        icon: getWeatherIcon(current.weatherCode),
        feelsLike: parseInt(current.FeelsLikeC) || parseInt(current.temp_C) || 0,
        visibility: parseInt(current.visibility) || 0,
        pressure: parseInt(current.pressure) || 0,
        uvIndex: parseInt(current.uvIndex) || 0
      };
      
      console.log('Processed weather data:', processedWeatherData);
      setWeatherData(processedWeatherData);
      
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(`Failed to fetch weather data: ${err.message}`);
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
            <Spinner size="small" />
            <Text>{i18n.translate('loading')}</Text>
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
          Weather data for delivery location
        </Text>
      </BlockStack>
    </AdminBlock>
  );
}