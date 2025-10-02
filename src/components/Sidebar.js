import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
    // Placeholder data to mimic the "Gems" and "Recent" sections
    const gems = [
        { icon: '📖', name: 'Storybook' },
        { icon: '💎', name: 'Explore Gems' }
    ];

    const recentChats = [
        'CSS Pitch Black Night Sky',
        'Adding Light Gradients to App C...',
        'CSS 3D Solar System Simulation',
        'React Navbar Component with T...',
        'Cyberpunk Login/Signup UI Desi...'
    ];

    return (
        <aside className="sidebar">
            {/* Top Section: Menu and New Chat */}
            <div className="sidebar-top">
                <div className="menu-header">
                    <span className="icon">☰</span>
                    <span className="icon search-icon">🔍</span>
                </div>
                <div className="new-chat-button">
                    <span className="icon">📝</span> New Chat
                    <span className="fullscreen-icon">⛶</span>
                </div>
            </div>

            {/* Middle Section: Gems (Features) */}
            <div className="sidebar-section">
                <h3>Gems</h3>
                {gems.map((item, index) => (
                    <div key={index} className="sidebar-item">
                        <span className="item-icon">{item.icon}</span>
                        {item.name}
                        <span className="pin-icon">📌</span>
                    </div>
                ))}
            </div>

            {/* Bottom Section: Recent Chats */}
            <div className="sidebar-section">
                <h3>Recent</h3>
                {recentChats.map((title, index) => (
                    <div 
                        key={index} 
                        className={`sidebar-item recent-chat ${index === 0 ? 'selected-chat' : ''}`}
                    >
                        {title}
                    </div>
                ))}
            </div>

            {/* Settings & Help at the very bottom */}
            <div className="sidebar-bottom">
                <div className="sidebar-item settings">
                    <span className="icon">⚙️</span> Settings & help
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;