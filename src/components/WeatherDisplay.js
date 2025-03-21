import React, { useState, useRef, useEffect } from "react";
import sunglasses from "../logo/sunglasses.png";
import sunscreen from "../logo/sunscreen.png";
import hat from "../logo/hat.png";
import clothes from "../logo/clothes.png";
import tree from "../logo/tree.png";
import umbrella from "../logo/umbrella.png";
import house from "../logo/house.png";

/**
 * WeatherDisplay Component
 * Provides real-time weather information and UV protection recommendations based on location.
 * Integrates with OpenWeather API to fetch current weather conditions and UV index data.
 *
 * Features:
 * - Location-based weather and UV index tracking
 * - Dynamic UV protection recommendations
 * - Visual protection guides with intuitive icons
 * - Real-time temperature and weather description
 * - Responsive design for all screen sizes
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.RefObject} props.locationRef - Reference for scroll navigation
 * @returns {JSX.Element} Weather display section with UV protection recommendations
 */

// OpenWeather API key
const OPENWEATHER_API_KEY = "476e8dfbd2ea445a0f2a2d76630d978f";

const WeatherDisplay = ({ locationRef }) => {
    const [location, setLocation] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const suggestionsRef = useRef(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /**
     * Determines UV protection message and color based on UV index
     * @param {number} uvIndex - Current UV index value
     * @returns {Object} Object containing message, color, and protection recommendation
     */
    const getUVMessage = (uvIndex) => {
        if (uvIndex <= 2) {
            return {
                message: "Low",
                color: "green",
                protection: "Have fun outside!",
            };
        } else if (uvIndex >= 3 && uvIndex <= 5) {
            return {
                message: "Moderate",
                color: "yellow",
                protection: "SPF is your BFF, cover up and use sunscreen!",
            };
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            return {
                message: "High",
                color: "orange",
                protection:
                    "Sunburns are so last season, protect yourself and reduce your sun-time!",
            };
        } else if (uvIndex >= 8 && uvIndex <= 10) {
            return {
                message: "Very High",
                color: "red",
                protection:
                    "Avoid the Lobster Look, use sunscreen every 2 hours and minimise sun exposure!",
            };
        } else {
            return {
                message: "Extreme",
                color: "purple",
                protection: "UV off the Charts! You should be off the sun!",
            };
        }
    };

    /**
     * Fetches weather data from OpenWeather API
     * Makes multiple API calls to get coordinates, weather, and UV data
     * @param {string} searchLocation - Location string to search for
     * @returns {Promise<void>} Updates component state with weather data
     */
    const fetchWeatherData = async (searchLocation) => {
        try {
            setLoading(true);
            setError("");

            // First, get coordinates
            const geoResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${searchLocation}&limit=1&appid=${OPENWEATHER_API_KEY}`
            );
            const geoData = await geoResponse.json();

            if (!geoData.length) {
                throw new Error("Location not found");
            }

            const { lat, lon, name, country } = geoData[0];

            // Get weather data
            const weatherResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
            );
            const weatherResult = await weatherResponse.json();

            // Get UV data
            const uvResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
            );
            const uvData = await uvResponse.json();

            // Get timezone offset from weather data
            const timezoneOffset = weatherResult.timezone;
            const localTime = new Date(Date.now() + timezoneOffset * 1000);

            // Ensure UV index is a rounded integer
            const uvIndex = Math.round(Number(uvData.value));

            setWeatherData({
                temperature: Math.round(weatherResult.main.temp),
                description: weatherResult.weather[0].description,
                uvIndex: uvIndex,
                icon: weatherResult.weather[0].icon,
                location: name,
                country: country,
                time: localTime,
            });
        } catch (err) {
            setError("Failed to fetch weather data. Please try again.");
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocationSuggestions = async (searchText) => {
        if (!searchText.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${OPENWEATHER_API_KEY}`
            );
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Error fetching location suggestions:", err);
            setSuggestions([]);
        }
    };

    const handleLocationChange = (e) => {
        const value = e.target.value;
        setLocation(value);
        fetchLocationSuggestions(value);
    };

    const handleSuggestionClick = (suggestion) => {
        setLocation(`${suggestion.name}, ${suggestion.country}`);
        setShowSuggestions(false);
        fetchWeatherData(`${suggestion.name}, ${suggestion.country}`);
    };

    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (location.trim()) {
            fetchWeatherData(location.trim());
        }
    };

    /**
     * Renders protection recommendation icons based on UV index level
     * Displays appropriate protection measures using visual icons
     * @param {number} uvIndex - Current UV index value
     * @returns {JSX.Element} Grid of protection recommendation icons
     */
    const renderProtectionIcons = (uvIndex) => {
        const allIcons = [
            { src: sunglasses, alt: "Sunglasses", text: "Use sunglasses" },
            { src: sunscreen, alt: "Sunscreen", text: "Wear sunscreen" },
            { src: hat, alt: "Hat", text: "Wear a hat" },
            { src: clothes, alt: "Clothes", text: "Wear protective clothing" },
            { src: tree, alt: "Tree", text: "Stay in shade" },
            { src: umbrella, alt: "Umbrella", text: "Reduce time in the sun" },
            { src: house, alt: "House", text: "Avoid the sun" },
        ];

        let iconsToShow = [];
        if (uvIndex <= 2) {
            iconsToShow = allIcons.slice(0, 4);
        } else if (uvIndex <= 5) {
            iconsToShow = allIcons.slice(0, 5);
        } else if (uvIndex <= 7) {
            iconsToShow = allIcons.slice(0, 6);
        } else {
            iconsToShow = allIcons;
        }

        return (
            <p
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "center",
                    maxWidth: "840px",
                    margin: "0 auto",
                    padding: "10px",
                }}
            >
                {iconsToShow.map((icon, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: "center",
                            width: "100px",
                        }}
                    >
                        <img
                            src={icon.src}
                            alt={icon.alt}
                            style={{
                                width: "100px",
                                height: "100px",
                            }}
                        />
                        <p
                            style={{
                                marginTop: "5px",
                                fontSize: "0.6em",
                                lineHeight: "1.2",
                            }}
                        >
                            {icon.text}
                        </p>
                    </div>
                ))}
            </p>
        );
    };

    return (
        <div
            className="App-theme"
            ref={locationRef}
            style={{
                display: "block",
                textAlign: "center",
                paddingTop: "2rem",
            }}
        >
            <h1>Where's the Sun?</h1>
            <p>Tell us your location</p>
            <p>↓</p>
            <div
                className="location-form-container"
                style={{ position: "relative" }}
            >
                <form onSubmit={handleLocationSubmit} className="location-form">
                    <input
                        type="text"
                        className="location-input"
                        placeholder="Enter your location"
                        value={location}
                        onChange={handleLocationChange}
                        autoComplete="off"
                        style={{ width: "80%", maxWidth: "400px" }}
                    />
                    <button type="submit" className="reminder-button">
                        Search
                    </button>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        className="location-suggestions"
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "80%",
                            maxWidth: "400px",
                            backgroundColor: "#282c34",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                            borderRadius: "4px",
                            zIndex: 1000,
                            marginTop: "4px",
                            border: "2px solid #4caf50",
                            color: "white",
                        }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.name}-${suggestion.country}-${index}`}
                                onClick={() =>
                                    handleSuggestionClick(suggestion)
                                }
                                style={{
                                    padding: "12px",
                                    cursor: "pointer",
                                    borderBottom:
                                        index < suggestions.length - 1
                                            ? "1px solid rgba(255, 255, 255, 0.1)"
                                            : "none",
                                    transition: "all 0.2s ease",
                                    textAlign: "left",
                                    fontSize: "0.9em",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#4caf50";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "#282c34";
                                }}
                            >
                                {suggestion.name},{" "}
                                {suggestion.state
                                    ? `${suggestion.state}, `
                                    : ""}
                                {suggestion.country}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            {weatherData && (
                <div className="weather-container">
                    <div className="location-info">
                        <h2>
                            {weatherData.location}, {weatherData.country}
                        </h2>
                    </div>
                    <div className="weather-info">
                        <h2>{weatherData.temperature}°C</h2>
                        <p>{weatherData.description}</p>
                    </div>

                    <div className="uv-info">
                        <h3>UV Index: {Math.round(weatherData.uvIndex)}</h3>
                        <div
                            className="uv-status"
                            style={{
                                color: getUVMessage(weatherData.uvIndex).color,
                                fontWeight: "bold",
                            }}
                        >
                            {getUVMessage(weatherData.uvIndex).message}
                        </div>
                        {getUVMessage(weatherData.uvIndex).protection && (
                            <p className="uv-protection">
                                {getUVMessage(weatherData.uvIndex).protection}
                            </p>
                        )}
                        <div className="protection-recommendations">
                            {renderProtectionIcons(weatherData.uvIndex)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherDisplay;
