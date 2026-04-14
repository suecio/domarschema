import React from 'react';
import { X, Map } from 'lucide-react';
import { getGoogleCalendarLink, getOutlookCalendarLink } from '../../utils/helpers';

export default function GameDetailsModal({
  t,
  selectedGameDetails,
  setSelectedGameDetails,
  groupedAssignments,
  getLeagueStyles
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="space-y-6 pt-4">
          <div>
            <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLeagueStyles(selectedGameDetails.league)}`}>
              {selectedGameDetails.league}
            </span>
            <h3 className="text-2xl font-black mt-3">{selectedGameDetails.away} @ {selectedGameDetails.home}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase mt-1">{selectedGameDetails.date} @ {selectedGameDetails.time}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p>
              <p className="font-bold text-blue-900">{selectedGameDetails.location}</p>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=$?q=$${selectedGameDetails.location}`} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Map className="w-4 h-4"/> {t.mapDirections}
            </a>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400">{t.crew}</h4>
            {(groupedAssignments[selectedGameDetails.id] || []).map(asg => (
              <div key={asg.userId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="font-bold">{asg.userName}</span>
              </div>
            ))}
            {(groupedAssignments[selectedGameDetails.id] || []).length === 0 && (
              <p className="text-xs italic text-slate-400">{t.notAssigned || "Inga domare tillsatta än."}</p>
            )}
          </div>
          
          <button 
            onClick={() => setSelectedGameDetails(null)} 
            className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-xs hover:bg-slate-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
