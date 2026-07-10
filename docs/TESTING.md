# VoiceMail-Genie Testing & Verification Protocols

This document details the strategies and verification processes required to validate, test, and debug **VoiceMail-Genie v1**.

---

## 1. Core Testing Methodology

The testing matrix spans across three layers:

```
┌──────────────────────────────────────────────────────────────┐
│                  MANUAL COMPLIANCE CHECKLIST                 │
│  Mic permission loops, Waveforms, Tone switches, Sandbox logic│
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    INTEGRATION VERIFICATIONS                 │
│  API Gateway, base64 payload checks, Firebase Session, Gemini │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  PIPELINE BUILD VALIDATIONS                  │
│  tsc Type checks, linter routines, production esbuild Bundles │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Structural Build Checks (CI/CD)

Before pushing any changes or preparing a deployable artifact, execute the standard workspace diagnostic routines:

### A. Static Type Verification & Lint Checks
Verifies TypeScript structures, detects unused or stale imports, and identifies code smell:
```bash
npm run lint
```

### B. Bundler Verification
Compiles both backend Express TS files and client-side assets to ensure the complete application builds cleanly:
```bash
npm run build
```

---

## 3. Manual Verification Checklist

Follow these steps to manually test core application modules:

### A. Dynamic Audio Capture Validation
1. **Permission Isolation:** Revoke microphone permissions in browser settings. Refresh the app and verify the UI displays a clear, elegant notice asking for permissions.
2. **Device Connection:** Grant permissions. Click the recording action. Confirm the visual waveforms animate dynamically and the elapsed time increments on-screen.
3. **Limit Protection:** Record past `10:00` minutes. Ensure the capture loop automatically halts and triggers the transcription flow safely.

### B. Drag-and-Drop Formats
1. **Valid Uploads:** Drag-and-drop a `5MB MP3` file onto the upload card. Ensure the UI registers the file size and triggers processing.
2. **Size Overloads:** Attempt to upload a `65MB WAV` file. Verify the application blocks the transfer and highlights a clear `File size exceeds 50MB limit` visual error.

### C. Agentic Writing & Presets
1. **Scenario Switches:** Enter transcription raw text, select **Meeting Follow-up**, set tone to **Direct**, and click **Write Draft**. Verify the generated subject line and body correspond to business follow-ups.
2. **Translation Verification:** Open the language dropdown inside the composer. Select **Spanish**. Confirm the text blocks are translated instantly while maintaining all custom HTML formatting tags (`<p>`, `<strong>`).

### D. Secure Sandbox Gate
1. **Auth Bypass:** Click **Try Sandbox/Demo Mode** on the login page.
2. **Offline Actions:** Ensure all components are rendered and that transcription/generation requests function flawlessly via mock/simulation buffers, bypassing the need for immediate Google API authentications.

---

## 4. Debugging & Error Handling Matrix

| Symptom | Root Cause | Action / Resolution |
|---|---|---|
| `auth/operation-not-allowed` on email login | Email/Password provider disabled in Firebase Console. | Navigate to Firebase Console -> Build -> Authentication -> Sign-in Method. Enable the "Email/Password" provider. |
| `vite: not found` on build | Environment node modules folder is missing or corrupted. | Run `npm install` to clear local cache and re-populate the directories. |
| Broken image assets | Missing `referrerPolicy` declaration on external URLs. | Ensure all `<img>` tags declare `referrerPolicy="no-referrer"` explicitly. |
| `Target content not found` on edits | Stale workspace context during incremental agent modifications. | Perform a full `view_file` fetch on the file before editing to synchronize lines. |
| Google Workspace draft fail | Scope credentials expired or unauthorized. | Disconnect from Gmail portal, reconnect, and authorize the requested `gmail.compose` scope. |
