import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthModal = ({ isOpen, onClose, setUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Firestore-এ ইউজারের একটি পারমানেন্ট প্রোফাইল ডকুমেন্ট তৈরি
  const saveUserToFirestore = async (userObj, extraName = '') => {
    const userRef = doc(db, 'users', userObj.uid);
    const snap = await getDoc(userRef);
    
    // যদি আগে থেকে ইউজার ডাটাবেজে না থাকে, তবে নতুন এন্ট্রি করবে
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: userObj.uid,
        name: extraName || userObj.displayName || 'User',
        email: userObj.email,
        role: 'user',
        createdAt: new Date().toISOString()
      });
    }
  };

  // ইমেইল ও পাসওয়ার্ডের সাহায্যে লগইন / সাইন-আপ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // ১. নতুন অ্যাকাউন্ট তৈরি
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
        // ২. ইউজারের ডিসপ্লে নেম আপডেট
        await updateProfile(res.user, { displayName: name });
        
        // ৩. Firestore ডাটাবেজে সেভ
        await saveUserToFirestore(res.user, name);
        setUser(res.user);
      } else {
        // বিদ্যমান অ্যাকাউন্টে সাইন-ইন
        const res = await signInWithEmailAndPassword(auth, email, password);
        setUser(res.user);
      }
      onClose();
    } catch (err) {
      // Firebase এরর মেসেজ হ্যান্ডলিং
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In পপআপ পদ্ধতি
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(res.user);
      setUser(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold mb-1 text-red-500">
          {isSignUp ? '📝 Create Account' : '🔐 Welcome Back'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {isSignUp ? 'Sign up to register as a donor or post emergency requests.' : 'Login to manage your profile and requests.'}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 text-xs p-2.5 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Rahim Ahmed" 
                required
                className="input input-bordered w-full bg-slate-800 border-slate-700 text-white focus:border-red-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1 block">Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. user@example.com" 
              required
              className="input input-bordered w-full bg-slate-800 border-slate-700 text-white focus:border-red-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1 block">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="input input-bordered w-full bg-slate-800 border-slate-700 text-white focus:border-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn bg-red-600 hover:bg-red-700 text-white border-none w-full font-bold mt-2"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
          </button>
        </form>

        <div className="divider text-xs text-slate-500 my-4">OR</div>

        <button 
          onClick={handleGoogleSignIn}
          type="button"
          className="btn bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 w-full font-bold flex items-center justify-center gap-2"
        >
          🌐 Continue with Google
        </button>

        <p className="text-xs text-slate-400 text-center mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
            className="text-red-400 underline font-bold"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;