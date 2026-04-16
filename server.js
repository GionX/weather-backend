const express = require('express');
const app = express();

// ============ YOUR MAJOR CITIES ============
const cities = {
  'newyork': { lat: 40.7128, lon: -74.0060 },
  'losangeles': { lat: 34.0522, lon: -118.2437 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'sanantonio': { lat: 29.4241, lon: -98.4936 },
  'sandiego': { lat: 32.7157, lon: -117.1611 },
  'dallas': { lat: 32.7767, lon: -96.7970 },
  'austin': { lat: 30.2672, lon: -97.7431 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'berlin': { lat: 52.5200, lon: 13.4050 },
  'moscow': { lat: 55.7558, lon: 37.6173 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'beijing': { lat: 39.9042, lon: 116.4074 },
  'cairo': { lat: 30.0444, lon: 31.2357 },
  'mexicocity': { lat: 19.4326, lon: -99.1332 }
};

// Cache for weather data (4 hours)
const weatherCache = new Map();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ============ WEATHER MAPPING WITH INTENSITY ============
const getWeatherWithIntensity = (symbolCode) => {
  // MET Norway symbol codes with their intensity mapping
  const weatherMap = {
    // Clear conditions
    'clearsky': { condition: 'clear', intensity: null },
    'fair': { condition: 'clear', intensity: null },
    'fair_day': { condition: 'clear', intensity: null },
    'fair_night': { condition: 'clear', intensity: null },
    
    // Cloudy conditions
    'partlycloudy': { condition: 'cloudy', intensity: null },
    'partlycloudy_day': { condition: 'cloudy', intensity: null },
    'partlycloudy_night': { condition: 'cloudy', intensity: null },
    'cloudy': { condition: 'cloudy', intensity: null },
    
    // Rain intensities
    'lightrain': { condition: 'rain', intensity: 'light' },
    'rain': { condition: 'rain', intensity: 'medium' },
    'heavyrain': { condition: 'rain', intensity: 'heavy' },
    'rainandfog': { condition: 'rain', intensity: 'medium' },
    'lightrainandfog': { condition: 'rain', intensity: 'light' },
    'heavyrainandfog': { condition: 'rain', intensity: 'heavy' },
    
    // Rain showers with intensity
    'lightrainshowers': { condition: 'rain', intensity: 'light' },
    'rainshowers': { condition: 'rain', intensity: 'medium' },
    'heavyrainshowers': { condition: 'rain', intensity: 'heavy' },
    'lightrainshowersandfog': { condition: 'rain', intensity: 'light' },
    'heavyrainshowersandfog': { condition: 'rain', intensity: 'heavy' },
    
    // Snow intensities
    'lightsnow': { condition: 'snow', intensity: 'light' },
    'snow': { condition: 'snow', intensity: 'medium' },
    'heavysnow': { condition: 'snow', intensity: 'heavy' },
    'snowandfog': { condition: 'snow', intensity: 'medium' },
    'lightsnowandfog': { condition: 'snow', intensity: 'light' },
    'heavysnowandfog': { condition: 'snow', intensity: 'heavy' },
    
    // Snow showers
    'lightsnowshowers': { condition: 'snow', intensity: 'light' },
    'snowshowers': { condition: 'snow', intensity: 'medium' },
    'heavysnowshowers': { condition: 'snow', intensity: 'heavy' },
    
    // Sleet/Freezing rain (map to rain)
    'lightsleet': { condition: 'rain', intensity: 'light' },
    'sleet': { condition: 'rain', intensity: 'medium' },
    'heavysleet': { condition: 'rain', intensity: 'heavy' },
    'lightfreezingrain': { condition: 'rain', intensity: 'light' },
    'freezingrain': { condition: 'rain', intensity: 'medium' },
    'heavyfreezingrain': { condition: 'rain', intensity: 'heavy' },
    
    // Fog
    'fog': { condition: 'fog', intensity: 'light' },
    'mist': { condition: 'fog', intensity: 'light' },
    
    // Thunderstorms (map to heavy rain)
    'lightthunderstorm': { condition: 'rain', intensity: 'heavy' },
    'thunderstorm': { condition: 'rain', intensity: 'heavy' },
    'heavythunderstorm': { condition: 'rain', intensity: 'heavy' },
    'thunderstormwithrain': { condition: 'rain', intensity: 'heavy' }
  };
  
  // Return mapped weather or default to clear
  return weatherMap[symbolCode] || { condition: 'clear', intensity: null };
};

// ============ WEATHER ENDPOINT ============
app.get('/weather/:city', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ 
      error: 'City not found',
      availableCities: Object.keys(cities)
    });
  }
  
  // Check cache (4 hour TTL)
  const cached = weatherCache.get(cityName);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < 14400000) {
    console.log(`✅ Cache hit: ${cityName} (${cached.data.condition}${cached.data.intensity ? ' ' + cached.data.intensity : ''})`);
    return res.json(cached.data);
  }
  
  console.log(`🌐 Fetching fresh weather for: ${cityName}`);
  
  try {
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'WeatherEffectsApp/1.0 (your-email@example.com)'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MET API error: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.properties.timeseries[0].data;
    
    // Get the symbol code (priority: next_1_hours > current)
    let symbolCode = null;
    if (current.next_1_hours?.summary?.symbol_code) {
      symbolCode = current.next_1_hours.summary.symbol_code;
    } else if (current.current?.summary?.symbol_code) {
      symbolCode = current.current.summary.symbol_code;
    } else if (current.next_6_hours?.summary?.symbol_code) {
      symbolCode = current.next_6_hours.summary.symbol_code;
    }
    
    if (!symbolCode) {
      throw new Error('Could not find weather symbol code');
    }
    
    // Get weather with intensity
    const { condition, intensity } = getWeatherWithIntensity(symbolCode);
    
    // Get additional weather details
    const temperature = Math.round(current.instant.details.air_temperature);
    const humidity = current.instant.details.relative_humidity;
    const windSpeed = current.instant.details.wind_speed;
    const pressure = current.instant.details.air_pressure_at_sea_level;
    
    // Build weather object with intensity
    const weather = {
      condition: condition,
      intensity: intensity, // 'light', 'medium', 'heavy', or null
      temperature: temperature,
      humidity: humidity,
      windSpeed: windSpeed,
      pressure: pressure,
      rawSymbol: symbolCode, // For debugging
      updatedAt: new Date().toISOString(),
      city: cityName
    };
    
    // Cache the data
    weatherCache.set(cityName, {
      data: weather,
      timestamp: now
    });
    
    console.log(`✅ Weather cached: ${cityName} -> ${condition}${intensity ? ' (' + intensity + ')' : ''}, ${temperature}°C`);
    res.json(weather);
    
  } catch (error) {
    console.error(`❌ Error fetching weather for ${cityName}:`, error.message);
    
    // Return stale cache if available
    if (cached) {
      console.log(`⚠️ Returning stale cache for ${cityName}`);
      return res.json({
        ...cached.data,
        stale: true,
        note: 'Using cached data due to API error'
      });
    }
    
    res.status(500).json({ 
      error: 'Weather service unavailable',
      message: error.message
    });
  }
});

// Get detailed forecast (next 6 hours)
app.get('/weather/:city/forecast', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ error: 'City not found' });
  }
  
  try {
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'WeatherEffectsApp/1.0 (your-email@example.com)'
        }
      }
    );
    
    const data = await response.json();
    const forecast = [];
    
    // Get next 6 hours of forecast (3 time periods)
    for (let i = 0; i < Math.min(3, data.properties.timeseries.length); i++) {
      const period = data.properties.timeseries[i];
      const symbolCode = period.data.next_1_hours?.summary?.symbol_code ||
                        period.data.current?.summary?.symbol_code;
      
      const { condition, intensity } = getWeatherWithIntensity(symbolCode);
      
      forecast.push({
        time: period.time,
        condition: condition,
        intensity: intensity,
        temperature: Math.round(period.data.instant.details.air_temperature)
      });
    }
    
    res.json({
      city: cityName,
      forecast: forecast
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all available cities
app.get('/cities', (req, res) => {
  res.json({
    count: Object.keys(cities).length,
    cities: Object.keys(cities)
  });
});

// Cache statistics with intensity info
app.get('/stats', (req, res) => {
  const stats = {};
  const now = Date.now();
  for (const [city, data] of weatherCache.entries()) {
    const ageMinutes = Math.round((now - data.timestamp) / 1000 / 60);
    stats[city] = {
      age: `${ageMinutes} minutes`,
      condition: data.data.condition,
      intensity: data.data.intensity || 'none',
      temperature: data.data.temperature,
      rawSymbol: data.data.rawSymbol
    };
  }
  res.json({
    cachedCities: Object.keys(stats).length,
    details: stats
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Weather API with intensity support is running',
    cacheDuration: '4 hours',
    availableCities: Object.keys(cities).length,
    intensities: ['light', 'medium', 'heavy'],
    conditions: ['clear', 'cloudy', 'rain', 'snow', 'fog']
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Weather API running on port ${port}`);
  console.log(`📡 Cache duration: 4 hours`);
  console.log(`🌆 Cities available: ${Object.keys(cities).length}`);
  console.log(`🌧️ Rain intensities: light, medium, heavy`);
  console.log(`❄️ Snow intensities: light, medium, heavy`);
});
