import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile,
  sendPasswordResetEmail, onAuthStateChanged, getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

export const registerWithEmail = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserDocument(cred.user, { displayName });
  return cred.user;
};

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = async (mode = 'login') => {
  const cred = await signInWithPopup(auth, googleProvider);
  const additional = getAdditionalUserInfo(cred);

  // If in login mode but the user is completely new (just created by Google)
  if (mode === 'login' && additional?.isNewUser) {
    await cred.user.delete();
    await signOut(auth);
    const error = new Error('Not registered');
    error.code = 'auth/not-registered';
    throw error;
  }

  // Ensure document exists
  await createUserDocument(cred.user);
  return cred.user;
};

export const logout = () => (auth ? signOut(auth) : Promise.resolve());

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const onAuthChange = (callback) => {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
};

export const createUserDocument = async (user, extraData = {}) => {
  if (!db || !user) return;
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName || extraData.displayName || '',
      photoURL:    user.photoURL    || '',
      role:        'customer',
      createdAt:   serverTimestamp(),
      ...extraData,
    });
  }
};

export const getUserDoc = async (uid) => {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Real-time listener — role changes in Firebase console appear instantly
export const subscribeUserDoc = (uid, callback) => {
  if (!db) { callback(null); return () => {}; }
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    ()     => callback(null),
  );
};
