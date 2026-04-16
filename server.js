const express = require('express');
const app = express();

// ============ YOUR MAJOR CITIES ============
// Add as many as you want! Format: 'cityname': { lat: number, lon: number }
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
  // Add more cities here following the same format
};

// Separate caches for weather and sun data
const weatherCache = new Map();  // 4 hour TTL
const sunCache = new Map();       // 24 hour TTL (sun data changes daily)

// Enable CORS so your React Native app can call this
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

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
  
  if (cached && (now - cached.timestamp) < 14400000) { // 4 hours
    console.log(`✅ Weather cache hit: ${cityName} (${Math.round((now - cached.timestamp) / 1000 / 60)} minutes old)`);
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
          'User-Agent': 'WeatherEffectsApp/1.0 (your-email@example.com)' // CHANGE THIS EMAIL
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MET API error: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.properties.timeseries[0].data;
    const symbolCode = current.next_1_hours?.summary.symbol_code ||
                       current.current?.summary.symbol_code;
    
    const weatherMap = {
      'clearsky': 'clear',
      'fair': 'clear',
      'fair_day': 'clear',
      'fair_night': 'clear',
      'partlycloudy': 'cloudy',
      'partlycloudy_day': 'cloudy',
      'partlycloudy_night': 'cloudy',
      'cloudy': 'cloudy',
      'rain': 'rain',
      'heavyrain': 'rain',
      'lightrain': 'rain',
      'rainandfog': 'rain',
      'snow': 'snow',
      'heavysnow': 'snow',
      'lightsnow': 'snow',
      'snowandfog': 'snow',
      'fog': 'fog',
      'thunderstorm': 'rain'
    };
    
    const weather = {
      condition: weatherMap[symbolCode] || 'clear',
      temperature: Math.round(current.instant.details.air_temperature),
      updatedAt: new Date().toISOString(),
      city: cityName
    };
    
    weatherCache.set(cityName, {
      data: weather,
      timestamp: now
    });
    
    res.json(weather);
    
  } catch (error) {
    console.error(`❌ Error fetching weather for ${cityName}:`, error.message);
    res.status(500).json({ 
      error: 'Weather service unavailable',
      message: error.message
    });
  }
});

// ============ SUNRISE/SUNSET ENDPOINT ============
app.get('/sun/:city', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ 
      error: 'City not found',
      availableCities: Object.keys(cities)
    });
  }
  
  // Get date from query parameter, default to today
  const date = req.query.date || new Date().toISOString().split('T')[0];
  
  // Check cache (24 hour TTL for sun data)
  const cacheKey = `sun_${cityName}_${date}`;
  const cached = sunCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < 86400000) { // 24 hours
    console.log(`✅ Sun cache hit: ${cityName} on ${date}`);
    return res.json(cached.data);
  }
  
  console.log(`🌅 Fetching sun data for: ${cityName} on ${date}`);
  
  try {
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    const response = await fetch(
      `https://api.met.no/weatherapi/sunrise/2.0/?lat=${lat}&lon=${lon}&date=${date}`,
      {
        headers: {
          'User-Agent': 'WeatherEffectsApp/1.0 (your-email@example.com)' // CHANGE THIS EMAIL
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MET Sun API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Calculate day and night duration
    const sunriseTime = data.properties.sunrise?.time;
    const sunsetTime = data.properties.sunset?.time;
    
    let dayDuration = null;
    let nightDuration = null;
    
    if (sunriseTime && sunsetTime) {
      const sunrise = new Date(sunriseTime);
      const sunset = new Date(sunsetTime);
      const dayMs = sunset - sunrise;
      const dayHours = Math.floor(dayMs / 3600000);
      const dayMinutes = Math.floor((dayMs % 3600000) / 60000);
      dayDuration = `${dayHours}h ${dayMinutes}m`;
      
      // Night duration = 24 hours - day duration
      const nightMs = 86400000 - dayMs;
      const nightHours = Math.floor(nightMs / 3600000);
      const nightMinutes = Math.floor((nightMs % 3600000) / 60000);
      nightDuration = `${nightHours}h ${nightMinutes}m`;
    }
    
    // Extract useful sun data
    const sunData = {
      city: cityName,
      date: date,
      sunrise: sunriseTime,
      sunset: sunsetTime,
      dayDuration: dayDuration,
      nightDuration: nightDuration,
      twilight: {
        civilDawn: data.properties.sun_altitude?.civil_twilight_start,
        civilDusk: data.properties.sun_altitude?.civil_twilight_end,
        nauticalDawn: data.properties.sun_altitude?.nautical_twilight_start,
        nauticalDusk: data.properties.sun_altitude?.nautical_twilight_end,
        astronomicalDawn: data.properties.sun_altitude?.astronomical_twilight_start,
        astronomicalDusk: data.properties.sun_altitude?.astronomical_twilight_end
      },
      moon: {
        phase: data.properties.moon_phase?.description,
        phaseValue: data.properties.moon_phase?.value,
        highMoon: data.properties.high_moon?.time,
        lowMoon: data.properties.low_moon?.time
      }
    };
    
    // Store in cache
    sunCache.set(cacheKey, {
      data: sunData,
      timestamp: now
    });
    
    res.json(sunData);
    
  } catch (error) {
    console.error(`❌ Error fetching sun data for ${cityName}:`, error.message);
    res.status(500).json({ 
      error: 'Sun data service unavailable',
      message: error.message
    });
  }
});

// ============ SUNRISE/SUNSET WITH DATE RANGE ============
app.get('/sunrange/:city', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ 
      error: 'City not found',
      availableCities: Object.keys(cities)
    });
  }
  
  // Get start and end dates (default to this week)
  const startDate = req.query.start || new Date().toISOString().split('T')[0];
  const endDate = req.query.end || (() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  })();
  
  console.log(`📅 Fetching sun data for ${cityName} from ${startDate} to ${endDate}`);
  
  try {
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    const response = await fetch(
      `https://api.met.no/weatherapi/sunrise/2.0/?lat=${lat}&lon=${lon}&from=${startDate}&to=${endDate}`,
      {
        headers: {
          'User-Agent': 'WeatherEffectsApp/1.0 (your-email@example.com)'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MET Sun API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data
    const results = [];
    for (const item of data.properties.sunrise) {
      results.push({
        date: item.date,
        sunrise: item.time,
        sunset: item.sunset?.time,
        dayDuration: item.day_duration
      });
    }
    
    res.json({
      city: cityName,
      startDate: startDate,
      endDate: endDate,
      data: results
    });
    
  } catch (error) {
    console.error(`❌ Error fetching sun range data:`, error.message);
    res.status(500).json({ 
      error: 'Sun data service unavailable',
      message: error.message
    });
  }
});

// ============ LIST ALL AVAILABLE CITIES ============
app.get('/cities', (req, res) => {
  res.json({
    count: Object.keys(cities).length,
    cities: Object.keys(cities)
  });
});

// ============ CACHE STATISTICS ============
app.get('/stats', (req, res) => {
  const weatherStats = {};
  const sunStats = {};
  const now = Date.now();
  
  for (const [city, data] of weatherCache.entries()) {
    const ageMinutes = Math.round((now - data.timestamp) / 1000 / 60);
    weatherStats[city] = {
      age: `${ageMinutes} minutes`,
      condition: data.data.condition,
      temperature: data.data.temperature
    };
  }
  
  for (const [key, data] of sunCache.entries()) {
    const ageHours = Math.round((now - data.timestamp) / 1000 / 60 / 60);
    sunStats[key] = `${ageHours} hours old`;
  }
  
  res.json({
    weatherCache: {
      count: Object.keys(weatherStats).length,
      details: weatherStats
    },
    sunCache: {
      count: Object.keys(sunStats).length,
      details: sunStats
    }
  });
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Weather & Sun API is running',
    weatherCacheDuration: '4 hours',
    sunCacheDuration: '24 hours',
    availableCities: Object.keys(cities).length,
    endpoints: {
      weather: '/weather/:city',
      sun: '/sun/:city',
      sunRange: '/sunrange/:city?start=YYYY-MM-DD&end=YYYY-MM-DD',
      cities: '/cities',
      stats: '/stats'
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Weather & Sun API running on port ${port}`);
  console.log(`📡 Weather cache: 4 hours`);
  console.log(`🌅 Sun cache: 24 hours`);
  console.log(`🌆 Cities available: ${Object.keys(cities).length}`);
});
