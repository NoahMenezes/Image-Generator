import React, { useRef, useEffect, useState } from 'react';
import './App.css'; // Assuming you named the CSS file App.css

// Configuration constants defined outside the component for clarity
const MAX_STAR_COUNT = 1200;
const MIN_SPEED = 0.0005;
const MAX_SPEED = 0.003;

// Star Class Definition (moved outside the component to avoid re-creation on render)
class Star {
    constructor(W, H, startX = null, startY = null) {
        const isNew = startX !== null;
        this.W = W;
        this.H = H;

        if (isNew) {
            this.x = startX - W / 2;
            this.y = startY - H / 2;
            this.z = W;
        } else {
            this.x = Math.random() * W - W / 2;
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
        this.x = Math.random() * this.W - this.W / 2;
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


export default function Starfield() {
    // 1. Refs for DOM elements
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const starsRef = useRef([]); // Use a ref to hold the mutable stars array

    // 2. State for dimensions (useful for resize handling)
    const [dimensions, setDimensions] = useState({ 
        W: window.innerWidth, 
        H: window.innerHeight 
    });
    const { W, H } = dimensions;

    // 3. Setup function (called on mount and resize)
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

    // 4. Star spawning logic
    const spawnStar = (x, y) => {
        if (starsRef.current.length < MAX_STAR_COUNT) {
            starsRef.current.push(new Star(W, H, x, y));
        }
    };

    // 5. Animation loop (runs via requestAnimationFrame)
    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear canvas with pitch black
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

    // --- useEffect Hooks ---

    // Hook for Initial Setup, Animation Start, and Cleanup
    useEffect(() => {
        setupCanvas();

        // Initialize stars
        for (let i = 0; i < 800; i++) {
            starsRef.current.push(new Star(W, H));
        }

        // Start animation loop
        animationFrameRef.current = requestAnimationFrame(animate);

        // Cleanup function on component unmount
        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [W, H]); // Rerun setup when W or H changes (on resize)

    // Hook for Mouse Listener (only needs to be set up once)
    useEffect(() => {
        const handleMouseMove = (event) => {
            // Note: Mouse position is relative to the viewport (correct for canvas)
            spawnStar(event.clientX, event.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', setupCanvas);

        // Cleanup for event listeners
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', setupCanvas);
        };
    }, [W, H]); // Re-attach if dimensions change, though listeners primarily use current state

    return (
        <div className="starfield-container" style={{ width: W, height: H }}>
            <canvas ref={canvasRef} id="starfield" className="starfield-canvas" />
            <div className="info-text">
            </div>
        </div>
    );
}