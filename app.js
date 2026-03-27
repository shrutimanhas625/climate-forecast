// App State
const state = {
    units: 'celsius', // or 'fahrenheit'
    currentLocation: {
        name: 'London',
        lat: 51.5085,
        lon: -0.1257
    },
    savedLocations: JSON.parse(localStorage.getItem('savedLocations')) || [],
    currentWeatherData: null
};

// WMO Weather interpretation codes
const weatherCodes = {
    0: { label: 'Clear sky', icon: 'sun', bg: 'clear', nightIcon: 'moon', nightBg: 'clear-night' },
    1: { label: 'Mainly clear', icon: 'sun', bg: 'clear', nightIcon: 'moon', nightBg: 'clear-night' },
    2: { label: 'Partly cloudy', icon: 'cloud-sun', bg: 'clouds', nightIcon: 'cloud-moon', nightBg: 'clouds' },
    3: { label: 'Overcast', icon: 'cloud', bg: 'clouds', nightIcon: 'cloud', nightBg: 'clouds' },
    45: { label: 'Fog', icon: 'cloud-fog', bg: 'clouds', nightIcon: 'cloud-fog', nightBg: 'clouds' },
    48: { label: 'Depositing rime fog', icon: 'cloud-fog', bg: 'clouds', nightIcon: 'cloud-fog', nightBg: 'clouds' },
    51: { label: 'Light drizzle', icon: 'cloud-drizzle', bg: 'rain', nightIcon: 'cloud-drizzle', nightBg: 'rain' },
    53: { label: 'Moderate drizzle', icon: 'cloud-drizzle', bg: 'rain', nightIcon: 'cloud-drizzle', nightBg: 'rain' },
    55: { label: 'Dense drizzle', icon: 'cloud-drizzle', bg: 'rain', nightIcon: 'cloud-drizzle', nightBg: 'rain' },
    56: { label: 'Light freezing drizzle', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    57: { label: 'Dense freezing drizzle', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    61: { label: 'Slight rain', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    63: { label: 'Moderate rain', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    65: { label: 'Heavy rain', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    66: { label: 'Light freezing rain', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    67: { label: 'Heavy freezing rain', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    71: { label: 'Slight snow fall', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    73: { label: 'Moderate snow fall', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    75: { label: 'Heavy snow fall', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    77: { label: 'Snow grains', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    80: { label: 'Slight rain showers', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    81: { label: 'Moderate rain showers', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    82: { label: 'Violent rain showers', icon: 'cloud-rain', bg: 'rain', nightIcon: 'cloud-rain', nightBg: 'rain' },
    85: { label: 'Slight snow showers', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    86: { label: 'Heavy snow showers', icon: 'cloud-snow', bg: 'snow', nightIcon: 'cloud-snow', nightBg: 'snow' },
    95: { label: 'Thunderstorm', icon: 'cloud-lightning', bg: 'thunderstorm', nightIcon: 'cloud-lightning', nightBg: 'thunderstorm' },
    96: { label: 'Thunderstorm slight hail', icon: 'cloud-lightning', bg: 'thunderstorm', nightIcon: 'cloud-lightning', nightBg: 'thunderstorm' },
    99: { label: 'Thunderstorm heavy hail', icon: 'cloud-lightning', bg: 'thunderstorm', nightIcon: 'cloud-lightning', nightBg: 'thunderstorm' },
};

// Initialize Lucide icons
lucide.createIcons();

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const searchTriggers = document.querySelectorAll('.search-trigger');

// Router
function navigateTo(viewId) {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    navItems.forEach(item => {
        if(item.dataset.target === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Event Listeners for Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.target);
    });
});
searchTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => navigateTo('search-view'));
});

// Initialization
async function initApp() {
    // Load config from local storage
    const savedUnit = localStorage.getItem('weatherUnit');
    if (savedUnit) {
        state.units = savedUnit;
        document.getElementById('unit-toggle').checked = (savedUnit === 'fahrenheit');
    }
    
    const lastLoc = localStorage.getItem('lastLocation');
    if (lastLoc) {
        state.currentLocation = JSON.parse(lastLoc);
    } else {
        // Automatically request geolocation on first load if no last location
        tryToGeolocation();
    }
    
    renderSavedLocations();
    await fetchWeatherData();
    
    // Add settings listener
    document.getElementById('unit-toggle').addEventListener('change', (e) => {
        state.units = e.target.checked ? 'fahrenheit' : 'celsius';
        localStorage.setItem('weatherUnit', state.units);
        updateUI(state.currentWeatherData);
    });
    
    document.getElementById('use-current-location').addEventListener('click', () => {
        tryToGeolocation();
    });
    
    // Search listener
    let debounceTimer;
    document.getElementById('city-search').addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query.length > 2) {
            debounceTimer = setTimeout(() => searchCity(query), 500);
        } else {
            document.getElementById('search-results').classList.remove('active');
        }
    });
}

async function tryToGeolocation() {
    const btn = document.getElementById('use-current-location');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="loading"></i> Locating...';
    lucide.createIcons();
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Reverse geocode
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await res.json();
                    
                    let city = data.address.city || data.address.town || data.address.village || "Current Location";
                    
                    state.currentLocation = { name: city, lat, lon, country: data.address.country || "" };
                    localStorage.setItem('lastLocation', JSON.stringify(state.currentLocation));
                    
                    btn.innerHTML = originalText;
                    lucide.createIcons();
                    await fetchWeatherData();
                    navigateTo('home-view');
                } catch (e) {
                    console.error("Geocoding failed", e);
                    // Fallback to coordinates
                    state.currentLocation = { name: "Current Location", lat, lon, country: "" };
                    localStorage.setItem('lastLocation', JSON.stringify(state.currentLocation));
                    btn.innerHTML = originalText;
                    lucide.createIcons();
                    await fetchWeatherData();
                    navigateTo('home-view');
                }
            },
            (error) => {
                console.error("Error getting location: ", error);
                alert("Location access denied or unavailable. Using default location.");
                btn.innerHTML = originalText;
                lucide.createIcons();
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
        btn.innerHTML = originalText;
        lucide.createIcons();
    }
}

// API Calls
async function searchCity(query) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await res.json();
        
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        
        if (data.results && data.results.length > 0) {
            data.results.forEach(city => {
                const div = document.createElement('div');
                div.className = 'location-item';
                div.innerHTML = `
                    <div class="location-item-title">${city.name}</div>
                    <div class="location-item-subtitle">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</div>
                `;
                div.addEventListener('click', () => {
                    selectLocation({
                        name: city.name,
                        lat: city.latitude,
                        lon: city.longitude,
                        country: city.country
                    });
                });
                resultsContainer.appendChild(div);
            });
            resultsContainer.classList.add('active');
        } else {
            resultsContainer.innerHTML = '<div class="empty-state">No locations found</div>';
            resultsContainer.classList.add('active');
        }
    } catch (e) {
        console.error("Search failed", e);
    }
}

async function selectLocation(loc) {
    state.currentLocation = loc;
    document.getElementById('search-results').classList.remove('active');
    document.getElementById('city-search').value = '';
    
    // Save to recents
    const existsIndex = state.savedLocations.findIndex(l => l.name === loc.name);
    if (existsIndex > -1) {
        state.savedLocations.splice(existsIndex, 1);
    }
    state.savedLocations.unshift(loc);
    if (state.savedLocations.length > 5) state.savedLocations.pop(); // Keep 5
    
    localStorage.setItem('savedLocations', JSON.stringify(state.savedLocations));
    localStorage.setItem('lastLocation', JSON.stringify(loc));
    
    renderSavedLocations();
    await fetchWeatherData();
    navigateTo('home-view');
}

function renderSavedLocations() {
    const container = document.getElementById('saved-locations');
    container.innerHTML = '';
    if (state.savedLocations.length === 0) {
        container.innerHTML = '<div class="empty-state">No saved locations</div>';
        return;
    }
    
    state.savedLocations.forEach(loc => {
        const div = document.createElement('div');
        div.className = 'location-item';
        div.innerHTML = `
            <div class="location-item-title">${loc.name}</div>
            <div class="location-item-subtitle">${loc.country || ''}</div>
        `;
        div.addEventListener('click', () => {
            state.currentLocation = loc;
            localStorage.setItem('lastLocation', JSON.stringify(loc));
            fetchWeatherData();
            navigateTo('home-view');
        });
        container.appendChild(div);
    });
}

async function fetchWeatherData() {
    const { lat, lon } = state.currentLocation;
    document.getElementById('current-location').innerText = 'Updating...';
    
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        state.currentWeatherData = data;
        updateUI(data);
        
    } catch (error) {
        console.error("Failed to fetch weather data", error);
        document.getElementById('current-location').innerText = 'Error loading data';
    }
}

// Convert temperature if needed
function getTemp(celsius) {
    if (state.units === 'fahrenheit') {
        return Math.round((celsius * 9/5) + 32);
    }
    return Math.round(celsius);
}

// UI Updating
function updateUI(data) {
    if (!data) return;
    
    // Update Theme based on weather and day/night
    const currentCode = data.current.weather_code;
    const isDay = data.current.is_day === 1;
    const ws = weatherCodes[currentCode] || weatherCodes[0];
    
    const bgTheme = isDay ? ws.bg : ws.nightBg;
    document.body.setAttribute('data-weather', bgTheme);
    
    // Format displays
    const tempUnitStr = state.units === 'celsius' ? '°C' : '°F';
    
    // 1. Home View
    document.getElementById('current-location').innerText = state.currentLocation.name;
    document.getElementById('current-temp').innerText = `${getTemp(data.current.temperature_2m)}°`;
    document.getElementById('current-condition').innerText = ws.label;
    
    const iconName = isDay ? ws.icon : ws.nightIcon;
    document.getElementById('current-icon').innerHTML = `<i data-lucide="${iconName}"></i>`;
    
    document.getElementById('current-high').innerText = `${getTemp(data.daily.temperature_2m_max[0])}°`;
    document.getElementById('current-low').innerText = `${getTemp(data.daily.temperature_2m_min[0])}°`;
    
    document.getElementById('current-humidity').innerText = `${data.current.relative_humidity_2m}%`;
    document.getElementById('current-wind').innerText = `${Math.round(data.current.wind_speed_10m)} km/h`;
    document.getElementById('current-uv').innerText = Math.round(data.daily.uv_index_max[0] || 0);
    
    // 2. Hourly View (Next 24 hours)
    const currentHourIndex = new Date().getHours();
    const hourlyContainer = document.getElementById('hourly-container');
    let hourlyHTML = '';
    
    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
        const timeObj = new Date(data.hourly.time[i]);
        let timeStr = timeObj.getHours() + ':00';
        if(i === currentHourIndex) timeStr = 'Now';
        
        const hCode = data.hourly.weather_code[i];
        // Assume day for hourly unless 18:00 - 06:00
        const hIsDay = timeObj.getHours() >= 6 && timeObj.getHours() < 18;
        const hWs = weatherCodes[hCode] || weatherCodes[0];
        const hIcon = hIsDay ? hWs.icon : hWs.nightIcon;
        
        hourlyHTML += `
            <div class="hourly-item">
                <div class="hourly-time">${timeStr}</div>
                <div class="hourly-icon"><i data-lucide="${hIcon}"></i></div>
                <div class="hourly-temp">${getTemp(data.hourly.temperature_2m[i])}°</div>
            </div>
        `;
    }
    hourlyContainer.innerHTML = hourlyHTML;
    
    // 3. Daily View (7 days)
    const dailyContainer = document.getElementById('daily-container');
    let dailyHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
        const dateObj = new Date(data.daily.time[i]);
        let dayStr = days[dateObj.getDay()];
        if(i === 0) dayStr = 'Today';
        
        const dCode = data.daily.weather_code[i];
        const dWs = weatherCodes[dCode] || weatherCodes[0];
        
        dailyHTML += `
            <div class="daily-item">
                <div class="daily-day">${dayStr}</div>
                <div class="daily-center"><i data-lucide="${dWs.icon}"></i></div>
                <div class="daily-temps">
                    <span class="daily-low">${getTemp(data.daily.temperature_2m_min[i])}°</span>
                    <span class="daily-high">${getTemp(data.daily.temperature_2m_max[i])}°</span>
                </div>
            </div>
        `;
    }
    dailyContainer.innerHTML = dailyHTML;
    
    // Re-initialize icons for newly injected HTML
    lucide.createIcons();
}

// Start App
document.addEventListener('DOMContentLoaded', initApp);
