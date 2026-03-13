import React, { useState } from "react";

export default function SettingsView({ user, onUpdate, onBack }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name,
      email
    };

    chrome.storage.local.set({ userInfo: updatedUser }, () => {
      onUpdate(updatedUser);
      onBack();
    });
  };

  return (
    <div className="settings-container">

      {/* Header Row */}
      <div className="settings-header">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>
        <h2>Settings</h2>
      </div>

      {/* Form */}
      <div className="settings-form">

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="save-btn"
          onClick={handleSave}
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}