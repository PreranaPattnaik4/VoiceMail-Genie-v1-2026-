# VoiceMail-Genie v1

VoiceMail-Genie v1 is a full-stack, AI-driven productivity dashboard that converts spoken voice memos into structured, professionally-crafted email drafts. By orchestrating the modern Google Gemini 3.5 Flash model, Firebase Authentication, and Google Workspace integrations, the application transcribes, categorizes, translates, and formats voice inputs into pristine emails, synchronizing them directly to your Gmail Drafts.

---

## 🚀 Key Features

* **Real-time Web Voice Capturing:** Record high-fidelity voice memos with real-time waveform visual feedback and duration tracking.
* **Flexible Audio Upload:** Support drag-and-drop or manual selection of existing audio files (`MP3`, `WAV`, `M4A`, `WEBM`) up to `50MB`.
* **Gemini 3.5 Flash Pipeline:** High-speed multilingual transcription, structural analysis, and intent mapping.
* **Smart Composer & Translator:** Automatically format dictation into clear, professional HTML email structures (Subject, Greeting, Action Items, Call To Action) with dynamic tone modifiers and one-click target translations.
* **Secure Gmail Syncing:** Authenticate via secure OAuth scopes and compile RFC 822 standard email streams directly to your Gmail drafts directory.
* **Instant Sandbox Mode:** Instant offline-friendly bypass that allows developers to explore and experience simulated features without requiring Google Cloud API permissions.

---

## 🔒 Zero-Exposure GitHub Security Architecture

To prevent accidental credentials and private API key leaks when pushing to public GitHub repositories or sharing ZIP exports:

1. **Excluded Firebase Configuration:** The client-side configuration file `firebase-applet-config.json` containing sensitive keys is ignored in `.gitignore`.
2. **Dynamic Build-Time Injection:** At compile time, `vite.config.ts` checks for the presence of the configuration file and injects it as a global compile constant (`__FIREBASE_CONFIG__`). If the file is missing, compilation continues gracefully without crashing.
3. **Flexible Runtime Fallback:** `src/firebase-auth.ts` automatically falls back to reading standard client-side environment variables (`VITE_FIREBASE_*`) if no build-time configuration was injected.
4. **Server-Side API Key Hiding:** The `GEMINI_API_KEY` is maintained entirely on the server runtime (`server.ts`) and is **never** compiled into the client bundle or exposed to browser inspector tools.

---

## 💻 Getting Started (Local Development)

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes pre-bundled with Node)

### 1. Installation
Clone your repository or extract the ZIP file, navigate to the project directory, and install dependencies:
```bash
npm install
```

### 2. Environment Variables Configuration
Create a local `.env` file in the root of your directory by copying `.env.example`:
```bash
cp .env.example .env
```
Fill in the configuration parameters inside the `.env` file:
```env
# Server-side Secret (Mandatory)
GEMINI_API_KEY=your_gemini_api_key_here

# Client-side Firebase Keys (Optional fallback if firebase-applet-config.json is absent)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📦 Production Builds

Compile the full-stack application for production:
```bash
npm run build
```
This builds your client static files in `dist/` and bundles the Express backend server into a single optimized file (`dist/server.cjs`).

Start the production server:
```bash
npm start
```
The server will boot and serve the client assets and API gateway on port `3000`.
