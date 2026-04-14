import React from 'react';
import { Calendar as CalendarIcon, CalendarPlus, ChevronDown, List, ChevronLeft, ChevronRight, Info, MapPin, CheckCircle, AlertTriangle, Trash2, ArrowRightLeft } from 'lucide-react';
import { getGoogleCalendarLink, getOutlookCalendarLink } from '../../utils/helpers';

export default function MyGamesView({
  t, user, myAssignedGames, myInterestedGames, showMyGamesExport, setShowMyGamesExport,
  generateICS, generateCSV, myGamesViewMode, setMyGamesViewMode, currentDate, setCurrentDate,
  calendarWeeks, toLocalISO, today, umpireId, groupedAssignments, setSelectedGameDetails,
  getLeagueStyles, confirmScheduleChange, removeAssignment, toggleTradeStatus, features,
  toggleApplication, safeDateDay, safeDateNum, safeDateMonth, renderOfficialsRow, masterUmpires
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black uppercase">{t.mySchedule}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {myAssignedGames.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setShowMyGamesExport(!showMyGamesExport)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <CalendarPlus className="w-4 h-4" /> {t.downloadCalendar} <ChevronDown className="w-3 h-3" />
              </button>
              {showMyGamesExport && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMyGamesExport(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { generateICS(myAssignedGames); setShowMyGamesExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-700">{t.formatICS}</span>
                      <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextICS}</span>
                    </button>
                    <button onClick={() => { generateCSV(myAssignedGames); setShowMyGamesExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-700">{t.formatCSV}</span>
                      <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextCSV}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
             <button 
               onClick={() => setMyGamesViewMode('list')} 
               className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <List className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setMyGamesViewMode('calendar')} 
               className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <CalendarIcon className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start mb-6">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-medium text-blue-800 leading-relaxed">
          {t.myGamesReminder}
        </p>
      </div>

      {!user || !user.email ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-500 font-medium mb-6">{t.loginRequiredMsg}</p>
        </div>
      ) : myGamesViewMode === 'calendar' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">
                  {t.months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">IDAG</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-sm"><ChevronRight className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">
                {(t.days || []).map((d, i) => (
                  <div key={i} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {calendarWeeks.flatMap((week) => 
                  week.days.map((day, idx) => {
                    const dateStr = day ? toLocalISO(day) : null;
                    const myMatches = dateStr ? [...myAssignedGames, ...myInterestedGames].filter(g => g.date === dateStr) : [];
                    const isToday = dateStr === today;
                    
                    return (
                      <div key={`${week.weekNumber}-${idx}`} className={`min-h-[100px] p-2 border-r border-b border-slate-50 relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                        {day && (
                          <>
                            <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>
                              {day.getDate()}
                            </span>
                            <div className="mt-2 space-y-1">
                              {myMatches.map(g => {
                                const myAsg = groupedAssignments[g.id]?.find(a => a.userId === umpireId);
                                const isAssigned = myAsg !== undefined;
                                const isPending = myAsg?.pendingChange;
                                
                                return (
                                  <div 
                                    key={g.id} 
                                    onClick={() => setSelectedGameDetails(g)}
                                    className={`w-full text-left p-1 rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${isPending ? 'border-yellow-300 bg-yellow-50' : isAssigned ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-white'}`}
                                  >
                                    <div className={`w-full h-1 rounded-full mb-1 ${isPending ? 'bg-yellow-500' : isAssigned ? 'bg-green-500' : getLeagueStyles(g.league).split(' ')[0]}`} />
                                    <p className={`text-[8px] font-bold truncate leading-none uppercase ${isPending ? 'text-yellow-800' : isAssigned ? 'text-green-800' : 'text-slate-700'}`}>{g.away} @ {g.home}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
            </div>
        </div>
      ) : (
        <>
          {(() => {
            const pendingAssignedGames = myAssignedGames.filter(g => groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange);
            const confirmedAssignedGames = myAssignedGames.filter(g => !groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange);

            const renderGameCard = (game) => {
              const gameAssignments = groupedAssignments[game.id] || [];
              const coUmpires = gameAssignments.filter(asg => asg.userId !== umpireId);
              const myAsg = gameAssignments.find(a => a.userId === umpireId);

              return (
                <div 
                  key={game.id} 
                  onClick={() => setSelectedGameDetails(game)}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border ${myAsg?.pendingChange ? 'border-yellow-400 shadow-sm shadow-yellow-100 ring-2 ring-yellow-400/20' : 'border-green-200 hover:shadow-md'} flex flex-col gap-3 cursor-pointer transition-all group`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${myAsg?.pendingChange ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'} shrink-0 transition-colors`}>
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{game.away} @ {game.home}</p>
                        <p className="text-[11px] text-slate-500 font-black uppercase mt-1">{game.date} @ {game.time} • {game.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       {myAsg?.pendingChange ? (
                         <div className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start sm:self-end w-fit shadow-sm">{t.timeChangedBadge}</div>
                       ) : (
                         <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start sm:self-end w-fit">{t.confirmed}</div>
                       )}
                       
                       {myAsg && !myAsg.pendingChange && features.marketplace && (
                         myAsg.forTrade ? (
                            <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, false); }} className="text-[10px] font-black uppercase bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors w-fit">
                              {t.cancelTrade}
                            </button>
                         ) : (
                            <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, true); }} className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1 w-fit">
                              <ArrowRightLeft className="w-3 h-3" /> {t.tradeGame}
                            </button>
                         )
                       )}
                    </div>
                  </div>

                  {myAsg?.pendingChange && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-2 flex flex-col gap-3">
                      <p className="text-xs font-bold text-yellow-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {t.matchMovedWarning}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={(e) => { e.stopPropagation(); confirmScheduleChange(myAsg.id); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.acceptTime}</button>
                        <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, umpireId); }} className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.declineTime}</button>
                      </div>
                    </div>
                  )}

                  {renderOfficialsRow(game, gameAssignments, masterUmpires)}

                  <div className="pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                     <a href={getGoogleCalendarLink(game)} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">+ Google</a>
                     <a href={getOutlookCalendarLink(game)} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">+ Outlook</a>
                     <button onClick={(e) => { e.stopPropagation(); generateICS([game]); }} className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">.ICS</button>
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-6">
                {pendingAssignedGames.length > 0 && (
                  <div className="bg-yellow-50/50 p-4 rounded-3xl border border-yellow-200 shadow-inner">
                    <h3 className="text-sm font-black text-yellow-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> {t.actionRequired}
                    </h3>
                    <div className="space-y-4">
                      {pendingAssignedGames.map(renderGameCard)}
                    </div>
                  </div>
                )}

                {confirmedAssignedGames.length > 0 && (
                  <div>
                    {pendingAssignedGames.length > 0 && (
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 mt-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {t.confirmedGames}
                      </h3>
                    )}
                    <div className="space-y-4">
                      {confirmedAssignedGames.map(renderGameCard)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">{t.interestedGames}</h3>
            {myInterestedGames.map(game => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGameDetails(game)}
                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-2 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-400"><CalendarIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-slate-900">{game.away} @ {game.home}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{game.date} @ {game.time}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
