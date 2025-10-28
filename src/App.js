import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar, { SidebarProvider, SidebarContext } from "./components/Sidebar";
import SearchBar from "./components/SearchBar";
import { generateImage, enhanceImagePrompt } from "./config/API";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// --- CONFIGURATION ---
const MAX_STAR_COUNT = 1200;
const MIN_SPEED = 0.0005;
const MAX_SPEED = 0.003;
// NOTE: Must match the width defined in Sidebar.css and used in the CSS variable below
const SIDEBAR_WIDTH_OPEN = 350; // <-- UPDATED to 350px
const SIDEBAR_WIDTH_CLOSED = 60;
// ---------------------

// Star Class Definition (remains the same)
class Star {
  constructor(W, H, sidebarWidth, startX = null, startY = null) {
    const isNew = startX !== null;
    this.W = W;
    this.H = H;
    this.sidebarWidth = sidebarWidth;

    // Note: Star generation is optimized to happen outside the sidebar area
    if (isNew) {
      this.x = startX - W / 2;
      this.y = startY - H / 2;
      this.z = W;
    } else {
      // Generate star in the main content area (right of the sidebar)
      const availableW = W - sidebarWidth;
      this.x = Math.random() * availableW + sidebarWidth - W / 2;
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
    const currentSidebarWidth = this.sidebarWidth;
    const availableW = this.W - currentSidebarWidth;
    this.x = Math.random() * availableW + currentSidebarWidth - this.W / 2;
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
  const { currentChatId, updateChatTitle, setCurrentChatId, isSidebarOpen } =
    useContext(SidebarContext);

  // Determine the current width for star spawning logic
  const currentSidebarWidth = isSidebarOpen
    ? SIDEBAR_WIDTH_OPEN
    : SIDEBAR_WIDTH_CLOSED;

  // State to hold all chat messages, keyed by chat ID
  const [chatHistory, setChatHistory] = useState({});

  // Get current chat messages
  const messages = chatHistory[currentChatId] || [];

  const [loading, setLoading] = useState(false);

  const mainContentRef = useRef(null);

  const addMessage = useCallback(
    (role, text) => {
      const message = { role, text, timestamp: Date.now() };
      setChatHistory((prevHistory) => {
        const id = currentChatId || Date.now();
        if (!currentChatId) {
          setCurrentChatId(id);
        }

        return {
          ...prevHistory,
          [id]: [...(prevHistory[id] || []), message],
        };
      });
    },
    [currentChatId, setCurrentChatId],
  );

  // Handle search submission
  const handleSearchSubmit = useCallback(
    async (query) => {
      if (!query || loading) return;

      // Check if this is a new chat (no messages yet)
      const isNewChat = messages.length === 0;

      // Create new chat ID only if this is truly a new chat
      const chatID = isNewChat ? Date.now() : currentChatId;

      if (isNewChat) {
        setCurrentChatId(chatID);
        // Add new chat to sidebar immediately with the user's prompt as title
        updateChatTitle(chatID, query);
      }

      // 1. Save USER query to history
      addMessage("user", query);

      setLoading(true);

      try {
        // Enhance the prompt for better image generation
        const enhancedPrompt = enhanceImagePrompt(query);

        // Generate image using Pollinations AI
        const apiResult = await generateImage(enhancedPrompt);

        // 2. Determine role and content
        let modelResponse;
        let responseRole;

        if (apiResult.error) {
          // Error occurred
          responseRole = "error";
          modelResponse = apiResult.message;
        } else {
          // Success - image generated
          responseRole = "image";
          modelResponse = apiResult.image;
        }

        // 3. Save MODEL response (image or error message) to history
        addMessage(responseRole, modelResponse);
      } catch (e) {
        console.error("Fatal error during API call:", e);
        const errorMessage = `A fatal error occurred: ${e.message}. Check your console and API key.`;
        addMessage("error", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      currentChatId,
      updateChatTitle,
      messages.length,
      addMessage,
      setCurrentChatId,
      loading,
    ],
  );

  // Effect to scroll to the bottom when new message is added
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
    }
  }, [messages.length]);

  // --- Canvas/Star Logic ---
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

  const spawnStar = useCallback(
    (x, y) => {
      // Only spawn stars in the main content area
      if (x > currentSidebarWidth && starsRef.current.length < MAX_STAR_COUNT) {
        starsRef.current.push(new Star(W, H, currentSidebarWidth, x, y));
      }
    },
    [W, H, currentSidebarWidth],
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
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
  }, [W, H]);

  useEffect(() => {
    let isMounted = true;
    const init = () => {
      if (!isMounted) return;
      setupCanvas();
      if (starsRef.current.length === 0) {
        for (let i = 0; i < 800; i++) {
          starsRef.current.push(new Star(W, H, currentSidebarWidth));
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
  }, [W, H, currentSidebarWidth, animate]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      spawnStar(event.clientX, event.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", setupCanvas);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", setupCanvas);
    };
  }, [W, H, currentSidebarWidth, spawnStar]);

  // Set a CSS variable to control the main content position based on sidebar state
  const containerStyle = {
    "--sidebar-current-width": `${currentSidebarWidth}px`,
    width: W,
    height: H,
  };

  const contentClass =
    messages.length > 0
      ? "main-content-overlay result-mode"
      : "main-content-overlay initial-mode";

  return (
    <div className="starfield-container" style={containerStyle}>
      <Sidebar />
      <canvas ref={canvasRef} id="starfield" className="starfield-canvas" />

      {/* Routes Container */}
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/"
          element={
            <div className={contentClass} ref={mainContentRef}>
              <div className="content-scroll-area">
                {/* Message History */}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.role}-message ${msg.role === "error" ? "error-text" : ""}`}
                  >
                    <div className="message-header">
                      {msg.role === "user" ? "Your Prompt" : "Generated Image"}
                    </div>

                    <div className="message-content">
                      {/* Conditional rendering based on role */}
                      {msg.role === "text" || msg.role === "model" ? (
                        <div className="text-response">
                          <p>{msg.text}</p>
                        </div>
                      ) : msg.role === "image" && msg.text.length > 100 ? (
                        <img
                          src={`data:image/jpeg;base64,${msg.text}`}
                          alt="Generated content"
                          className="generated-image"
                        />
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Default Greeting (Only show if history is empty) */}
                {messages.length === 0 && !loading && (
                  <div className="info-text">
                    <h1 className="greeting-hello">Hello, Creator!</h1>
                    <h2 className="greeting-question">
                      What image will you create today?
                    </h2>
                  </div>
                )}
              </div>

              {/* Loading Indicator (Moves with the search bar) */}
              {loading && (
                <div className="loading-indicator">
                  🎨 Creating your image... Hold tight!
                </div>
              )}

              {/* SearchBar remains fixed at the bottom of the main-content-overlay */}
              <SearchBar onSearchSubmit={handleSearchSubmit} />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// Export the App component wrapped with the provider
export default function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}
