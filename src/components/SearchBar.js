import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

const SearchBar = ({ onSearchSubmit = () => {} }) => {
    const [input, setInput] = useState('');
    
    const handleSubmit = (event) => {
        try {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            
            if (input.trim() && typeof onSearchSubmit === 'function') {
                onSearchSubmit(input.trim());
                setInput(''); 
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
                placeholder="Describe your creative vision..." 
                className="searchbar-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            {/* Microphone button (first button) - Placeholder */}
            <button className="searchbar-button mic-button" disabled={!input.trim()}>
                <span role="img" aria-label="Microphone">🎤</span>
            </button>
            
            {/* Submit button */}
            <button 
                className="searchbar-button send-button" 
                onClick={handleSubmit} 
                disabled={!input.trim()}
            >
                <span role="img" aria-label="Send">🚀</span>
            </button>
        </div>
    );
};

SearchBar.propTypes = {
    onSearchSubmit: PropTypes.func
};

export default SearchBar;
