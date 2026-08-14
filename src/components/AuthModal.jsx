import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

const AuthModal = ({ isOpen, onClose, setUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  if (!isOpen) return null;

  // Google Sign-In Handler (Google accounts are automatically verified)
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error("Firebase Auth is not configured properly.");
      }
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;

      if (db && loggedUser) {
        const userRef = doc(db, "users", loggedUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: loggedUser.uid,
            displayName: loggedUser.displayName || 'Emergency Donor',
            email: loggedUser.email,
            photoURL: loggedUser.photoURL || '',
            lastDonatedDate: '',
            isVerified: true,
            createdAt: new Date().toISOString()
          });
        }
      }

      if (setUser) setUser(loggedUser);
      onClose();
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Submit Handler
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // ১. নতুন ইউজার তৈরি
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });

        // ২. ফায়ারবেস থেকে ভেরিফিকেশন মেইল পাঠানো
        await sendEmailVerification(res.user);

        // ৩. Firestore ডাটাবেজে রেকর্ড সেভ
        if (db && res.user) {
          await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            displayName: name,
            email: email,
            photoURL: '',
            lastDonatedDate: '',
            isVerified: false,
            createdAt: new Date().toISOString()
          });
        }

        // ভেরিফিকেশন সেন্ট স্ক্রিনে নিয়ে যাওয়া
        setVerificationSent(true);

      } else {
        // লগইন করার সময় চেক করা যে ইমেইল ভেরিফাইড কিনা
        const res = await signInWithEmailAndPassword(auth, email, password);
        
        if (!res.user.emailVerified) {
          await signOut(auth);
          setError("⚠️ Your email is not verified yet! Please check your inbox and verify before logging in.");
          return;
        }

        if (setUser) setUser(res.user);
        onClose();
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  // ভেরিফিকেশন মেইল পুনরায় পাঠানোর হ্যান্ডলার (Resend Verification)
  const handleResendEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setResendCooldown(true);
        alert("📩 Verification email resent! Please check your Inbox / Spam folder.");
        setTimeout(() => setResendCooldown(false), 30000); // 30 sec cooldown
      } catch (err) {
        alert("Failed to resend email: " + err.message);
      }
    }
  };

  // ভেরিফিকেশন চেক হ্যান্ডলার (User clicks after clicking email link)
  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          alert("🎉 Email verified successfully! You are now logged in.");
          if (setUser) setUser(auth.currentUser);
          onClose();
        } else {
          setError("Email is still not verified. Please click the link sent to your inbox first.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      
      {/* Main Container */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-white overflow-hidden">
        
        {/* Glow Accents */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-20"
        >
          ✕
        </button>

        {/* -------------------- স্ক্রিন ১: ইমেইল ভেরিফিকেশন নোটিফিকেশন -------------------- */}
        {verificationSent ? (
          <div className="text-center py-2 space-y-4 relative z-10 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-3xl mx-auto shadow-inner shadow-red-950/50">
              📩
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Verify Your Email</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                A verification link has been sent to: <br />
                <span className="text-red-400 font-bold">{email}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Please click the link inside your email (check Spam folder if needed) to activate your donor account.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCheckVerification}
                disabled={loading}
                className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full font-bold rounded-xl shadow-lg shadow-red-950/50 text-xs"
              >
                {loading ? 'Checking...' : "✓ I Have Verified My Email"}
              </button>

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendCooldown}
                className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 w-full rounded-xl"
              >
                {resendCooldown ? 'Wait 30s to resend' : '🔄 Resend Verification Email'}
              </button>
            </div>
          </div>
        ) : (

          /* -------------------- স্ক্রিন ২: মূল লগইন / রেজিস্ট্রেশন ফর্ম -------------------- */
          <>
            <div className="text-center mb-5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 text-2xl mx-auto mb-2 shadow-inner shadow-red-950/50">
                🩸
              </div>
              <h3 className="text-lg font-black text-white">
                {isRegister ? 'Create Donor Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {isRegister ? 'Enter details to get verification link' : 'Log in to manage requests & donations'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4 relative z-10">
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {isRegister && (
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input input-sm bg-slate-950 text-white border-slate-800 w-full text-xs rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-sm bg-slate-950 text-white border-slate-800 w-full text-xs rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-sm bg-slate-950 text-white border-slate-800 w-full text-xs rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-none w-full font-bold rounded-xl shadow-lg shadow-red-950/50 text-xs mt-1 transition-all active:scale-98"
                >
                  {loading ? 'Processing...' : (isRegister ? 'Register & Send Verification' : 'Sign In')}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2 py-1">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">or continue with</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* Official Google Card at the bottom */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs transition-all duration-200 shadow-xl group active:scale-98"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-sm">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span className="tracking-wide group-hover:text-white transition-colors">
                  Continue with Google
                </span>
              </button>

              {/* Mode Toggle */}
              <div className="text-center pt-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setError('');
                    }}
                    className="text-red-400 hover:text-red-300 underline font-bold transition-colors ml-0.5"
                  >
                    {isRegister ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthModal;