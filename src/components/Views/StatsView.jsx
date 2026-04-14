import React from 'react';

export default function StatsView({ t, sortedStatistics, handleSort, setSelectedProfileId, setView }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
         <table className="w-full text-left min-w-[600px]">
           <thead className="bg-slate-50 border-b">
             <tr>
               <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black uppercase cursor-pointer">{t.umpire}</th>
               <th onClick={() => handleSort('interest')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.interests}</th>
               <th onClick={() => handleSort('games')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.gamesAssigned}</th>
               <th onClick={() => handleSort('rate')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.assignmentRate}</th>
             </tr>
           </thead>
           <tbody>
             {sortedStatistics.map(stat => (
               <tr key={stat.userId} className="border-b border-slate-50 hover:bg-slate-50">
                 <td className="px-6 py-4 font-bold">
                   <button onClick={() => { setSelectedProfileId(stat.userId); setView('umpire-profile'); }} className="hover:underline">
                     {stat.name}
                   </button>
                 </td>
                 <td className="px-6 py-4 text-center">{stat.interest}</td>
                 <td className="px-6 py-4 text-center font-bold text-blue-600">{stat.games}</td>
                 <td className="px-6 py-4 text-center">{stat.rate}%</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
  );
}
