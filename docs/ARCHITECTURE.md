# VoiceMail-Genie System Architecture & Topology

This document details the software design patterns, server layout, file architecture, and build-time credential flows powering **VoiceMail-Genie v1**.

---

## 1. System Topology & Physical Architecture

The application is engineered as a secure, full-stack application operating in isolated Cloud Run container environments. 

```
                                  +----------------------+
                                  |   PUBLIC INTERNET    |
                                  +──────────┬───────────+
                                             │
                                             ▼ (HTTPS / Port 443)
                            +────────────────────────────────+
                            │  NGINX Reverse Proxy Layer     │
                            │  - Exposes Port 3000 externally│
                            │  - Routes inbound API/assets   │
                            +────────────────┬───────────────+
                                             │
                                             ▼ (Port 3000 Local Loop)
                            +────────────────────────────────+
                            │   Cloud Run Container Runtime  │
                            │                                │
                            │  +──────────────────────────+  │
                            │  │  Express API (Node.js)   │  │
                            │  │  - Serving /api/* routes │  │
                            │  │  - Serves compiled static│  │
                            │  │    assets from /dist     │  │
                            │  +─────────────┬────────────+  │
                            +────────────────┼───────────────+
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼ (Secure Server SDK)                       ▼ (Client-Side SDK)
            +────────────────────+                       +────────────────────+
            │ GOOGLE GEMINI API  │                       │ FIREBASE AUTH / DB │
            │ (gemini-3.5-flash) │                       │ (Client SDK)       │
            +────────────────────+                       +────────────────────+
                       │                                           │
                       ▼                                           ▼
            [ AI Transcription / Writes ]                [ User Account State ]
```

---

## 2. Directory Structure Blueprint

The workspace is modularly structured, isolating build tools, static resources, database blueprints, and backend proxy environments:

```
├── .env.example                      # Template documenting necessary runtime secrets
├── .gitignore                        # Git target filters (excluding configs & credentials)
├── README.md                         # Project introductory reference and boot guide
├── server.ts                         # Main Express API entrypoint & Vite middleware mount
├── tsconfig.json                     # TypeScript compiler configuration directives
├── vite.config.ts                    # Build-time bundler configurations & config injector
├── docs/                             # Dedicated documentation repository
│   ├── PRD.md                        # Product Requirements Document
│   ├── REPORT.md                     # Technical Stack & Core Flow Report
│   ├── ARCHITECTURE.md               # [THIS FILE] System Architecture & Directory Blueprint
│   ├── API.md                        # REST API endpoint structures & schemas
│   ├── ROADMAP.md                    # Strategic feature release schedule
│   ├── TESTING.md                    # Verification routines & testing suite references
│   ├── diagrams/                     # High-resolution architectural diagram assets
│   │   ├── system-architecture.png   
│   │   ├── workflow.png              
│   │   ├── sequence-diagram.png      
│   │   ├── use-case.png              
│   │   └── data-flow.png             
│   └── screenshots/                  # User Interface mockups and views
└── src/                              # Frontend React Source Directory
    ├── App.tsx                       # Core React component (state router & Bento layout)
    ├── main.tsx                      # DOM compiler anchor and rendering engine
    ├── index.css                     # Global Tailwind v4 directive index & Custom font loads
    ├── types.ts                      # Shared TypeScript interface and enum declarations
    ├── firebase-auth.ts              # Firebase client SDK initialization & auth helpers
    └── components/                   # Extracted UI blocks and visual panels
```

---

## 3. Zero-Exposure Security Scheme

A key architectural mandate is preventing accidental exposure of private Firebase client certificates and Gemini system API keys to public repositories or exported bundles.

### A. The Build-Time Configuration Ingestion Pipeline

1. **Gitignore Filter:** `/firebase-applet-config.json` is listed in the local `.gitignore` ruleset, preventing the physical file from being pushed to GitHub or exported inside ZIPs.
2. **Vite Loader:** During `npm run build` or `npm run dev`, `vite.config.ts` attempts to load this configuration at compile-time:
   ```typescript
   let firebaseConfig = {};
   try {
     const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
     if (fs.existsSync(configPath)) {
       firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
     }
   } catch (error) {
     console.warn('Failed to load config at build-time:', error);
   }
   ```
3. **Compile Ingestion:** The loaded object is injected directly into the compiled client bundle under the global definition variable `__FIREBASE_CONFIG__`.
4. **Decoupled Resolution:** In `src/firebase-auth.ts`, the application dynamically assesses compile definitions and safely falls back to standard public `VITE_FIREBASE_*` environment variables if the config file is absent.

### B. Gemini API Isolation
* **Server-Only Binding:** The `GEMINI_API_KEY` is never compiled into client-side code, nor is it ever prefixed with `VITE_`.
* **REST Proxy Gateway:** The React frontend never queries Gemini directly. It submits request streams to backend `/api/transcribe` and `/api/write` endpoints, keeping keys securely encapsulated inside the runtime environment.
