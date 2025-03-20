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
 * A web application that helps users protect themselves from harmful UV radiation
 * by providing real-time weather data and personalized protection recommendations.
 *
 * Features:
 * - Real-time UV index and weather data via OpenWeather API
 * - Fitzpatrick skin type assessment
 * - Location-based UV protection recommendations
 * - Visual protection guides with icons
 * - UV impact data visualization
 * - Sunscreen reminder system
 *
 * @component
 * @returns {JSX.Element} The rendered UV Protection Guide application
 */
function App() {
    // Navigation refs for smooth scrolling
    const homeRef = useRef(null);
    const locationRef = useRef(null);
    const uvImpactsRef = useRef(null);
    const skinTypeRef = useRef(null);
    const remindersRef = useRef(null);
    const navRef = useRef(null);

    // State for reminders functionality
    const [selectedTime, setSelectedTime] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // State for location and weather data
    const [location, setLocation] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // State for skin type questionnaire
    const [answers, setAnswers] = useState(Array(10).fill(null));
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
    const [determinedSkinType, setDeterminedSkinType] = useState("");
    const [totalScore, setTotalScore] = useState(0);

    const questions = [
        {
            text: "What color are your eyes?",
            options: [
                "Light blue, gray, green",
                "Blue, gray, or green",
                "Blue",
                "Dark Brown",
                "Brownish Black",
            ],
        },
        {
            text: "What is your natural hair color?",
            options: [
                "Sandy red",
                "Blonde",
                "Chestnut/Dark Blonde",
                "Dark brown",
                "Black",
            ],
        },
        {
            text: "What is your skin color (unexposed areas)?",
            options: [
                "Reddish",
                "Very Pale",
                "Pale with a beige tint",
                "Light brown",
                "Dark brown",
            ],
        },
        {
            text: "Do you have freckles on unexposed areas?",
            options: ["Many", "Several", "Few", "Incidental", "None"],
        },
        {
            text: "What happens when you stay too long in the sun?",
            options: [
                "Painful redness, blistering, peeling",
                "Blistering followed by peeling",
                "Burns sometimes followed by peeling",
                "Rare burns",
                "Never had burns",
            ],
        },
        {
            text: "To what degree do you turn brown?",
            options: [
                "Hardly or not at all",
                "Light color tan",
                "Reasonable tan",
                "Tan very easily",
                "Turn dark brown quickly",
            ],
        },
        {
            text: "Do you turn brown after several hours of sun exposure?",
            options: ["Never", "Seldom", "Sometimes", "Often", "Always"],
        },
        {
            text: "How does your face react to the sun?",
            options: [
                "Very sensitive",
                "Sensitive",
                "Normal",
                "Very resistant",
                "Never had a problem",
            ],
        },
        {
            text: "When did you last expose your body to the sun (or artificial sunlamp/tanning cream)?",
            options: [
                "More than 3 months ago",
                "2-3 months ago",
                "1-2 months ago",
                "Less than a month ago",
                "Less than 2 weeks ago",
            ],
        },
        {
            text: "Do you expose your face to the sun?",
            options: ["Never", "Hardly ever", "Sometimes", "Often", "Always"],
        },
    ];

    /**
     * Fitzpatrick scale skin type color mapping
     * A standardized classification of human skin colors that correlates with skin's response to UV radiation
     * @type {Object.<string, string>}
     */
    const skinTypeColors = {
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
        if (!ref.current) return;

        const navOffset = navRef.current ? navRef.current.offsetHeight : 0;
        const elementPosition = ref.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    };

    /**
     * Handles reminder notification for sunscreen application
     * Triggers a popup notification with sound until dismissed
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
     * Resets the audio state for the next reminder
     *
     * @returns {void}
     */
    const handleDismissPopup = () => {
        setShowPopup(false);
        notificationSound.pause(); // Stop the sound
        notificationSound.currentTime = 0; // Reset sound to beginning
    };

    /**
     * Determines UV risk level and provides protection recommendations
     * @param {number} uvIndex - UV index value (0-11+ scale)
     * @returns {Object} Protection recommendations with message, color, and specific measures
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
     * Fetches weather and UV data from OpenWeather API
     * Makes sequential API calls for geocoding, weather, and UV data
     * @param {string} searchLocation - User input location
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
     * @param {React.FormEvent} e - Form submission event
     */
    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (location.trim()) {
            fetchWeatherData(location.trim());
        }
    };

    /**
     * Handles answer selection in the skin type questionnaire
     * Updates answers and calculates skin type when all questions are answered
     * @param {number} answer - Selected answer value (0-4)
     */
    const handleAnswer = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);

        // Calculate total score if all questions are answered
        if (newAnswers.every((a) => a !== null)) {
            const score = newAnswers.reduce((acc, curr) => acc + curr, 0);
            setTotalScore(score);

            // Determine skin type based on new scoring system
            if (score <= 6) {
                setDeterminedSkinType("type1");
            } else if (score <= 13) {
                setDeterminedSkinType("type2");
            } else if (score <= 20) {
                setDeterminedSkinType("type3");
            } else if (score <= 27) {
                setDeterminedSkinType("type4");
            } else if (score <= 34) {
                setDeterminedSkinType("type5");
            } else {
                setDeterminedSkinType("type6"); // Score 35-40
            }
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    /**
     * Resets the questionnaire
     */
    const handleReset = () => {
        setAnswers(Array(10).fill(null));
        setCurrentQuestion(0);
        setAllQuestionsAnswered(false);
        setDeterminedSkinType("");
        setTotalScore(0);
    };

    return (
        <div className="App" style={{ overflowX: "hidden", width: "100%" }}>
            {/* Navigation bar */}
            <nav className="sticky-nav" ref={navRef}>
                <ul
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "10px",
                        padding: "10px",
                        margin: 0,
                        listStyle: "none",
                    }}
                >
                    <li
                        style={{
                            flex: "1 1 auto",
                            minWidth: "150px",
                            textAlign: "center",
                            padding: "8px 15px",
                            cursor: "pointer",
                        }}
                        onClick={() => scrollToSection(homeRef)}
                    >
                        Home
                    </li>
                    <li
                        style={{
                            flex: "1 1 auto",
                            minWidth: "150px",
                            textAlign: "center",
                            padding: "8px 15px",
                            cursor: "pointer",
                        }}
                        onClick={() => scrollToSection(locationRef)}
                    >
                        Location
                    </li>
                    <li
                        style={{
                            flex: "1 1 auto",
                            minWidth: "150px",
                            textAlign: "center",
                            padding: "8px 15px",
                            cursor: "pointer",
                        }}
                        onClick={() => scrollToSection(uvImpactsRef)}
                    >
                        UV Impacts
                    </li>
                    <li
                        style={{
                            flex: "1 1 auto",
                            minWidth: "150px",
                            textAlign: "center",
                            padding: "8px 15px",
                            cursor: "pointer",
                        }}
                        onClick={() => scrollToSection(skinTypeRef)}
                    >
                        Skin Type
                    </li>
                    <li
                        style={{
                            flex: "1 1 auto",
                            minWidth: "150px",
                            textAlign: "center",
                            padding: "8px 15px",
                            cursor: "pointer",
                        }}
                        onClick={() => scrollToSection(remindersRef)}
                    >
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
                <h1>Where's the Sun?</h1>
                <p>Tell us your location</p>
                <p>↓</p>
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
                <p>Click on the logo to learn more</p>
                <p>↓</p>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "50px",
                        width: "100%",
                        maxWidth: "800px",
                        margin: "0 auto",
                        padding: "0 15px",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            paddingBottom: "56.25%", // 16:9 aspect ratio
                            height: 0,
                            overflow: "hidden",
                        }}
                    >
                        <iframe
                            src="/cancer_plot_v5.html"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                border: "none",
                            }}
                            title="UV Impact Chart 1"
                        />
                    </div>
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            paddingBottom: "56.25%", // 16:9 aspect ratio
                            height: 0,
                            overflow: "hidden",
                            marginBottom: "50px",
                        }}
                    >
                        <iframe
                            src="/uv_plot_v3.html"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                border: "none",
                            }}
                            title="UV Impact Chart 2"
                        />
                    </div>
                </div>
            </div>

            {/* Skin Type section */}
            <div
                className="App-theme"
                ref={skinTypeRef}
                style={{
                    display: "block",
                    textAlign: "center",
                    paddingTop: "2rem",
                }}
            >
                <h1>Skin Type</h1>
                <p>Answer this questionnaire to determine your shade</p>
                <p>↓</p>
                <div
                    style={{
                        maxWidth: "800px",
                        margin: "0 auto",
                        padding: "20px",
                    }}
                >
                    <div className="questionnaire-container">
                        <div
                            className="question-card"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                padding: "20px",
                                borderRadius: "10px",
                                marginBottom: "20px",
                                height: "500px", // Fixed height for the card
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    height: "80px", // Fixed height for question area
                                    marginBottom: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: "1rem",
                                        margin: 0,
                                        lineHeight: "1.4",
                                    }}
                                >
                                    {questions[currentQuestion].text}
                                </h3>
                            </div>
                            <div
                                className="options"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    flex: 1, // Take remaining space
                                    marginBottom: "20px",
                                }}
                            >
                                {questions[currentQuestion].options.map(
                                    (option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswer(index)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor:
                                                    answers[currentQuestion] ===
                                                    index
                                                        ? "#4CAF50"
                                                        : "transparent",
                                                border: "2px solid #4CAF50",
                                                borderRadius: "5px",
                                                color: "white",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                width: "100%",
                                                textAlign: "left",
                                            }}
                                        >
                                            {option}
                                        </button>
                                    )
                                )}
                            </div>
                            <div
                                style={{
                                    marginTop: "auto", // Push to bottom
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <button
                                        onClick={handlePrevQuestion}
                                        disabled={currentQuestion === 0}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            color:
                                                currentQuestion === 0
                                                    ? "#666"
                                                    : "white",
                                            cursor:
                                                currentQuestion === 0
                                                    ? "not-allowed"
                                                    : "pointer",
                                            fontSize: "24px",
                                        }}
                                    >
                                        ←
                                    </button>
                                    <span>{`Question ${
                                        currentQuestion + 1
                                    } of ${questions.length}`}</span>
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={
                                            currentQuestion ===
                                            questions.length - 1
                                        }
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            color:
                                                currentQuestion ===
                                                questions.length - 1
                                                    ? "#666"
                                                    : "white",
                                            cursor:
                                                currentQuestion ===
                                                questions.length - 1
                                                    ? "not-allowed"
                                                    : "pointer",
                                            fontSize: "24px",
                                        }}
                                    >
                                        →
                                    </button>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <button
                                        onClick={handleReset}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "#ff4444",
                                            border: "none",
                                            borderRadius: "5px",
                                            color: "white",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Reset
                                    </button>
                                    {answers.every((a) => a !== null) && (
                                        <button
                                            onClick={() =>
                                                setAllQuestionsAnswered(true)
                                            }
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#4CAF50",
                                                border: "none",
                                                borderRadius: "5px",
                                                color: "white",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Show Result
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results section */}
                    {allQuestionsAnswered && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "40px",
                                flexWrap: "wrap",
                                padding: "20px 15px",
                                width: "100%",
                                maxWidth: "100%",
                                boxSizing: "border-box",
                                marginTop: "30px",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "10px",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                <h2>Your Results</h2>
                                <p>Total Score: {totalScore} points</p>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "20px",
                                        flexWrap: "wrap",
                                        margin: "20px auto",
                                    }}
                                >
                                    {Object.entries(skinTypeColors).map(
                                        ([type, color]) => (
                                            <div
                                                key={type}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        backgroundColor: color,
                                                        border:
                                                            type ===
                                                            determinedSkinType
                                                                ? "4px solid #4CAF50"
                                                                : "2px solid #333",
                                                        borderRadius: "20px",
                                                        transition:
                                                            "all 0.3s ease",
                                                        transform:
                                                            type ===
                                                            determinedSkinType
                                                                ? "scale(1.1)"
                                                                : "scale(1)",
                                                    }}
                                                />
                                                <p
                                                    style={{
                                                        color: "white",
                                                        fontSize: "0.9em",
                                                        margin: 0,
                                                        fontWeight:
                                                            type ===
                                                            determinedSkinType
                                                                ? "bold"
                                                                : "normal",
                                                    }}
                                                >
                                                    {type.replace(
                                                        "type",
                                                        "Type "
                                                    )}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                                <p
                                    style={{
                                        color: "white",
                                        fontSize: "1.1em",
                                        marginTop: "20px",
                                        padding: "10px",
                                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                                        borderRadius: "5px",
                                        display: "inline-block",
                                    }}
                                >
                                    {determinedSkinType === "type1"
                                        ? "Fitzpatrick Type I: Pale white skin"
                                        : determinedSkinType === "type2"
                                        ? "Fitzpatrick Type II: White skin"
                                        : determinedSkinType === "type3"
                                        ? "Fitzpatrick Type III: White to olive skin"
                                        : determinedSkinType === "type4"
                                        ? "Fitzpatrick Type IV: Olive skin"
                                        : determinedSkinType === "type5"
                                        ? "Fitzpatrick Type V: Brown skin"
                                        : "Fitzpatrick Type VI: Dark brown to black skin"}
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
                                    Sun Protection Guidelines:
                                </h3>
                                <p style={{ marginBottom: "10px" }}>
                                    <strong>For full body application:</strong>
                                </p>
                                <ul style={{ margin: 0, marginBottom: "15px" }}>
                                    <li>Face and neck: 1 teaspoon</li>
                                    <li>Each arm: 1 teaspoon</li>
                                    <li>Chest and abdomen: 2 teaspoons</li>
                                    <li>Back: 2 teaspoons</li>
                                    <li>Each leg: 2 teaspoons</li>
                                </ul>
                                <p
                                    style={{
                                        fontSize: "0.9em",
                                        fontStyle: "italic",
                                        marginBottom: "15px",
                                    }}
                                >
                                    Total: ~10 teaspoons for full body coverage
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.9em",
                                        color: "#666",
                                        marginTop: "10px",
                                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                                        padding: "8px",
                                        borderRadius: "5px",
                                    }}
                                >
                                    {determinedSkinType === "type1" ||
                                    determinedSkinType === "type2"
                                        ? "🔥 Easy burner! Reapply every 1-2 hours."
                                        : determinedSkinType === "type3" ||
                                          determinedSkinType === "type4"
                                        ? "☀️ Stay sun-safe! Reapply every 2-3 hours."
                                        : "🛡️ Better protected, but still reapply every 2-3 hours!"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
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
                <p>Don't forget to re-apply sunscreen!</p>
                <p>↓</p>
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
