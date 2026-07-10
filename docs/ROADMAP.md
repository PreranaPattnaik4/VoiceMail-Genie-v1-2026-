# VoiceMail-Genie Product Roadmap

This document outlines the strategic milestones and features scheduled for upcoming releases of **VoiceMail-Genie**.

---

## 📅 Roadmap Overview

```
   Q3 2026                 Q4 2026                 Q1 2027                 Q2 2027
   [ v1.0 - Core FullStack] ───► [ v1.1 - Local Core ] ───► [ v2.0 - Biometric Auth ] ───► [ v3.0 - Enterprise Sync]
   - Web Voice Recording       - Local Web Assembly     - Voice Biometrics Auth     - CRM Pipeline Integrations
   - Gemini 3.5 Pipeline       - Dynamic Waveforms      - Multi-User Workspaces     - Team Workspace Templates
   - Gmail Sync & Sandbox      - Advanced File Formats  - Offline Audio Buffers     - Custom Fine-tuned Models
```

---

## 📌 Release Milestones

### Milestone 1: VoiceMail-Genie v1.0 — Core Foundation (Current Release)
* **Goal:** Launch high-performance browser capturing, reliable server-side Gemini 3.5 integration, and secure sandbox-fallback controls.
* **Key Features:**
  * Real-time Media Stream capturing with duration limits.
  * base64 direct stream transcription using Gemini 3.5 Flash.
  * Preset scenario modifiers (Meeting, pitch, casualty).
  * Instant bypass sandbox to let users test features before connecting Google Workspace accounts.
  * Complete client-key shielding with build-time variable configuration.

---

### Milestone 2: VoiceMail-Genie v1.1 — Polish & Local Performance (Target: Q4 2026)
* **Goal:** Increase processing efficiency, expand allowable file limits, and build rich local diagnostics.
* **Key Features:**
  * **WASM Voice Compression:** Compresses audio client-side using `ffmpeg.wasm` before upload, reducing network transfer times by up to 75%.
  * **Interactive Waveform Editor:** Enables trimming, cutting, and stitching audio files directly on the timeline.
  * **Batch Transcription:** Upload multiple audio recordings simultaneously and process them in parallel queues.
  * **Advanced Export Profiles:** Export compiled drafts as PDF, Markdown files, or MS Word documents (`.docx`).

---

### Milestone 3: VoiceMail-Genie v2.0 — Multi-user & Voice Security (Target: Q1 2027)
* **Goal:** Introduce personalized workspace environments, team-level collaborations, and custom speech pattern fine-tuning.
* **Key Features:**
  * **Voice Biometric Sign-in:** Verify user identities using distinct, encrypted voiceprint analysis signatures.
  * **Custom Dictionary Training:** Teach Gemini specialized jargon, unique project names, and team usernames to improve transcription precision.
  * **Offline Queueing:** Record and queue up to 10 dictations locally when network connection is severed. Sync and process them automatically once connection is restored.
  * **Workspace Templates:** Share tone modifiers, signature templates, and custom writing directives across whole professional teams.

---

### Milestone 4: VoiceMail-Genie v3.0 — Platform Extensions & Integrations (Target: Q2 2027)
* **Goal:** Seamlessly integrate with corporate tools and enter mobile application ecosystems.
* **Key Features:**
  * **Enterprise Integrations:** Push drafts directly into HubSpot, Salesforce, Notion, Jira, or Slack in one click.
  * **VoiceMail-Genie Mobile Apps:** Launch native iOS and Android companion applications featuring lock-screen recording widgets.
  * **AI Voice Replication:** Auto-generate styled, natural-sounding audio reads of generated emails for accessibility review.
