import React from 'react';
import { Shield, Plus, Mail, Download, Megaphone, Users, Check, X, Edit2, Trash2, AlertTriangle, RefreshCw, CheckCircle, UserMinus, UserPlus, Calendar as CalendarIcon } from 'lucide-react';

export default function AdminView({
  t, selectedYear, handleDownloadBackup, showImportTool, setShowImportTool,
  bulkInput, setBulkInput, handleBulkImport, setShowEmailPreview,
  editNoteText, setEditNoteText, saveGlobalNote, clearGlobalNote,
  masterUmpires, isSuperAdmin, adminUmpireIds, toggleUmpireAdmin,
  deleteMasterUmpire, editingUmpireId, setEditingUmpireId, tempEditName, setTempEditName,
  tempEditLevel, setTempEditLevel, tempEditEmail, setTempEditEmail,
  showManualEmailInput, setShowManualEmailInput, unconnectedEmails, updateMasterUmpire,
  mailQueue, forceSendQueue, syncing, showStaffed, setShowStaffed,
  filteredGames, groupedAssignments, applications, editingGameData, setEditingGameData,
  saveEditedGame, setSelectedGameDetails, handleDeleteGame, getLeagueStyles,
  safeDateDay, safeDateNum, safeDateMonth, getAssignmentStatusStyles, renderOfficialsRow,
  removeAssignment, assignUmpire, umpireId, today
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left"><h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2><p className="text-xs text-slate-500">{selectedYear} Season</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDownloadBackup} className="bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> {t.downloadBackup}
          </button>
          <button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-sm text-xs uppercase"><Plus className="w-4 h-4" /> {t.bulkImport}</button>
          <button onClick={() => setShowEmailPreview(true)} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg text-xs uppercase">
            <Mail className="w-4 h-4" /> {t.sendSchedules}
          </button>
        </div>
      </div>

      {showImportTool && (
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 animate-in slide-in-from-top">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> {t.pasteSheet}</h3>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="YYYY-MM-DD	HH:MM	Serie	Borta	Hemma	Plats" className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs mb-4 outline-none" />
          <div className="flex gap-3"><button onClick={handleBulkImport} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs">{t.addGames}</button><button onClick={() => setShowImportTool(false)} className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-black uppercase text-xs">{t.cancel}</button></div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Megaphone className="w-4 h-4" /> {t.globalAnnouncement}
        </h3>
        <textarea
          value={editNoteText}
          onChange={(e) => setEditNoteText(e.target.value)}
          placeholder={t.announcementPlaceholder}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px]"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={saveGlobalNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.saveAnnouncement}</button>
          <button onClick={clearGlobalNote} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.clearAnnouncement}</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" /> {t.masterList}
          </h3>
          {isSuperAdmin && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
              <Shield className="w-3 h-3" /> Master Admin
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {masterUmpires.map(u => (
            <div key={u.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              {editingUmpireId === u.id ? (
                <div className="flex flex-1 gap-2 flex-wrap sm:flex-nowrap">
                  <input type="text" value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} className="flex-1 min-w-[120px] bg-white border border-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold outline-none" />
                  <select value={tempEditLevel} onChange={(e) => setTempEditLevel(e.target.value)} className="w-32 bg-white border border-blue-300 px-2 py-1.5 rounded-lg text-sm font-bold outline-none">
                    <option value="">- {t.level} -</option>
                    {['Internationell', 'Elit', 'Nationell', 'Region', 'Förening'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {!showManualEmailInput ? (
                    <select value={tempEditEmail} onChange={(e) => { if (e.target.value === 'MANUAL_ENTRY') { setShowManualEmailInput(true); setTempEditEmail(''); } else { setTempEditEmail(e.target.value); } }} className="flex-1 min-w-[150px] bg-white border border-blue-300 px-2 py-1.5 rounded-lg text-sm font-bold outline-none">
                      <option value="">{t.selectEmail}</option>
                      {unconnectedEmails.map(email => <option key={email} value={email}>{email}</option>)}
                      {tempEditEmail && !unconnectedEmails.includes(tempEditEmail) && tempEditEmail !== 'MANUAL_ENTRY' && <option value={tempEditEmail}>{tempEditEmail}</option>}
                      <option value="MANUAL_ENTRY">{t.otherEmail}</option>
                    </select>
                  ) : (
                    <div className="flex-1 flex items-center min-w-[150px] relative">
                      <input type="email" value={tempEditEmail} onChange={(e) => setTempEditEmail(e.target.value)} placeholder={t.linkEmailPlaceholder} className="w-full bg-white border border-blue-300 px-3 py-1.5 pr-8 rounded-lg text-sm font-bold outline-none" />
                      <button onClick={() => { setShowManualEmailInput(false); setTempEditEmail(''); }} className="absolute right-2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  <div className="flex gap-1 items-center">
                    <button onClick={async () => { await updateMasterUmpire(u.id, tempEditName, tempEditLevel, tempEditEmail); setEditingUmpireId(null); }} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingUmpireId(null)} className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{u.name}</span>
                      {u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLeagueStyles(u.level)}`}>{u.level}</span>}
                      {(adminUmpireIds || []).includes(u.id) && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-black ml-1 flex items-center gap-0.5"><Shield className="w-2 h-2" /> Admin</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {u.linkedEmail ? <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t.linkedAccount} {u.linkedEmail}</span> : <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Info className="w-3 h-3" /> {t.notLinked}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 items-start">
                    {isSuperAdmin && <button onClick={() => toggleUmpireAdmin(u.id)} className={`p-1.5 rounded-lg transition-colors ${(adminUmpireIds || []).includes(u.id) ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><Shield className="w-4 h-4" /></button>}
                    <button onClick={() => { setEditingUmpireId(u.id); setTempEditName(u.name || ''); setTempEditLevel(u.level || ''); setTempEditEmail(u.linkedEmail || ''); setShowManualEmailInput(false); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteMasterUmpire(u.id, u.name, u.linkedEmail)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Staffing Desk Section */}
      <div className="space-y-4">
        {mailQueue.length > 0 && isSuperAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
            <p className="text-sm font-bold text-yellow-800 flex-1 leading-relaxed">
               {t.pendingEmailsQueued.replace('{count}', mailQueue.length)}
            </p>
            <button onClick={forceSendQueue} disabled={syncing} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50">
               {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.sendQueuedNow}
            </button>
          </div>
        )}

        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-600" /> {t.pendingAssignments}</h3>
          <button onClick={() => setShowStaffed(!showStaffed)} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${showStaffed ? 'bg-slate-800 text-white shadow-md hover:bg-black' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            <CheckCircle className="w-3.5 h-3.5" />{showStaffed ? t.hideStaffed : t.showAll}
          </button>
        </div>
        
        {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
          const applicants = applications.filter(a => a.gameId === game.id);
          const gameAssignments = groupedAssignments[game.id] || [];
          const required = game.requiredUmpires || 2;
          const isEditingThisGame = editingGameData?.id === game.id;
          const isFullyStaffed = gameAssignments.length >= required;

          return (
            <div key={game.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isFullyStaffed && !isEditingThisGame ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center hover:bg-slate-100/50 cursor-pointer transition-colors" onClick={() => setSelectedGameDetails(game)}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                  <p className="text-xs font-bold text-slate-600">{game.away} @ {game.home} | {safeDateDay(game.date)} {game.date} @ {game.time}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} {t.assignedTo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditingGameData(isEditingThisGame ? null : { ...game }); }} className={`p-2 transition-colors ${isEditingThisGame ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id); }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              {isEditingThisGame && (
                <div className="p-4 bg-blue-50/30 border-b border-slate-100 flex flex-col gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.date}</label><input type="date" value={editingGameData.date || ''} onChange={e => setEditingGameData({...editingGameData, date: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.time}</label><input type="time" value={editingGameData.time || ''} onChange={e => setEditingGameData({...editingGameData, time: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.league}</label><input type="text" value={editingGameData.league || ''} onChange={e => setEditingGameData({...editingGameData, league: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.requiredUmpires}</label><select value={editingGameData.requiredUmpires || 2} onChange={(e) => setEditingGameData({ ...editingGameData, requiredUmpires: parseInt(e.target.value) })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold">{[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.away}</label><input type="text" value={editingGameData.away || ''} onChange={e => setEditingGameData({...editingGameData, away: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.home}</label><input type="text" value={editingGameData.home || ''} onChange={e => setEditingGameData({...editingGameData, home: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                    <div className="space-y-1 sm:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">{t.location}</label><input type="text" value={editingGameData.location || ''} onChange={e => setEditingGameData({...editingGameData, location: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                  </div>
                  <div className="flex gap-2"><button onClick={saveEditedGame} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase shadow-sm hover:bg-green-700">{t.saveChanges}</button><button onClick={() => setEditingGameData(null)} className="flex-1 bg-slate-200 text-slate-600 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-slate-300">{t.cancel}</button></div>
                </div>
              )}
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {gameAssignments.map(asg => {
                     const m = masterUmpires.find(mu => mu.id === asg.userId);
                     return (
                       <div key={asg.userId} className={`flex items-center justify-between p-2 rounded-xl border ${asg.pendingChange ? 'border-yellow-200 bg-yellow-50' : 'border-green-100 bg-green-50/30'}`}>
                         <div className="flex items-center gap-2">
                           {asg.pendingChange ? <AlertTriangle className="w-3 h-3 text-yellow-600" /> : <Users className="w-3 h-3 text-green-600" />}
                           <span className="text-xs font-bold text-slate-700 text-left flex items-center">{asg.userName}{asg.pendingChange && <span className="ml-2 text-[9px] text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">{t.pendingReply}</span>}</span>
                           {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLeagueStyles(m.level)}`}>{m.level}</span>}
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, asg.userId); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><UserMinus className="w-3.5 h-3.5" /></button>
                       </div>
                     );
                   })}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.interests}</p>
                  {applicants.filter(app => !gameAssignments.some(asg => asg.userId === app.userId)).length === 0 ? <p className="text-xs text-slate-400 italic">{t.noInterest}</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {applicants.filter(app => !gameAssignments.some(asg => asg.userId === app.userId)).map(app => { 
                        const m = masterUmpires.find(mu => mu.id === app.userId); 
                        return (
                          <div key={app.userId} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-white hover:border-blue-300 transition-all">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{app.userName}</span>
                              {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLeagueStyles(m.level)}`}>{m.level}</span>}
                            </div>
                            <button disabled={isFullyStaffed} onClick={(e) => { e.stopPropagation(); assignUmpire(game.id, app.userId, app.userName); }} className="bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"><UserPlus className="w-3 h-3" /> Assign</button>
                          </div>
                        ); 
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
