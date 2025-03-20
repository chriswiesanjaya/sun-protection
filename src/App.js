import "./App.css";
import { useRef } from "react";
import Header from "./components/Header";
import WeatherDisplay from "./components/WeatherDisplay";
import UVImpacts from "./components/UVImpacts";
import SkinTypeQuestionnaire from "./components/SkinTypeQuestionnaire";
import ReminderSystem from "./components/ReminderSystem";

/**
 * Main application component for UV Protection Guide
 * A comprehensive web application that helps users protect themselves from harmful UV radiation
 * by providing real-time weather data, personalized protection recommendations, and educational resources.
 *
 * Key Features:
 * - Real-time UV index and weather data via OpenWeather API
 * - Fitzpatrick skin type assessment with personalized recommendations
 * - Location-based UV protection guidance
 * - Visual protection guides with intuitive icons
 * - Interactive UV impact data visualization
 * - Customizable sunscreen reminder system
 * - Responsive navigation with smooth scrolling
 *
 * Component Structure:
 * - Header: Landing page and introduction
 * - WeatherDisplay: Real-time UV and weather information
 * - UVImpacts: Educational data visualization
 * - SkinTypeQuestionnaire: Personalized skin type assessment
 * - ReminderSystem: Customizable protection reminders
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

    /**
     * Handles smooth scrolling to different sections of the application
     * Uses native smooth scrolling behavior for better performance and user experience
     * Accounts for the sticky navigation bar offset to ensure sections are properly aligned
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

            <Header homeRef={homeRef} />
            <WeatherDisplay locationRef={locationRef} />
            <UVImpacts uvImpactsRef={uvImpactsRef} />
            <SkinTypeQuestionnaire skinTypeRef={skinTypeRef} />
            <ReminderSystem remindersRef={remindersRef} />
        </div>
    );
}

export default App;
