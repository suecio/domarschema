import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  Calendar, 
  User, 
  Shield, 
  CheckCircle, 
  Clock, 
  Settings, 
  Trash2, 
  MapPin, 
  RefreshCw, 
  Trophy, 
  AlertCircle,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  BarChart3,
  History,
  Info,
  Languages
} from 'lucide-react';

/**
 * Firebase Configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyCDCo185Kc7wHHjDPsM750R9eBVi6Loltw",
  authDomain: "baseball-umpire-portal.firebaseapp.com",
  projectId: "baseball-umpire-portal",
  storageBucket: "baseball-umpire-portal.firebasestorage.app",
  messagingSenderId: "163069788280",
  appId: "1:163069788280:web:0d236c7ff9710a306c2d8d",
  measurementId: "G-VSWDNDQKE5"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// --- LOGO CONFIGURATION ---
// Once you have your logo URL, paste it here:
const LOGO_URL = ""; // e.g., "https://your-domain.com/logo.png"

// --- Translation Dictionary ---
const translations = {
  sv: {
    appTitle: "Domartillsättning",
    season: "Säsong",
    schedule: "Spelschema",
    myGames: "Mina Matcher",
    staffing: "Bemaning",
    analytics: "Statistik",
    history: "Historik",
    upcoming: "Kommande",
    archived: "Arkiverade matcher",
    activeSchedule: "Aktivt schema",
    searchPlaceholder: "Sök lag...",
    allSeries: "Alla serier",
    allLocations: "Alla platser",
    noGames: "Inga matcher hittades för urvalet.",
    noGamesSync: "Inga matcher har synkroniserats till databasen än.",
    syncNow: "Synka förbundsdata nu",
    applied: "Anmäld",
    interested: "Intresserad",
    withdraw: "Dra tillbaka",
    assignedTo: "Tillsatt till",
    staffed: "Bemannad",
    needsUmpire: "Behöver domare",
    bulkImport: "Massimport",
    pendingAssignments: "Väntande tillsättningar",
    staffingControl: "Bemanningskontroll",
    hideStaffed: "Dölj bemannade",
    showAll: "Visa alla matcher",
    removeAssignment: "Ta bort tillsättning",
    deleteGame: "Ta bort match",
    deleteConfirm: "Är du säker på att du vill ta bort matchen? Detta tar även bort tillsättningar.",
    umpire: "Domare",
    interests: "Intresseanmälningar",
    gamesAssigned: "Dömda matcher",
    noStats: "Ingen data finns registrerad för säsongen än.",
    mySchedule: "Mitt Schema",
    noInterest: "Du har inte anmält intresse för några matcher än.",
    confirmed: "Bekräftad",
    settings: "Inställningar",
    userSettings: "Användarinställningar",
    profileAccess: "Konfigurera profil & åtkomst",
    displayName: "Visningsnamn",
    namePlaceholder: "t.ex. Johan Andersson",
    adminVerify: "Admin-verifiering",
    accessCode: "Åtkomstkod",
    verify: "Verifiera",
    adminActive: "Admin aktiv",
    logoutAdmin: "Logga ut admin",
    close: "Stäng inställningar",
    status: "Status",
    setProfile: "Ange profilnamn",
    pasteSheet: "Klistra in från Google Sheets",
    pasteFormat: "Format: ÅYYY-MM-DD | Tid | Serie | Hemma | Borta | Plats (Tabb-separerat)",
    addGames: "Lägg till matcher",
    importSuccess: "Import lyckades",
    importFail: "Import misslyckades",
    syncSuccess: "Synkronisering lyckades",
    processing: "Bearbetar...",
    cancel: "Avbryt",
    date: "Datum"
  },
  en: {
    appTitle: "Domartillsättning",
    season: "Season",
    schedule: "Schedule",
    myGames: "My Games",
    staffing: "Staffing",
    analytics: "Analytics",
    history: "History",
    upcoming: "Upcoming",
    archived: "Archived Games",
    activeSchedule: "Active Schedule",
    searchPlaceholder: "Search team...",
    allSeries: "All Series",
    allLocations: "All Locations",
    noGames: "No games found for the current selection.",
    noGamesSync: "No matches have been synced to the database yet.",
    syncNow: "Sync Federation Data Now",
    applied: "Applied",
    interested: "Interested",
    withdraw: "Withdraw",
    assignedTo: "Assigned to",
    staffed: "Staffed",
    needsUmpire: "Needs Umpire",
    bulkImport: "Bulk Import",
    pendingAssignments: "Pending Assignments",
    staffingControl: "Staffing Control",
    hideStaffed: "Hide Staffed",
    showAll: "Show All Games",
    removeAssignment: "Remove Assignment",
    deleteGame: "Delete Game",
    deleteConfirm: "Are you sure you want to delete this game? This will also remove any assignments.",
    umpire: "Umpire",
    interests: "Interests",
    gamesAssigned: "Games Assigned",
    noStats: "No engagement data recorded for this season yet.",
    mySchedule: "My Schedule",
    noInterest: "You haven't marked interest in any games yet.",
    confirmed: "Confirmed",
    settings: "Settings",
    userSettings: "User Settings",
    profileAccess: "Configure profile & access",
    displayName: "Display Name",
    namePlaceholder: "e.g. John Smith",
    adminVerify: "Admin Verification",
    accessCode: "Access Code",
    verify: "Verify",
    adminActive: "Admin Active",
    logoutAdmin: "Logout Admin",
    close: "Close Settings",
    status: "Status",
    setProfile: "Set Profile Name",
    pasteSheet: "Paste from Google Sheets",
    pasteFormat: "Format: YYYY-MM-DD | Time | League | Home | Away | Location (Tab separated)",
    addGames: "Add Games",
    importSuccess: "Import Successful",
    importFail: "Import Failed",
    syncSuccess: "Sync Successful",
    processing: "Processing...",
    cancel: "Cancel",
    date: "Date"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('schedule');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Detection Logic: Start with Swedish if browser is Swedish, else English
  const defaultLang = typeof navigator !== 'undefined' && navigator.language.startsWith('sv') ? 'sv' : 'en';
  const [lang, setLang] = useState(defaultLang);
  const t = translations[lang];

  // Data State
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // UI State
  const [adminCode, setAdminCode] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [showImportTool, setShowImportTool] = useState(false);
  const [showStaffed, setShowStaffed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeague, setFilterLeague] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const appId = `baseball-umpire-scheduler-${selectedYear}`;
  const today = new Date().toISOString().split('T')[0];

  // 1. Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Database Listeners
  useEffect(() => {
    if (!user) return;

    const gamesCol = collection(db, 'artifacts', appId, 'public', 'data', 'games');
    const unsubscribeGames = onSnapshot(gamesCol, (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList.sort((a, b) => new Date(a.date) - new Date(b.date)));
    });

    const appsCol = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const unsubscribeApps = onSnapshot(appsCol, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const assignCol = collection(db, 'artifacts', appId, 'public', 'data', 'assignments');
    const unsubscribeAssign = onSnapshot(assignCol, (snapshot) => {
      const assignObj = {};
      snapshot.docs.forEach(doc => assignObj[doc.id] = doc.data());
      setAssignments(assignObj);
    });

    const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    const unsubscribeProfile = onSnapshot(profileDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserName(data.name || '');
        setIsAdmin(data.isAdmin || false);
      }
    });

    return () => {
      unsubscribeGames();
      unsubscribeApps();
      unsubscribeAssign();
      unsubscribeProfile();
    };
  }, [user, selectedYear]);

  // Derived Statistics
  const statistics = useMemo(() => {
    const stats = {};
    Object.values(assignments).forEach(asg => {
      if (!asg.userId) return;
      if (!stats[asg.userId]) stats[asg.userId] = { name: asg.userName, games: 0, interest: 0 };
      stats[asg.userId].games += 1;
    });
    applications.forEach(app => {
      if (!stats[app.userId]) stats[app.userId] = { name: app.userName, games: 0, interest: 0 };
      stats[app.userId].interest += 1;
    });
    return Object.values(stats).sort((a, b) => b.games - a.games);
  }, [assignments, applications]);

  // Filtering Logic
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = 
        game.home.toLowerCase().includes(searchQuery.toLowerCase()) || 
        game.away.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLeague = !filterLeague || game.league === filterLeague;
      const matchesLocation = !filterLocation || game.location === filterLocation;
      const isHistorical = game.date < today;
      return showHistory ? isHistorical && matchesSearch && matchesLeague && matchesLocation : !isHistorical && matchesSearch && matchesLeague && matchesLocation;
    });
  }, [games, searchQuery, filterLeague, filterLocation, showHistory, today]);

  const leagues = useMemo(() => [...new Set(games.map(g => g.league))], [games]);
  const locations = useMemo(() => [...new Set(games.map(g => g.location))], [games]);

  // Actions
  const updateProfile = async (name) => {
    if (!user) return;
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { name, isAdmin }, { merge: true });
  };

  const toggleApplication = async (gameId) => {
    if (!user || !userName) return;
    const appIdStr = `${gameId}_${user.uid}`;
    const existing = applications.find(a => a.id === appIdStr);
    if (existing) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr));
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr), {
        gameId, userId: user.uid, userName, timestamp: Date.now()
      });
    }
  };

  const assignUmpire = async (gameId, userId, name) => {
    if (!isAdmin) return;
    if (!name) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', gameId));
      return;
    }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', gameId), {
      userId, userName: name, assignedAt: Date.now()
    });
  };

  const handleBulkImport = async () => {
    if (!isAdmin || !bulkInput.trim()) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      const rows = bulkInput.trim().split('\n');
      rows.forEach((row) => {
        const columns = row.split(/\t|,/);
        if (columns.length >= 5) {
          const gameData = {
            date: columns[0].trim(),
            time: columns[1].trim(),
            league: columns[2].trim(),
            home: columns[3].trim(),
            away: columns[4].trim(),
            location: (columns[5] || 'Unknown').trim(),
          };
          const gameId = `m-${gameData.date}-${gameData.home}-${gameData.away}`.replace(/\s+/g, '').toLowerCase();
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), gameData);
        }
      });
      await batch.commit();
      setBulkInput('');
      setShowImportTool(false);
      alert(t.importSuccess);
    } catch (e) { alert(t.importFail); }
    finally { setSyncing(false); }
  };

  const handleAdminAuth = async () => {
    if (adminCode === 'admin123' && user) {
      setIsAdmin(true);
      setShowAdminModal(false);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: true }, { merge: true });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-blue-600"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-100">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center h-10 w-10 border border-white/20">
              {LOGO_URL ? (
                <img src={LOGO_URL} alt="Logo" className="h-full w-full object-contain p-1" />
              ) : (
                <Trophy className="w-6 h-6 text-blue-900" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">{t.appTitle}</h1>
              <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest mt-1">Season {selectedYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex bg-blue-800 rounded-lg p-0.5 mr-2">
              <button onClick={() => setLang('sv')} className={`px-2 py-1 text-xs rounded-md transition-all ${lang === 'sv' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇸🇪</button>
              <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs rounded-md transition-all ${lang === 'en' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇬🇧</button>
            </div>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-blue-800 text-[10px] font-black uppercase border-none rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <button onClick={() => setShowAdminModal(true)} className="p-2 hover:bg-blue-800 rounded-full transition-colors ml-1"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Navigation */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {[
            { id: 'schedule', label: t.schedule, icon: Calendar },
            { id: 'my-apps', label: t.myGames, icon: CheckCircle },
            ...(isAdmin ? [{ id: 'admin', label: t.staffing, icon: Shield }, { id: 'stats', label: t.analytics, icon: BarChart3 }] : [])
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setView(tab.id)} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Global Filters */}
        {(view === 'schedule' || view === 'admin') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <select 
                value={filterLeague} 
                onChange={(e) => setFilterLeague(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
              >
                <option value="">{t.allSeries}</option>
                {leagues.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select 
                value={filterLocation} 
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
              >
                <option value="">{t.allLocations}</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        <section className="space-y-4">
          {view === 'schedule' && (
            <>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {showHistory ? t.archived : t.activeSchedule}
                </h2>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <History className="w-3.5 h-3.5" />
                  {showHistory ? t.upcoming : t.history}
                </button>
              </div>

              {filteredGames.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">{t.noGames}</p>
                </div>
              ) : (
                filteredGames.map(game => {
                  const assigned = assignments[game.id];
                  const appsCount = applications.filter(a => a.gameId === game.id).length;
                  const isApplied = user && applications.some(a => a.gameId === game.id && a.userId === user.uid);
                  
                  return (
                    <div key={game.id} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all ${showHistory ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(game.date).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { month: 'short' })}</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{new Date(game.date).getDate()}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-blue-100 text-blue-700">{game.league}</span>
                            <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight">{game.home} vs {game.away}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                          {assigned?.userName ? (
                            <div className="bg-green-50 px-4 py-2 rounded-full flex items-center gap-2 border border-green-100">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase">{assigned.userName.charAt(0)}</div>
                              <span className="text-xs font-bold text-green-700">{assigned.userName}</span>
                            </div>
                          ) : !showHistory && (
                            <>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} {t.applied}</div>
                              <button 
                                onClick={() => toggleApplication(game.id)} 
                                disabled={!userName} 
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-600 text-white shadow-lg active:scale-95 disabled:opacity-30'}`}
                              >
                                {isApplied ? t.withdraw : t.interested}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {view === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2>
                  <p className="text-xs text-slate-500">{selectedYear} Season</p>
                </div>
                <button 
                  onClick={() => setShowImportTool(!showImportTool)}
                  className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" /> {t.bulkImport}
                </button>
              </div>

              {showImportTool && (
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 animate-in slide-in-from-top">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> {t.pasteSheet}</h3>
                  <p className="text-[10px] text-blue-600 mb-4 font-medium">{t.pasteFormat}</p>
                  <textarea 
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="2026-05-09	14:00	Serie	Hemma	Borta	Plats"
                    className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs mb-4 outline-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={handleBulkImport} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs">{t.addGames}</button>
                    <button onClick={() => setShowImportTool(false)} className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-black uppercase text-xs">{t.cancel}</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.pendingAssignments}</h3>
                   <button onClick={() => setShowStaffed(!showStaffed)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">
                     {showStaffed ? t.hideStaffed : t.showAll}
                   </button>
                </div>
                {filteredGames.filter(g => showStaffed ? true : !assignments[g.id]?.userName).map(game => {
                  const applicants = applications.filter(a => a.gameId === game.id);
                  const assigned = assignments[game.id];
                  return (
                    <div key={game.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${assigned?.userName ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
                      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-600">{game.home} vs {game.away} | {game.date}</p>
                        <button onClick={() => { if(window.confirm(t.deleteConfirm)) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)); }} className="text-red-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="p-4">
                        {assigned?.userName ? (
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-green-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t.assignedTo} {assigned.userName}</span>
                            <button onClick={() => assignUmpire(game.id, '', '')} className="text-[10px] font-black text-red-500 uppercase">{t.removeAssignment}</button>
                          </div>
                        ) : applicants.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">{t.noInterest}</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {applicants.map(app => (
                              <div key={app.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white">
                                <span className="text-xs font-bold">{app.userName}</span>
                                <button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg">Assign</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'stats' && (
            <div className="space-y-6">
              <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">{t.analytics}</h2>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">{selectedYear} Season Engagement</p>
                </div>
                <BarChart3 className="w-12 h-12 opacity-20" />
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.umpire}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.interests}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.gamesAssigned}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {statistics.map(stat => (
                      <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black uppercase">{stat.name.charAt(0)}</div>
                            <span className="font-bold text-slate-700">{stat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-black text-slate-500">{stat.interest}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-blue-100 px-3 py-1 rounded-full text-xs font-black text-blue-700">{stat.games}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {statistics.length === 0 && <p className="p-12 text-center text-slate-400 italic text-sm">{t.noStats}</p>}
              </div>
            </div>
          )}

          {view === 'my-apps' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{t.mySchedule}</h2>
              {applications.filter(a => a.userId === user?.uid).length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar className="w-8 h-8 text-slate-300" /></div>
                  <p className="text-slate-500 font-medium">{t.noInterest}</p>
                </div>
              ) : (
                applications.filter(a => a.userId === user?.uid).map(app => {
                  const game = games.find(g => g.id === app.gameId);
                  if (!game) return null;
                  const isAssigned = assignments[game.id]?.userId === user?.uid;
                  return (
                    <div key={app.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex items-center justify-between ${isAssigned ? 'border-green-200 bg-green-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isAssigned ? 'bg-green-100' : 'bg-slate-100'}`}><Calendar className={`w-5 h-5 ${isAssigned ? 'text-green-600' : 'text-slate-400'}`} /></div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight text-base">{game.home} vs {game.away}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{game.date} @ {game.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAssigned && <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {t.confirmed}</div>}
                        <button onClick={() => toggleApplication(game.id)} className="text-slate-300 hover:text-red-500 p-2.5 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </main>

      {/* Settings Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20">
            <div><h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3><p className="text-xs text-slate-400 font-medium tracking-wider uppercase">{t.profileAccess}</p></div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.displayName}</label>
                <input type="text" value={userName} placeholder={t.namePlaceholder} onChange={(e) => setUserName(e.target.value)} onBlur={() => updateProfile(userName)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.adminVerify}</label>
                {!isAdmin ? (
                  <div className="flex gap-2 mt-2">
                    <input type="password" placeholder={t.accessCode} value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" />
                    <button onClick={handleAdminAuth} className="bg-slate-800 text-white px-5 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all">{t.verify}</button>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center mt-2">
                    <p className="text-blue-700 font-black text-xs uppercase flex items-center justify-center gap-2"><Shield className="w-4 h-4" /> {t.adminActive}</p>
                    <button onClick={async () => { setIsAdmin(false); await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: false }, { merge: true }); }} className="text-[10px] font-black text-red-500 uppercase hover:underline mt-2.5 block w-full text-center">{t.logoutAdmin}</button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors shadow-sm">{t.close}</button>
          </div>
        </div>
      )}

      {/* Floating Profile Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-40 border border-blue-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[11px] font-black uppercase shadow-inner overflow-hidden">
            {LOGO_URL && userName === '' ? (
               <img src={LOGO_URL} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <span>{userName ? userName.charAt(0) : '?'}</span>
            )}
          </div>
          <span className="text-sm font-bold whitespace-nowrap">{userName || t.setProfile}</span>
        </div>
        <div className="h-4 w-px bg-blue-700" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-blue-300 leading-none">{t.status}</span>
          <span className="text-[11px] font-bold leading-none mt-0.5">
            {user && applications.filter(a => a.userId === user.uid).length} {t.applied}
          </span>
        </div>
      </div>
    </div>
  );
}
