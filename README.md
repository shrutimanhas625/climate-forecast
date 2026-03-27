**🌦️ Weather Forecast Web App**

**A modern and interactive weather application that allows users to search for any location and view real-time weather updates, hourly forecasts, and a 7-day weather outlook.**

**🚀 Features**

- 🌍 Search weather by city name
- 📍 Detect current location using Geolocation
- 🌡️ Toggle between Celsius (°C) and Fahrenheit (°F)
- ⏱️ 24-hour weather forecast
- 📅 7-day weather forecast
- 💾 Save recent locations
- 🎨 Dynamic UI based on weather conditions (day/night & weather type)
- ⚡ Fast and responsive interface
  
**🛠️ Technologies Used**

- HTML5 – Structure of the application
- CSS3 – Styling and layout
- JavaScript (Vanilla JS) – Core functionality
- Open-Meteo API – Weather data
- Geolocation API – User location detection
- LocalStorage – Saving user preferences and recent searches
- Lucide Icons – Weather icons

 ** ⚙️ How It Works**
 
* App Initialization
  - Loads saved preferences (units, last location) from localStorage
  - Attempts to fetch user’s current location
* Weather Data Fetching
  - Uses Open-Meteo API to get:
    - Current weather
    - Hourly forecast
    - Daily forecast
* Search Functionality
  - Users can search cities
  - Results fetched from geocoding API
  - Selected city updates weather instantly
* Dynamic UI Updates
  - Weather conditions update:
    - Icons
    - Background theme
    - Temperature values
* State Management
  - A central state object manages:
    - Units
    - Location
    - Saved locations
    - Weather data
      
**📸 Screens / Views**
- 🏠 Home View – Current weather overview
- 🔍 Search View – Find locations
- ⚙️ Settings View – Change temperature unit

**🌐 Live Demo**

👉 Add your deployed Netlify/Vercel link here

**💡 Future Improvements**
- 🌙 Dark mode toggle
- 📊 Weather charts & graphs
- 🔔 Weather alerts/notifications
- 🌎 Map integration
- 📱 PWA (Progressive Web App) support
- 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

**📜 License**

This project is open-source and available under the MIT License.

**👩‍💻 Author**

Shruti Manhas
