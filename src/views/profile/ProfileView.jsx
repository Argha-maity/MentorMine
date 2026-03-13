import React from "react";
import "./ProfileView.css";

export default function ProfileView({ user, onNavigate, onLogout, onBack }) {
  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out? This will clear your local session.")) {
      chrome.storage.local.remove(["userInfo"], () => {
        onLogout();
      });
    }
  };

  return (
    <div className="mm-profile">
      {/* Header */}
      <div className="mm-profile__header">
        <button className="mm-header__btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="mm-header__title">Account</h2>
        <div style={{ width: 32 }}></div> {/* Spacer for centering */}
      </div>

      {/* Profile Card */}
      <div className="mm-profile__card">
        <div className="mm-profile__avatar-wrapper">
          <img src={user?.photoUrl} alt="Avatar" className="mm-profile__avatar-img" />
          <div className="mm-profile__status-badge"></div>
        </div>
        <h3 className="mm-profile__name">{user?.name || "Developer"}</h3>
        <p className="mm-profile__email">{user?.email}</p>
      </div>

      {/* Menu Options */}
      <div className="mm-profile__menu">
        <div className="mm-menu-label">Activity & Settings</div>
        
        <button className="mm-menu-item" onClick={() => onNavigate('history')}>
          <div className="mm-menu-item__icon history">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mm-menu-item__text">
            <span>Hint & Chat History</span>
            <p>Review your past learning sessions</p>
          </div>
          <svg className="mm-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <button className="mm-menu-item" onClick={() => onNavigate('settings')}>
          <div className="mm-menu-item__icon settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="mm-menu-item__text">
            <span>Edit Profile</span>
            <p>Update name and email</p>
          </div>
          <svg className="mm-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mm-profile__footer">
        <button className="mm-logout-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Log Out
        </button>
        <p className="mm-version">Version 1.0.0</p>
      </div>
    </div>
  );
}