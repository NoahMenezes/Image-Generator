import React, { useRef, useEffect, useState, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import { generateTextResponse } from './config/Gemini'; // Import the text response function

// --- CONFIGURATION ---
const MAX_STAR_COUNT = 1200;
const MIN_SPEED = 0.0005;
const MAX_SPEED = 0.003;
const SIDEBAR_WIDTH = 280;
// ---------------------

// Star Class Definition (No changes needed here)
class Star {
    constructor(W, H, sidebarWidth, startX = null, startY = null) {
        const isNew = startX !== null;
        this.W = W;
        this.H = H;
        this.sidebarWidth = sidebarWidth;

        if (isNew) {
            this.x = startX - W / 2;
            this.y = startY - H / 2;
            this.z = W;
        } else {
            this.x = Math.random() * (W - sidebarWidth) + sidebarWidth / 2 - W / 2;
            this.y = Math.random() * H - H / 2;
            this.z = Math.random() * W;
        }

        this.speedMultiplier = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
    }

    update(starsArray) {
        this.z -= this.W * this.speedMultiplier;

        if (this.z <= 0) {
            if (starsArray.length > MAX_STAR_COUNT) {
                return false;
            }
            this.reset();
        }
        return true;
    }

    reset() {
        this.x = Math.random() * (this.W - this.sidebarWidth) + this.sidebarWidth / 2 - this.W / 2;
        this.y = Math.random() * this.H - this.H / 2;
        this.z = this.W;
    }

    draw(ctx) {
        const perspective = this.W / this.z;
        const xP = this.x * perspective + this.W / 2;
        const yP = this.y * perspective + this.H / 2;

        const size = (1 - this.z / this.W) * 2.5;
        const brightness = Math.min(255, (1 - this.z / this.W) * 255);

        ctx.beginPath();
        ctx.arc(xP, yP, size, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness / 255})`;
        ctx.fill();
    }
}


export default function App() {
    // 🎯 2. NEW STATE FOR API HANDLING
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle search submission - Now an ASYNC function
    const handleSearchSubmit = useCallback(async (query) => { 
        if (!query) return;
    
        setLoading(true); // Start loading
        setResult(null);  // Clear previous result
        setError(null);   // Clear previous error
    
        console.log('Search query:', query);
    
        try {
            // Line 98 (Original Line 87): The function call
            const apiResult = await generateTextResponse(query); 
    
            // Update logic to handle text response
            if (typeof apiResult === 'string' && (apiResult.startsWith('❌') || apiResult.includes('DEMO'))) {
                setError(apiResult);
            } else {
                setResult(apiResult);
            }
        } catch (e) {
            console.error("Fatal error during API call:", e);
            setError(`A fatal error occurred: ${e.message}. Check your console and API key.`);
        } finally {
            setLoading(false); // End loading
        } // End loading
        
    }, [generateTextResponse]);

    // ... all other canvas/star logic remains the same ...
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const starsRef = useRef([]);

    const [dimensions, setDimensions] = useState({
        W: window.innerWidth,
        H: window.innerHeight,
    });
    const { W, H } = dimensions;

    const setupCanvas = () => {
        const currentW = window.innerWidth;
        const currentH = window.innerHeight;
        setDimensions({ W: currentW, H: currentH });

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = currentW;
            canvas.height = currentH;
        }
    };

    const spawnStar = (x, y) => {
        if (x > SIDEBAR_WIDTH && starsRef.current.length < MAX_STAR_COUNT) {
            starsRef.current.push(new Star(W, H, SIDEBAR_WIDTH, x, y));
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, W, H);

        let newStars = [];
        for (let i = 0; i < starsRef.current.length; i++) {
            if (starsRef.current[i].update(starsRef.current)) {
                starsRef.current[i].draw(ctx);
                newStars.push(starsRef.current[i]);
            }
        }

        starsRef.current = newStars;

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        let isMounted = true;

        const init = () => {
            if (!isMounted) return;
            setupCanvas();

            if (starsRef.current.length === 0) {
                for (let i = 0; i < 800; i++) {
                    starsRef.current.push(new Star(W, H, SIDEBAR_WIDTH));
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        init();

        return () => {
            isMounted = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [W, H]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            spawnStar(event.clientX, event.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', setupCanvas);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', setupCanvas);
        };
    }, [W, H]);

    return (
        <div className="starfield-container" style={{ width: W, height: H }}>
            <Sidebar />
            <canvas ref={canvasRef} id="starfield" className="starfield-canvas" />
            <div className="main-content-overlay">
                {/* 🎯 3. CONDITIONAL RENDERING LOGIC */}

                {/* Loading Indicator */}
                {loading && <div className="loading-indicator">🌌 Generating your response...</div>}

                {/* Error Message */}
                {error && (
                    <div className="api-result error-text">
                        <p>{error}</p>
                    </div>
                )}

                {/* Successful Result (Text Content) */}
                {result && !loading && !error && (
                    <div className="api-result text-result">
                        <h3>Response:</h3>
                        {/* Display the text response instead of an image tag */}
                        <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
                    </div>
                )}

                {/* Default Greeting (Only show if nothing is loading, erroring, or resulting) */}
                {!loading && !error && !result && (
                    <div className="info-text">
                        <h1 className="greeting-hello">Hello, Noah</h1>
                        <h2 className="greeting-question">What should we do today?</h2>
                    </div>
                )}

                {/* SearchBar remains at the bottom */}
                <SearchBar onSearchSubmit={handleSearchSubmit} />
            </div>
        </div>
    );
}