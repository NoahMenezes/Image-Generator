import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: 'Noah',
    email: 'noah@example.com',
    bio: 'AI Image Generation Enthusiast',
    preferences: {
      darkMode: true,
      notifications: true,
      language: 'English'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference, value) => {
    setEditedData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }));
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        {!isEditing && (
          <button className="edit-button" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <button className="change-avatar-button">
                Change Avatar
              </button>
            )}
          </div>

          <div className="profile-fields">
            <div className="field">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              ) : (
                <span>{profileData.name}</span>
              )}
            </div>

            <div className="field">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                <span>{profileData.email}</span>
              )}
            </div>

            <div className="field">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  value={editedData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                />
              ) : (
                <span>{profileData.bio}</span>
              )}
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h2>Preferences</h2>
          <div className="preference-toggles">
            <div className="preference-item">
              <label>Dark Mode</label>
              <input
                type="checkbox"
                checked={isEditing ? editedData.preferences.darkMode : profileData.preferences.darkMode}
                onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="preference-item">
              <label>Notifications</label>
              <input
                type="checkbox"
                checked={isEditing ? editedData.preferences.notifications : profileData.preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="preference-item">
              <label>Language</label>
              {isEditing ? (
                <select
                  value={editedData.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              ) : (
                <span>{profileData.preferences.language}</span>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="profile-actions">
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
