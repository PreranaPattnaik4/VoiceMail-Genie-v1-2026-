/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

declare global {
  const __FIREBASE_CONFIG__: any;
}

const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const firebaseConfig = typeof __FIREBASE_CONFIG__ !== 'undefined' && __FIREBASE_CONFIG__ && Object.keys(__FIREBASE_CONFIG__).length > 0
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || __FIREBASE_CONFIG__.apiKey || "",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || __FIREBASE_CONFIG__.authDomain || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || __FIREBASE_CONFIG__.projectId || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || __FIREBASE_CONFIG__.storageBucket || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || __FIREBASE_CONFIG__.messagingSenderId || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || __FIREBASE_CONFIG__.appId || "",
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || __FIREBASE_CONFIG__.measurementId || ""
    }
  : defaultFirebaseConfig;

let app: any = null;
let auth: any = null;
let db: any = null;

try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "") {
    throw new Error("No API key provided. Firebase must be set up or configured in .env.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase failed to initialize gracefully. Falling back to mock references for Sandbox Mode support.", error);
  app = null;
  auth = new Proxy({}, {
    get(target, prop) {
      if (prop === 'currentUser') {
        return null;
      }
      if (prop === 'signOut') {
        return () => Promise.resolve();
      }
      return (...args: any[]) => {
        console.warn(`Firebase Auth operation '${String(prop)}' called but Firebase is not initialized.`);
        throw new Error("Firebase Authentication is not initialized. Please connect Firebase or use Sandbox Mode.");
      };
    }
  }) as any;
  db = new Proxy({}, {
    get(target, prop) {
      return (...args: any[]) => {
        throw new Error("Firestore is not initialized. Please connect Firebase or use Sandbox Mode.");
      };
    }
  }) as any;
}

export { app, auth, db };

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.setCustomParameters({
  prompt: 'select_account consent'
});

let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('gmail_access_token') : null;

// Helper to determine if token is expired (using 1 hour standard lifetime)
export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (localStorage.getItem('is_sandbox_mode') === 'true') return false;
  const token = localStorage.getItem('gmail_access_token');
  if (!token) return true;
  const expiresAt = localStorage.getItem('gmail_access_token_expires_at');
  if (!expiresAt) return true;
  // Return true if current time is past or within 30 seconds of expiration
  return Date.now() >= (parseInt(expiresAt, 10) - 30 * 1000);
};

// Helper to check token status
export interface TokenStatus {
  status: 'connected' | 'expired' | 'disconnected';
  message: string;
}

export const getTokenStatus = (): TokenStatus => {
  if (typeof window === 'undefined') {
    return { status: 'disconnected', message: 'Gmail disconnected' };
  }
  if (localStorage.getItem('is_sandbox_mode') === 'true') {
    return { status: 'connected', message: 'Gmail connected (Sandbox Mode)' };
  }
  const token = localStorage.getItem('gmail_access_token');
  if (!token) {
    return { status: 'disconnected', message: 'Gmail disconnected' };
  }
  if (isTokenExpired()) {
    return { status: 'expired', message: 'Authentication expired' };
  }
  return { status: 'connected', message: 'Gmail connected successfully' };
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (status: 'disconnected' | 'expired', user?: User) => void
) => {
  if (typeof window !== 'undefined' && localStorage.getItem('is_sandbox_mode') === 'true') {
    const sandboxUser = {
      uid: "sandbox-user",
      displayName: "Sandbox Explorer",
      email: "sandbox.user@gmail.com",
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=sandbox"
    } as any;
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess(sandboxUser, "sandbox_token");
    }, 50);
  }

  if (!app) {
    if (typeof window !== 'undefined' && localStorage.getItem('is_sandbox_mode') !== 'true') {
      setTimeout(() => {
        if (onAuthFailure) onAuthFailure('disconnected');
      }, 50);
    }
    return () => {};
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (typeof window !== 'undefined' && localStorage.getItem('is_sandbox_mode') === 'true') {
      return; // Handled by sandbox bypass
    }
    if (user) {
      const token = localStorage.getItem('gmail_access_token');
      if (token && !isTokenExpired()) {
        cachedAccessToken = token;
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else if (token && isTokenExpired()) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure('expired', user);
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure('disconnected', user);
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gmail_access_token');
        localStorage.removeItem('gmail_access_token_expires_at');
      }
      if (onAuthFailure) onAuthFailure('disconnected');
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!app) {
    throw new Error("Firebase is not initialized. Please connect your Firebase project or use 'Instant Sandbox Bypass'.");
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gmail_access_token', cachedAccessToken);
      // Store expiry (typically 3600 seconds, so let's set it to 1 hour from now)
      const expiresAt = Date.now() + 3600 * 1000;
      localStorage.setItem('gmail_access_token_expires_at', expiresAt.toString());
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (isTokenExpired()) {
    return null;
  }
  return cachedAccessToken || (typeof window !== 'undefined' ? localStorage.getItem('gmail_access_token') : null);
};

export const enterSandboxMode = (): { user: User; accessToken: string } => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('is_sandbox_mode', 'true');
    localStorage.setItem('gmail_access_token', 'sandbox_token');
    localStorage.setItem('gmail_access_token_expires_at', (Date.now() + 3600 * 1000).toString());
  }
  const sandboxUser = {
    uid: "sandbox-user",
    displayName: "Sandbox Explorer",
    email: "sandbox.user@gmail.com",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=sandbox"
  } as any;
  cachedAccessToken = "sandbox_token";
  return { user: sandboxUser, accessToken: "sandbox_token" };
};

export const logout = async () => {
  if (app) {
    await auth.signOut().catch(() => {});
  }
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_access_token_expires_at');
    localStorage.removeItem('is_sandbox_mode');
  }
};

// --- NEW Email/Password Authentication & Firestore Profile Creation ---

/**
 * Register a user with Email/Password, sets their display name, and stores user details in Firestore.
 */
export const signUpWithEmailPassword = async (name: string, email: string, password: string): Promise<User> => {
  if (!app) {
    throw new Error("Firebase is not initialized. Please connect your Firebase project or use 'Instant Sandbox Bypass'.");
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Set the Firebase auth display name
  await updateProfile(user, { displayName: name });

  try {
    // Store user document in Firestore users collection
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      name,
      email,
      uid: user.uid,
      createdAt: new Date().toISOString()
    });
  } catch (firestoreError) {
    console.error("Failed to store user profile in Firestore:", firestoreError);
    // Do not throw so registration completes if Firestore rules or connectivity fails
  }

  return user;
};

/**
 * Log in a user with Email/Password and apply desired session persistence.
 */
export const loginWithEmailPassword = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
  if (!app) {
    throw new Error("Firebase is not initialized. Please connect your Firebase project or use 'Instant Sandbox Bypass'.");
  }
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Send a password reset email via Firebase.
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!app) {
    throw new Error("Firebase is not initialized. Please connect your Firebase project or use 'Instant Sandbox Bypass'.");
  }
  await sendPasswordResetEmail(auth, email);
};

