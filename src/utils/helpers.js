import React from 'react';

export const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const formatCalendarDate = (dateStr, timeStr, addHours = 3) => {
  const cleanDate = (dateStr || '').replace(/-/g, '');
  const cleanTime = (timeStr || '00:00').replace(/:/g, '');
  const start = `${cleanDate}T${cleanTime}00`;
  const [hours, mins] = (timeStr || '00:00').split(':');
  const endHours = (parseInt(hours || '0') + addHours).toString().padStart(2, '0');
  const end = `${cleanDate}T${endHours}${mins || '00'}00`;
  return { start, end };
};

export const getGoogleCalendarLink = (game) => {
  if (!game.date || !game.time) return '#';
  const { start, end } = formatCalendarDate(game.date, game.time);
  const title = encodeURIComponent(`${game.away} @ ${game.home} (${game.league})`);
  const details = encodeURIComponent(`League: ${game.league}\nLocation: ${game.location}`);
  const location = encodeURIComponent(game.location);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

export const getOutlookCalendarLink = (game) => {
  if (!game.date || !game.time) return '#';
  const { start, end } = formatCalendarDate(game.date, game.time);
  const title = encodeURIComponent(`${game.away} @ ${game.home} (${game.league})`);
  const details = encodeURIComponent(`League: ${game.league}\nLocation: ${game.location}`);
  const location = encodeURIComponent(game.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${location}`;
};

export const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-slate-800 mb-4 mt-8 tracking-tight">{line.substring(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mb-3 mt-6 pb-2 border-b border-slate-100">{line.substring(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-700 mb-2 mt-4">{line.substring(4)}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-1 text-slate-600 font-medium">{line.substring(2)}</li>;
    if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-blue-400 bg-blue-50 p-3 my-4 italic text-slate-700 rounded-r-lg">{line.substring(2)}</blockquote>;
    if (line.trim() === '') return <div key={i} className="h-2"></div>;
    return <p key={i} className="mb-2 text-slate-600 font-medium leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
  });
};
