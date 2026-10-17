
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weather-result");

function getWeatherInfo(code, isDay) {
    if (code === 0) {
        return isDay
            ? { condition: "Clear Sky", icon: "☀️" }
            : { condition: "Clear Sky", icon: "🌙" };
    }

    if (code === 1 || code === 2) {
        return { condition: "Partly Cloudy", icon: "🌤️" };
    }

    if (code === 3) {
        return { condition: "Overcast", icon: "☁️" };
    }

    if ([45, 48].includes(code)) {
        return { condition: "Foggy", icon: "🌫️" };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return { condition: "Drizzle", icon: "🌦️" };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { condition: "Rainy", icon: "🌧️" };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { condition: "Snowy", icon: "❄️" };
    }

    if ([95, 96, 99].includes(code)) {
        return { condition: "Thunderstorm", icon: "⛈️" };
    }

    return { condition: "Unknown", icon: "🌡️" };
}

async function getWeather(city) {
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    weatherResult.hidden = true;
    message.textContent = "Getting weather information...";

    try {
        const geoUrl = new URL(
            "https://geocoding-api.open-meteo.com/v1/search"
        );

        geoUrl.search = new URLSearchParams({
            name: city,
            count: "1",
            language: "en",
            format: "json"
        });

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }

        const place = geoData.results[0];

        const weatherUrl = new URL(
            "https://api.open-meteo.com/v1/forecast"
        );

        weatherUrl.search = new URLSearchParams({
            latitude: place.latitude,
            longitude: place.longitude,
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "weather_code",
                "wind_speed_10m"
            ].join(","),
            timezone: "auto"
        });

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        if (!current) {
            throw new Error("Weather data is unavailable.");
        }

        const weather = getWeatherInfo(
            current.weather_code,
            current.is_day
        );

        document.getElementById("city-name").textContent =
            `${place.name}, ${place.country}`;

        document.getElementById("weather-icon").textContent =
            weather.icon;

        document.getElementById("temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;

        document.getElementById("condition").textContent =
            weather.condition;

        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;

        document.getElementById("wind-speed").textContent =
            `${current.wind_speed_10m} km/h`;

        weatherResult.hidden = false;
        message.textContent = "Weather updated successfully!";
    } catch (error) {
        message.textContent =
            error instanceof TypeError
                ? "Network error. Please check your internet connection."
                : error.message || "Something went wrong. Please try again.";
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        weatherResult.hidden = true;
        return;
    }

    getWeather(city);
});
