/**
 * SkyPulse Weather Application
 * Built with Vanilla JavaScript & Open-Meteo API (No API key required)
 */

(() => {
  // --- State ---
  const state = {
    currentUnit: 'c', // 'c' or 'f'
    currentLocation: {
      name: 'London',
      country: 'GB',
      countryCode: 'GB',
      latitude: 51.5085,
      longitude: -0.1257,
      timezone: 'auto'
    },
    weatherData: null,
    searchTimeout: null,
  };

  // --- DOM Elements ---
  const cityInput = document.getElementById('cityInput');
  const searchSubmitBtn = document.getElementById('searchSubmitBtn');
  const geoBtn = document.getElementById('geoBtn');
  const suggestionsBox = document.getElementById('suggestionsBox');
  const loader = document.getElementById('loader');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const weatherContent = document.getElementById('weatherContent');
  const unitToggle = document.getElementById('unitToggle');
  const btnCelsius = document.getElementById('btnCelsius');
  const btnFahrenheit = document.getElementById('btnFahrenheit');
  const quickChips = document.querySelectorAll('.chip');

  // Weather Displays
  const cityNameEl = document.getElementById('cityName');
  const countryCodeEl = document.getElementById('countryCode');
  const currentDateEl = document.getElementById('currentDate');
  const weatherConditionPill = document.getElementById('weatherConditionPill');
  const currentTempEl = document.getElementById('currentTemp');
  const feelsLikeEl = document.getElementById('feelsLike');
  const tempHighEl = document.getElementById('tempHigh');
  const tempLowEl = document.getElementById('tempLow');
  const heroIconEl = document.getElementById('heroIcon');

  // Highlights
  const humidityValEl = document.getElementById('humidityVal');
  const humidityDescEl = document.getElementById('humidityDesc');
  const windValEl = document.getElementById('windVal');
  const windDirDescEl = document.getElementById('windDirDesc');
  const uvValEl = document.getElementById('uvVal');
  const uvDescEl = document.getElementById('uvDesc');
  const pressureValEl = document.getElementById('pressureVal');
  const precipValEl = document.getElementById('precipVal');
  const precipDescEl = document.getElementById('precipDesc');
  const sunValEl = document.getElementById('sunVal');
  const forecastListEl = document.getElementById('forecastList');

  // --- Weather Interpretation & SVG Icons ---
  const WEATHER_CODES = {
    0: { desc: 'Clear Sky', icon: 'sun', theme: 'clear' },
    1: { desc: 'Mainly Clear', icon: 'partly-cloudy', theme: 'clear' },
    2: { desc: 'Partly Cloudy', icon: 'partly-cloudy', theme: 'cloudy' },
    3: { desc: 'Overcast', icon: 'cloudy', theme: 'cloudy' },
    45: { desc: 'Foggy', icon: 'fog', theme: 'cloudy' },
    48: { desc: 'Depositing Rime Fog', icon: 'fog', theme: 'cloudy' },
    51: { desc: 'Light Drizzle', icon: 'drizzle', theme: 'rain' },
    53: { desc: 'Moderate Drizzle', icon: 'drizzle', theme: 'rain' },
    55: { desc: 'Dense Drizzle', icon: 'drizzle', theme: 'rain' },
    56: { desc: 'Light Freezing Drizzle', icon: 'snow', theme: 'snow' },
    57: { desc: 'Dense Freezing Drizzle', icon: 'snow', theme: 'snow' },
    61: { desc: 'Slight Rain', icon: 'rain', theme: 'rain' },
    63: { desc: 'Moderate Rain', icon: 'rain', theme: 'rain' },
    65: { desc: 'Heavy Rain', icon: 'heavy-rain', theme: 'rain' },
    66: { desc: 'Light Freezing Rain', icon: 'snow', theme: 'snow' },
    67: { desc: 'Heavy Freezing Rain', icon: 'snow', theme: 'snow' },
    71: { desc: 'Slight Snow Fall', icon: 'snow', theme: 'snow' },
    73: { desc: 'Moderate Snow Fall', icon: 'snow', theme: 'snow' },
    75: { desc: 'Heavy Snow Fall', icon: 'snow', theme: 'snow' },
    77: { desc: 'Snow Grains', icon: 'snow', theme: 'snow' },
    80: { desc: 'Slight Rain Showers', icon: 'rain', theme: 'rain' },
    81: { desc: 'Moderate Rain Showers', icon: 'rain', theme: 'rain' },
    82: { desc: 'Violent Rain Showers', icon: 'heavy-rain', theme: 'rain' },
    85: { desc: 'Slight Snow Showers', icon: 'snow', theme: 'snow' },
    86: { desc: 'Heavy Snow Showers', icon: 'snow', theme: 'snow' },
    95: { desc: 'Thunderstorm', icon: 'thunder', theme: 'thunder' },
    96: { desc: 'Thunderstorm with Slight Hail', icon: 'thunder', theme: 'thunder' },
    99: { desc: 'Thunderstorm with Heavy Hail', icon: 'thunder', theme: 'thunder' },
  };

  function getWeatherIconSvg(iconType, isDay = 1) {
    if (iconType === 'sun' && !isDay) {
      // Moon
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M43 38.5C40.8 45.4 33.3 49.3 26.4 47.1C21.7 45.6 18.2 41.9 16.9 37.2C16 33.7 16.5 29.9 18.3 26.8C20 23.8 22.9 21.6 26.3 20.6C27.5 20.3 28.3 19.1 28 17.9C27.8 17.1 27.2 16.4 26.4 16.1C18.6 13.5 10.1 17.8 7.5 25.6C4.9 33.4 9.2 41.9 17 44.5C24.8 47.1 33.3 42.8 35.9 35C36.3 33.8 35.6 32.5 34.4 32.1C33.7 31.9 32.8 32.1 32.2 32.6C34.8 34.8 38.8 36.6 43 38.5Z" 
            fill="url(#moon-gradient)" stroke="#818cf8" stroke-width="1.5"/>
          <circle cx="48" cy="18" r="2" fill="#c7d2fe"/>
          <circle cx="54" cy="28" r="1.5" fill="#c7d2fe"/>
          <circle cx="42" cy="12" r="1" fill="#c7d2fe"/>
          <defs>
            <linearGradient id="moon-gradient" x1="12" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#e0e7ff"/>
              <stop offset="1" stop-color="#818cf8"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'sun') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="14" fill="url(#sun-grad)"/>
          <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
            <line x1="32" y1="6" x2="32" y2="12" />
            <line x1="32" y1="52" x2="32" y2="58" />
            <line x1="6" y1="32" x2="12" y2="32" />
            <line x1="52" y1="32" x2="58" y2="32" />
            <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
            <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
            <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
            <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
          </g>
          <defs>
            <linearGradient id="sun-grad" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fef08a"/>
              <stop offset="0.6" stop-color="#f59e0b"/>
              <stop offset="1" stop-color="#ea580c"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'partly-cloudy') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="24" r="11" fill="url(#sun-pc)"/>
          <path d="M46 44H22C17.6 44 14 40.4 14 36C14 31.8 17.2 28.3 21.3 28C22.6 22.3 27.7 18 33.7 18C40.6 18 46.2 23.3 46.6 30.1C49.7 30.8 52 33.6 52 37C52 40.9 49.3 44 46 44Z" 
            fill="url(#cloud-grad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
          <defs>
            <linearGradient id="sun-pc" x1="18" y1="16" x2="35" y2="33" gradientUnits="userSpaceOnUse">
              <stop stop-color="#fef08a"/>
              <stop offset="1" stop-color="#f59e0b"/>
            </linearGradient>
            <linearGradient id="cloud-grad" x1="14" y1="18" x2="52" y2="44" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffffff"/>
              <stop offset="1" stop-color="#cbd5e1"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'rain' || iconType === 'drizzle') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 36H21C17.1 36 14 32.9 14 29C14 25.3 16.8 22.3 20.4 22C21.6 17 26 13 31.3 13C37.4 13 42.3 17.7 42.7 23.7C45.4 24.3 47.5 26.8 47.5 29.8C47.5 33.2 45.1 36 45 36Z" 
            fill="url(#rain-cloud)"/>
          <g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
            <line x1="22" y1="42" x2="19" y2="49"/>
            <line x1="31" y1="42" x2="28" y2="49"/>
            <line x1="40" y1="42" x2="37" y2="49"/>
          </g>
          <defs>
            <linearGradient id="rain-cloud" x1="14" y1="13" x2="48" y2="36" gradientUnits="userSpaceOnUse">
              <stop stop-color="#e2e8f0"/>
              <stop offset="1" stop-color="#94a3b8"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'heavy-rain') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 34H21C17.1 34 14 30.9 14 27C14 23.3 16.8 20.3 20.4 20C21.6 15 26 11 31.3 11C37.4 11 42.3 15.7 42.7 21.7C45.4 22.3 47.5 24.8 47.5 27.8C47.5 31.2 45.1 34 45 34Z" 
            fill="url(#dark-cloud)"/>
          <g stroke="#0284c7" stroke-width="2.5" stroke-linecap="round">
            <line x1="20" y1="40" x2="17" y2="48"/>
            <line x1="28" y1="40" x2="25" y2="48"/>
            <line x1="36" y1="40" x2="33" y2="48"/>
            <line x1="44" y1="40" x2="41" y2="48"/>
            <line x1="24" y1="50" x2="21" y2="57"/>
            <line x1="32" y1="50" x2="29" y2="57"/>
            <line x1="40" y1="50" x2="37" y2="57"/>
          </g>
          <defs>
            <linearGradient id="dark-cloud" x1="14" y1="11" x2="48" y2="34" gradientUnits="userSpaceOnUse">
              <stop stop-color="#cbd5e1"/>
              <stop offset="1" stop-color="#64748b"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'snow') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 34H21C17.1 34 14 30.9 14 27C14 23.3 16.8 20.3 20.4 20C21.6 15 26 11 31.3 11C37.4 11 42.3 15.7 42.7 21.7C45.4 22.3 47.5 24.8 47.5 27.8C47.5 31.2 45.1 34 45 34Z" 
            fill="url(#snow-cloud)"/>
          <g fill="#bae6fd">
            <circle cx="21" cy="44" r="2.5"/>
            <circle cx="31" cy="44" r="2.5"/>
            <circle cx="41" cy="44" r="2.5"/>
            <circle cx="26" cy="52" r="2.5"/>
            <circle cx="36" cy="52" r="2.5"/>
          </g>
          <defs>
            <linearGradient id="snow-cloud" x1="14" y1="11" x2="48" y2="34" gradientUnits="userSpaceOnUse">
              <stop stop-color="#f8fafc"/>
              <stop offset="1" stop-color="#cbd5e1"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'thunder') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 32H21C17.1 32 14 28.9 14 25C14 21.3 16.8 18.3 20.4 18C21.6 13 26 9 31.3 9C37.4 9 42.3 13.7 42.7 19.7C45.4 20.3 47.5 22.8 47.5 25.8C47.5 29.2 45.1 32 45 32Z" 
            fill="url(#storm-cloud)"/>
          <polygon points="31,34 22,46 30,46 27,57 40,43 32,43" fill="#facc15" stroke="#eab308" stroke-width="1.2"/>
          <defs>
            <linearGradient id="storm-cloud" x1="14" y1="9" x2="48" y2="32" gradientUnits="userSpaceOnUse">
              <stop stop-color="#64748b"/>
              <stop offset="1" stop-color="#334155"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    if (iconType === 'fog') {
      return `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 30H21C17.1 30 14 26.9 14 23C14 19.3 16.8 16.3 20.4 16C21.6 11 26 7 31.3 7C37.4 7 42.3 11.7 42.7 17.7C45.4 18.3 47.5 20.8 47.5 23.8C47.5 27.2 45.1 30 45 30Z" 
            fill="url(#fog-cloud)" opacity="0.8"/>
          <g stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round">
            <line x1="16" y1="38" x2="48" y2="38"/>
            <line x1="20" y1="44" x2="44" y2="44"/>
            <line x1="18" y1="50" x2="46" y2="50"/>
          </g>
          <defs>
            <linearGradient id="fog-cloud" x1="14" y1="7" x2="48" y2="30" gradientUnits="userSpaceOnUse">
              <stop stop-color="#cbd5e1"/>
              <stop offset="1" stop-color="#94a3b8"/>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    // Default Cloudy
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M47 42H19C14.6 42 11 38.4 11 34C11 29.8 14.2 26.3 18.3 26C19.6 20.3 24.7 16 30.7 16C37.6 16 43.2 21.3 43.6 28.1C46.7 28.8 49 31.6 49 35C49 38.9 48.1 42 47 42Z" 
          fill="url(#cloudy-main)"/>
        <defs>
          <linearGradient id="cloudy-main" x1="11" y1="16" x2="49" y2="42" gradientUnits="userSpaceOnUse">
            <stop stop-color="#f8fafc"/>
            <stop offset="1" stop-color="#94a3b8"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  }

  // --- Helpers ---
  function cToF(celsius) {
    return Math.round((celsius * 9) / 5 + 32);
  }

  function formatTemp(tempC) {
    if (tempC === null || tempC === undefined) return '--';
    if (state.currentUnit === 'f') {
      return `${cToF(tempC)}°`;
    }
    return `${Math.round(tempC)}°`;
  }

  function formatSpeed(kmh) {
    if (state.currentUnit === 'f') {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  }

  function getWindDirection(deg) {
    if (deg === undefined || deg === null) return 'N';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  }

  function getUvDescription(uv) {
    if (uv <= 2) return 'Low danger';
    if (uv <= 5) return 'Moderate protection needed';
    if (uv <= 7) return 'High - Seek shade';
    if (uv <= 10) return 'Very high - Extra precautions';
    return 'Extreme danger';
  }

  function showLoading(show) {
    if (show) {
      loader.classList.add('visible');
      errorMessage.classList.remove('visible');
      weatherContent.classList.add('loading');
    } else {
      loader.classList.remove('visible');
      weatherContent.classList.remove('loading');
    }
  }

  function showError(msg) {
    showLoading(false);
    errorText.textContent = msg;
    errorMessage.classList.add('visible');
  }

  function clearError() {
    errorMessage.classList.remove('visible');
  }

  // --- API Calls ---

  // 1. Geocoding Search (Find coordinates for city name)
  async function searchLocations(query) {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error('Geocoding error:', err);
      return [];
    }
  }

  // 2. Fetch Forecast Data
  async function fetchWeatherData(lat, lon, timezone = 'auto') {
    showLoading(true);
    clearError();

    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max',
        timezone: timezone || 'auto'
      });

      const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather service returned ${response.status}`);
      }

      const data = await response.json();
      state.weatherData = data;
      renderWeather();
      showLoading(false);
    } catch (err) {
      showError(err.message || 'Could not fetch weather data. Check your internet connection.');
    }
  }

  // --- Render Functions ---
  function renderWeather() {
    if (!state.weatherData) return;

    const current = state.weatherData.current;
    const daily = state.weatherData.daily;
    const isDay = current.is_day !== 0;

    const weatherInfo = WEATHER_CODES[current.weather_code] || {
      desc: 'Clear',
      icon: 'sun',
      theme: isDay ? 'clear-day' : 'clear-night'
    };

    // Update dynamic theme on <body>
    let themeName = weatherInfo.theme;
    if (themeName === 'clear') {
      themeName = isDay ? 'clear-day' : 'clear-night';
    }
    document.body.setAttribute('data-weather', themeName);

    // City & Country
    cityNameEl.textContent = state.currentLocation.name;
    countryCodeEl.textContent = state.currentLocation.countryCode || state.currentLocation.country || '';
    
    // Date formatting
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    currentDateEl.textContent = dateStr;

    // Condition pill & Hero icon
    weatherConditionPill.textContent = weatherInfo.desc;
    heroIconEl.innerHTML = getWeatherIconSvg(weatherInfo.icon, current.is_day);

    // Temperatures
    currentTempEl.textContent = formatTemp(current.temperature_2m);
    feelsLikeEl.textContent = `Feels like ${formatTemp(current.apparent_temperature)}`;
    
    if (daily && daily.temperature_2m_max && daily.temperature_2m_max.length > 0) {
      tempHighEl.textContent = `H: ${formatTemp(daily.temperature_2m_max[0])}`;
      tempLowEl.textContent = `L: ${formatTemp(daily.temperature_2m_min[0])}`;
    }

    // Metrics
    humidityValEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    if (current.relative_humidity_2m > 70) {
      humidityDescEl.textContent = 'High humidity • Muggy';
    } else if (current.relative_humidity_2m < 35) {
      humidityDescEl.textContent = 'Dry atmospheric conditions';
    } else {
      humidityDescEl.textContent = 'Pleasant & comfortable';
    }

    windValEl.textContent = formatSpeed(current.wind_speed_10m);
    windDirDescEl.textContent = `Direction: ${getWindDirection(current.wind_direction_10m)} (${Math.round(current.wind_direction_10m)}°)`;

    const uv = daily && daily.uv_index_max ? daily.uv_index_max[0] : 0;
    uvValEl.textContent = uv ? uv.toFixed(1) : '0';
    uvDescEl.textContent = getUvDescription(uv);

    pressureValEl.textContent = `${Math.round(current.surface_pressure)} hPa`;

    const precip = current.precipitation !== undefined ? current.precipitation : 0;
    precipValEl.textContent = `${precip.toFixed(1)} mm`;
    if (precip > 2) {
      precipDescEl.textContent = 'Active precipitation underway';
    } else if (precip > 0) {
      precipDescEl.textContent = 'Light moisture observed';
    } else {
      precipDescEl.textContent = 'No current precipitation';
    }

    // Sun times
    if (daily && daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]) {
      const sunrise = daily.sunrise[0].split('T')[1];
      const sunset = daily.sunset[0].split('T')[1];
      sunValEl.textContent = `🌅 ${sunrise}  🌇 ${sunset}`;
    }

    // 7-day forecast
    renderForecast(daily);
  }

  function renderForecast(daily) {
    if (!daily || !daily.time) return;

    forecastListEl.innerHTML = '';
    const daysCount = Math.min(daily.time.length, 7);

    for (let i = 0; i < daysCount; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const isToday = i === 0;

      const dayName = isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const wCode = daily.weather_code[i];
      const info = WEATHER_CODES[wCode] || { icon: 'sun', desc: 'Clear' };

      const maxTemp = formatTemp(daily.temperature_2m_max[i]);
      const minTemp = formatTemp(daily.temperature_2m_min[i]);

      const card = document.createElement('div');
      card.className = `forecast-day-card ${isToday ? 'today' : ''}`;
      card.innerHTML = `
        <span class="forecast-day-name">${dayName}</span>
        <div class="forecast-icon">
          ${getWeatherIconSvg(info.icon, 1)}
        </div>
        <div class="forecast-temps">
          <span class="forecast-max">${maxTemp}</span>
          <span class="forecast-min">${minTemp}</span>
        </div>
      `;
      forecastListEl.appendChild(card);
    }
  }

  // --- Location Select & Search Actions ---
  function selectLocation(loc) {
    state.currentLocation = {
      name: loc.name,
      country: loc.country || '',
      countryCode: loc.country_code ? loc.country_code.toUpperCase() : (loc.country ? loc.country.slice(0, 2).toUpperCase() : ''),
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone || 'auto'
    };

    cityInput.value = '';
    closeSuggestions();
    fetchWeatherData(loc.latitude, loc.longitude, loc.timezone);
  }

  async function handleCitySearch(query) {
    if (!query || query.trim().length === 0) return;
    showLoading(true);
    closeSuggestions();

    const results = await searchLocations(query.trim());
    if (results && results.length > 0) {
      selectLocation(results[0]);
    } else {
      showError(`No locations found matching "${query}". Please check the spelling.`);
    }
  }

  function renderSuggestions(locations) {
    if (!locations || locations.length === 0) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.remove('visible');
      return;
    }

    suggestionsBox.innerHTML = locations.map((loc, idx) => {
      const region = [loc.admin1, loc.country].filter(Boolean).join(', ');
      return `
        <div class="suggestion-item" data-index="${idx}">
          <span class="suggestion-city">${loc.name}</span>
          <span class="suggestion-region">${region}</span>
        </div>
      `;
    }).join('');

    suggestionsBox.classList.add('visible');

    // Attach click events
    const items = suggestionsBox.querySelectorAll('.suggestion-item');
    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        selectLocation(locations[idx]);
      });
    });
  }

  function closeSuggestions() {
    suggestionsBox.innerHTML = '';
    suggestionsBox.classList.remove('visible');
  }

  // --- Geolocation ---
  function locateUser() {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser.');
      return;
    }

    showLoading(true);
    clearError();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        // Reverse geocoding via Open-Meteo or BigDataCloud client-friendly free endpoint
        try {
          const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (revRes.ok) {
            const revData = await revRes.json();
            const cityName = revData.city || revData.locality || 'Current Location';
            const countryCode = revData.countryCode || '';
            state.currentLocation = {
              name: cityName,
              country: revData.countryName || '',
              countryCode: countryCode,
              latitude: lat,
              longitude: lon,
              timezone: 'auto'
            };
          } else {
            state.currentLocation = {
              name: 'My Location',
              country: '',
              countryCode: 'GPS',
              latitude: lat,
              longitude: lon,
              timezone: 'auto'
            };
          }
        } catch {
          state.currentLocation = {
            name: 'My Location',
            country: '',
            countryCode: 'GPS',
            latitude: lat,
            longitude: lon,
            timezone: 'auto'
          };
        }

        fetchWeatherData(lat, lon);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        showError('Location access was denied or timed out. Please type a city name above.');
      },
      { timeout: 10000 }
    );
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Unit Toggle
    btnCelsius.addEventListener('click', () => {
      if (state.currentUnit !== 'c') {
        state.currentUnit = 'c';
        btnCelsius.classList.add('active');
        btnFahrenheit.classList.remove('active');
        renderWeather();
      }
    });

    btnFahrenheit.addEventListener('click', () => {
      if (state.currentUnit !== 'f') {
        state.currentUnit = 'f';
        btnFahrenheit.classList.add('active');
        btnCelsius.classList.remove('active');
        renderWeather();
      }
    });

    // Search input typing with debounce for autocomplete
    cityInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(state.searchTimeout);

      if (q.length < 2) {
        closeSuggestions();
        return;
      }

      state.searchTimeout = setTimeout(async () => {
        const results = await searchLocations(q);
        renderSuggestions(results);
      }, 300);
    });

    // Enter key
    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCitySearch(cityInput.value);
      } else if (e.key === 'Escape') {
        closeSuggestions();
      }
    });

    // Search Button
    searchSubmitBtn.addEventListener('click', () => {
      handleCitySearch(cityInput.value);
    });

    // Geolocation button
    geoBtn.addEventListener('click', () => {
      locateUser();
    });

    // Quick chips
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cityName = chip.getAttribute('data-city');
        cityInput.value = cityName;
        handleCitySearch(cityName);
      });
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-section')) {
        closeSuggestions();
      }
    });
  }

  // --- Initialization ---
  function init() {
    setupEventListeners();
    // Default load: London
    fetchWeatherData(state.currentLocation.latitude, state.currentLocation.longitude);
  }

  init();
})();
