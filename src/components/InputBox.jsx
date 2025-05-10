import React, {useState} from "react";
import "../styles/app.css";
//InputBox will use a function passed to it from the parent when the submit button is clicked>

const InputBox =({onSubmit})=>{ //onSubmit is a prop here whose value is accepted from App.JS
    const [input,setInput] = useState("");
    const [mode,setMode] = useState("Friendly");

    const tones =[
       "Friendly",
        "Formal",
        "Professional",
        "Chill",
        "Flirty",
        "Sarcastic",
        "Explain like I’m 5",
        "Simplify",
        "Motivational",
        "Funny", 
    ];

    const handleSubmit = ()=>{
        if (input.trim()!== ""){ //ensures empty inputs are ignored
            onSubmit(input,mode);  //calls the function from parent (App.js) (onSubmit) and sends the current input & mode.
            setInput("");  //clears inputarea after send
        }
    };

    return(  //onscreen UI
        <div className="input-box">
            <textarea 
            value={input} 
            onChange={(e)=>setInput(e.target.value)}
            placeholder="Type your message here.." 
            rows={5} 
            />

            <div className="controls">
                <select value={mode} onChange={(e)=> setMode(e.target.value)}>
                    {tones.map((tone)=>(
                        <option key={tone} value={tone}>
                            {tone}
                            </option>
                    ))}
                </select>
                <button onClick={handleSubmit} type="submit">Send</button>
            </div>
        </div>
    );
};

export default InputBox;