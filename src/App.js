import clothes from "./logo/clothes.png";
import hat from "./logo/hat.png";
import house from "./logo/house.png";
import sun from "./logo/sun.png";
import sunglasses from "./logo/sunglasses.png";
import sunscreen from "./logo/sunscreen.png";
import tree from "./logo/tree.png";
import umbrella from "./logo/umbrella.png";
import "./App.css";
import { useRef, useState } from "react";

// OpenWeather API key for weather and UV data
// Note: In production, this should be stored in environment variables
const OPENWEATHER_API_KEY = "476e8dfbd2ea445a0f2a2d76630d978f";

// Configure notification sound for better user experience
// Using external audio file to ensure consistent playback across browsers
const notificationSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
);
notificationSound.volume = 0.3;
notificationSound.loop = true; // Enable sound looping for persistent notifications

/**
 * Main application component for UV Protection Guide
 * A comprehensive application that helps users protect themselves from harmful UV radiation
 * by providing real-time weather information, UV index data, and personalized protection recommendations.
 *
 * Key Features:
 * - Real-time weather and UV index tracking using OpenWeather API
 * - Location-based data retrieval and display
 * - Personalized protection recommendations based on UV levels
 * - Fitzpatrick skin type scale integration for customized advice
 * - Interactive reminder system for sunscreen application
 * - Responsive navigation with smooth scrolling
 * - Visual protection recommendations using intuitive icons
 * - Comprehensive UV impact visualization through charts
 *
 * Technical Implementation:
 * - Uses OpenWeather's multiple endpoints (Geocoding, Weather, UV)
 * - Implements responsive design patterns
 * - Features interactive UI elements with real-time updates
 * - Includes audio-visual notification system
 * - Provides accessibility-friendly color coding and contrast
 *
 * @component
 * @returns {JSX.Element} The rendered UV Protection Guide application
 */
function App() {
    // Refs for smooth scrolling to different sections
    const homeRef = useRef(null);
    const locationRef = useRef(null);
    const uvImpactsRef = useRef(null);
    const skinToneRef = useRef(null);
    const remindersRef = useRef(null);

    // State management for user interactions and data
    const [selectedTime, setSelectedTime] = useState(""); // Reminder time selection
    const [showPopup, setShowPopup] = useState(false); // Reminder popup visibility
    const [skinTone, setSkinTone] = useState(""); // Selected Fitzpatrick skin type
    const [location, setLocation] = useState(""); // User's location input
    const [weatherData, setWeatherData] = useState(null); // Weather and UV data
    const [error, setError] = useState(""); // Error message handling
    const [loading, setLoading] = useState(false); // Loading state indicator

    /**
     * Fitzpatrick scale skin tone color mapping
     * A standardized classification of human skin colors that correlates with skin's response to UV radiation
     * @type {Object.<string, string>}
     */
    const skinToneColors = {
        type1: "#FFE3E3", // Type I: Pale white skin, always burns, never tans
        type2: "#FFD8C4", // Type II: White skin, usually burns, tans minimally
        type3: "#E5B887", // Type III: White to olive skin, sometimes burns, tans uniformly
        type4: "#C99364", // Type IV: Olive skin, rarely burns, tans easily
        type5: "#8D5524", // Type V: Brown skin, very rarely burns, tans very easily
        type6: "#413333", // Type VI: Dark brown to black skin, never burns, deeply pigmented
    };

    /**
     * Handles smooth scrolling to different sections of the application
     * Uses native smooth scrolling behavior for better performance
     *
     * @param {React.RefObject} ref - Reference to the target section element
     * @returns {void}
     */
    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: "smooth" });
    };

    /**
     * Handles reminder notification for sunscreen application
     * Triggers a looping popup notification with sound until user interaction
     * Implements both visual and auditory feedback for better accessibility
     *
     * @returns {void}
     */
    const handleReminder = () => {
        setShowPopup(true);
        setSelectedTime(""); // Reset the time selection for next use
        notificationSound.play().catch((error) => {
            console.log("Audio playback failed:", error);
        });
    };

    /**
     * Dismisses the reminder popup and stops the notification sound
     */
    const handleDismissPopup = () => {
        setShowPopup(false);
        notificationSound.pause(); // Stop the sound
        notificationSound.currentTime = 0; // Reset sound to beginning
    };

    /**
     * Determines UV risk level and protection recommendations based on UV index
     * Provides color-coded risk levels and specific protection measures
     *
     * @param {number} uvIndex - UV index value from OpenWeather API (0-11+ scale)
     * @returns {Object} Protection recommendations containing:
     *   - message: Risk level description (Low, Moderate, High, etc.)
     *   - color: Color code for visual representation (follows accessibility guidelines)
     *   - protection: Detailed protection recommendations based on UV level
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
     * Performs three sequential API calls to gather complete weather information:
     * 1. Geocoding API: Converts location name to coordinates
     * 2. Current Weather API: Retrieves current weather conditions
     * 3. UV Index API: Gets current UV radiation levels
     *
     * Error Handling:
     * - Validates location input
     * - Handles API response errors
     * - Provides user feedback for failed requests
     * - Implements loading states for better UX
     *
     * @param {string} searchLocation - User input location (city name)
     * @throws {Error} When location is not found or API calls fail
     * @async
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
     * Validates and processes the location input before triggering the weather data fetch
     *
     * @param {React.FormEvent} e - Form submission event
     * @returns {void}
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
                    <li onClick={() => scrollToSection(skinToneRef)}>
                        Skin Tone
                    </li>
                    <li onClick={() => scrollToSection(remindersRef)}>
                        Reminders
                    </li>
                </ul>
            </nav>

            {/* Home section */}
            <header className="App-theme" ref={homeRef}>
                <img src={sun} className="App-logo" alt="logo" />
                <h1>Your Skin Called — It Needs Protection!</h1>
                <p>Scroll down to be sun-smart, not sun-stupid</p>
                <p>↓</p>
            </header>

            {/* Location section */}
            <div
                className="App-theme"
                ref={locationRef}
                style={{
                    display: "block",
                    textAlign: "center",
                    paddingTop: "2rem",
                }}
            >
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
                            <div className="protection-recommendations">
                                {weatherData.uvIndex <= 2 && (
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
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={sunglasses}
                                                alt="Sunglasses"
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
                                                Use sunglasses
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={sunscreen}
                                                alt="Sunscreen"
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
                                                Wear sunscreen
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={hat}
                                                alt="Hat"
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
                                                Wear a hat
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={clothes}
                                                alt="Clothes"
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
                                                Wear protective clothing
                                            </p>
                                        </div>
                                    </p>
                                )}
                                {weatherData.uvIndex >= 3 &&
                                    weatherData.uvIndex <= 5 && (
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
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={sunglasses}
                                                    alt="Sunglasses"
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
                                                    Use sunglasses
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={sunscreen}
                                                    alt="Sunscreen"
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
                                                    Wear sunscreen
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={hat}
                                                    alt="Hat"
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
                                                    Wear a hat
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={clothes}
                                                    alt="Clothes"
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
                                                    Wear protective clothing
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={tree}
                                                    alt="Tree"
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
                                                    Stay in shade
                                                </p>
                                            </div>
                                        </p>
                                    )}
                                {weatherData.uvIndex >= 6 &&
                                    weatherData.uvIndex <= 7 && (
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
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={sunglasses}
                                                    alt="Sunglasses"
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
                                                    Use sunglasses
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={sunscreen}
                                                    alt="Sunscreen"
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
                                                    Wear sunscreen
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={hat}
                                                    alt="Hat"
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
                                                    Wear a hat
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={clothes}
                                                    alt="Clothes"
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
                                                    Wear protective clothing
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={tree}
                                                    alt="Tree"
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
                                                    Stay in shade
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={umbrella}
                                                    alt="Umbrella"
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
                                                    Reduce time in the sun
                                                </p>
                                            </div>
                                        </p>
                                    )}
                                {weatherData.uvIndex >= 8 &&
                                    weatherData.uvIndex <= 10 && (
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
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={sunglasses}
                                                    alt="Sunglasses"
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
                                                    Use sunglasses
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={sunscreen}
                                                    alt="Sunscreen"
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
                                                    Wear sunscreen
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={hat}
                                                    alt="Hat"
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
                                                    Wear a hat
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={clothes}
                                                    alt="Clothes"
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
                                                    Wear protective clothing
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={tree}
                                                    alt="Tree"
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
                                                    Stay in shade
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={umbrella}
                                                    alt="Umbrella"
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
                                                    Reduce time in the sun
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    textAlign: "center",
                                                    width: "100px",
                                                }}
                                            >
                                                <img
                                                    src={house}
                                                    alt="House"
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
                                                    Avoid the sun
                                                </p>
                                            </div>
                                        </p>
                                    )}
                                {weatherData.uvIndex > 10 && (
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
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={sunglasses}
                                                alt="Sunglasses"
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
                                                Use sunglasses
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={sunscreen}
                                                alt="Sunscreen"
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
                                                Wear sunscreen
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={hat}
                                                alt="Hat"
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
                                                Wear a hat
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={clothes}
                                                alt="Clothes"
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
                                                Wear protective clothing
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={tree}
                                                alt="Tree"
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
                                                Stay in shade
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={umbrella}
                                                alt="Umbrella"
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
                                                Reduce time in the sun
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                textAlign: "center",
                                                width: "100px",
                                            }}
                                        >
                                            <img
                                                src={house}
                                                alt="House"
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
                                                Avoid the sun
                                            </p>
                                        </div>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* UV Impacts section */}
            <div
                className="App-theme"
                ref={uvImpactsRef}
                style={{
                    display: "block",
                    textAlign: "center",
                    paddingTop: "2rem",
                }}
            >
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
                            marginBottom: "100px",
                        }}
                        title="UV Impact Chart 2"
                    />
                </div>
            </div>

            {/* Skin Tone section */}
            <div
                className="App-theme"
                ref={skinToneRef}
                style={{
                    display: "block",
                    textAlign: "center",
                    paddingTop: "2rem",
                }}
            >
                <h1>Skin Tone</h1>
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
            <div
                className="App-theme"
                ref={remindersRef}
                style={{
                    display: "block",
                    textAlign: "center",
                    paddingTop: "2rem",
                }}
            >
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
                        disabled={!selectedTime || showPopup} // Prevent multiple popups
                    >
                        Remind me
                    </button>
                </div>
                {showPopup && (
                    <div
                        className="popup-message"
                        onClick={handleDismissPopup}
                        style={{
                            cursor: "pointer",
                            animation: "pulse 2s infinite",
                            backgroundColor: "rgba(76, 175, 80, 0.95)",
                            border: "2px solid #45a049",
                            color: "white",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            padding: "8px 15px",
                        }}
                    >
                        <div style={{ fontSize: "0.9em", marginBottom: "2px" }}>
                            Please wear your sunscreen!
                        </div>
                        <div
                            style={{
                                fontSize: "0.7em",
                                opacity: 0.9,
                                color: "#e8f5e9",
                            }}
                        >
                            (Click to dismiss)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
