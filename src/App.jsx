import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc,
  writeBatch,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getAnalytics, 
  logEvent 
} from 'firebase/analytics';
import { 
  Calendar as CalendarIcon, 
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
  History as HistoryIcon,
  Info,
  Users,
  UserPlus,
  UserMinus,
  Download,
  CalendarPlus,
  ArrowRight,
  UserCheck,
  Edit2,
  Check,
  LogOut,
  ChevronRight,
  X,
  List,
  ChevronLeft,
  ArrowUpDown
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
const analytics = typeof window !== 'undefined' ? getAnalytics(firebaseApp) : null;

// --- LOGO CONFIGURATION ---
const LOGO_URL = ""; 

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
    applied: "Anmälda",
    interested: "Intresserad",
    withdraw: "Dra tillbaka",
    assignedTo: "Tillsatta",
    staffed: "Bemannad",
    partiallyStaffed: "Delvis bemannad",
    needsUmpire: "Behöver domare",
    bulkImport: "Massimport",
    pendingAssignments: "Bemanningsöversikt",
    staffingControl: "Bemanningskontroll",
    hideStaffed: "Dölj helt bemannade",
    showAll: "Visa alla matcher",
    removeAssignment: "Ta bort",
    deleteGame: "Ta bort match",
    deleteConfirm: "Är du säker på att du vill ta bort matchen? Detta tar även bort tillsättningar.",
    deleteAllGames: "Rensa hela säsongen",
    deleteAllConfirm: "ÄR DU HELT SÄKER? Detta kommer radera ALLA matcher, intresseanmälningar och tillsättningar för det valda året. Detta går inte att ångra.",
    deleteAllSuccess: "Säsongen har rensats.",
    umpire: "Domare",
    interests: "Intresseanmälningar",
    gamesAssigned: "Dömda matcher",
    assignmentRate: "Tillsättningsgrad",
    noStats: "Ingen data finns registrerad för säsongen än.",
    mySchedule: "Mitt Schema",
    noInterest: "Du har inga bekräftade matchuppdrag än.",
    noPendingInterest: "Du har inte anmält intresse för några kommande matcher.",
    confirmed: "Bekräftad",
    settings: "Inställningar",
    userSettings: "Användarinställningar",
    profileAccess: "Konfigurera profil & åtkomst",
    displayName: "Visningsnamn",
    namePlaceholder: "Sök eller skriv ditt namn...",
    adminVerify: "Admin-verifiering",
    accessCode: "Åtkomstkod",
    verify: "Verifiera",
    adminActive: "Admin aktiv",
    logoutAdmin: "Logga ut admin",
    logout: "Logga ut",
    close: "Stäng",
    status: "Status",
    setProfile: "Välj din profil",
    pasteSheet: "Klistra in från Google Sheets",
    pasteFormat: "Format: ÅYYY-MM-DD | Tid | Serie | Borta | Hemma | Plats (Tabb-separerat)",
    addGames: "Lägg till matcher",
    importSuccess: "Import lyckades",
    importFail: "Import misslyckades",
    syncSuccess: "Synkronisering lyckades",
    processing: "Bearbetar...",
    cancel: "Avbryt",
    date: "Datum",
    crew: "Domarteam",
    addToCalendar: "Spara i kalender",
    downloadFullSchedule: "Ladda ner mitt schema (.ics)",
    confirmedGames: "Bekräftade uppdrag",
    interestedGames: "Anmält intresse",
    nameRequiredTitle: "Vem är du?",
    nameRequiredDesc: "Välj ditt namn från listan nedan för att se ditt schema på alla enheter.",
    saveName: "Välj profil",
    addNewName: "Hittar du inte ditt namn?",
    createUmpire: "Skapa ny profil",
    masterList: "Domarlista",
    editName: "Ändra namn",
    save: "Spara",
    selectFromList: "Välj från listan",
    changeUser: "Byt användare",
    editMatch: "Ändra matchdata",
    home: "Hemma",
    away: "Borta",
    time: "Tid",
    location: "Plats",
    league: "Serie",
    saveChanges: "Spara ändringar",
    listView: "Lista",
    calendarView: "Kalender",
    days: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
    months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
    requiredUmpires: "Antal domare"
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
    applied: "Interested",
    interested: "Interested",
    withdraw: "Withdraw",
    assignedTo: "Crew",
    staffed: "Fully Staffed",
    partiallyStaffed: "Partially Staffed",
    needsUmpire: "Needs Umpire",
    bulkImport: "Bulk Import",
    pendingAssignments: "Staffing Desk",
    staffingControl: "Staffing Control",
    hideStaffed: "Hide Fully Staffed",
    showAll: "Show All Games",
    removeAssignment: "Remove",
    deleteGame: "Delete Game",
    deleteConfirm: "Are you sure you want to delete this game? This will also remove any assignments.",
    deleteAllGames: "Clear Entire Season",
    deleteAllConfirm: "ARE YOU ABSOLUTELY SURE? This will delete ALL games, interests, and assignments for the selected year. This cannot be undone.",
    deleteAllSuccess: "Season cleared successfully.",
    umpire: "Umpire",
    interests: "Interests",
    gamesAssigned: "Games Assigned",
    assignmentRate: "Assignment Rate",
    noStats: "No engagement data recorded for this season yet.",
    mySchedule: "My Schedule",
    noInterest: "You have no confirmed assignments yet.",
    noPendingInterest: "You haven't marked interest in any upcoming matches.",
    confirmed: "Confirmed",
    settings: "Settings",
    userSettings: "User Settings",
    profileAccess: "Configure profile & access",
    displayName: "Display Name",
    namePlaceholder: "Search or type name...",
    adminVerify: "Admin Verification",
    accessCode: "Access Code",
    verify: "Verify",
    adminActive: "Admin Active",
    logoutAdmin: "Logout Admin",
    logout: "Logout",
    close: "Close",
    status: "Status",
    setProfile: "Select Your Profile",
    pasteSheet: "Paste from Google Sheets",
    pasteFormat: "Format: YYYY-MM-DD | Time | League | Away | Home | Location (Tab separated)",
    addGames: "Add Games",
    importSuccess: "Import Successful",
    importFail: "Import Failed",
    syncSuccess: "Sync Successful",
    processing: "Processing...",
    cancel: "Cancel",
    date: "Date",
    crew: "Umpire Crew",
    addToCalendar: "Add to Calendar",
    downloadFullSchedule: "Download My Schedule (.ics)",
    confirmedGames: "Confirmed Assignments",
    interestedGames: "Interested Matches",
    nameRequiredTitle: "Who are you?",
    nameRequiredDesc: "Select your name from the list below to sync your schedule across devices.",
    saveName: "Select Profile",
    addNewName: "Can't find your name?",
    createUmpire: "Create new profile",
    masterList: "Umpire Master List",
    editName: "Edit Name",
    save: "Save",
    selectFromList: "Select from list",
    changeUser: "Change User",
    editMatch: "Edit Match Details",
    home: "Home",
    away: "Away",
    time: "Time",
    location: "Location",
    league: "League",
    saveChanges: "Save Changes",
    listView: "List",
    calendarView: "Calendar",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    requiredUmpires: "Crew Size"
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [umpireId, setUmpireId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('schedule');
  const [scheduleViewMode, setScheduleViewMode] = useState('list');
  const [myGamesViewMode, setMyGamesViewMode] = useState('list'); 
  const [selectedYear, setSelectedYear] = useState('2026');
  
  const defaultLang = typeof navigator !== 'undefined' && navigator.language.startsWith('sv') ? 'sv' : 'en';
  const [lang, setLang] = useState(defaultLang);
  const t = translations[lang];

  // Shared Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data State
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterUmpires, setMasterUmpires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // UI State
  const [adminCode, setAdminCode] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [showImportTool, setShowImportTool] = useState(false);
  const [showStaffed, setShowStaffed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingUmpireId, setEditingUmpireId] = useState(null);
  const [tempEditName, setTempEditName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingGameData, setEditingGameData] = useState(null);

  // Sorting State for Statistics
  const [sortConfig, setSortConfig] = useState({ key: 'games', direction: 'desc' });

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
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const umpiresCol = collection(db, 'artifacts', appId, 'public', 'data', 'umpires');
    const unsubscribeUmpires = onSnapshot(umpiresCol, (snapshot) => {
      setMasterUmpires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.name.localeCompare(b.name)));
    });

    const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    const unsubscribeProfile = onSnapshot(profileDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserName(data.name || '');
        setUmpireId(data.umpireId || '');
        setIsAdmin(data.isAdmin || false);
      }
    });

    return () => {
      unsubscribeGames();
      unsubscribeApps();
      unsubscribeAssign();
      unsubscribeUmpires();
      unsubscribeProfile();
    };
  }, [user, selectedYear, isAdmin]);

  // 3. Analytics Tracking
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        firebase_screen: view,
        year: selectedYear,
        lang: lang
      });
    }
  }, [view, selectedYear, lang]);

  // Helpers
  const getLeagueStyles = (league) => {
    const l = league?.toLowerCase() || '';
    if (l.includes('elit')) return 'bg-green-100 text-green-700 border-green-200';
    if (l.includes('region')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (l.includes('pre') || l.includes('off')) return 'bg-red-100 text-red-700 border-red-200';
    if (l.includes('junior')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getAssignmentStatusStyles = (count, required) => {
    const req = required || 2;
    if (count === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (count < req) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const generateICS = (gamesToExport) => {
    if (gamesToExport.length === 0) return;
    if (analytics) logEvent(analytics, 'calendar_bulk_export', { count: gamesToExport.length });
    const events = gamesToExport.map(game => {
      const cleanDate = game.date.replace(/-/g, '');
      const cleanTime = game.time.replace(/:/g, '');
      const startTime = `${cleanDate}T${cleanTime}00`;
      const [hours, mins] = game.time.split(':');
      const endHours = (parseInt(hours) + 3).toString().padStart(2, '0');
      const endTime = `${cleanDate}T${endHours}${mins}00`;
      return [
        'BEGIN:VEVENT',
        `UID:${game.id}@domartillsattning.portal`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${startTime}`,
        `DTEND:${endTime}`,
        `SUMMARY:${game.away} @ ${game.home} (${game.league})`,
        `DESCRIPTION:League: ${game.league}\\nLocation: ${game.location}`,
        `LOCATION:${game.location}`,
        'END:VEVENT'
      ].join('\n');
    }).join('\n');
    const icsContent = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Domartillsättning//Baseball Scheduler//EN', events, 'END:VCALENDAR'].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `schedule-${selectedYear}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCalendarExport = (game) => {
    if (!game.date || !game.time) return;
    if (analytics) logEvent(analytics, 'calendar_single_export', { game_id: game.id });
    generateICS([game]);
  };

  const groupedAssignments = useMemo(() => {
    const map = {};
    assignments.forEach(asg => {
      if (!map[asg.gameId]) map[asg.gameId] = [];
      map[asg.gameId].push(asg);
    });
    return map;
  }, [assignments]);

  const myAssignedGames = useMemo(() => {
    if (!umpireId) return [];
    return games.filter(game => groupedAssignments[game.id]?.some(asg => asg.userId === umpireId));
  }, [games, groupedAssignments, umpireId]);

  const myInterestedGames = useMemo(() => {
    if (!umpireId) return [];
    return games.filter(game => 
      applications.some(app => app.gameId === game.id && app.userId === umpireId) &&
      !groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)
    );
  }, [games, applications, groupedAssignments, umpireId]);

  const sortedStatistics = useMemo(() => {
    const stats = {};
    assignments.forEach(asg => {
      if (!asg.userId) return;
      if (!stats[asg.userId]) stats[asg.userId] = { name: asg.userName, games: 0, interest: 0 };
      stats[asg.userId].games += 1;
    });
    applications.forEach(app => {
      if (!stats[app.userId]) stats[app.userId] = { name: app.userName, games: 0, interest: 0 };
      stats[app.userId].interest += 1;
    });
    const data = Object.values(stats).map(s => {
      const rate = s.interest > 0 ? Math.round((s.games / s.interest) * 100) : (s.games > 0 ? 100 : 0);
      return { ...s, rate };
    });
    return data.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [assignments, applications, sortConfig]);

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

  const filteredMasterUmpires = useMemo(() => {
    if (!searchQuery && !isAddingNew) return masterUmpires;
    return masterUmpires.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [masterUmpires, searchQuery, isAddingNew]);

  const updateProfile = async (name, id) => {
    if (!user) return;
    if (analytics) logEvent(analytics, 'profile_updated', { user_name: name });
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { name, umpireId: id, isAdmin }, { merge: true });
  };

  const logoutUmpire = async () => {
    if (!user) return;
    if (analytics) logEvent(analytics, 'logout');
    setUserName('');
    setUmpireId('');
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { name: '', umpireId: '', isAdmin: false }, { merge: true });
    setShowNamePrompt(true);
  };

  const addMasterUmpire = async (name) => {
    if (!name.trim()) return "";
    const exists = masterUmpires.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (exists) return exists.id;
    if (analytics) logEvent(analytics, 'umpire_added_to_master', { name });
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), { name });
    return docRef.id;
  };

  const updateMasterUmpire = async (id, newName) => {
    if (!isAdmin || !newName.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id), { name: newName }, { merge: true });
  };

  const deleteMasterUmpire = async (id) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id));
  };

  const toggleApplication = async (gameId) => {
    if (!user) return;
    if (!umpireId) {
      setShowNamePrompt(true);
      return;
    }
    const appIdStr = `${gameId}_${umpireId}`;
    const existing = applications.find(a => a.id === appIdStr);
    if (existing) {
      if (analytics) logEvent(analytics, 'withdraw_interest', { game_id: gameId, umpire: userName });
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr));
    } else {
      if (analytics) logEvent(analytics, 'express_interest', { game_id: gameId, umpire: userName });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr), {
        gameId, userId: umpireId, userName, timestamp: Date.now()
      });
    }
  };

  const assignUmpire = async (gameId, uId, name) => {
    if (!isAdmin) return;
    if (analytics) logEvent(analytics, 'umpire_assigned', { game_id: gameId, umpire: name });
    const asgId = `${gameId}_${uId}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), {
      gameId, userId: uId, userName: name, assignedAt: Date.now()
    });
  };

  const removeAssignment = async (gameId, uId) => {
    if (!isAdmin) return;
    const asgId = `${gameId}_${uId}`;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId));
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
          const gameData = { date: columns[0].trim(), time: columns[1].trim(), league: columns[2].trim(), away: columns[3].trim(), home: columns[4].trim(), location: (columns[5] || 'Unknown').trim(), requiredUmpires: 2 };
          const gameId = `m-${gameData.date}-${gameData.time}-${gameData.away}-${gameData.home}`.replace(/\s+/g, '').replace(/:/g, '').toLowerCase();
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), gameData);
        }
      });
      if (analytics) logEvent(analytics, 'bulk_import', { count: rows.length });
      await batch.commit();
      setBulkInput('');
      setShowImportTool(false);
      alert(t.importSuccess);
    } catch (e) { alert(t.importFail); }
    finally { setSyncing(false); }
  };

  const saveEditedGame = async () => {
    if (!isAdmin || !editingGameData) return;
    try {
      const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', editingGameData.id);
      await updateDoc(gameRef, { 
        date: editingGameData.date, 
        time: editingGameData.time, 
        league: editingGameData.league, 
        home: editingGameData.home, 
        away: editingGameData.away, 
        location: editingGameData.location,
        requiredUmpires: parseInt(editingGameData.requiredUmpires) || 2
      });
      setEditingGameData(null);
    } catch (e) { alert("Error updating match."); }
  };

  const deleteAllGames = async () => {
    if (!isAdmin) return;
    const confirmed = window.confirm(t.deleteAllConfirm);
    if (!confirmed) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      games.forEach(game => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)));
      assignments.forEach(asg => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${asg.gameId}_${asg.userId}`)));
      applications.forEach(app => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'applications', `${app.gameId}_${app.userId}`)));
      if (analytics) logEvent(analytics, 'clear_season', { year: selectedYear });
      await batch.commit();
      alert(t.deleteAllSuccess);
    } catch (e) { alert("Error deleting games."); }
    finally { setSyncing(false); }
  };

  const handleAdminAuth = async () => {
    if (adminCode === 'admin123' && user) {
      if (analytics) logEvent(analytics, 'admin_login');
      setIsAdmin(true);
      setShowAdminModal(false);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: true }, { merge: true });
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const shiftedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < shiftedFirstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const calendarDays = useMemo(generateCalendarDays, [currentDate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-blue-600"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-100">
      {/* Header */}
      <header 
        onClick={() => { 
            setView('schedule'); 
            setScheduleViewMode('list');
            setSearchQuery('');
        }} 
        className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-20 cursor-pointer group"
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center h-10 w-10 border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
              {LOGO_URL ? (
                <img src={LOGO_URL} alt="Logo" className="h-full w-full object-contain p-1" />
              ) : (
                <Trophy className="w-6 h-6 text-blue-900" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none group-hover:text-blue-200 transition-colors">{t.appTitle}</h1>
              <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest mt-1">{t.season} {selectedYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex bg-blue-800 rounded-lg p-0.5 mr-2">
              <button onClick={(e) => { e.stopPropagation(); setLang('sv'); }} className={`px-2 py-1 text-xs rounded-md transition-all ${lang === 'sv' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇸🇪</button>
              <button onClick={(e) => { e.stopPropagation(); setLang('en'); }} className={`px-2 py-1 text-xs rounded-md transition-all ${lang === 'en' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇬🇧</button>
            </div>
            <select 
              value={selectedYear} 
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-blue-800 text-[10px] font-black uppercase border-none rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAdminModal(true); }} 
              className="p-2 hover:bg-blue-800 rounded-full transition-colors ml-1"
            >
                <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Navigation */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {[
            { id: 'schedule', label: t.schedule, icon: CalendarIcon },
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
              <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium">
                <option value="">{t.allSeries}</option>
                {leagues.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none font-medium">
                <option value="">{t.allLocations}</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        <section className="space-y-4">
          {view === 'schedule' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {showHistory ? t.archived : t.activeSchedule}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                     <button onClick={() => setScheduleViewMode('list')} className={`p-2 rounded-lg transition-all ${scheduleViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                        <List className="w-4 h-4" />
                     </button>
                     <button onClick={() => setScheduleViewMode('calendar')} className={`p-2 rounded-lg transition-all ${scheduleViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                        <CalendarIcon className="w-4 h-4" />
                     </button>
                  </div>
                  <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    <HistoryIcon className="w-3.5 h-3.5" />
                    {showHistory ? t.upcoming : t.history}
                  </button>
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
                    {[1, 2, 3, 4, 5, 6, 0].map(d => (
                      <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{t.days[d]}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const dateStr = day ? day.toISOString().split('T')[0] : null;
                      const matches = dateStr ? filteredGames.filter(g => g.date === dateStr) : [];
                      const isToday = dateStr === today;
                      return (
                        <div key={idx} className={`min-h-[100px] p-2 border-r border-b border-slate-50 relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                          {day && (
                            <>
                              <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>
                                {day.getDate()}
                              </span>
                              <div className="mt-2 space-y-1">
                                {matches.map(g => (
                                  <button key={g.id} onClick={() => { setSearchQuery(g.home); setScheduleViewMode('list'); }} className="w-full text-left p-1 rounded border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden">
                                    <div className={`w-full h-1 rounded-full mb-1 ${getLeagueStyles(g.league).split(' ')[0]}`} />
                                    <p className="text-[8px] font-bold text-slate-700 truncate leading-none uppercase">{g.away} @ {g.home}</p>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
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
                    const gameDateObj = new Date(game.date);
                    const dayOfWeek = t.days[gameDateObj.getDay()];
                    const required = game.requiredUmpires || 2;

                    return (
                      <div key={game.id} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all ${showHistory ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dayOfWeek}</p>
                              <p className="text-2xl font-black text-slate-800 leading-none">{gameDateObj.getDate()}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{gameDateObj.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { month: 'short' })}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                                  <button onClick={() => handleCalendarExport(game)} className="text-slate-400 hover:text-blue-600 transition-colors" title={t.addToCalendar}><CalendarPlus className="w-4 h-4" /></button>
                              </div>
                              <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight">{game.away} @ {game.home}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                              </div>
                              {gameAssignments.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3 items-center">
                                  {gameAssignments.map(asg => (
                                    <div key={asg.userId} className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-green-100 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> {asg.userName}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                            {!showHistory && (
                              <>
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} {t.applied}</span>
                                  {gameAssignments.length > 0 && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5">{gameAssignments.length}/{required} {t.staffed}</span>}
                                </div>
                                <button onClick={() => toggleApplication(game.id)} disabled={isAssignedToThisGame} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-600 text-white shadow-lg active:scale-95 disabled:opacity-30'}`}>{isApplied ? t.withdraw : t.interested}</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
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
                <div className="flex gap-2">
                  <button onClick={deleteAllGames} className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-red-100 transition-all active:scale-95">{t.deleteAllGames}</button>
                  <button onClick={() => setShowImportTool(!showImportTool)} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"><Plus className="w-4 h-4" /> {t.bulkImport}</button>
                </div>
              </div>

              {showImportTool && (
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 animate-in slide-in-from-top">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> {t.pasteSheet}</h3>
                  <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="YYYY-MM-DD	HH:MM	Serie	Borta	Hemma	Plats" className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs mb-4 outline-none" />
                  <div className="flex gap-3"><button onClick={handleBulkImport} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs">{t.addGames}</button><button onClick={() => setShowImportTool(false)} className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-black uppercase text-xs">{t.cancel}</button></div>
                </div>
              )}

              {/* Master List Manager */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> {t.masterList}</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {masterUmpires.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      {editingUmpireId === u.id ? (
                        <div className="flex flex-1 gap-2">
                          <input type="text" value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} className="flex-1 bg-white border border-blue-300 px-3 py-1 rounded-lg text-sm font-bold outline-none" />
                          <button onClick={async () => { await updateMasterUmpire(u.id, tempEditName); setEditingUmpireId(null); }} className="bg-green-600 text-white p-1.5 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingUmpireId(null)} className="bg-slate-200 text-slate-600 p-1.5 rounded-lg"><UserMinus className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-slate-700">{u.name}</span>
                          <div className="flex gap-1"><button onClick={() => { setEditingUmpireId(u.id); setTempEditName(u.name); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteMasterUmpire(u.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.pendingAssignments}</h3>
                   <button onClick={() => setShowStaffed(!showStaffed)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">{showStaffed ? t.hideStaffed : t.showAll}</button>
                </div>
                {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
                  const applicants = applications.filter(a => a.gameId === game.id);
                  const gameAssignments = groupedAssignments[game.id] || [];
                  const required = game.requiredUmpires || 2;
                  const isFullyStaffed = gameAssignments.length >= required;
                  const isEditingThisGame = editingGameData?.id === game.id;
                  
                  return (
                    <div key={game.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isFullyStaffed && !isEditingThisGame ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
                      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                          <p className="text-xs font-bold text-slate-600">{game.away} @ {game.home} | {game.date}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} {t.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingGameData(isEditingThisGame ? null : { ...game })} className={`p-2 transition-colors ${isEditingThisGame ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { if(window.confirm(t.deleteConfirm)) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)); }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {isEditingThisGame ? (
                        <div className="p-6 bg-blue-50/30 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.date}</label><input type="date" value={editingGameData.date} onChange={(e) => setEditingGameData({ ...editingGameData, date: e.target.value })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                             <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.time}</label><input type="text" value={editingGameData.time} onChange={(e) => setEditingGameData({ ...editingGameData, time: e.target.value })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                             <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.away}</label><input type="text" value={editingGameData.away} onChange={(e) => setEditingGameData({ ...editingGameData, away: e.target.value })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                             <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.home}</label><input type="text" value={editingGameData.home} onChange={(e) => setEditingGameData({ ...editingGameData, home: e.target.value })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                             <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.league}</label><input type="text" value={editingGameData.league} onChange={(e) => setEditingGameData({ ...editingGameData, league: e.target.value })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                             <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.location}</label><input type="text" value={editingGameData.location} onChange={(e) => setEditingGameData({ ...editingGameData, location: e.target.value })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.requiredUmpires}</label>
                                <select 
                                    value={editingGameData.requiredUmpires || 2} 
                                    onChange={(e) => setEditingGameData({ ...editingGameData, requiredUmpires: parseInt(e.target.value) })}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                >
                                    {[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                             </div>
                          </div>
                          <div className="flex gap-2"><button onClick={saveEditedGame} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">{t.saveChanges}</button><button onClick={() => setEditingGameData(null)} className="px-6 bg-slate-200 text-slate-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">{t.cancel}</button></div>
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          {gameAssignments.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.crew}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {gameAssignments.map(asg => (
                                  <div key={asg.userId} className="flex items-center justify-between p-2 rounded-xl border border-green-100 bg-green-50/30"><div className="flex items-center gap-2"><Users className="w-3 h-3 text-green-600" /><span className="text-xs font-bold text-slate-700">{asg.userName}</span></div><button onClick={() => removeAssignment(game.id, asg.userId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><UserMinus className="w-3.5 h-3.5" /></button></div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.interests}</p>
                            {applicants.filter(app => !gameAssignments.some(asg => asg.userId === app.userId)).length === 0 ? <p className="text-xs text-slate-400 italic">{t.noInterest}</p> : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {applicants.filter(app => !gameAssignments.some(asg => asg.userId === app.userId)).map(app => (
                                  <div key={app.userId} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-white hover:border-blue-300 transition-all"><span className="text-xs font-bold">{app.userName}</span><button disabled={isFullyStaffed} onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-50"><UserPlus className="w-3 h-3" /> Assign</button></div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'stats' && (
            <div className="space-y-6">
              <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
                <div><h2 className="text-2xl font-black tracking-tighter">{t.analytics}</h2><p className="text-blue-200 text-xs font-bold uppercase tracking-widest">{selectedYear} Season Engagement</p></div>
                <BarChart3 className="w-12 h-12 opacity-20" />
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">
                        <div className="flex items-center gap-1">
                          {t.umpire}
                          {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                        </div>
                      </th>
                      <th onClick={() => handleSort('interest')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-blue-600 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          {t.interests}
                          {sortConfig.key === 'interest' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                        </div>
                      </th>
                      <th onClick={() => handleSort('games')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-blue-600 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          {t.gamesAssigned}
                          {sortConfig.key === 'games' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                        </div>
                      </th>
                      <th onClick={() => handleSort('rate')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-blue-600 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          {t.assignmentRate}
                          {sortConfig.key === 'rate' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sortedStatistics.map(stat => (
                      <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black uppercase">{stat.name.charAt(0)}</div><span className="font-bold text-slate-700">{stat.name}</span></div></td>
                        <td className="px-6 py-4 text-center"><span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-black text-slate-500">{stat.interest}</span></td>
                        <td className="px-6 py-4 text-center"><span className="bg-blue-100 px-3 py-1 rounded-full text-xs font-black text-blue-700">{stat.games}</span></td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className="flex-1 max-w-[64px] bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${stat.rate}%` }} />
                             </div>
                             <span className="text-xs font-black text-slate-600 min-w-[32px]">{stat.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedStatistics.length === 0 && <p className="p-12 text-center text-slate-400 italic text-sm">{t.noStats}</p>}
              </div>
            </div>
          )}

          {view === 'my-apps' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{t.mySchedule}</h2>
                <div className="flex items-center gap-2">
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button onClick={() => setMyGamesViewMode('list')} className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                            <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setMyGamesViewMode('calendar')} className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {myAssignedGames.length > 0 && <button onClick={() => generateICS(myAssignedGames)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-lg hover:bg-blue-700 transition-all active:scale-95"><Download className="w-4 h-4" />{t.downloadFullSchedule}</button>}
                </div>
              </div>
              
              {myGamesViewMode === 'calendar' ? (
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
                        {[1, 2, 3, 4, 5, 6, 0].map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{t.days[d]}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, idx) => {
                        const dateStr = day ? day.toISOString().split('T')[0] : null;
                        const matches = dateStr ? myAssignedGames.filter(g => g.date === dateStr) : [];
                        const isToday = dateStr === today;
                        return (
                            <div key={idx} className={`min-h-[100px] p-2 border-r border-b border-slate-50 relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                            {day && (
                                <>
                                <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-2 space-y-1">
                                    {matches.map(g => (
                                    <button key={g.id} onClick={() => setMyGamesViewMode('list')} className="w-full text-left p-1 rounded border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden">
                                        <div className={`w-full h-1 rounded-full mb-1 ${getLeagueStyles(g.league).split(' ')[0]}`} />
                                        <p className="text-[8px] font-bold text-slate-700 truncate leading-none uppercase">{g.away} @ {g.home}</p>
                                    </button>
                                    ))}
                                </div>
                                </>
                            )}
                            </div>
                        );
                        })}
                    </div>
                </div>
              ) : (
                <>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pl-1 mb-1">
                        <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.confirmedGames}</h3>
                        </div>
                        {myAssignedGames.length === 0 ? (
                        <p className="text-sm text-slate-400 italic py-8 text-center bg-white rounded-3xl border border-slate-100">{t.noInterest}</p>
                        ) : (
                        myAssignedGames.map(game => {
                            const gameDateObj = new Date(game.date);
                            return (
                            <div key={game.id} className="bg-white p-4 rounded-2xl shadow-sm border border-green-200 bg-green-50/20 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform"><CalendarIcon className="w-5 h-5" /></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.days[gameDateObj.getDay()]} {gameDateObj.getDate()} {t.months[gameDateObj.getMonth()].substring(0,3)} @ {game.time}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 leading-tight text-base mt-1">{game.away} @ {game.home}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleCalendarExport(game)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title={t.addToCalendar}><CalendarPlus className="w-5 h-5" /></button>
                                    <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {t.confirmed}</div>
                                </div>
                            </div>
                            );
                        })
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pl-1 mb-1">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.interestedGames}</h3>
                        </div>
                        {myInterestedGames.length === 0 ? (
                        <p className="text-sm text-slate-400 italic py-8 text-center bg-white rounded-3xl border border-slate-100">{t.noPendingInterest}</p>
                        ) : (
                        myInterestedGames.map(game => {
                            const gameDateObj = new Date(game.date);
                            return (
                                <div key={game.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-slate-100 text-slate-400"><CalendarIcon className="w-5 h-5" /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.days[gameDateObj.getDay()]} {gameDateObj.getDate()} {t.months[gameDateObj.getMonth()].substring(0,3)} @ {game.time}</p>
                                            </div>
                                            <p className="font-bold text-slate-900 leading-tight text-base mt-1">{game.away} @ {game.home}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleCalendarExport(game)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title={t.addToCalendar}><CalendarPlus className="w-5 h-5" /></button>
                                        <button onClick={() => toggleApplication(game.id)} className="text-slate-300 hover:text-red-500 p-2.5 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Profile Selection Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in border border-white/20">
            <div className="text-center space-y-2">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><UserCheck className="w-8 h-8 text-blue-600" /></div>
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
                  {filteredMasterUmpires.length > 0 ? filteredMasterUmpires.map(u => (
                      <button key={u.id} onClick={async () => { setUserName(u.name); setUmpireId(u.id); await updateProfile(u.name, u.id); setShowNamePrompt(false); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-700">{u.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                  )) : <div className="p-4 text-center"><p className="text-xs text-slate-400 font-medium italic">{t.noGames}</p></div>}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button onClick={() => setIsAddingNew(!isAddingNew)} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase hover:underline"><Plus className="w-3 h-3" /> {t.addNewName}</button>
                {isAddingNew && (
                   <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <input type="text" autoFocus value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} placeholder="För- och efternamn" className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-sm outline-none" />
                      <button onClick={async () => { if (tempEditName.trim()) { const newId = await addMasterUmpire(tempEditName); setUserName(tempEditName); setUmpireId(newId); await updateProfile(tempEditName, newId); setTempEditName(''); setIsAddingNew(false); setShowNamePrompt(false); } }} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200">{t.createUmpire}</button>
                   </div>
                )}
              </div>
            </div>
            <button onClick={() => setShowNamePrompt(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">{t.cancel}</button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20 overflow-y-auto max-h-[90vh]">
            <div><h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3><p className="text-xs text-slate-400 font-medium tracking-wider uppercase">{t.profileAccess}</p></div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.displayName}</p><p className="text-sm font-bold text-slate-800">{userName || t.setProfile}</p></div>
                <button onClick={logoutUmpire} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 font-black text-[10px] uppercase"><LogOut className="w-4 h-4" /> {t.logout}</button>
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
            <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-sm">{t.close}</button>
          </div>
        </div>
      )}

      {/* Floating Profile Bar */}
      <button onClick={() => setShowNamePrompt(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-40 border border-blue-800/50 backdrop-blur-md hover:scale-105 active:scale-95 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[11px] font-black uppercase shadow-inner overflow-hidden">{userName ? userName.charAt(0) : '?'}</div>
          <div className="text-left"><p className="text-[8px] font-black uppercase text-blue-300 leading-none mb-0.5">{userName ? t.status : t.setProfile}</p><span className="text-sm font-bold whitespace-nowrap leading-none">{userName || t.selectFromList}</span></div>
        </div>
        <div className="h-4 w-px bg-blue-700" />
        <div className="flex flex-col items-center"><span className="text-[10px] font-black uppercase text-blue-300 leading-none">{t.applied}</span><span className="text-[11px] font-bold leading-none mt-0.5">{umpireId && applications.filter(a => a.userId === umpireId).length}</span></div>
      </button>
    </div>
  );
}
