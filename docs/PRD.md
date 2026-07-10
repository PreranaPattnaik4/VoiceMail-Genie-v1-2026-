# Product Requirements Document (PRD): VoiceMail-Genie v1

## 1. Product Vision & Overview
VoiceMail-Genie v1 is a high-performance, full-stack AI-driven productivity application designed to convert spoken voice memos into polished, professional email drafts. By combining real-time web audio recording, Google Gemini AI, and secure Firebase/Google Workspace authentication, the application solves the friction of drafting emails while on the move, allowing users to talk naturally and receive instantly structured, formatted, and contextual email drafts.

---

## 2. Core Target Audience & Use Cases
* **Busy Professionals:** Dictate rapid meeting minutes, client updates, or follow-ups while on the go.
* **Multilingual Users:** Record voice memos in their native tongue and translate them seamlessly into clean business English or other target languages.
* **Content Creators & Executives:** Brainstorm draft concepts verbally and have them automatically categorized, summarized, and drafted into professional email structures.

---

## 3. Detailed Functional Modules

### A. Dynamic Audio Capture & Upload Hub
* **Real-time Web Audio Recording:** High-fidelity web media stream recording with instant duration tracking and pause/resume states.
* **Visual Waveform Feedback:** Dynamic CSS and SVG-driven visual activity indicator representing the active recording state.
* **Flexible File Drag-and-Drop:** Native browser dropzone allowing manual selection or drag-and-drop uploads of pre-recorded audio files (MP3, WAV, M4A, WEBM) up to `50MB`.

### B. Intelligent AI Pipeline (Powered by Gemini 3.5 Flash)
* **Multimodal Transcription:** Direct translation of spoken base64 audio data into plain text. Auto-detects dialects and input language.
* **Agentic Writing Assistant:** Parses raw transcriptions to identify core intent, key action items, and structural takeaways. Combines this with:
  * **Tone Adjustments:** Interactive presets (Professional, Direct, Warm, Persuasive, Casual).
  * **Custom Presets/Scenarios:** Meeting follow-ups, project updates, quick pitches, and formal requests.
* **Secure Server-side Integration:** Proxies all LLM processing through `/api/*` endpoints to ensure the `GEMINI_API_KEY` is never exposed in client bundles.

### C. Workspace & Sync Integrations
* **Federated Google Sign-In:** Direct user authentication managed securely via Firebase Client SDK.
* **Gmail Workspace Compose Sync:** Seamless OAuth connection requiring the narrowest secure compose scope (`https://www.googleapis.com/auth/gmail.compose`).
* **Direct Draft Creation:** Compiles styled HTML emails using base64url encoding and registers them directly as live Drafts within the user's real Gmail mailbox.
* **Bypass Sandbox Demo Mode:** Enables instant client-side sandbox mode with mocked/simulated endpoints for immediate testing and verification without full Google Workspace scopes.

---

## 4. Zero-Exposure GitHub Export Security Scheme

To protect user environments and prevent credential leaks during exports (e.g., when the project is exported as a ZIP, imported into a clean environment, or pushed to a public GitHub repository), the application implements a multi-layer security configuration:

```
                  ┌───────────────────────────────┐
                  │  firebase-applet-config.json  │  (Contains private Firebase API keys)
                  └───────────────┬───────────────┘
                                  │
                       [EXCLUDED from git/export]
                       (Listed in .gitignore)
                                  │
                                  ▼
┌─────────────────────────────────┴─────────────────────────────────┐
│                          VITE BUILD TIME                          │
│                                                                   │
│  - vite.config.ts reads file if present locally                   │
│  - Injects config object dynamically as __FIREBASE_CONFIG__        │
│  - Fallback: reads public VITE_FIREBASE_* env variables if empty │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────┴─────────────────────────────────┐
│                          CLIENT RUNTIME                           │
│                                                                   │
│  - firebase-auth.ts checks for compile-time __FIREBASE_CONFIG__   │
│  - Uses injected object or loads custom VITE_FIREBASE_* variables  │
└───────────────────────────────────────────────────────────────────┘
```

### A. Environment Separation (Client vs. Server)
* All LLM transactions are kept strictly on the backend Express layer (`server.ts`).
* The `GEMINI_API_KEY` remains a server-side environment secret and is **never** prefixed with `VITE_` or exposed to browser bundles.

### B. Git & Repository Protection
* **Exclusion List (`.gitignore`):** The default file `firebase-applet-config.json` is explicitly gitignored. This prevents the file containing the user's actual Firebase configuration from ever being accidentally checked into source control or exported to public repositories.
* **Build-Time Config Loader (`vite.config.ts`):** Dynamically attempts to read `firebase-applet-config.json` at compile-time. If it exists (during local or development builds in AI Studio), it stringifies and injects it into the client application under the global constant variable `__FIREBASE_CONFIG__`.
* **Flexible Runtime Decoupling (`src/firebase-auth.ts`):** 
  ```typescript
  const firebaseConfig = typeof __FIREBASE_CONFIG__ !== 'undefined' && __FIREBASE_CONFIG__ && Object.keys(__FIREBASE_CONFIG__).length > 0
    ? {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || __FIREBASE_CONFIG__.apiKey || "",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || __FIREBASE_CONFIG__.authDomain || "",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || __FIREBASE_CONFIG__.projectId || "",
        ...
      }
    : defaultFirebaseConfig;
  ```
  This design ensures that if the project is exported or cloned to GitHub without `firebase-applet-config.json`, the app will fail-safe, gracefully allowing developers to supply standard client-side environment variables (`VITE_FIREBASE_API_KEY`, etc.) inside a local `.env` file instead.

---

## 5. Non-Functional & UI Design Requirements
* **Bento Grid Framework:** Segmented modules inside a responsive visual container, maximizing screen density while preserving negative space.
* **Visual Theme:** Deep-indigo accents paired with high-contrast slate borders, modern typography ("Space Grotesk" for displays, "Inter" for body text, "JetBrains Mono" for diagnostics), and eye-safe twilight backgrounds.
* **High Accessibility:** Clear contrast ratios for error flags, visual icons, loading indicators, and informational banners.
