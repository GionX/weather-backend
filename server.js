const express = require('express');
const app = express();

// ============ YOUR MAJOR CITIES ============
const cities = {
  // ============ HIGH RAINFALL CITIES (April) ============
  'london': { lat: 51.5074, lon: -0.1278 },        // UK - April showers
  'manchester': { lat: 53.4808, lon: -2.2426 },    // UK - Very rainy
  'glasgow': { lat: 55.8642, lon: -4.2518 },       // Scotland - High rainfall
  'amsterdam': { lat: 52.3676, lon: 4.9041 },      // Netherlands - Rainy Aprils
  'brussels': { lat: 50.8503, lon: 4.3517 },       // Belgium - Frequent rain
  'paris': { lat: 48.8566, lon: 2.3522 },          // France - Spring showers
  'zurich': { lat: 47.3769, lon: 8.5417 },         // Switzerland - April rain
  
  // ============ TROPICAL RAIN CITIES ============
  'singapore': { lat: 1.3521, lon: 103.8198 },     // Singapore - Daily rain
  'jakarta': { lat: -6.2088, lon: 106.8456 },      // Indonesia - Heavy rain
  'bangkok': { lat: 13.7367, lon: 100.5231 },      // Thailand - Rainy season
  'manila': { lat: 14.5995, lon: 120.9842 },       // Philippines - High rain
  'mumbai': { lat: 19.0760, lon: 72.8777 },        // India - Pre-monsoon rain
  'chennai': { lat: 13.0827, lon: 80.2707 },       // India - Humid with rain
  'kualalumpur': { lat: 3.1390, lon: 101.6869 },   // Malaysia - Daily rain
  
  // ============ PACIFIC NORTHWEST (Rainy Aprils) ============
  'seattle': { lat: 47.6062, lon: -122.3321 },     // USA - Very rainy April
  'vancouver': { lat: 49.2827, lon: -123.1207 },   // Canada - Rainy spring
  'portland': { lat: 45.5152, lon: -122.6784 },    // USA - High April rainfall
  
  // ============ SOUTH AMERICAN RAIN ============
  'riodejaneiro': { lat: -22.9068, lon: -43.1729 }, // Brazil - Rain possible
  'bogota': { lat: 4.7110, lon: -74.0721 },        // Colombia - Frequent rain
  'lima': { lat: -12.0464, lon: -77.0428 },        // Peru - Light rain possible
  
  // ============ AFRICAN RAIN ============
  'lagos': { lat: 6.5244, lon: 3.3792 },           // Nigeria - Heavy rain
  'nairobi': { lat: -1.2921, lon: 36.8219 },       // Kenya - Rainy season
  'addisababa': { lat: 9.0320, lon: 38.7468 },     // Ethiopia - Spring rain
  
  // ============ AUSTRALIAN/ASIAN RAIN ============
  'sydney': { lat: -33.8688, lon: 151.2093 },      // Australia - April showers
  'auckland': { lat: -36.8485, lon: 174.7633 },    // New Zealand - High rain
  'hongkong': { lat: 22.3193, lon: 114.1694 },     // China - Humid with rain
  'taipei': { lat: 25.0330, lon: 121.5654 },       // Taiwan - Frequent rain
  'osaka': { lat: 34.6937, lon: 135.5023 },        // Japan - Spring rain
  
  // ============ EUROPEAN RAIN ============
  'dublin': { lat: 53.3498, lon: -6.2603 },        // Ireland - Very rainy
  'edinburgh': { lat: 55.9533, lon: -3.1883 },     // Scotland - High rain
  'bergen': { lat: 60.3913, lon: 5.3221 },         // Norway - Rain capital
  'copenhagen': { lat: 55.6761, lon: 12.5683 },    // Denmark - April showers
  
  // ============ NORTH AMERICAN RAIN ============
  'miami': { lat: 25.7617, lon: -80.1918 },        // USA - Thunderstorms
  'orlando': { lat: 28.5383, lon: -81.3792 },      // USA - Afternoon rain
  'neworleans': { lat: 29.9511, lon: -90.0715 },   // USA - High humidity/rain
  'atlanta': { lat: 33.7490, lon: -84.3880 },      // USA - Spring storms
  
  // ============ NEW YORK & EAST COAST ============
  'newyork': { lat: 40.7128, lon: -74.0060 },      // USA - New York City
  'newyorkcity': { lat: 40.7128, lon: -74.0060 },  // USA - New York City alias
  'nyc': { lat: 40.7128, lon: -74.0060 },          // USA - NYC alias
  'boston': { lat: 42.3601, lon: -71.0589 },       // USA - Boston
  'washington': { lat: 38.9072, lon: -77.0369 },   // USA - Washington DC
  'philadelphia': { lat: 39.9526, lon: -75.1652 }, // USA - Philadelphia
  'chicago': { lat: 41.8781, lon: -87.6298 },      // USA - Chicago
  'detroit': { lat: 42.3314, lon: -83.0458 },      // USA - Detroit
  
  // ============ WEST COAST ============
  'losangeles': { lat: 34.0522, lon: -118.2437 },  // USA - Los Angeles
  'la': { lat: 34.0522, lon: -118.2437 },          // USA - LA alias
  'sandiego': { lat: 32.7157, lon: -117.1611 },    // USA - San Diego
  'sanfrancisco': { lat: 37.7749, lon: -122.4194 }, // USA - San Francisco
  'sf': { lat: 37.7749, lon: -122.4194 },          // USA - SF alias
  'oakland': { lat: 37.8044, lon: -122.2712 },     // USA - Oakland
  'sanjose': { lat: 37.3382, lon: -121.8863 },     // USA - San Jose
  
  // ============ SOUTHERN USA ============
  'austin': { lat: 30.2672, lon: -97.7431 },       // USA - Austin
  'dallas': { lat: 32.7767, lon: -96.7970 },       // USA - Dallas
  'houston': { lat: 29.7604, lon: -95.3698 },      // USA - Houston
  'nashville': { lat: 36.1627, lon: -86.7816 },    // USA - Nashville
  'charlotte': { lat: 35.2271, lon: -80.8431 },    // USA - Charlotte
  
  // ============ MOUNTAIN WEST ============
  'denver': { lat: 39.7392, lon: -104.9903 },      // USA - Late snow possible
  'saltlakecity': { lat: 40.7608, lon: -111.8910 }, // USA - Salt Lake City
  'lasvegas': { lat: 36.1699, lon: -115.1398 },    // USA - Las Vegas
  'phoenix': { lat: 33.4484, lon: -112.0740 },     // USA - Desert dry
  'tucson': { lat: 32.2226, lon: -110.9747 },      // USA - Tucson
  
  // ============ CANADIAN CITIES ============
  'toronto': { lat: 43.6532, lon: -79.3832 },      // Canada - Toronto
  'montreal': { lat: 45.5017, lon: -73.5673 },     // Canada - Montreal
  'ottawa': { lat: 45.4215, lon: -75.6972 },       // Canada - Ottawa
  'calgary': { lat: 51.0447, lon: -114.0719 },     // Canada - April snow
  'edmonton': { lat: 53.5461, lon: -113.4938 },    // Canada - Edmonton
  'anchorage': { lat: 61.2181, lon: -149.9003 },   // USA - Still snow in April
  
  // ============ CLEAR SKY CITIES (For comparison) ============
  'cairo': { lat: 30.0444, lon: 31.2357 },         // Egypt - Dry
  'dubai': { lat: 25.2048, lon: 55.2708 },         // UAE - Sunny
  
  // ============ EUROPEAN ADDITIONS ============
  'berlin': { lat: 52.5200, lon: 13.4050 },        // Germany - Berlin
  'munich': { lat: 48.1351, lon: 11.5820 },        // Germany - Munich
  'vienna': { lat: 48.2082, lon: 16.3738 },        // Austria - Vienna
  'prague': { lat: 50.0755, lon: 14.4378 },        // Czech Republic - Prague
  'budapest': { lat: 47.4979, lon: 19.0402 },      // Hungary - Budapest
  'warsaw': { lat: 52.2297, lon: 21.0122 },        // Poland - Warsaw
  'madrid': { lat: 40.4168, lon: -3.7038 },        // Spain - Madrid
  'barcelona': { lat: 41.3851, lon: 2.1734 },      // Spain - Barcelona
  'rome': { lat: 41.9028, lon: 12.4964 },          // Italy - Rome
  'milan': { lat: 45.4642, lon: 9.1900 },          // Italy - Milan
  
  // ============ ASIAN ADDITIONS ============
  'tokyo': { lat: 35.6762, lon: 139.6503 },        // Japan - Tokyo
  'seoul': { lat: 37.5665, lon: 126.9780 },        // South Korea - Seoul
  'beijing': { lat: 39.9042, lon: 116.4074 },      // China - Beijing
  'shanghai': { lat: 31.2304, lon: 121.4737 },     // China - Shanghai
  'delhi': { lat: 28.6139, lon: 77.2090 },         // India - Delhi
  'bangalore': { lat: 12.9716, lon: 77.5946 },     // India - Bangalore
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
