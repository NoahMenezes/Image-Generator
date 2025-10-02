import React, { useState, useMemo, createContext, useContext } from 'react';
import './Sidebar.css';

// Create a context for the sidebar
export const SidebarContext = createContext({
    recentChats: [],
    currentChatId: null,
    newChat: () => {},
    selectChat: () => {},
    deleteChat: () => {},
    clearAllChats: () => {}
});

const Sidebar = () => {
    const context = useContext(SidebarContext);
    
    // --- STATE MANAGEMENT ---
    const initialRecentChats = useMemo(() => [
        { id: 1, title: 'CSS Pitch Black Night Sky' },
        { id: 2, title: 'Adding Light Gradients to App' },
        { id: 3, title: 'CSS 3D Solar System Simulation' },
        { id: 4, title: 'React Navbar Component with T...' },
        { id: 5, title: 'Cyberpunk Login/Signup UI Desi...' }
    ], []);

    const [recentChats, setRecentChats] = useState(initialRecentChats);
    const [currentChatId, setCurrentChatId] = useState(initialRecentChats[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Placeholder data for the "Gems" section
    const gems = [
        { icon: '📖', name: 'Storybook' },
        { icon: '💎', name: 'Explore Gems' }
    ];

    // --- HANDLERS ---

    const handleNewChat = () => {
        const newId = Date.now();
        const newChatItem = { id: newId, title: 'New Chat' };
        setRecentChats(prevChats => [newChatItem, ...prevChats]);
        setCurrentChatId(newId);
        setSearchTerm('');
        
        // Call context method if provided
        if (context.newChat) {
            context.newChat(newChatItem);
        }
    };

    const handleSelectChat = (id) => {
        setCurrentChatId(id);
        if (context.selectChat) {
            context.selectChat(id);
        }
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            setRecentChats(prevChats => {
                const updatedChats = prevChats.filter(chat => chat.id !== id);
                if (currentChatId === id) {
                    setCurrentChatId(updatedChats[0]?.id || null);
                }
                
                // Call context method if provided
                if (context.deleteChat) {
                    context.deleteChat(id);
                }
                
                return updatedChats;
            });
        }
    };

    const handleEdit = (id) => {
        const newTitle = prompt('Enter new chat title:');
        if (newTitle) {
            setRecentChats(recentChats.map(chat =>
                chat.id === id ? { ...chat, title: newTitle } : chat
            ));
        }
    };

    // --- COMPUTED VALUES ---

    const filteredChats = useMemo(() => {
        if (!searchTerm) {
            return recentChats;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return recentChats.filter(chat =>
            chat.title.toLowerCase().includes(lowerCaseSearch)
        );
    }, [recentChats, searchTerm]);

    // --- RENDER ---

    return (
        <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
            {/* Top Section: Menu and New Chat Button */}
            <div className="sidebar-top">
                <div className="menu-header">
                    <span className="icon menu-toggle-icon" onClick={handleToggleSidebar}>☰</span>
                </div>

                <div className="new-chat-button" onClick={handleNewChat}>
                    <span className="icon">📝</span>
                    {isSidebarOpen && 'New Chat'}
                    <span className="fullscreen-icon">⛶</span>
                </div>
            </div>

            {/* Content Container - Conditionally rendered based on open state */}
            {isSidebarOpen && (
                <>
                    {/* Search Bar */}
                    <div className="sidebar-search">
                        <span className="icon search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    {/* Middle Section: Gems (Features) */}
                    <div className="sidebar-section gems-section">
                        <h3>Gems</h3>
                        {gems.map((item, index) => (
                            <div key={index} className="sidebar-item">
                                <span className="item-icon">{item.icon}</span>
                                {item.name}
                                <span className="pin-icon">📌</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section: Recent Chats (The main scrolling content) */}
                    <div className="sidebar-section recent-chats-section">
                        <h3>Recent</h3>
                        <div className="recent-chats-list">
                            {filteredChats.length > 0 ? (
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`sidebar-item recent-chat ${chat.id === currentChatId ? 'selected-chat' : ''}`}
                                        onClick={() => handleSelectChat(chat.id)}
                                    >
                                        {chat.title}
                                        {/* Action buttons appear on hover/selection */}
                                        <div className="chat-actions">
                                            <span
                                                className="action-icon edit-icon"
                                                onClick={(e) => { e.stopPropagation(); handleEdit(chat.id); }}
                                                title="Edit Title"
                                            >
                                                ✏️
                                            </span>
                                            <span
                                                className="action-icon delete-icon"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }}
                                                title="Delete Chat"
                                            >
                                                🗑️
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">No chats found.</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Settings & Help at the very bottom (Always visible, but content changes) */}
            <div className="sidebar-bottom">
                <div className="sidebar-item settings">
                    <span className="icon">⚙️</span>
                    {isSidebarOpen && 'Settings & help'}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;