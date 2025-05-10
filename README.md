#VibeWrite ✍️

**VibeWrite** is a React-based web app that helps you rewrite your messages in different tones — whether you want to sound friendly, sarcastic, flirty, or just way more professional than you feel.  
It’s powered by the OpenRouter API (GPT-3.5 Turbo under the hood) and keeps things snappy with no backend — all data stays local.

🔗 [Live site](https://vibewrite-gamma.vercel.app)

---

# What it does :

- Rewrite any message in a tone you pick (yes, even “explain like I’m 5”).
- Dark mode & light mode toggle (because aesthetics matter).
- View, edit, copy, or delete past generations.
- Automatically saves your prompt history, grouped by date.
- Works fully in-browser — no account, no backend, no fuss.

---

# Built With :

- **React** (with Hooks)
- **OpenRouter API** (GPT-3.5 Turbo ,temperature-0.7)
- **localStorage** for saving prompts
- **Vercel** for deployment

---

# Running it locally

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/vibewrite.git
   cd vibewrite
2. Install the dependencies:
   ```bash
   npm install
3. Create a .env.local file in the root and add your OpenRouter API key:
   REACT_APP_OPENROUTER_KEY=your_openrouter_key_here
   
5. Start the dev server:
   ```bash
   npm start
   
🚧 Things I might still add :
 - Export history to .txt or .json
 - More tone options (e.g. Gen Z, passive-aggressive, corporate buzzword hell)

🙌 Why I built this
I wanted a tool that could help rewrite text based on vibe — like how you’d tweak a message before sending it to your boss vs your best friend. So I made one. The whole thing runs in-browser using React + OpenRouter, and it helped me get better at integrating APIs, managing local state, and polishing UI.

🤙 Let’s connect : https://www.linkedin.com/in/aditi-goswami-850076261/
