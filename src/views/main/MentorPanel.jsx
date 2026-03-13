import { useState, useRef, useEffect } from "react";
import "./MentorPanel.css";
import SignupView from "../auth/SignupView";
import SettingsView from "../profile/SettingsView";
import ProfileView from "../profile/ProfileView";
import HintView from "../dashboard/HintView";
import ChatView from "../dashboard/ChatView";
import HistoryView from "../history/HistoryView";
import { GradCapIcon, SettingsIcon, LightbulbIcon, MessageIcon } from "../../components/Icons";
import { saveToHistory } from "../../services/HistoryService";

/*const hints = [
  { level: 1, label: "Nudge", content: "Think about the data structure that allows O(1) lookup. What would help you check if an element exists quickly?" },
  { level: 2, label: "Direction", content: "Consider using a hash map. For each element, you can check if its complement (target - current) has already been seen." },
  { level: 3, label: "Approach", content: "Iterate through the array once. For each number, calculate target - num. If that value exists in your hash map, you found the pair. Otherwise, store the current number with its index." },
];*/

export default function MentorPanel() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [tab, setTab] = useState("hints");
  const [problemTitle, setProblemTitle] = useState("Select a problem");
  const [currentCode, setCurrentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [problemContext, setProblemContext] = useState({ description: "", lastError: null });

  const [dynamicHints, setDynamicHints] = useState([]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, role: "assistant", content: "Hi! I'm your MentorMine assistant. Ready to code?" },
  ]);

  const getAIHints = () => {
    if (!currentCode || problemTitle === "Select a problem") return;

    setIsLoading(true);
    chrome.runtime.sendMessage({
      type: "GET_AI_HINT",
      payload: {
        title: problemTitle,
        code: currentCode,
        description: problemContext.description,
        lastError: problemContext.lastError
      }
    }, (response) => {
      if (response && response.hint) {
        const formatted = [
          { level: 1, label: "Nudge", content: response.hint.nudge },
          { level: 2, label: "Direction", content: response.hint.direction },
          { level: 3, label: "Approach", content: response.hint.approach },
        ];
        setDynamicHints(formatted);
        saveToHistory(problemTitle, "hint", response.hint.nudge);
      }
      setIsLoading(false);
    });
  };

  const handleLogout = () => {
    setUser(null);
    setTab("hints");
  };

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["userInfo"], (result) => {
        if (result.userInfo) {
          setUser(result.userInfo);
        }
        setLoadingProfile(false);
      });
    } else {
      setLoadingProfile(false);
    }

    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "GET_LATEST_DATA" }, (response) => {
        if (response) {
          setProblemTitle(response.title);
          setCurrentCode(response.code);
        }
      });

      const listener = (message) => {
        if (message.type === "UPDATE_UI_DATA") {
          setProblemTitle(message.data.title);
          setCurrentCode(message.data.code);
          setProblemContext({
            description: message.data.description,
            lastError: message.data.lastError
          });
          if (message.data.title !== problemTitle) setDynamicHints([]);
        }
      };

      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }
  }, []);

  if (!user) {
    return (
      <SignupView
        onSignup={(newUser) => {
          chrome.storage.local.set({ userInfo: newUser }, () => {
            setUser(newUser);
            setTab("hints");
          });
        }}
      />
    );
  }

  const handleUpdateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    chrome.storage.local.set({ userInfo: updatedUser }, () => {
      setUser(updatedUser);
    });
  };

  if (loadingProfile) return <div className="mm-panel">Loading profile...</div>;

  if (!user) {
    return <SignupView onSignup={setUser} />;
  }

  return (
    <div className="mm-panel">
      <div className="mm-header">
        <div className="mm-header__brand">
          <div className="mm-header__logo"><GradCapIcon /></div>
          <span className="mm-header__title">MentorMine</span>
        </div>
        <div className="mm-header__actions">
          <button className="mm-header__btn" onClick={() => setTab("settings")}>
            <SettingsIcon />
          </button>
          <button className="mm-header__avatar" onClick={() => setTab("profile")}>
            <img src={user.photoUrl} alt="Avatar" className="mm-avatar-img" />
          </button>
        </div>
      </div>

      <div className="mm-context">
        <p className="mm-context__label">Current Problem</p>
        <p className="mm-context__problem">{problemTitle}</p>
      </div>

      <div className="mm-tabs">
        <button className={`mm-tabs__btn ${tab === "hints" ? "mm-tabs__btn--active" : ""}`}
          onClick={() => setTab("hints")}>
          <LightbulbIcon /> Hints
        </button>
        <button className={`mm-tabs__btn ${tab === "chat" ? "mm-tabs__btn--active" : ""}`}
          onClick={() => setTab("chat")}>
          <MessageIcon /> Chat
        </button>
      </div>

      {tab === "hints" && (
        <HintView
          hints={dynamicHints}
          onGetHint={getAIHints}
          loading={isLoading}
        />
      )}

      {tab === "chat" && (
        <ChatView
          messages={chatMessages}
          setMessages={setChatMessages}
          currentCode={currentCode}
          problemTitle={problemTitle}
          problemContext={problemContext}
        />
      )}

      {tab === "profile" && (
        <ProfileView
          user={user}
          onNavigate={(target) => setTab(target)}
          onLogout={handleLogout}
          onBack={() => setTab("hints")}
        />
      )}

      {tab === "settings" && (
        <SettingsView
          user={user}
          onUpdate={setUser}
          onBack={() => setTab("hints")}
        />
      )}
      {tab === "history" && (
        <HistoryView onBack={() => setTab("profile")} />
      )}
    </div>
  );
}