import React, { useState,useEffect,useRef} from "react";
import InputBox from "./components/InputBox";
import './styles/app.css';
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [darkMode,setDarkMode] =useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  //load saved messages from localstorage,runs only once when the page loads
  useEffect(() => {
    const saved = localStorage.getItem("vibewrite-history");
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map(msg => ({
        ...msg,
        date: msg.date || new Date(msg.timeStamp).toLocaleDateString()
      }));
      setMessages(withDates);
    }
    setIsStorageLoaded(true); // ✅ mark when localStorage is ready
  
    const savedTheme = localStorage.getItem("vibewrite-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);  
  
  useEffect(() => {
    if (!isStorageLoaded) return; // 🛑 Don't save until we’ve loaded once
    console.log("Trying to save to localStorage:", messages);
    localStorage.setItem("vibewrite-history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages, isStorageLoaded]);
  
  //Runs every time messages changes.Saves updated list into browser memory.
  useEffect(()=>{
    document.body.classList.toggle("dark",darkMode);
    localStorage.setItem("vibewrite-theme",darkMode? "dark":"light");
  },[darkMode]);

  const scrollToBottom =()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  };

  const handleCopy =(text)=>{
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDelete = (index) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
    toast.info("Message deleted.");
  };

  const handleEdit = async(index)=>{
    const old = messages[index];
    const newText =prompt("Edit your original message",old.original);
    if (!newText || newText.trim()==="") return;

    try{
      const promptText = `Rewrite the following message in a ${old.mode} tone:\n"${newText}"`;

      const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
        {
          model:"openai/gpt-3.5-turbo",
          messages:[
            { role: "system", content: "You are a helpful assistant that rewrites messages in different tones." },
            { role: "user", content: promptText }
          ],
          temperature:0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "Content-Type": "application/json",
            "X-Title": "VibeWrite"
          }
        }
      );

      const rewritten = response.data.choices[0].message.content.trim();

      const updated = [...messages];
      updated[index] = {
        ...updated[index],
        original: newText,
        rewritten,
        timeStamp: new Date().toLocaleString(),
      };

      setMessages(updated);
      toast.success("Message updated.");

    } catch (err) {
      console.error("Edit Error:", err?.response?.data || err.message);
      toast.error("Edit failed. Try again.");
    }
    };
  console.log("ENV KEY:", process.env.REACT_APP_OPENROUTER_KEY);
  //You're sending a request to OpenRouter and updating state with the response.
  const handleSubmit = async (text, mode) => {
    
    const prompt = `Rewrite the following message in a ${mode} tone:\n"${text}"`;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo", 
          messages: [
            { role: "system", content: `You are a helpful assistant that rewrites messages in different tones.` },
            { role: "user", content: prompt }  
          ],          
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "Content-Type": "application/json",
            "X-Title": "VibeWrite"
          }
        }
      );

      const rewritten = response.data.choices[0].message.content.trim();

      const newMessage = { //Yeh ek object hai jo hum messages array mein daal rahe hain
        original: text,
        rewritten,
        mode,
        timeStamp: new Date().toLocaleString(),
        date: new Date().toLocaleDateString()
      };

      setMessages((prev) => [...prev, newMessage]); //means "append this newMessage to whatever was there earlier".
      toast.success("Message rewritten!");

    } catch (error) {
      console.error("OpenRouter Error:", error?.response?.data || error.message);
      toast.error(error?.response?.status === 429
        ? "Rate limit hit. Try again later."
        : "Something went wrong.");
    } 
  };
// grouping logic for future date tabs feature
   const groupedByDate = messages.reduce((acc,msg)=>{
    const date = msg.date || new Date(msg.timeStamp).toLocaleDateString();
    if(!acc[date]) acc[date]=[];
    acc[date].push(msg);
    return acc;
   },{});

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="title">
        VibeWrite <span>✨</span>
      </h1>
      <div className="toggle-container">
  <button className="dark-toggle" onClick={() => setDarkMode(prev => !prev)}>
    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
  </button>
  <button className="view-toggle" onClick={() => setShowHistory(prev => !prev)}>
    {showHistory ? "📝 Back to Writing" : "📜 View History"}
  </button>
</div>

      <button className="dark-toggle" onClick={() => setDarkMode(prev => !prev)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      
      {!showHistory ? (
  <>
    <InputBox onSubmit={handleSubmit} />
    <div className="messages">
      {Object.keys(groupedByDate).map(date => (
        <div key={date}>
          <h3 className="date-label">{date}</h3>
          {groupedByDate[date].map((msg, idx) => (
            <div key={idx} className="message-card">
              <strong>Original:</strong> {msg.original}<br />
              <strong>{msg.mode} tone:</strong> {msg.rewritten}
              <div className="button-group">
                <button className="copy-btn" onClick={() => handleCopy(msg.rewritten)}>📋</button>
                <button className="edit-btn" onClick={() => handleEdit(messages.indexOf(msg))}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(messages.indexOf(msg))}>🗑️</button>
              </div>
              <div className="timestamp">{msg.timeStamp}</div>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  </>
) : (
  <div className="history-view">
    <h2>Prompt History 📜</h2>
    {messages.length === 0 ? <p>No saved prompts yet.</p> : (
      messages.map((msg, idx) => (
        <div key={idx} className="history-card">
          <strong>Original:</strong> {msg.original}<br />
          <strong>{msg.mode} tone:</strong> {msg.rewritten}<br />
          <small>{msg.timeStamp}</small>
          <hr />
        </div>
      ))
    )}
  </div>
)}

    </div>
  );
}
export default App;
