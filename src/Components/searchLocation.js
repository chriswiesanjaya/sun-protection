import React, { useState, useEffect } from "react";
import axios from "axios";

const API_KEY = "54e9349a114f977acb490677c487408b";

const SearchLocation = () => {
  const [location, setLocation] = useState("");
  const [uvIndex, setUvIndex] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentLocationWeather();
  }, []);

  const fetchCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
        await fetchWeatherData(url);
      });
    }
  };

  const fetchWeatherData = async (url) => {
    try {
      const response = await axios.get(url);
      setWeatherData(response.data);
      fetchUVIndex(response.data.coord.lat, response.data.coord.lon);
    } catch (error) {
      setError("Error fetching weather data.");
    }
  };

  const fetchUVIndex = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=${lat}&lon=${lon}`
      );
      setUvIndex(response.data.value);
    } catch (err) {
      setError("Failed to fetch UV index. Please try again.");
    }
  };

  const searchByCity = async () => {
    if (!location.trim()) {
      alert("Please enter a city name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}`;
      await fetchWeatherData(url);
    } catch (error) {
      setError("Error fetching data for the city.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-2">Search UV Index</h2>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={searchByCity}
        className="w-full bg-blue-500 text-white p-2 rounded mt-2"
      >
        Search
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {uvIndex !== null && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="text-lg font-bold">UV Index: {uvIndex}</p>
          <p>
            {uvIndex < 3 && "Low UV - Minimal protection needed."}
            {uvIndex >= 3 && uvIndex < 6 && "Moderate UV - Wear sunglasses and sunscreen."}
            {uvIndex >= 6 && uvIndex < 8 && "High UV - Use SPF 30+, seek shade."}
            {uvIndex >= 8 && uvIndex < 11 && "Very High UV - Cover up, wear a hat."}
            {uvIndex >= 11 && "Extreme UV - Avoid sun, wear full protection."}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchLocation;
