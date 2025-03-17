import logo from "./sun.png";
import "./App.css";
import { useRef, useState } from "react";

const OPENWEATHER_API_KEY = "476e8dfbd2ea445a0f2a2d76630d978f";

// Create notification sound
const notificationSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
);
notificationSound.volume = 0.3; // Reduced volume for the shorter sound

/**
 * Main application component for UV Protection Guide
 * Provides real-time weather information, UV index data, and personalized sun protection recommendations
 * based on user location and Fitzpatrick skin type scale.
 *
 * Features:
 * - Location-based weather and UV index tracking
 * - Skin type-specific protection guidelines
 * - Custom reminder system for sunscreen application
 * - Responsive navigation with smooth scrolling
 */
function App() {
    // Refs for smooth scrolling to different sections
    const homeRef = useRef(null);
    const locationRef = useRef(null);
    const uvImpactsRef = useRef(null);
    const uvSkinToneRef = useRef(null);
    const remindersRef = useRef(null);
    const clothingRef = useRef(null);

    // State management for user inputs and API data
    const [selectedTime, setSelectedTime] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [skinTone, setSkinTone] = useState("");
    const [location, setLocation] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Fitzpatrick scale skin tone color mapping
    const skinToneColors = {
        type1: "#FFE3E3", // Light pale, white
        type2: "#FFD8C4", // White, fair
        type3: "#E5B887", // Medium, white to olive
        type4: "#C99364", // Olive, moderate brown
        type5: "#8D5524", // Brown, dark brown
        type6: "#413333", // Black, brown to black
    };

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: "smooth" });
    };

    /**
     * Sets up a reminder notification for sunscreen application
     * Displays popup for 3 seconds
     */
    const handleReminder = () => {
        setShowPopup(true);
        setSelectedTime(""); // Reset the time
        notificationSound.play().catch((error) => {
            console.log("Audio playback failed:", error);
        });
    };

    const handleDismissPopup = () => {
        setShowPopup(false);
    };

    /**
     * Determines UV risk level and protection recommendations based on UV index value
     * @param {number} uvIndex - UV index value from OpenWeather API (0-11+ scale)
     * @returns {Object} Contains:
     *   - message: Risk level description (Low, Moderate, High, etc.)
     *   - color: Color code for visual representation
     *   - protection: Detailed protection recommendations
     */
    const getUVMessage = (uvIndex) => {
        if (uvIndex <= 2) {
            return {
                message: "Low",
                color: "green",
                protection:
                    "You can safely stay outside with minimal protection",
            };
        } else if (uvIndex >= 3 && uvIndex <= 5) {
            return {
                message: "Moderate",
                color: "yellow",
                protection: "Take precautions - cover up and use sunscreen",
            };
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            return {
                message: "High",
                color: "orange",
                protection:
                    "Protection required. Reduce time in the sun between 11 am and 4 pm",
            };
        } else if (uvIndex >= 8 && uvIndex <= 10) {
            return {
                message: "Very High",
                color: "red",
                protection:
                    "Extra precautions needed. Minimize sun exposure during midday hours",
            };
        } else {
            return {
                message: "Extreme",
                color: "purple",
                protection: `EXTREME RISK! Avoid sun exposure during midday hours`,
            };
        }
    };

    /**
     * Fetches comprehensive weather and UV data from OpenWeather API
     * Performs three sequential API calls:
     * 1. Geocoding to convert location name to coordinates
     * 2. Current weather data retrieval
     * 3. UV index data retrieval
     *
     * @param {string} searchLocation - User input location (city name)
     * @throws {Error} When location is not found or API calls fail
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

    /**
     * Handles form submission for location search
     * Prevents default form behavior and triggers weather data fetch
     * @param {React.FormEvent} e - Form submission event
     */
    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (location.trim()) {
            fetchWeatherData(location.trim());
        }
    };

    return (
        <div className="App">
            {/* Navigation bar */}
            <nav className="sticky-nav">
                <ul>
                    <li onClick={() => scrollToSection(homeRef)}>Home</li>
                    <li onClick={() => scrollToSection(locationRef)}>
                        Location
                    </li>
                    <li onClick={() => scrollToSection(uvImpactsRef)}>
                        UV Impacts
                    </li>
                    <li onClick={() => scrollToSection(uvSkinToneRef)}>
                        UV Skin Tone Protection
                    </li>
                    <li onClick={() => scrollToSection(remindersRef)}>
                        Reminders
                    </li>
                    <li onClick={() => scrollToSection(clothingRef)}>
                        Clothing Recommendations
                    </li>
                </ul>
            </nav>

            {/* Home section */}
            <header className="App-theme" ref={homeRef}>
                <img src={logo} className="App-logo" alt="logo" />
                <h1>UV Protection Guide</h1>
                <p>Scroll down to learn more</p>
            </header>

            {/* Location section */}
            <div className="App-theme" ref={locationRef}>
                <h1>Location</h1>
                <form onSubmit={handleLocationSubmit} className="location-form">
                    <input
                        type="text"
                        className="location-input"
                        placeholder="Enter your location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        Search
                    </button>
                </form>

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
                                    color: getUVMessage(weatherData.uvIndex)
                                        .color,
                                    fontWeight: "bold",
                                }}
                            >
                                {getUVMessage(weatherData.uvIndex).message}
                            </div>
                            {getUVMessage(weatherData.uvIndex).protection && (
                                <p className="uv-protection">
                                    {
                                        getUVMessage(weatherData.uvIndex)
                                            .protection
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* UV Impacts section */}
            <div className="App-theme" ref={uvImpactsRef}>
                <h1>UV Impacts</h1>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "100px",
                    }}
                >
                    <iframe
                        src="/chart1-plot.html"
                        style={{
                            width: "800px",
                            height: "500px",
                            border: "none",
                        }}
                        title="UV Impact Chart 1"
                    />
                    <iframe
                        src="/chart2-plot.html"
                        style={{
                            width: "800px",
                            height: "500px",
                            border: "none",
                        }}
                        title="UV Impact Chart 2"
                    />
                </div>
            </div>

            {/* UV Skin Tone Protection section */}
            <div className="App-theme" ref={uvSkinToneRef}>
                <h1>UV Skin Tone Protection</h1>
                <div className="skin-tone-grid">
                    {Object.entries(skinToneColors).map(([type, color]) => {
                        const isSelected = skinTone === type;
                        return (
                            <div key={type} className="skin-tone-item">
                                <div
                                    className={`skin-tone-square ${
                                        isSelected ? "selected" : ""
                                    }`}
                                    style={{
                                        backgroundColor: color,
                                        cursor: "pointer",
                                        width: "100px",
                                        height: "100px",
                                        border: isSelected
                                            ? "4px solid #4CAF50"
                                            : "2px solid #333",
                                        borderRadius: "10px",
                                        transition: "all 0.3s ease",
                                    }}
                                    onClick={() =>
                                        setSkinTone(isSelected ? "" : type)
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
                {skinTone && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "40px",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    backgroundColor: skinToneColors[skinTone],
                                    margin: "20px auto",
                                    border: "2px solid #333",
                                    borderRadius: "40px",
                                }}
                            />
                            <p
                                style={{
                                    color: "white",
                                    fontSize: "1.1em",
                                    marginTop: "10px",
                                }}
                            >
                                {skinTone === "type1"
                                    ? "Light pale, white"
                                    : skinTone === "type2"
                                    ? "White, fair"
                                    : skinTone === "type3"
                                    ? "Medium, white to olive"
                                    : skinTone === "type4"
                                    ? "Olive, moderate brown"
                                    : skinTone === "type5"
                                    ? "Brown, dark brown"
                                    : "Black, brown to black"}
                            </p>
                        </div>
                        <div
                            style={{
                                textAlign: "left",
                                padding: "20px",
                                borderRadius: "10px",
                                border: "1px solid rgba(255, 255, 255, 0.5)",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>
                                Sunscreen Guidelines:
                            </h3>
                            <p>For full body application:</p>
                            <ul style={{ margin: 0 }}>
                                <li>Face and neck: 1 teaspoon</li>
                                <li>Each arm: 1 teaspoon</li>
                                <li>Chest and abdomen: 2 teaspoons</li>
                                <li>Back: 2 teaspoons</li>
                                <li>Each leg: 2 teaspoons</li>
                            </ul>
                            <p
                                style={{
                                    marginTop: "10px",
                                    padding: "8px",
                                    borderRadius: "5px",
                                }}
                            >
                                <strong>Total: ~10 teaspoons</strong> for full
                                body coverage
                            </p>
                            <p
                                style={{
                                    fontSize: "0.9em",
                                    color: "#666",
                                    marginTop: "10px",
                                }}
                            >
                                {skinTone === "type1" || skinTone === "type2"
                                    ? "⚠️ Your skin type burns easily. Reapply every 1-2 hours."
                                    : skinTone === "type3" ||
                                      skinTone === "type4"
                                    ? "⚠️ Reapply every 2-3 hours when in sun."
                                    : "⚠️ While more naturally protected, still reapply every 2-3 hours for best protection."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Reminders section */}
            <div className="App-theme" ref={remindersRef}>
                <h1>Reminders</h1>
                <div className="reminder-container">
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="time-selector"
                    />
                    <button
                        onClick={handleReminder}
                        className="reminder-button"
                        disabled={!selectedTime}
                    >
                        Remind me
                    </button>
                </div>
                {showPopup && (
                    <div className="popup-message" onClick={handleDismissPopup}>
                        Please wear your sunscreen!
                        <div className="popup-hint">(Click to dismiss)</div>
                    </div>
                )}
            </div>

            {/* Clothing Recommendations section */}
            <div className="App-theme" ref={clothingRef}>
                <h1>Clothing Recommendations</h1>
                {/* TODO: add clothing recommendations based on UV index */}
            </div>
        </div>
    );
}

export default App;
