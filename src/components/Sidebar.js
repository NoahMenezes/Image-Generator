import React, { useState, useMemo, createContext, useContext, useCallback } from 'react';
import './Sidebar.css';

// Create a context for the sidebar state and update methods
export const SidebarContext = createContext({
    // State
    recentChats: [],
    currentChatId: null,
    // Methods
    setCurrentChatId: () => {},
    setRecentChats: () => {},
    // Action to be called from App.js after a prompt
    updateChatTitle: () => {}, 
});

// Sidebar Provider (Must wrap the App content to share state)
export const SidebarProvider = ({ children }) => {
    const initialChats = useMemo(() => [
        { id: 1, title: 'CSS Pitch Black Night Sky' },
        { id: 2, title: 'Adding Light Gradients to App' },
        { id: 3, title: 'CSS 3D Solar System Simulation' },
    ], []);

    const [recentChats, setRecentChats] = useState(initialChats);
    const [currentChatId, setCurrentChatId] = useState(initialChats[0]?.id || Date.now());

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

    // Other handlers (select, delete)

    const handleDelete = (id) => {
        // Implement delete logic here (using setRecentChats/setCurrentChatId)
    };
    
    // ... define other handlers like newChat if needed for internal use ...

    const contextValue = useMemo(() => ({
        recentChats,
        currentChatId,
        setCurrentChatId,
        setRecentChats,
        updateChatTitle,
        // ... add other public methods here
    }), [recentChats, currentChatId, updateChatTitle]);

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
        updateChatTitle // Not used directly but good practice to keep here
    } = useContext(SidebarContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // NOTE: GEMS REMOVED as requested.
    
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
                return updatedChats;
            });
        }
    };

    const handleEdit = (id) => {
        const newTitle = prompt('Enter new chat title:');
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
                    {/* This is the only scrolling section now */}
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

            {/* Settings & Help at the very bottom */}
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