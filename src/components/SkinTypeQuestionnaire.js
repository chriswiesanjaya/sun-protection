import React, { useState } from "react";

/**
 * SkinTypeQuestionnaire Component
 * Interactive questionnaire to determine user's Fitzpatrick skin type and provide personalized
 * sun protection recommendations. Uses the Fitzpatrick Scale, a numerical classification schema
 * for human skin color.
 *
 * Features:
 * - 10-question interactive assessment
 * - Real-time answer tracking
 * - Dynamic result calculation
 * - Visual skin type representation
 * - Personalized protection guidelines
 * - Mobile-responsive design
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.RefObject} props.skinTypeRef - Reference for scroll navigation
 * @returns {JSX.Element} Skin type assessment questionnaire and results
 */

/**
 * Questionnaire data structure defining all questions and possible answers
 * Each question contributes to the final Fitzpatrick skin type calculation
 * @type {Array<{text: string, options: string[]}>}
 */
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
 * Color mapping for different Fitzpatrick skin types
 * Used for visual representation in the results section
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

const SkinTypeQuestionnaire = ({ skinTypeRef }) => {
    const [answers, setAnswers] = useState(Array(10).fill(null));
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
    const [determinedSkinType, setDeterminedSkinType] = useState("");
    const [totalScore, setTotalScore] = useState(0);

    /**
     * Handles user's answer selection and calculates final skin type if all questions are answered
     * @param {number} answer - Index of the selected answer (0-4)
     */
    const handleAnswer = (answer) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answer;
        setAnswers(newAnswers);

        if (newAnswers.every((a) => a !== null)) {
            const score = newAnswers.reduce((acc, curr) => acc + curr, 0);
            setTotalScore(score);

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
                setDeterminedSkinType("type6");
            }
        }
    };

    /**
     * Navigates to the next question in the questionnaire
     */
    const handleNextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    /**
     * Navigates to the previous question in the questionnaire
     */
    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    /**
     * Resets the questionnaire to its initial state
     * Clears all answers and results
     */
    const handleReset = () => {
        setAnswers(Array(10).fill(null));
        setCurrentQuestion(0);
        setAllQuestionsAnswered(false);
        setDeterminedSkinType("");
        setTotalScore(0);
    };

    return (
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
                            height: "500px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                height: "80px",
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
                                flex: 1,
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
                        <div style={{ marginTop: "auto" }}>
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
                                <span>{`Question ${currentQuestion + 1} of ${
                                    questions.length
                                }`}</span>
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={
                                        currentQuestion === questions.length - 1
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
                                                    transition: "all 0.3s ease",
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
                                                {type.replace("type", "Type ")}
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
    );
};

export default SkinTypeQuestionnaire;
