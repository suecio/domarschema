import React from 'react';
import { Shield, X } from 'lucide-react';

export default function AuthModal({
  t,
  setShowAuthModal,
  handleAuthSubmit,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  isLoginMode,
  setIsLoginMode,
  authError,
  setAuthError,
  handleResetPassword
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 relative">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-2">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">{t.appTitle}</h3>
          <p className="text-xs text-slate-400 font-medium">{isLoginMode ? t.loginToContinue : t.createAnAccount}</p>
        </div>
        
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 break-words">
              {authError}
            </div>
          )}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.email}</label>
            <input 
              type="email" 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)} 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm mt-1" 
              placeholder="namn@exempel.se" 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.password}</label>
            <input 
              type="password" 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm mt-1" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {isLoginMode ? t.login : t.register}
          </button>
        </form>
        
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
          <button 
            onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} 
            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isLoginMode ? t.noAccount : t.hasAccount}
          </button>
          {isLoginMode && (
            <button 
              onClick={handleResetPassword} 
              type="button"
              className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors mt-2"
            >
              {t.forgotPassword}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
