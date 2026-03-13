import { useState } from "react";
import { LightbulbIcon, EyeIcon, EyeOffIcon, ChevronIcon } from "../../components/Icons";
import MarkdownRenderer from "../../components/MarkdownRenderer";

export default function HintView({ hints, onGetHint, loading }) {
  const [revealed, setRevealed] = useState([]);

  const toggle = (level) => {
    setRevealed((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  return (
    <div className="mm-hints">
      <div className="mm-hints__header">
        <LightbulbIcon />
        <span className="mm-hints__title">Hints</span>
      </div>

      {hints.length === 0 ? (
        <div className="mm-hints__empty">
          <p>No hints generated yet for your current code.</p>
          <button
            className="mm-hints__generate-btn"
            onClick={onGetHint}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Analyze my code for hints"}
          </button>
        </div>
      ) : (
        <div className="mm-hints__list">
          {hints.map((h) => {
            const open = revealed.includes(h.level);
            return (
              <div key={h.level} className="mm-hint">
                <button className="mm-hint__toggle" onClick={() => toggle(h.level)}>
                  <span className="mm-hint__left">
                    <span className="mm-hint__badge">{h.level}</span>
                    <span className="mm-hint__label">{h.label}</span>
                  </span>
                  <span className="mm-hint__right">
                    {open ? <EyeOffIcon /> : <EyeIcon />}
                    <ChevronIcon open={open} />
                  </span>
                </button>
                {open && (
                  <div className="mm-hint__content">
                    <div className="mm-hint__text">
                      <MarkdownRenderer content={h.content} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button
            className="mm-hints__refresh-btn"
            onClick={onGetHint}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Hints"}
          </button>
        </div>
      )}
    </div>
  );
}