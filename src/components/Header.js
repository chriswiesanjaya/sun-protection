import React from "react";
import sun from "../logo/sun.png";

const Header = ({ homeRef }) => {
    return (
        <header className="App-theme" ref={homeRef}>
            <img src={sun} className="App-logo" alt="logo" />
            <h1>Your Skin Called — It Needs Protection!</h1>
            <p>Scroll down to be sun-smart, not sun-stupid</p>
            <p>↓</p>
        </header>
    );
};

export default Header;
