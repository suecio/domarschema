import React from 'react';
import { UserCheck, Search, Plus, ChevronRight } from 'lucide-react';

export default function NamePromptModal({
  t,
  setShowNamePrompt,
  searchQuery,
  setSearchQuery,
  filteredMasterUmpires,
  setUserName,
  setUmpireId,
  updateProfile,
  isAddingNew,
  setIsAddingNew,
  tempEditName,
  setTempEditName,
  addMasterUmpire,
  getLevelStyles
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20">
        <div className="text-center space-y-2">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">{t.nameRequiredTitle}</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">{t.nameRequiredDesc}</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.masterList}</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input type="text" value={searchQuery} placeholder={t.namePlaceholder} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm" />
            </div>
            
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              {filteredMasterUmpires.length > 0 ? (
                filteredMasterUmpires.map(u => (
                  <button 
                    key={u.id} 
                    onClick={async () => { 
                      setUserName(u.name); 
                      setUmpireId(u.id); 
                      await updateProfile(u.name, u.id); 
                      setShowNamePrompt(false); 
                      setSearchQuery(''); 
                    }} 
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{u.name}</span>
                      {u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center"><p className="text-xs text-slate-400 font-medium italic">{t.noGames}</p></div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button onClick={() => setIsAddingNew(!isAddingNew)} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase hover:underline">
              <Plus className="w-3 h-3" /> {t.addNewName}
            </button>
            {isAddingNew && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <input type="text" autoFocus value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} placeholder="För- och efternamn" className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-sm outline-none" />
                <button 
                  onClick={async () => { 
                    if (tempEditName.trim()) { 
                      const newId = await addMasterUmpire(tempEditName); 
                      setUserName(tempEditName); 
                      setUmpireId(newId); 
                      await updateProfile(tempEditName, newId); 
                      setTempEditName(''); 
                      setIsAddingNew(false); 
                      setShowNamePrompt(false); 
                    } 
                  }} 
                  className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200"
                >
                  {t.createUmpire}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button onClick={() => setShowNamePrompt(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
