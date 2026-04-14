import React from 'react';

export default function LocationsView({ t, allLocationNames, searchQuery, locationsData, setSelectedLocation }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       {allLocationNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).map(locName => {
          const locData = locationsData.find(l => l.id === locName) || { id: locName, address: '', facilities: [] };
          return (
            <div key={locName} onClick={() => setSelectedLocation(locName)} className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md">
               <h3 className="font-bold text-slate-800">{locName}</h3>
               {locData.address && <p className="text-xs text-slate-500 mt-1 truncate">{locData.address}</p>}
               <div className="mt-2"><span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">{locData.facilities.length} {t.facilities}</span></div>
            </div>
          );
       })}
    </div>
  );
}
