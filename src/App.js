import logo from "./sun.png";
import chart1 from "./chart1.png";
import "./App.css";
import { useRef } from "react";

function App() {
    const homeRef = useRef(null);
    const uvLevelsRef = useRef(null);
    const uvImpactsRef = useRef(null);
    const uvProtectionRef = useRef(null);
    const remindersRef = useRef(null);
    const clothingRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="App">
            {/* Navigation bar */}
            <nav className="sticky-nav">
                <ul>
                    <li onClick={() => scrollToSection(homeRef)}>Home</li>
                    <li onClick={() => scrollToSection(uvLevelsRef)}>
                        UV Levels
                    </li>
                    <li onClick={() => scrollToSection(uvImpactsRef)}>
                        UV Impacts
                    </li>
                    <li onClick={() => scrollToSection(uvProtectionRef)}>
                        UV Protection
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
            </header>

            {/* UV Levels section */}
            <div className="App-theme" ref={uvLevelsRef}>
                <h1>UV Levels</h1>
                <input
                    type="text"
                    className="location-input"
                    placeholder="Enter your location"
                />
                {/* TODO: Add weather API and display weather data and UV index */}
            </div>

            {/* UV Impacts section */}
            <div className="App-theme" ref={uvImpactsRef}>
                <h1>UV Impacts</h1>
                <img src={chart1} className="chart-logo" alt="logo" />
                {/* TODO: Add 1 more chart */}
            </div>

            {/* UV Protection section */}
            <div className="App-theme" ref={uvProtectionRef}>
                <h1>UV Protection</h1>
                <select className="skin-tone-input" defaultValue="">
                    <option value="" disabled>
                        Select your Skin Tone
                    </option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                </select>
                {/* TODO: Add recommendations based on skin tone */}
            </div>

            {/* Reminders section */}
            <div className="App-theme" ref={remindersRef}>
                <h1>Reminders</h1>
                {/* TODO: add click button and pop up reminder */}
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
