import React from 'react';
import { Calendar as CalendarIcon, CalendarPlus, ChevronDown, List, History as HistoryIcon, ChevronLeft, ChevronRight, Info, MapPin, CheckCircle } from 'lucide-react';

export default function ScheduleView({
  t, showHistory, setShowHistory, filteredGames, showScheduleExport, setShowScheduleExport,
  generateICS, generateCSV, scheduleViewMode, setScheduleViewMode, currentDate, setCurrentDate,
  calendarWeeks, toLocalISO, today, setSelectedGameDetails, getLeagueStyles, safeDateDay,
  safeDateNum, safeDateMonth, groupedAssignments, masterUmpires, renderOfficialsRow,
  umpireId, applications, toggleApplication, lang
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
          {showHistory ? t.archived : t.activeSchedule}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {filteredGames.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setShowScheduleExport(!showScheduleExport)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <CalendarPlus className="w-4 h-4" /> {t.downloadCalendar} <ChevronDown className="w-3 h-3" />
              </button>
              {showScheduleExport && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowScheduleExport(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { generateICS(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-700">{t.formatICS}</span>
                      <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextICS}</span>
                    </button>
                    <button onClick={() => { generateCSV(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5">
                      <span className="text-xs font-black text-slate-700">{t.formatCSV}</span>
                      <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextCSV}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
               <button 
                 onClick={() => setScheduleViewMode('list')} 
                 className={`p-2 rounded-lg transition-all ${scheduleViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <List className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setScheduleViewMode('calendar')} 
                 className={`p-2 rounded-lg transition-all ${scheduleViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <CalendarIcon className="w-4 h-4" />
               </button>
            </div>
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              {showHistory ? t.upcoming : t.history}
            </button>
          </div>
        </div>
      </div>

      {scheduleViewMode === 'calendar' ? (
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
                    const matches = dateStr ? filteredGames.filter(g => g.date === dateStr) : [];
                    const isToday = dateStr === today;
                    
                    return (
                      <div key={`${week.weekNumber}-${idx}`} className={`min-h-[100px] p-2 border-r border-b border-slate-50 relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                        {day && (
                          <>
                            <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>
                              {day.getDate()}
                            </span>
                            <div className="mt-2 space-y-1">
                              {matches.map(g => (
                                <button 
                                  key={g.id} 
                                  onClick={(e) => { e.stopPropagation(); setSelectedGameDetails(g); }} 
                                  className="w-full text-left p-1 rounded border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden"
                                >
                                  <div className={`w-full h-1 rounded-full mb-1 ${getLeagueStyles(g.league).split(' ')[0]}`} />
                                  <p className="text-[8px] font-bold text-slate-700 truncate leading-none uppercase">{g.away} @ {g.home}</p>
                                </button>
                              ))}
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
        filteredGames.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200">
            <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">{t.noGames}</p>
          </div>
        ) : (
          filteredGames.map(game => {
            const gameAssignments = groupedAssignments[game.id] || [];
            const appsCount = applications.filter(a => a.gameId === game.id).length;
            const isApplied = umpireId && applications.some(a => a.gameId === game.id && a.userId === umpireId);
            const isAssignedToThisGame = umpireId && gameAssignments.some(asg => asg.userId === umpireId);
            const required = game.requiredUmpires || 2;
            
            return (
              <div 
                key={game.id} 
                onClick={() => setSelectedGameDetails(game)}
                className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all cursor-pointer hover:border-blue-300 group ${showHistory ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100 flex flex-col justify-center group-hover:bg-blue-50 transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                      <p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight group-hover:text-blue-700 transition-colors">{game.away} @ {game.home}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                      </div>
                      
                      {/* Centralized Officials Output */}
                      {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    {!showHistory && (
                      <>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} {t.applied}</span>
                          {gameAssignments.length > 0 && (
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5">
                              {gameAssignments.length}/{required} {t.staffed}
                            </span>
                          )}
                        </div>
                        {isAssignedToThisGame ? (
                          <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> {t.yourGame}
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} 
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white shadow-lg active:scale-95 hover:bg-blue-700'}`}
                          >
                            {isApplied ? t.withdraw : t.interested}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )
      )}
    </div>
  );
}
