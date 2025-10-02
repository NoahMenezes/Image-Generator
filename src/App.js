// Starfield.js (formerly your main component logic)

import React, { useRef, useEffect, useState } from 'react';
import './App.css'; 
import Sidebar from './components/Sidebar'; // 1. Import the new Sidebar

// --- CONFIGURATION ---
const MAX_STAR_COUNT = 1200;
const MIN_SPEED = 0.0005;
const MAX_SPEED = 0.003;
const SIDEBAR_WIDTH = 280; // Define sidebar width here
// ---------------------

// Star Class Definition (Updated to receive sidebar width)
class Star {
    constructor(W, H, sidebarWidth, startX = null, startY = null) { // Added sidebarWidth
        const isNew = startX !== null;
        this.W = W;
        this.H = H;
        this.sidebarWidth = sidebarWidth; // Store sidebar width

        if (isNew) {
            // New star starts near the mouse position
            this.x = startX - W / 2;
            this.y = startY - H / 2;
            this.z = W;
        } else {
            // Random start position (must exclude the sidebar area)
            // X-coordinate is calculated relative to the new, smaller drawable area
            this.x = Math.random() * (W - sidebarWidth) + sidebarWidth / 2 - W / 2;
            this.y = Math.random() * H - H / 2;
            this.z = Math.random() * W;
        }
        
        this.speedMultiplier = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
    }

    // ... (update and reset methods remain the same) ...

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
        // Reset X is constrained to the non-sidebar area
        this.x = Math.random() * (this.W - this.sidebarWidth) + this.sidebarWidth / 2 - this.W / 2;
        this.y = Math.random() * this.H - this.H / 2;
        this.z = this.W;
    }

    // ... (draw method remains the same) ...
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
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const starsRef = useRef([]);

    const [dimensions, setDimensions] = useState({ 
        W: window.innerWidth, 
        H: window.innerHeight 
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
        // Only spawn stars if the click/mouse is outside the sidebar area
        if (x > SIDEBAR_WIDTH && starsRef.current.length < MAX_STAR_COUNT) {
            starsRef.current.push(new Star(W, H, SIDEBAR_WIDTH, x, y));
        }
    };

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

    // Initial Setup and Animation Start
    useEffect(() => {
        setupCanvas();

        // Initialize stars (Pass SIDEBAR_WIDTH to the Star constructor)
        for (let i = 0; i < 800; i++) {
            starsRef.current.push(new Star(W, H, SIDEBAR_WIDTH));
        }

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [W, H]);

    // Mouse Listener and Resize Hook
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
            {/* 2. Render the Sidebar first (z-index ensures it's on top) */}
            <Sidebar /> 
            
            <canvas ref={canvasRef} id="starfield" className="starfield-canvas" />
            
            {/* The info-text is now unnecessary as the Sidebar provides info */}
            <div className="info-text">
                {/* Note: Mouse movement will only generate stars outside the sidebar now */}
            </div>
        </div>
    );
}