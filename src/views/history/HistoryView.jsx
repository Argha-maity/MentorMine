import React, { useEffect, useState } from "react";
import "./HistoryView.css";

export default function HistoryView({ onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(["history"], (result) => {
      if (result.history) {
        setHistory(result.history);
      }
    });
  }, []);

  const clearHistory = () => {
    if (window.confirm("Clear all history?")) {
      chrome.storage.local.set({ history: [] }, () => setHistory([]));
    }
  };

  return (
    <div className="mm-history">
      <div className="mm-header">
        <button className="mm-header__btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="mm-header__title">Activity History</h2>
        <button className="mm-header__btn" onClick={clearHistory} title="Clear All">
          <svg viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <div className="mm-history__list">
        {history.length === 0 ? (
          <div className="mm-history__empty">
            <p>No history yet. Start coding to see your hints here!</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="mm-history-card">
              <div className="mm-history-card__header">
                <span className={`mm-badge mm-badge--${item.type}`}>
                  {item.type.toUpperCase()}
                </span>
                <span className="mm-history-card__date">{item.timestamp}</span>
              </div>
              <h4 className="mm-history-card__title">{item.title}</h4>
              <p className="mm-history-card__content">{item.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}