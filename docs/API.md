# VoiceMail-Genie REST API Reference

This document describes the backend routing APIs, expected JSON contracts, authentication headers, and standard error outputs. All services are served relative to the root URL `/api/*` on port `3000`.

---

## 1. Authentication & Authorization Headers

Requests targeting writing pipelines, translation engines, or Workspace sync directories must contain appropriate authentication context:

* **Firebase Context (DB Operations):** Standard Firebase User ID token must be provided via the `Authorization` bearer token header:
  ```http
  Authorization: Bearer <firebase_id_token>
  ```
* **Gmail OAuth Scope (Workspace Operations):** Active Google OAuth Access Token (with `gmail.compose` scope) must be provided in synchronization payloads.

---

## 2. API Endpoint Directory

### A. Audio Transcription Pipeline
* **Endpoint:** `POST /api/transcribe`
* **Description:** Receives a raw, Base64-encoded audio payload, and processes it via the Gemini Multimodal Transcription engine.
* **Request Payload (`application/json`):**
  ```json
  {
    "audio": "data:audio/webm;base64,GkXfo69ChoEBQveBAULygQRC84EIQoKEdmF2ZW...",
    "mimeType": "audio/webm"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "text": "Hello Team, we need to schedule the roadmap review meeting for tomorrow morning at 10 AM.",
    "detectedLanguage": "en-US",
    "metrics": {
      "confidence": 0.98,
      "durationSeconds": 14.5
    }
  }
  ```

---

### B. Agentic Email Draft Builder
* **Endpoint:** `POST /api/write`
* **Description:** Analyzes raw transcribed dictations and compiles a formatted, professional email draft including subjects, bodies, and takeaways.
* **Request Payload (`application/json`):**
  ```json
  {
    "rawText": "schedule roadmap review for tomorrow 10 am, tell sarah to bring slides",
    "tone": "Professional",
    "scenario": "Meeting Follow-Up",
    "additionalInstructions": "Mention that pizza will be provided"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "subject": "Roadmap Review Meeting - Tomorrow 10:00 AM",
    "body": "<p>Hi Team,</p><p>Please note we have scheduled our <strong>Roadmap Review Meeting</strong> for tomorrow morning at <strong>10:00 AM</strong>.</p><p>Sarah, please make sure to bring the updated slide deck for the presentation.</p><p><em>Note: Pizza will be provided for all attendees during the session.</em></p><p>Best regards,</p>",
    "keyInfo": [
      "Roadmap Review Meeting scheduled for tomorrow at 10:00 AM",
      "Sarah to bring presentation slide deck"
    ],
    "callToAction": "Sarah: Upload the slide deck to the shared directory by 9:30 AM tomorrow."
  }
  ```

---

### C. Dynamic Translation Engine
* **Endpoint:** `POST /api/translate`
* **Description:** Fluently translates pre-compiled email subject lines and HTML bodies into the target language while retaining existing HTML tags.
* **Request Payload (`application/json`):**
  ```json
  {
    "subject": "Roadmap Review Meeting - Tomorrow 10:00 AM",
    "body": "<p>Hi Team,</p><p>Please note we have scheduled our <strong>Roadmap Review Meeting</strong> for tomorrow morning.</p>",
    "targetLanguage": "Spanish"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "subject": "Reunión de revisión de la hoja de ruta - Mañana 10:00 AM",
    "body": "<p>Hola equipo,</p><p>Tenga en cuenta que hemos programado nuestra <strong>Reunión de revisión de la hoja de ruta</strong> para mañana por la mañana.</p>"
  }
  ```

---

### D. Gmail Draft Synchronization Sync
* **Endpoint:** `POST /api/gmail/draft`
* **Description:** Inserts a fully formatted RFC 822 message body directly into the user's active Gmail Drafts box.
* **Request Payload (`application/json`):**
  ```json
  {
    "accessToken": "ya29.a0AcEsW...",
    "subject": "Roadmap Review Meeting - Tomorrow 10:00 AM",
    "body": "<p>Hi Team,</p><p>Please note we have scheduled our Roadmap Review.</p>"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "draftId": "r-84729103984719283",
    "messageId": "msg-1934c9c8e23924a",
    "syncTime": "2026-07-09T22:35:05-07:00"
  }
  ```

---

### E. Health Diagnostic Check
* **Endpoint:** `GET /api/health`
* **Description:** Returns operational readiness status of database connection pools and container response times.
* **Success Response (`200 OK`):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-07-09T22:35:05-07:00",
    "uptimeSeconds": 1420
  }
  ```
