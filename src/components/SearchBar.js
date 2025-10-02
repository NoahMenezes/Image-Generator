// src/components/SearchBar.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

const SearchBar = ({ onSearchSubmit = () => {} }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (event) => {
        try {
            // Prevent form submission if this were a form
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            
            if (input.trim() && typeof onSearchSubmit === 'function') {
                onSearchSubmit(input.trim());
                setInput(''); // Clear the input field after submitting
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
        }
    };

    const handleKeyDown = (event) => {
        try {
            if (event && event.key === 'Enter') {
                handleSubmit(event);
            }
        } catch (error) {
            console.error('Error in handleKeyDown:', error);
        }
    };

    return (
        <div className="searchbar-container">
            <input 
                placeholder="Ask me anything..." 
                className="searchbar-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button className="searchbar-button" disabled={!input.trim()}>
                🎤
            </button>
            {/* 🎯 Attach handleSubmit to the click event */}
            <button className="searchbar-button" onClick={handleSubmit} disabled={!input.trim()}>
                ✨
            </button>
        </div>
    );
};

SearchBar.propTypes = {
    onSearchSubmit: PropTypes.func
};

export default SearchBar;