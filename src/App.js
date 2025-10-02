import React, { useRef, useEffect, useState, useCallback, useContext } from 'react';
import './App.css';
import Sidebar, { SidebarProvider, SidebarContext } from './components/Sidebar'; // Import Provider and Context
import SearchBar from './components/SearchBar';
import { generateTextResponse } from './config/Gemini'; 

// --- CONFIGURATION (Keeping sidebar width consistent) ---
const MAX_STAR_COUNT = 1200;
const MIN_SPEED = 0.0005;
const MAX_SPEED = 0.003;
const SIDEBAR_WIDTH = 320; 
// ---------------------

// Star Class Definition (remains the same)
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


// New component wrapper to use Context
function AppContent() {
    const { currentChatId, updateChatTitle, setCurrentChatId } = useContext(SidebarContext);

    // State to hold all chat messages, keyed by chat ID
    // { chatId: [{ role: 'user', text: '...' }, { role: 'model', text: '...' }], ... }
    const [chatHistory, setChatHistory] = useState({});
    
    // Get current chat messages
    const messages = chatHistory[currentChatId] || [];

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Used for critical network/API key errors only
    
    const mainContentRef = useRef(null); 

    // Function to add a message to the current chat
    const addMessage = useCallback((role, text) => {
        const message = { role, text, timestamp: Date.now() };
        setChatHistory(prevHistory => {
            // Use currentChatId state (which might be null if it's the very first message)
            const id = currentChatId || Date.now(); 
            
            // If currentChatId was null, update it now for the next message/action
            if (!currentChatId) {
                setCurrentChatId(id);
            }
            
            return {
                ...prevHistory,
                [id]: [...(prevHistory[id] || []), message]
            };
        });
    }, [currentChatId, setCurrentChatId]);


    // Handle search submission
    const handleSearchSubmit = useCallback(async (query) => { 
        if (!query || loading) return;
        
        // Ensure a chat is selected/started
        const chatID = currentChatId || Date.now();
        if (!currentChatId) {
            setCurrentChatId(chatID);
        }

        // 1. Save USER query to history
        addMessage('user', query);
    
        setLoading(true);
        setError(null);
    
        try {
            const apiResult = await generateTextResponse(query); 
    
            // 2. Determine role and content
            let modelResponse = apiResult;
            let responseRole = 'model';
            
            if (typeof apiResult === 'string' && apiResult.startsWith('❌')) {
                setError(apiResult); // Display the error message in the console and potentially separately
                responseRole = 'error'; 
                // Don't save general errors to the main chat history, save as error message instead
            } 
            
            // 3. Save MODEL response to history
            addMessage(responseRole, modelResponse);

            // 4. Update Sidebar Chat Title (only if it's the first message in this chat)
            // Use the query itself to generate the title
            if (messages.length === 0) {
                updateChatTitle(chatID, query); 
            }

        } catch (e) {
            console.error("Fatal error during API call:", e);
            const errorMessage = `A fatal error occurred: ${e.message}. Check your console and API key.`;
            setError(errorMessage);
            addMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [generateTextResponse, currentChatId, updateChatTitle, messages.length, addMessage, setCurrentChatId, loading]);


    // Effect to scroll to the bottom when new message is added
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
        }
    }, [messages.length]); 


    // --- Canvas/Star Logic (remains the same) ---
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
    
    // --- RENDER ---
    
    const contentClass = messages.length > 0 ? "main-content-overlay result-mode" : "main-content-overlay initial-mode";

    return (
        <div className="starfield-container" style={{ width: W, height: H }}>
            <Sidebar />
            <canvas ref={canvasRef} id="starfield" className="starfield-canvas" />
            
            {/* The main scrollable container */}
            <div className={contentClass} ref={mainContentRef}>
                <div className="content-scroll-area">
                    
                    {/* Message History */}
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`chat-message ${msg.role}-message ${msg.role === 'error' ? 'error-text' : ''}`}
                        >
                            {/* Display different header/icon based on role */}
                            <div className="message-header">
                                {msg.role === 'user' ? 'You' : 'Gemini'}
                            </div>

                            {/* Display text content */}
                            <div className="message-content">
                                <p style={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Default Greeting (Only show if history is empty) */}
                    {messages.length === 0 && !loading && (
                        <div className="info-text">
                            <h1 className="greeting-hello">Hello, Noah</h1>
                            <h2 className="greeting-question">What should we do today?</h2>
                        </div>
                    )}
                </div>

                {/* Loading Indicator (Moves with the search bar) */}
                {loading && <div className="loading-indicator">🌌 Generating your response...</div>}
                
                {/* SearchBar remains fixed at the bottom of the main-content-overlay */}
                <SearchBar onSearchSubmit={handleSearchSubmit} />
            </div>
        </div>
    );
}

// Export the App component wrapped with the provider
export default function App() {
    return (
        <SidebarProvider>
            <AppContent />
        </SidebarProvider>
    );
}
