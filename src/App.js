import logo from "./sun.png";
import chart1 from "./chart1.png";
import "./App.css";
import { useRef, useState } from "react";

const OPENWEATHER_API_KEY = "476e8dfbd2ea445a0f2a2d76630d978f";

function App() {
    const homeRef = useRef(null);
    const locationRef = useRef(null);
    const uvImpactsRef = useRef(null);
    const uvSkinToneRef = useRef(null);
    const remindersRef = useRef(null);
    const clothingRef = useRef(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [skinTone, setSkinTone] = useState("");
    const [location, setLocation] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const skinToneColors = {
        type1: "#FFE3E3",
        type2: "#FFD8C4",
        type3: "#E5B887",
        type4: "#C99364",
        type5: "#8D5524",
        type6: "#413333",
    };

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: "smooth" });
    };

    const handleReminder = () => {
        setShowPopup(true);
        setSelectedTime(""); // Reset the time
        setTimeout(() => {
            setShowPopup(false);
        }, 3000); // Hide popup after 3 seconds
    };

    const getUVMessage = (uvIndex) => {
        if (uvIndex <= 2) {
            return { message: "Low", color: "green" };
        } else if (uvIndex >= 3 && uvIndex <= 5) {
            return {
                message: "Moderate",
                color: "yellow",
                protection: "Sun protection is recommended",
            };
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            return {
                message: "High",
                color: "orange",
                protection: "Sun protection is necessary",
            };
        } else {
            return {
                message: "Very High",
                color: "red",
                protection:
                    "Not recommended to go outside or be exposed to the sun for long periods of time",
            };
        }
    };

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

            setWeatherData({
                temperature: Math.round(weatherResult.main.temp),
                description: weatherResult.weather[0].description,
                uvIndex: uvData.value,
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
                            <p>
                                {weatherData.time.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "UTC",
                                })}
                            </p>
                        </div>
                        <div className="weather-info">
                            <img
                                src={`http://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                                alt="Weather icon"
                            />
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
                <img src={chart1} className="chart-logo" alt="logo" />
                {/* TODO: Add 1 more chart */}
            </div>

            {/* UV Skin Tone Protection section */}
            <div className="App-theme" ref={uvSkinToneRef}>
                <h1>UV Skin Tone Protection</h1>
                <select
                    className="skin-tone-input"
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                >
                    <option value="" disabled>
                        Select your Skin Type
                    </option>
                    <option value="type1">Type 1 - Light pale, white</option>
                    <option value="type2">Type 2 - White, fair</option>
                    <option value="type3">
                        Type 3 - Medium, white to olive
                    </option>
                    <option value="type4">
                        Type 4 - Olive, moderate brown
                    </option>
                    <option value="type5">Type 5 - Brown, dark brown</option>
                    <option value="type6">
                        Type 6 - Black, brown to black
                    </option>
                </select>
                {skinTone && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "40px",
                        }}
                    >
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
                                    // backgroundColor: "#f8f8f8",
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
                {/* TODO: add sunscreen recommendation based on skin tone */}
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
                    <div className="popup-message">
                        Please wear your sunscreen!
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
