import React, { useState,useEffect,useRef, use } from "react";
import InputBox from "./components/InputBox";
import './styles/app.css';
import axios from "axios";

function App() {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  //load saved messages from localstorage
  useEffect(()=>{   //runs only once when the page loads
    const saved =localStorage.getItem("vibewrite-history");
    if (saved){
      setMessages(JSON.parse(saved)); //If saved data exists, parse it and use it to initialize messages.


    }
  },[]);

  //Runs every time messages changes.Saves updated list into browser memory.
  useEffect(()=>{
    localStorage.setItem("vibewrite-history",JSON.stringify(messages));
    scrollToBottom(); //Scrolls to the bottom so user sees latest message.
    },[messages]);

  const scrollToBottom =()=>{
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  };

  const handleCopy =(text)=>{
    navigator.clipboard.writeText(text);
    alert("Copied");
  };

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
      };

      setMessages((prev) => [...prev, newMessage]); //means "append this newMessage to whatever was there earlier".

    } catch (error) {
      const msg = error?.response?.status === 429
        ? "Rate limit hit. Try again later."
        : "Something went wrong. Check console.";
      console.error("OpenRouter Error:", error?.response?.data || error.message);
      alert(msg);
    } 
  };

  return (
    <div className="app-container">
      <h1 className="title">
        VibeWrite <span>✨</span>
      </h1>

      <InputBox onSubmit={handleSubmit} />

      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="message-card">
            <strong>Original:</strong> {msg.original}
            <br />
            <strong>{msg.mode} tone:</strong> {msg.rewritten}
            <button className="copy-btn" onClick={() => handleCopy(msg.rewritten)}>📋</button>
            <div className="timestamp">{msg.timeStamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef}/> 
      </div>
    </div>
  );
}

export default App;
