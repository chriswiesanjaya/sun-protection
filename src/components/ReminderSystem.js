import React, { useState } from "react";

/**
 * ReminderSystem Component
 * Implements a customizable reminder system for sunscreen reapplication.
 * Features audio notifications and visual alerts to help users maintain proper sun protection.
 *
 * Features:
 * - Time-based reminder selection
 * - Audio notifications with volume control
 * - Visual popup alerts
 * - Dismissible notifications
 * - Mobile-friendly interface
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.RefObject} props.remindersRef - Reference for scroll navigation
 * @returns {JSX.Element} Reminder system interface
 */

// Configure notification sound with reduced volume for better user experience
const notificationSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
);
notificationSound.volume = 0.3;
notificationSound.loop = true;

const ReminderSystem = ({ remindersRef }) => {
    const [selectedTime, setSelectedTime] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    /**
     * Handles reminder activation
     * Triggers audio notification and displays visual popup
     */
    const handleReminder = () => {
        setShowPopup(true);
        setSelectedTime(""); // Reset the time selection for next use
        notificationSound.play().catch((error) => {
            console.log("Audio playback failed:", error);
        });
    };

    /**
     * Dismisses the reminder popup and stops the audio notification
     * Resets the audio to beginning for next use
     */
    const handleDismissPopup = () => {
        setShowPopup(false);
        notificationSound.pause(); // Stop the sound
        notificationSound.currentTime = 0; // Reset sound to beginning
    };

    return (
        <div
            className="App-theme"
            ref={remindersRef}
            style={{
                display: "block",
                textAlign: "center",
                paddingTop: "2rem",
            }}
        >
            <h1>Beep-Boop, It's Time to Slop!</h1>
            <p>Never forget to apply sunscreen again</p>
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
    );
};

export default ReminderSystem;
