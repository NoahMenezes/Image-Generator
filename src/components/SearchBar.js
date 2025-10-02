import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

const SearchBar = ({ onSearchSubmit = () => {} }) => {
    const [input, setInput] = useState('');
    
    const handleSubmit = (event) => {
        try {
            // Prevent form submission if this were a form (Good defensive practice)
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
            {/* Microphone button (first button) */}
            <button className="searchbar-button" disabled={!input.trim()}>
                🎤
            </button>
            
            {/* 🎯 Submit button, now using a standard right arrow (send) icon */}
            <button 
                className="searchbar-button send-button" 
                onClick={handleSubmit} 
                disabled={!input.trim()}
            >
                ➡️ {/* Changed from ✨ to ➡️ for a typical "send" or "enter" visual */}
            </button>
        </div>
    );
};

SearchBar.propTypes = {
    onSearchSubmit: PropTypes.func
};

export default SearchBar;