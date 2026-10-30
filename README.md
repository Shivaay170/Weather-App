# 🌤️ SkyPulse - Simple & Elegant Weather App

A lightweight, modern weather forecast application powered by the free [Open-Meteo API](https://open-meteo.com/). No API keys or complicated setup required—just open and search any city in the world!

---

## ✨ Features

- **Worldwide City Search:** Type any city or town name with live autocomplete suggestions.
- **One-Click Popular Cities:** Quick chips for immediate forecasts (London, New York, Tokyo, Paris, Dubai, Sydney).
- **Geolocation Support:** One click on the GPS icon detects your current location weather.
- **Rich Weather Metrics:**
  - Real-time temperature & "Feels like" temperature
  - Humidity percentage & atmospheric comfort level
  - Wind speed & direction
  - UV index indicator
  - Atmospheric pressure (hPa)
  - Precipitation levels (mm)
  - Sunrise & sunset schedule
- **7-Day Outlook:** Daily high/low temperatures with weather condition icons.
- **Unit Toggle:** Easily switch between **Celsius (°C)** and **Fahrenheit (°F)**.
- **Dynamic Glassmorphic UI:** Smooth adaptive ambient theme that transitions based on day/night and conditions (Clear, Cloudy, Rain, Snow, Thunderstorm).

---

## 🚀 How to Run

### Option 1: Direct File
Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Local HTTP Server (Python)
If you prefer running via a local server:
```bash
# In the project directory:
python -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic structure, accessible inputs, and SEO-friendly tags.
- **Vanilla CSS3:** Custom modern design system, glassmorphism, responsive flex/grid, micro-animations.
- **Vanilla JavaScript:** Fast client-side logic, debounced search, Open-Meteo REST API integration.
- **API:** [Open-Meteo Geocoding & Weather Forecast API](https://open-meteo.com/) (Free, reliable, no API key needed).
