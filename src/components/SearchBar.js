// src/components/SearchBar.js

import React from 'react';
import './SearchBar.css';

// Using simple text/emojis as placeholders for icons.
const SearchBar = () => {
    return (
        <div className="searchbar-container">
            <input 
                type="text" 
                placeholder="Ask me anything..." 
                className="searchbar-input"
            />
            {/* These buttons emulate the microphone and send/gemini icon buttons */}
            <button className="searchbar-button">
                🎤
            </button>
            <button className="searchbar-button">
                ✨
            </button>
        </div>
    );
};

export default SearchBar;