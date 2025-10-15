import React, { useState, useMemo, createContext, useContext, useCallback } from 'react';
import './Sidebar.css';

// Create a context for the sidebar state and update methods
export const SidebarContext = createContext({
    // State
    recentChats: [],
    currentChatId: null,
    isSidebarOpen: true, // <-- Added
    // Methods
    setCurrentChatId: () => {},
    setRecentChats: () => {},
    updateChatTitle: () => {},
    handleToggleSidebar: () => {}, // <-- Added
});

// Sidebar Provider (Must wrap the App content to share state)
export const SidebarProvider = ({ children }) => {
    const initialChats = useMemo(() => [
        { id: 1, title: 'Epic Space Battle' },
        { id: 2, title: 'Neon Cityscape Art' },
        { id: 3, title: 'Abstract Wireframe Cube' },
    ], []);

    const [recentChats, setRecentChats] = useState(initialChats);
    const [currentChatId, setCurrentChatId] = useState(initialChats[0]?.id || Date.now());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // <-- Internal state for open/close

    // Function called by App.js to create a new chat or update the current one's title
    const updateChatTitle = useCallback((id, newTitle) => {
        setRecentChats(prevChats => {
            const index = prevChats.findIndex(chat => chat.id === id);
            if (index !== -1) {
                // Update existing chat title
                return prevChats.map((chat, i) =>
                    i === index ? { ...chat, title: newTitle.substring(0, 30) + (newTitle.length > 30 ? '...' : '') } : chat
                );
            } else {
                // If ID is new (first time saving), create a new chat
                const newChat = { 
                    id, 
                    title: newTitle.substring(0, 30) + (newTitle.length > 30 ? '...' : '') 
                };
                return [newChat, ...prevChats];
            }
        });
        setCurrentChatId(id);
    }, []);

    const handleToggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const contextValue = useMemo(() => ({
        recentChats,
        currentChatId,
        setCurrentChatId,
        setRecentChats,
        updateChatTitle,
        isSidebarOpen, // <-- Exposed
        handleToggleSidebar, // <-- Exposed
    }), [recentChats, currentChatId, updateChatTitle, isSidebarOpen, handleToggleSidebar]);

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    );
};


const Sidebar = () => {
    const { 
        recentChats, 
        currentChatId, 
        setCurrentChatId, 
        setRecentChats, 
        isSidebarOpen, // <-- Used
        handleToggleSidebar // <-- Used
    } = useContext(SidebarContext);

    const [searchTerm, setSearchTerm] = useState('');
    
    // --- HANDLERS ---

    const handleNewChat = () => {
        const newId = Date.now();
        const newChat = { id: newId, title: 'New Chat' };
        setRecentChats(prevChats => [newChat, ...prevChats.filter(chat => chat.id !== newId)]);
        setCurrentChatId(newId);
        setSearchTerm('');
    };

    const handleSelectChat = (id) => {
        setCurrentChatId(id);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // NOTE: Using custom modal UI instead of window.confirm/prompt (best practice for iframes)
    // NOTE: Using custom modal UI instead of window.confirm/prompt (best practice for iframes)
    const handleDelete = (id) => {
        // Removed window.confirm() - Deleting immediately upon click
        // if (window.confirm('Are you sure you want to delete this chat?')) { 
            setRecentChats(prevChats => {
                const updatedChats = prevChats.filter(chat => chat.id !== id);
                if (currentChatId === id) {
                    setCurrentChatId(updatedChats[0]?.id || null);
                }
                return updatedChats;
            });
        // }
    };

    const handleEdit = (id) => {
        const newTitle = window.prompt('Enter new chat title:');
        if (newTitle) {
            setRecentChats(recentChats.map(chat =>
                chat.id === id ? { ...chat, title: newTitle.substring(0, 30) } : chat
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
                    {/* Using an inline SVG for the menu icon for better styling control */}
                    <svg 
                        className="icon menu-toggle-icon" 
                        onClick={handleToggleSidebar}
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </div>

                <div className="new-chat-button" onClick={handleNewChat} title={!isSidebarOpen ? 'New Chat' : ''}>
                    {/* Using plus icon for New Chat */}
                    <span className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </span>
                    {isSidebarOpen && <span className='new-chat-text'>Start New Vision</span>}
                    {/* Placeholder for optional "full screen" icon, hidden in collapsed state */}
                    {isSidebarOpen && <span className="fullscreen-icon">⛶</span>}
                </div>
            </div>

            {/* Content Container - Conditionally rendered based on open state */}
            {isSidebarOpen && (
                <>
                    {/* Sidebar Search Bar */}
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

                    {/* Recent Chats Section (The main scrolling content) */}
                    <div className="sidebar-section recent-chats-section"> 
                        <h3>Recent Visions</h3>
                        <div className="recent-chats-list">
                            {filteredChats.length > 0 ? (
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`sidebar-item recent-chat ${chat.id === currentChatId ? 'selected-chat' : ''}`}
                                        onClick={() => handleSelectChat(chat.id)}
                                    >
                                        <span className="item-icon">✨</span>
                                        <span className="item-title">{chat.title}</span>
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

            {/* Settings & Help at the very bottom */}
            <div className="sidebar-bottom">
                <div className="sidebar-item settings" title={!isSidebarOpen ? 'Settings & Help' : ''}>
                    <span className="icon">⚙️</span>
                    {isSidebarOpen && 'Settings & Help'}
                </div>
                <div className="sidebar-item user-profile">
                    <span className="icon">👤</span>
                    {isSidebarOpen && 'Profile (Noah)'}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
