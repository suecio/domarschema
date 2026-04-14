import React from 'react';
import { LogOut, Bell, BellOff, Shield, Sliders, RefreshCw, Github, ChevronRight } from 'lucide-react';

export default function AdminModal({
  t,
  user,
  userName,
  umpireId,
  isAdmin,
  isSuperAdmin,
  features,
  toggleSystemFeature,
  masterUmpires,
  toggleUmpireReminderPref,
  forceRunRemindersNow,
  setShowAdminModal,
  logoutUmpire,
  setShowChangelogModal
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20 overflow-y-auto max-h-[90vh]">
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3>
          <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">{user?.email}</p>
        </div>
        
        <div className="space-y-4">
          {/* User Profile Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.displayName}</p>
              <p className="text-sm font-bold text-slate-800">{userName || t.setProfile}</p>
            </div>
            <button onClick={logoutUmpire} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 font-black text-[10px] uppercase">
              <LogOut className="w-4 h-4" /> {t.logout}
            </button>
          </div>

          {/* Reminder Preferences */}
          {features.reminders && umpireId && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.reminderPreferences}</p>
                <p className="text-xs font-bold text-slate-700">{t.receiveReminders}</p>
              </div>
              <button 
                onClick={() => toggleUmpireReminderPref(umpireId, (masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled)}
                className={`p-2 rounded-xl transition-colors flex items-center justify-center ${(masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled !== false ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-slate-200 text-slate-400'}`}
              >
                {(masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled !== false ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            </div>
          )}
          
          {/* Admin Badge */}
          {isAdmin && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Admin</p>
                <p className="text-[10px] text-blue-600 font-medium">Behörighet beviljad via e-post</p>
              </div>
            </div>
          )}

          {/* Super Admin Panel */}
          {isSuperAdmin && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4" /> {t.superAdminSettings}
              </h4>
              
              <button onClick={() => toggleSystemFeature('marketplace')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-purple-900">{t.featureMarketplace}</span>
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.marketplace ? 'bg-purple-600' : 'bg-slate-300'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.marketplace ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>
              
              <button onClick={() => toggleSystemFeature('evaluations')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-purple-900">{t.featureEvaluations}</span>
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.evaluations ? 'bg-purple-600' : 'bg-slate-300'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.evaluations ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>
              
              <button onClick={() => toggleSystemFeature('reminders')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-xs font-bold text-purple-900">{t.featureReminders}</span>
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.reminders ? 'bg-purple-600' : 'bg-slate-300'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.reminders ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </button>

              {features.reminders && (
                <button onClick={forceRunRemindersNow} className="w-full mt-2 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" /> {t.runRemindersNow}
                </button>
              )}
            </div>
          )}
        </div>
        
        <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-sm">
          {t.close}
        </button>
      </div>
    </div>
  );
}
