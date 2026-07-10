# VoiceMail-Genie Technical Stack & Architecture Report

VoiceMail-Genie is a state-of-the-art, full-stack application designed to capture voice dictation, perform real-time AI-powered multilingual transcription, reconstruct transcription content to identify business intent, and draft structured HTML communications that can be directly committed to a user's real Gmail account.

---

## 1. System Architecture Overview
The system is built on a **Full-Stack (Client-Server) Architecture** designed to isolate the frontend from sensitive APIs. This separates browser actions (UI interaction, file uploads, media recording, and user session state) from server actions (AI models, prompt engineering, file streaming, and credential security).

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                              │
│  React 19 / Tailwind v4 / Motion / Firebase Auth / Web Media Stream   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         REST API (JSON / HTTPS)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                            SERVER (Express)                            │
│  NodeJS ESM / esbuild / dotenv / @google/genai SDK                    │
└──────────┬──────────────────────────────────────────────────┬──────────┘
           │                                                  │
   Google Gemini API                                     Gmail API
┌──────────▼──────────┐                             ┌─────────▼──────────┐
│  gemini-3.5-flash   │                             │  Gmail Drafts SDK  │
│  Transcribe, Write  │                             │  compose/inject    │
└─────────────────────┘                             └────────────────────┘
```

---

## 2. Core Technology Stack

### A. Frontend Tier (Single Page Application)
* **Framework:** `React 19` using functional component design, standard hooks (`useState`, `useEffect`, `useRef`), and local states.
* **Styling Engine:** `Tailwind CSS v4` providing utility-first responsive sizing, fluid flex layouts, and custom theme overrides.
* **Animations:** `motion/react` driving micro-interactions, modal fade-ins, loading spinner transitions, and visual wave pulse effects.
* **Typography:**
  * **Display Font:** `Space Grotesk` (clean, contemporary sans-serif for headers)
  * **Primary Body Font:** `Inter` (optimal legibility across all screen sizes)
  * **Mono-spacing Font:** `JetBrains Mono` (used for digital clock overlays, recording timers, and transcription accuracy statistics)

### B. Backend Tier (API Gateway & Asset Host)
* **API Framework:** `Express 4` managing file streaming payloads up to `50MB` for long-duration memo uploads.
* **Compiler & Bundler:** `TypeScript 5` compiled to a standalone CommonJS bundle (`dist/server.cjs`) via `esbuild`. This encapsulates Node's runtime paths and removes the filesystem performance penalty during container startup.
* **Environment Management:** `dotenv` loading secure server-side variables directly on the Node runtime.

---

## 3. Security-First Credentials & Git Export Protection

To ensure the application can be safely shared, deployed to public staging targets, or exported directly to GitHub, a specialized **Zero-Exposure Credential Scheme** has been integrated into the build-pipeline:

### A. Non-Leaking Git Configuration
* **Gitignore Directives (`.gitignore`):** The file `/firebase-applet-config.json` (which contains private Firebase configuration objects such as API keys and Project IDs) is strictly excluded from version control.
* **Server-Key Isolation (`.env.example`):** The `GEMINI_API_KEY` is maintained as a server-side runtime variable. It is **never** shared with the client-side bundle or prefixed with `VITE_`.

### B. Dynamic Build-Time Compilation (`vite.config.ts`)
The Vite build process is modified to scan the build environment for configuration assets at compile time:
1. If `/firebase-applet-config.json` exists locally, Vite reads the file and stringifies it into a global constant variable definition `__FIREBASE_CONFIG__`.
2. If the file does not exist (e.g., when cloned from GitHub), it defaults to an empty object, preventing compilation crashes and ensuring clean building.

### C. Graceful Fallback Engine (`src/firebase-auth.ts`)
The Firebase authentication layer has been decoupled to dynamically resolve credentials:
* **Primary Source:** Checks the global compile-time constant `__FIREBASE_CONFIG__` first.
* **Secondary Source:** If no build-time variable was injected, it resolves config values from standard client-side environment variables prefixed with `VITE_` (e.g., `import.meta.env.VITE_FIREBASE_API_KEY`).
* This enables developers to run the code in local or external environments without the proprietary configuration file by simply populating a local `.env` file with their own keys.

---

## 4. Artificial Intelligence & Prompt Pipelines

All translation, transcription, formatting, and categorizing workloads run on the server using **Google Gemini 3.5 Flash** (`gemini-3.5-flash`) via the `@google/genai` (v2.4.0) SDK. AI tasks use structured JSON outputs for predictable and robust data serialization:

| Pipeline Stage | Model | Input Data Type | Output Structure | Core Action |
|---|---|---|---|---|
| **Transcription Engine** | `gemini-3.5-flash` | Multimodal Base64 Audio (`audio/webm`) | `{ text, detectedLanguage }` | Decodes spoken language and transcribes voice memo inputs. |
| **Agentic Email Writer** | `gemini-3.5-flash` | Plain text raw memo + Preset Moods/Scenarios | `{ subject, body, intent, keyInfo, callToAction }` | Crafts a fully formatted HTML email with clear structural components. |
| **Dynamic Translator** | `gemini-3.5-flash` | Formatted HTML blocks | `{ subject, body }` | Fluently translates text blocks while preserving HTML nodes (`<p>`, `<strong>`). |

---

## 5. UI Features & Layout Design

The client panel utilizes a custom **Bento Grid** layout, partitioning complex tasks into distinct, visual components:
1. **Dynamic Audio Hub:** Real-time visual media recording, waveform state loops, elapsed timer, and drag-and-drop support.
2. **Preset Scenario Selector:** Quick template pre-configurations (Meeting notes, project pitch, informal chat).
3. **Draft Composer Pane:** A robust Markdown/HTML interactive editor allowing manual polish, live character analysis, and translation triggers.
4. **Efficiency Metrics Panel:** High-contrast display presenting calculated analytics (Time Saved, Transcription Accuracy, Intent Mapping, Language Code).
5. **Secure Authentication Gate:** Clean sign-in and account creation forms supporting both traditional password/email workflows (with safe `operation-not-allowed` exception handling), Google Sign-In, and instant bypass simulation sandbox gates.
