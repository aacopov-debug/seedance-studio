<div align="center">

# 🎬 Seedance Studio

**Build cinematic AI-video prompts in seconds**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![No Backend](https://img.shields.io/badge/backend-none-green.svg)](#)
[![Works Offline](https://img.shields.io/badge/works-offline-blue.svg)](#)

A free, open-source prompt builder for AI video generators<br/>
*Seedance · Runway · Kling · Luma · Pika · Sora · ...*

[**▶ Try it live**](https://aacopov-debug.github.io/seedance-studio/) · [📖 Manual](MANUAL.html) · [🐛 Report issue](https://github.com/aacopov-debug/seedance-studio/issues)

</div>

---

## What it does

Turn one-line ideas into production-ready cinematic prompts with structured fields, AI assistance, and multi-scene story mode.

```
Input:   "детектив в туманном порту"
       ↓
Output: "Lone detective in trench coat walks through fog-drenched harbor,
         medium shot tracking, anamorphic 35mm lens, blue hour, 
         heavy mist, cinematic chiaroscuro, neo-noir style, ..."
```

## ✨ Features

| | |
|---|---|
| 🎯 **Goal mode** | One sentence → full structured prompt via AI |
| 🩺 **Critique** | AI rates your prompt 0-100 and suggests fixes |
| 🖼 **Image-to-Video** | Drop a reference image, AI Vision fills the form |
| 🎬 **Story Mode** | Generate 3-10 connected scenes with consistent hero |
| 🔍 **Continuity Checker** | AI script supervisor finds wardrobe/time/prop breaks |
| 📽 **FCPXML export** | Drop the timeline straight into DaVinci Resolve / Final Cut |
| 🎤 **Voice input** | Speak your idea, Web Speech API transcribes |
| 🌐 **Translation** | EN / RU / CN / JP / ES |
| 🎨 **Live palette** | Visual color reference under the form |
| ⌨ **Command palette** | `Ctrl+K` for everything |
| 🔧 **Self-test** | Built-in diagnostics panel |

## 🚀 Quick start

### Option 1: Use the live version
Just open the link — nothing to install.<br/>
👉 **[https://aacopov-debug.github.io/seedance-studio/](https://aacopov-debug.github.io/seedance-studio/)**

### Option 2: Run locally
```bash
git clone https://github.com/aacopov-debug/seedance-studio.git
cd seedance-studio
# Just open index.html in any browser. No build, no install.
```

### Option 3: Deploy your own copy
This is a static site. Drop the 3 files (`index.html`, `app.js`, `MANUAL.html`) anywhere — GitHub Pages, Netlify, Vercel, your own server.

## 🤖 AI setup (optional)

The base prompt builder works **without any AI**. To unlock Goal Mode, Story Mode, Continuity Checker etc., add an API key in `⚙ AI`:

| Provider | Base URL | Notes |
|---|---|---|
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o-mini` recommended |
| **OpenRouter** | `https://openrouter.ai/api/v1` | Access Claude, Gemini, Llama via one key |
| **Ollama (local)** | `http://localhost:11434/v1` | Free, fully offline |
| **Anthropic** | via OpenRouter | Claude models |

Your key is **encrypted (XOR + base64)** in localStorage and never leaves your browser except to the configured API.

## 📚 Documentation

Full user manual: **[MANUAL.html](MANUAL.html)** (40 pages, printable to PDF via `Ctrl+P`)

## ⌨ Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Command palette | `Ctrl+K` |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` |
| Slash commands in any field | `/random`, `/cyberpunk`, `/anime`, `/score`, `/preview` ... |
| Self-test diagnostics | `Ctrl+K` → `self-test` |

## 🎞 Workflow: idea → finished video

```
   💡 Idea (any language)
        ↓
   🎬 Story Mode  →  expand into 5-10 scenes with consistent hero
        ↓
   🔍 Continuity Checker  →  AI finds wardrobe/time/location breaks
        ↓
   📽 FCPXML export  →  ZIP with timeline + preview placeholders
        ↓
   🎥 DaVinci Resolve  →  import, replace placeholders with real mp4
        ↓
   🎬 Generate clips in Seedance/Runway/Kling using prompts from <note>
        ↓
   ✅ Export final video
```

## 🛠 Tech stack

- Vanilla HTML/CSS/JavaScript — **no framework**, no build step
- TailwindCSS via CDN
- JSZip (lazy-loaded) for archive exports
- Web Speech API for voice input
- ~150KB total, works offline

## 📦 Project structure

```
seedance-studio/
├── index.html       The app (UI + Tailwind config)
├── app.js           All logic (~1800 lines, single file)
├── MANUAL.html      Full user manual (PDF-printable)
├── README.md        This file
└── LICENSE          MIT
```

## 🤝 Contributing

Feedback, bug reports, feature requests welcome via [Issues](https://github.com/aacopov-debug/seedance-studio/issues).

If you build something cool with it — share via Discussions or tag me on social.

## 📄 License

MIT — do whatever, just keep the copyright notice.

## 🙏 Acknowledgments

Built for the AI video community. Inspired by the gap between "I have an idea" and "I have a usable prompt".

---

<div align="center">
<sub>Made with ☕ and a lot of <code>aiCall()</code></sub>
</div>
