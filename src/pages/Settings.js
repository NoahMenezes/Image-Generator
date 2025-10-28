import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    apiKey: '',
    modelSettings: {
      temperature: 0.7,
      maxTokens: 150,
      topP: 1.0,
    },
    imageSettings: {
      imageSize: '1024x1024',
      imageQuality: 'standard',
      numberOfImages: 1,
    },
    prompt: {
      defaultStyle: 'realistic',
      defaultMedium: 'digital art',
      useEnhancedPrompts: true,
    }
  });

  const handleApiKeyChange = (e) => {
    setSettings(prev => ({
      ...prev,
      apiKey: e.target.value
    }));
  };

  const handleModelSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      modelSettings: {
        ...prev.modelSettings,
        [setting]: parseFloat(value)
      }
    }));
  };

  const handleImageSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      imageSettings: {
        ...prev.imageSettings,
        [setting]: value
      }
    }));
  };

  const handlePromptSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      prompt: {
        ...prev.prompt,
        [setting]: setting === 'useEnhancedPrompts' ? value : value
      }
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Here you would typically save the settings to your backend or localStorage
    console.log('Saving settings:', settings);
    // Show success message
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <form onSubmit={handleSaveSettings}>
        <section className="settings-section">
          <h2>API Configuration</h2>
          <div className="form-group">
            <label htmlFor="apiKey">Gemini API Key</label>
            <input
              type="password"
              id="apiKey"
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your Gemini API key"
            />
            <small>Your API key is stored securely and never shared</small>
          </div>
        </section>

        <section className="settings-section">
          <h2>Model Settings</h2>
          <div className="form-group">
            <label htmlFor="temperature">Temperature</label>
            <input
              type="range"
              id="temperature"
              min="0"
              max="1"
              step="0.1"
              value={settings.modelSettings.temperature}
              onChange={(e) => handleModelSettingChange('temperature', e.target.value)}
            />
            <span>{settings.modelSettings.temperature}</span>
          </div>

          <div className="form-group">
            <label htmlFor="maxTokens">Max Tokens</label>
            <input
              type="number"
              id="maxTokens"
              min="1"
              max="1000"
              value={settings.modelSettings.maxTokens}
              onChange={(e) => handleModelSettingChange('maxTokens', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="topP">Top P</label>
            <input
              type="range"
              id="topP"
              min="0"
              max="1"
              step="0.1"
              value={settings.modelSettings.topP}
              onChange={(e) => handleModelSettingChange('topP', e.target.value)}
            />
            <span>{settings.modelSettings.topP}</span>
          </div>
        </section>

        <section className="settings-section">
          <h2>Image Generation Settings</h2>
          <div className="form-group">
            <label htmlFor="imageSize">Image Size</label>
            <select
              id="imageSize"
              value={settings.imageSettings.imageSize}
              onChange={(e) => handleImageSettingChange('imageSize', e.target.value)}
            >
              <option value="256x256">256x256</option>
              <option value="512x512">512x512</option>
              <option value="1024x1024">1024x1024</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="imageQuality">Image Quality</label>
            <select
              id="imageQuality"
              value={settings.imageSettings.imageQuality}
              onChange={(e) => handleImageSettingChange('imageQuality', e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="numberOfImages">Number of Images</label>
            <input
              type="number"
              id="numberOfImages"
              min="1"
              max="4"
              value={settings.imageSettings.numberOfImages}
              onChange={(e) => handleImageSettingChange('numberOfImages', parseInt(e.target.value))}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Prompt Settings</h2>
          <div className="form-group">
            <label htmlFor="defaultStyle">Default Style</label>
            <select
              id="defaultStyle"
              value={settings.prompt.defaultStyle}
              onChange={(e) => handlePromptSettingChange('defaultStyle', e.target.value)}
            >
              <option value="realistic">Realistic</option>
              <option value="artistic">Artistic</option>
              <option value="cartoon">Cartoon</option>
              <option value="abstract">Abstract</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="defaultMedium">Default Medium</label>
            <select
              id="defaultMedium"
              value={settings.prompt.defaultMedium}
              onChange={(e) => handlePromptSettingChange('defaultMedium', e.target.value)}
            >
              <option value="digital art">Digital Art</option>
              <option value="photography">Photography</option>
              <option value="oil painting">Oil Painting</option>
              <option value="watercolor">Watercolor</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label htmlFor="useEnhancedPrompts">
              <input
                type="checkbox"
                id="useEnhancedPrompts"
                checked={settings.prompt.useEnhancedPrompts}
                onChange={(e) => handlePromptSettingChange('useEnhancedPrompts', e.target.checked)}
              />
              Use Enhanced Prompts
            </label>
            <small>Automatically enhance your prompts for better results</small>
          </div>
        </section>

        <div className="settings-actions">
          <button type="submit" className="save-button">
            Save Settings
          </button>
          <button type="button" className="reset-button" onClick={() => window.location.reload()}>
            Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
