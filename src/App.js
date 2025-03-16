import logo from "./sun.png";
import React, { useRef } from "react";
import SearchLocation from "./Components/searchLocation";
import "./App.css";

function App() {
    const searchSectionRef = useRef(null);

  const scrollToSearch = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="App">
      <header className="App-header" onClick={scrollToSearch}>
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Weather App</h1>
        <p>Click the ☀️ to search</p>
      </header>
      <section ref={searchSectionRef} className="search-section">
        <div className="search-container">
          <h1 className="search-title">Search by your location</h1>
          <SearchLocation />
        </div>
      </section>
    </div>
  );
}

export default App;
