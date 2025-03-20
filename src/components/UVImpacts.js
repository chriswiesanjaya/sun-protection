import React from "react";

/**
 * UVImpacts Component
 * Displays interactive data visualizations showing the impact of UV radiation on human health.
 * Features an embedded interactive chart showing correlations between UV exposure and health outcomes.
 *
 * Features:
 * - Interactive data visualization
 * - Responsive iframe implementation
 * - Educational content about UV radiation effects
 * - Mobile-friendly design with proper aspect ratio
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.RefObject} props.uvImpactsRef - Reference for scroll navigation
 * @returns {JSX.Element} UV impacts visualization section
 */

const UVImpacts = ({ uvImpactsRef }) => {
    return (
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
    );
};

export default UVImpacts;
