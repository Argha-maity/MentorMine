import React, { useState } from "react";
import "./SignupView.css";

export default function SignupView({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const generateAvatar = (name) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page reload
    if (!name.trim() || !email.trim()) {
      alert("Please fill all fields");
      return;
    }

    const newUser = {
      name,
      email,
      photoUrl: generateAvatar(name),
      createdAt: new Date().toISOString()
    };

    chrome.storage.local.set({ userInfo: newUser }, () => {
      onSignup(newUser);
    });
  };

  return (
    <div className="mm-signup">
      <div className="mm-signup__brand">
        <div className="mm-signup__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
            <path d="M12 12L20 7.5M12 12V21M12 12L4 7.5" />
          </svg>
        </div>
        <h1 className="mm-signup__title">Welcome to MentorMine</h1>
        <p className="mm-signup__subtitle">Your AI coding mentor — right in your browser</p>
      </div>

      <div className="mm-signup__features">
        <div className="mm-feature-card">
          <div className="mm-feature-card__icon">🧠</div>
          <h3>AI-Powered Hints</h3>
          <p>Get progressive hints without spoilers</p>
        </div>
        <div className="mm-feature-card">
          <div className="mm-feature-card__icon">💬</div>
          <h3>Smart Chat</h3>
          <p>Ask your mentor anything, anytime</p>
        </div>
        <div className="mm-feature-card">
          <div className="mm-feature-card__icon">📖</div>
          <h3>Learn by Doing</h3>
          <p>Build real understanding, not memorization</p>
        </div>
      </div>

      <form className="mm-signup__form" onSubmit={handleSubmit}>
        <div className="mm-input-group">
          <svg className="mm-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mm-input-group">
          <svg className="mm-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="mm-signup__btn">
          Get Started <span>→</span>
        </button>
      </form>

      <p className="mm-signup__footer">
        No credit card required · Works on any coding platform
      </p>
    </div>
  );
}