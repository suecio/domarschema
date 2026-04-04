import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  deleteDoc,
  writeBatch,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import { 
  getAnalytics, 
  logEvent 
} from 'firebase/analytics';
import { 
  Calendar as CalendarIcon, 
  Shield, 
  CheckCircle, 
  Clock, 
  Settings, 
  Trash2, 
  MapPin, 
  RefreshCw, 
  Trophy, 
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  History as HistoryIcon,
  Info,
  User,
  UserPlus,
  UserMinus,
  Download,
  CalendarPlus,
  UserCheck,
  Edit2,
  Check,
  LogOut,
  ChevronRight,
  List,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  Users2,
  Github,
  GitCommit,
  X,
  AlertTriangle,
  ArrowLeft,
  UserCircle
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

// --- GITHUB CONFIGURATION ---
const GITHUB_REPO = "suecio/domarschema"; 

// --- Translation Dictionary ---
const translations = {
  sv: {
    appTitle: "Domartillsättning",
    season: "Säsong",
    schedule: "Spelschema",
    myGames: "Mina Matcher",
    umpireList: "Domarlista",
    staffing: "Bemaning",
    analytics: "Statistik",
    history: "Historik",
    upcoming: "Kommande",
    archived: "Arkiverade matcher",
    activeSchedule: "Aktivt schema",
    searchPlaceholder: "Sök...",
    allSeries: "Alla serier",
    allLocations: "Alla platser",
    noGames: "Inga matcher hittades.",
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
    deleteConfirm: "Är du säker på att du vill ta bort matchen?",
    deleteAllGames: "Rensa hela säsongen",
    deleteAllConfirm: "ÄR DU HELT SÄKER? Detta kommer radera ALLA matcher, intresseanmälningar och tillsättningar för det valda året.",
    deleteAllSuccess: "Säsongen har rensats.",
    downloadBackup: "Ladda ner backup (JSON)",
    umpire: "Domare",
    interests: "Intresseanmälningar",
    gamesAssigned: "Dömda matcher",
    assignmentRate: "Tillsättningsgrad",
    noStats: "Ingen data finns registrerad än.",
    mySchedule: "Mitt Schema",
    noInterest: "Du har inga bekräftade matchuppdrag än.",
    noPendingInterest: "Du har inte anmält intresse för några matcher.",
    confirmed: "Bekräftad",
    settings: "Inställningar",
    userSettings: "Användarinställningar",
    profileAccess: "Konfigurera profil & åtkomst",
    displayName: "Visningsnamn",
    namePlaceholder: "Sök eller skriv ditt namn...",
    logout: "Logga ut",
    close: "Stäng",
    status: "Status",
    setProfile: "Välj din profil",
    pasteSheet: "Klistra in från Google Sheets",
    addGames: "Lägg till matcher",
    importSuccess: "Import lyckades",
    cancel: "Avbryt",
    date: "Datum",
    crew: "Domarteam",
    addToCalendar: "Spara i kalender",
    downloadFullSchedule: "Ladda ner (.ics)",
    confirmedGames: "Bekräftade uppdrag",
    interestedGames: "Anmält intresse",
    nameRequiredTitle: "Vem är du?",
    nameRequiredDesc: "Välj ditt namn från listan nedan för att koppla ditt konto till dina matcher.",
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
    requiredUmpires: "Antal domare",
    level: "Nivå",
    name: "Namn",
    sortBy: "Sortera",
    week: "V.",
    systemUpdates: "Systemuppdateringar",
    fetchError: "Kunde inte hämta uppdateringar",
    login: "Logga in",
    register: "Skapa konto",
    email: "E-postadress",
    password: "Lösenord",
    forgotPassword: "Glömt lösenord?",
    loginToContinue: "Logga in för att fortsätta",
    createAnAccount: "Skapa ett nytt konto",
    noAccount: "Inget konto? Registrera dig här",
    hasAccount: "Har du redan ett konto? Logga in",
    loginRequiredMsg: "Du måste logga in för att se detta.",
    adminManagement: "Administratörer",
    addAdmin: "Lägg till admin",
    adminAdded: "Admin tillagd",
    adminRemoved: "Admin borttagen",
    masterAdminInfo: "Du är inloggad som Master Admin.",
    linkedAccount: "Konto:",
    notLinked: "Inget konto",
    linkEmailPlaceholder: "Koppla e-post...",
    selectEmail: "-- Välj E-post --",
    otherEmail: "+ Ange annan...",
    umpireProfile: "Domarprofil",
    back: "Tillbaka",
    assignedMatches: "Tillsatta matcher",
    noAssignedMatches: "Inga tillsatta matcher än.",
    totalAssignments: "Tillsättningar",
    totalInterests: "Intresseanmälningar"
  },
  en: {
    appTitle: "Umpire Portal",
    season: "Season",
    schedule: "Schedule",
    myGames: "My Games",
    umpireList: "Umpire List",
    staffing: "Staffing",
    analytics: "Analytics",
    history: "History",
    upcoming: "Upcoming",
    archived: "Archived Games",
    activeSchedule: "Active Schedule",
    searchPlaceholder: "Search...",
    allSeries: "All Series",
    allLocations: "All Locations",
    noGames: "No games found.",
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
    deleteConfirm: "Are you sure you want delete this game?",
    deleteAllGames: "Clear Entire Season",
    deleteAllConfirm: "ARE YOU ABSOLUTELY SURE? This will delete ALL data.",
    deleteAllSuccess: "Season cleared successfully.",
    downloadBackup: "Download Backup (JSON)",
    umpire: "Umpire",
    interests: "Interests",
    gamesAssigned: "Games Assigned",
    assignmentRate: "Assignment Rate",
    noStats: "No engagement data recorded yet.",
    mySchedule: "My Schedule",
    noInterest: "You have no confirmed assignments yet.",
    noPendingInterest: "You haven't marked interest in any matches.",
    confirmed: "Confirmed",
    settings: "Settings",
    userSettings: "User Settings",
    profileAccess: "Configure profile & access",
    displayName: "Display Name",
    namePlaceholder: "Search or type name...",
    logout: "Logout",
    close: "Close",
    status: "Status",
    setProfile: "Select Your Profile",
    pasteSheet: "Paste from Google Sheets",
    addGames: "Add Games",
    importSuccess: "Import Successful",
    cancel: "Cancel",
    date: "Date",
    crew: "Umpire Crew",
    addToCalendar: "Add to Calendar",
    downloadFullSchedule: "Download (.ics)",
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
    requiredUmpires: "Crew Size",
    level: "Level",
    name: "Name",
    sortBy: "Sort by",
    week: "W.",
    systemUpdates: "System Updates",
    fetchError: "Could not fetch updates",
    login: "Login",
    register: "Register",
    email: "Email Address",
    password: "Password",
    forgotPassword: "Forgot Password?",
    loginToContinue: "Login to continue",
    createAnAccount: "Create a new account",
    noAccount: "No account? Register here",
    hasAccount: "Already have an account? Login",
    loginRequiredMsg: "You must be logged in to view this.",
    adminManagement: "Admin Roles",
    addAdmin: "Add Admin",
    adminAdded: "Admin added",
    adminRemoved: "Admin removed",
    masterAdminInfo: "You are logged in as Master Admin.",
    linkedAccount: "Account:",
    notLinked: "No account",
    linkEmailPlaceholder: "Link email...",
    selectEmail: "-- Select Email --",
    otherEmail: "+ Enter other...",
    umpireProfile: "Umpire Profile",
    back: "Back",
    assignedMatches: "Assigned Matches",
    noAssignedMatches: "No assigned matches yet.",
    totalAssignments: "Assignments",
    totalInterests: "Interests"
  }
};

const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// ==========================================
// ERROR BOUNDARY
// ==========================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical React Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ett oväntat fel uppstod</h2>
            <p className="text-slate-600 mb-6 font-medium">Applikationen kraschade under laddning. Felet var:</p>
            <div className="bg-red-50 rounded-xl p-4 text-left overflow-x-auto mb-6 border border-red-100">
              <pre className="text-red-700 text-xs font-mono whitespace-pre-wrap">
                {this.state.error?.toString()}
              </pre>
            </div>
            <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors">
              Ladda om sidan
            </button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
function MainApp() {
  // Auth & Roles
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [umpireId, setUmpireId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUmpireIds, setAdminUmpireIds] = useState([]);
  
  // Navigation & View
  const [view, setView] = useState('schedule');
  const [scheduleViewMode, setScheduleViewMode] = useState('list');
  const [myGamesViewMode, setMyGamesViewMode] = useState('list'); 
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Language & UI Context
  const defaultLang = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('sv') ? 'sv' : 'en';
  const [lang, setLang] = useState(defaultLang);
  const t = translations[lang] || translations['en'];

  // Shared UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Data State
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterUmpires, setMasterUmpires] = useState([]);
  const [registeredEmails, setRegisteredEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null); 
  
  // Auth & Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  
  // Changelog
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [changelog, setChangelog] = useState([]);
  const [loadingChangelog, setLoadingChangelog] = useState(false);
  
  // Admin Editing Controls
  const [bulkInput, setBulkInput] = useState('');
  const [showImportTool, setShowImportTool] = useState(false);
  const [showStaffed, setShowStaffed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingUmpireId, setEditingUmpireId] = useState(null);
  const [tempEditName, setTempEditName] = useState('');
  const [tempEditLevel, setTempEditLevel] = useState('');
  const [tempEditEmail, setTempEditEmail] = useState('');
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingGameData, setEditingGameData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'games', direction: 'desc' });
  const [umpireSort, setUmpireSort] = useState('level');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeague, setFilterLeague] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : `baseball-umpire-scheduler-${selectedYear}`;
  
  // Localized today
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  // --- DEFENSIVE UI HELPERS ---
  const safeDateMonth = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; 
    return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { month: 'short' });
  };

  const safeDateDay = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday...
    return (t.days && t.days[dayIndex]) ? t.days[dayIndex] : '-';
  };

  const safeDateNum = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.getDate();
  };

  const toLocalISO = (date) => {
    if (!date || isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLeagueStyles = (league) => {
    const l = (league || '').toLowerCase();
    if (l.includes('elit')) return 'bg-green-100 text-green-700 border-green-200';
    if (l.includes('region')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (l.includes('pre') || l.includes('off')) return 'bg-red-100 text-red-700 border-red-200';
    if (l.includes('junior')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getLevelStyles = (level) => {
    const l = (level || '').toLowerCase();
    if (l.includes('internationell')) return 'bg-[#204d99] text-white border-[#1a3d7a]';
    if (l.includes('elit')) return 'bg-[#38761d] text-white border-[#2d5f17]';
    if (l.includes('nationell')) return 'bg-[#990000] text-white border-[#7a0000]';
    if (l.includes('region')) return 'bg-[#cfe2f3] text-[#3d85c6] border-[#a2c4c9]';
    if (l.includes('förening')) return 'bg-[#efefef] text-[#666666] border-[#cccccc]';
    return 'bg-slate-200 text-slate-500 border-slate-300';
  };

  const getAssignmentStatusStyles = (count, required) => {
    const req = required || 2;
    if (count === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (count < req) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  // 1. Authentication Configuration
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth initialization fallback. Proceeding safely.", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // 2. Data Listeners 
  useEffect(() => {
    const isCanvas = typeof window !== 'undefined' && window.__initial_auth_token != null;
    if (isCanvas && !user) return; 

    const handleDbError = (err) => {
      console.error("Firebase Sync Error:", err);
      if (err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes('permission'))) {
        setFirebaseError('permission-denied');
      }
    };

    const gamesCol = collection(db, 'artifacts', appId, 'public', 'data', 'games');
    const unsubscribeGames = onSnapshot(gamesCol, (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
      setFirebaseError(null);
    }, handleDbError);

    const appsCol = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const unsubscribeApps = onSnapshot(appsCol, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleDbError);

    const assignCol = collection(db, 'artifacts', appId, 'public', 'data', 'assignments');
    const unsubscribeAssign = onSnapshot(assignCol, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleDbError);

    const umpiresCol = collection(db, 'artifacts', appId, 'public', 'data', 'umpires');
    const unsubscribeUmpires = onSnapshot(umpiresCol, (snapshot) => {
      setMasterUmpires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    }, handleDbError);
    
    const regUsersCol = collection(db, 'artifacts', appId, 'public', 'data', 'registered_users');
    const unsubscribeRegUsers = onSnapshot(regUsersCol, (snapshot) => {
      const emails = snapshot.docs.map(doc => doc.data().email).filter(Boolean);
      setRegisteredEmails([...new Set(emails)]);
    }, handleDbError);

    const settingsDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubscribeSettings = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        setAdminUmpireIds(snapshot.data().adminUmpireIds || []);
      }
    }, handleDbError);

    return () => {
      unsubscribeGames(); 
      unsubscribeApps(); 
      unsubscribeAssign(); 
      unsubscribeUmpires();
      unsubscribeRegUsers();
      unsubscribeSettings();
    };
  }, [user, appId]);

  // 3. User Profile & Role Evaluation
  useEffect(() => {
    let unsubscribeProfile = () => {};

    if (user && user.email) {
      const isMaster = user.email === 'suecio@tryempire.com';
      
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registered_users', user.uid), {
        email: user.email.toLowerCase(),
        lastSeen: Date.now()
      }, { merge: true }).catch(err => console.warn("Failed to register email:", err));

      const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      unsubscribeProfile = onSnapshot(profileDoc, (snapshot) => {
        if (snapshot.exists() && snapshot.data().umpireId) {
          const data = snapshot.data();
          setUserName(data.name || '');
          setUmpireId(data.umpireId || '');
          
          const isStandardAdmin = Array.isArray(adminUmpireIds) && adminUmpireIds.includes(data.umpireId);
          setIsAdmin(isMaster || isStandardAdmin);
        } else {
          const preLinkedUmpire = masterUmpires.find(u => u.linkedEmail && u.linkedEmail.toLowerCase() === user.email.toLowerCase());
          if (preLinkedUmpire) {
             setDoc(profileDoc, { name: preLinkedUmpire.name, umpireId: preLinkedUmpire.id }, { merge: true });
          } else {
             setUserName('');
             setUmpireId('');
             setIsAdmin(isMaster);
          }
        }
      }, (err) => console.error(err));
    } else {
      setIsAdmin(false);
      setUserName('');
      setUmpireId('');
    }

    return () => unsubscribeProfile();
  }, [user, appId, adminUmpireIds, masterUmpires]);

  // 3.5 Auto-link email to public umpire profile
  useEffect(() => {
    if (user && user.email && umpireId && masterUmpires.length > 0) {
      const myUmpire = masterUmpires.find(u => u.id === umpireId);
      if (myUmpire && myUmpire.linkedEmail !== user.email) {
        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', umpireId), {
          linkedUserId: user.uid,
          linkedEmail: user.email
        }).catch(e => console.warn("Background email sync failed", e));
      }
    }
  }, [user, umpireId, masterUmpires, appId]);

  // 4. Scroll & Analytics
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, 'screen_view', { firebase_screen: view, year: selectedYear, lang: lang });
    }
    const handleScroll = () => { 
      if(typeof window !== 'undefined') setShowBackToTop(window.scrollY > 300); 
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [view, selectedYear, lang]);

  // 5. Fetch GitHub Changelog
  useEffect(() => {
    const fetchChangelog = async () => {
      if (!GITHUB_REPO || GITHUB_REPO.includes("your-github-username")) return;
      setLoadingChangelog(true);
      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=5`);
        if (res.ok) {
          const data = await res.json();
          setChangelog(data);
        }
      } catch (err) {
        console.error("Failed to fetch changelog:", err);
      } finally {
        setLoadingChangelog(false);
      }
    };

    if (showChangelogModal && changelog.length === 0) {
      fetchChangelog();
    }
  }, [showChangelogModal, changelog.length]);

  // --- ACTIONS ---

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      let cred;
      if (isLoginMode) {
        cred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
      
      setShowAuthModal(false);
      
      if (cred && cred.user) {
        const docRef = doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'info');
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || !docSnap.data().umpireId) {
          const preLinkedUmpire = masterUmpires.find(u => u.linkedEmail && u.linkedEmail.toLowerCase() === authEmail.toLowerCase());
          if (preLinkedUmpire) {
            await setDoc(docRef, { name: preLinkedUmpire.name, umpireId: preLinkedUmpire.id }, { merge: true });
          } else {
            setShowNamePrompt(true);
          }
        }
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!authEmail) {
      setAuthError(lang === 'sv' ? 'Fyll i e-postadressen ovan först.' : 'Please enter your email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, authEmail);
      if (typeof window !== 'undefined') alert(lang === 'sv' ? 'Lösenordsåterställning skickad!' : 'Password reset email sent!');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({ 
      key, 
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' 
    }));
  };

  const updateProfile = async (name, id) => {
    if (!user || !user.email) return;
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { name, umpireId: id }, { merge: true });
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id), { linkedUserId: user.uid, linkedEmail: user.email }, { merge: true });
  };

  const logoutUmpire = async () => {
    await signOut(auth);
    try { await signInAnonymously(auth); } catch (e) { }
    setShowAdminModal(false);
    setView('schedule');
  };

  const toggleUmpireAdmin = async (uId) => {
    if (user?.email !== 'suecio@tryempire.com') return; 
    
    let updatedIds = [...(adminUmpireIds || [])];
    if (updatedIds.includes(uId)) {
      updatedIds = updatedIds.filter(id => id !== uId);
    } else {
      updatedIds.push(uId);
    }
    
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { adminUmpireIds: updatedIds }, { merge: true });
  };

  const addMasterUmpire = async (name, level = "") => {
    if (!name.trim()) return "";
    const exists = masterUmpires.find(u => (u.name || '').toLowerCase() === name.toLowerCase());
    if (exists) return exists.id;
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), { name, level });
    return docRef.id;
  };

  const updateMasterUmpire = async (id, newName, newLevel, newEmail) => {
    if (!isAdmin || !newName.trim()) return;
    const updateData = { name: newName, level: newLevel };
    if (newEmail !== undefined) {
      updateData.linkedEmail = newEmail.trim().toLowerCase();
    }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id), updateData, { merge: true });
  };

  const deleteMasterUmpire = async (id) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id));
  };

  const toggleApplication = async (gameId) => {
    if (!user || !user.email) { 
      setShowAuthModal(true); 
      return; 
    }
    if (!umpireId) { 
      setShowNamePrompt(true); 
      return; 
    }
    
    const appIdStr = `${gameId}_${umpireId}`;
    const existing = applications.find(a => a.id === appIdStr);
    
    if (existing) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr));
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr), { 
        gameId, 
        userId: umpireId, 
        userName, 
        timestamp: Date.now() 
      });
    }
  };

  const assignUmpire = async (gameId, uId, name) => {
    if (!isAdmin) return;
    const asgId = `${gameId}_${uId}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { 
      gameId, 
      userId: uId, 
      userName: name, 
      assignedAt: Date.now() 
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
          const gameData = { 
            date: columns[0].trim(), 
            time: columns[1].trim(), 
            league: columns[2].trim(), 
            away: columns[3].trim(), 
            home: columns[4].trim(), 
            location: (columns[5] || 'Unknown').trim(), 
            requiredUmpires: 2 
          };
          const gameId = `m-${gameData.date}-${gameData.time}-${gameData.away}-${gameData.home}`.replace(/\s+/g, '').replace(/:/g, '').toLowerCase();
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), gameData);
        }
      });
      
      await batch.commit();
      setBulkInput(''); 
      setShowImportTool(false);
      if (typeof window !== 'undefined') alert(t.importSuccess);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setSyncing(false); 
    }
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
    } catch (e) { 
      console.error(e); 
    }
  };

  const deleteAllGames = async () => {
    if (!isAdmin) return;
    if (typeof window !== 'undefined' && !window.confirm(t.deleteAllConfirm)) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      games.forEach(game => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)));
      assignments.forEach(asg => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${asg.gameId}_${asg.userId}`)));
      applications.forEach(app => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'applications', `${app.gameId}_${app.userId}`)));
      await batch.commit();
      if (typeof window !== 'undefined') alert(t.deleteAllSuccess);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setSyncing(false); 
    }
  };

  const generateICS = (gamesToExport) => {
    if (gamesToExport.length === 0 || typeof window === 'undefined') return;
    if (analytics) logEvent(analytics, 'calendar_bulk_export', { count: gamesToExport.length });
    
    const events = gamesToExport.map(game => {
      const cleanDate = (game.date || '').replace(/-/g, '');
      const cleanTime = (game.time || '00:00').replace(/:/g, '');
      const startTime = `${cleanDate}T${cleanTime}00`;
      const [hours, mins] = (game.time || '00:00').split(':');
      const endHours = (parseInt(hours || '0') + 3).toString().padStart(2, '0');
      const endTime = `${cleanDate}T${endHours}${mins || '00'}00`;
      
      return [
        'BEGIN:VEVENT',
        `UID:${game.id}@domartillsattning.portal`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${startTime}`,
        `DTEND:${endTime}`,
        `SUMMARY:${game.away || 'TBA'} @ ${game.home || 'TBA'} (${game.league || 'Unknown'})`,
        `DESCRIPTION:League: ${game.league || ''}\\nLocation: ${game.location || ''}`,
        `LOCATION:${game.location || ''}`,
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

  const handleDownloadBackup = () => {
    if (!isAdmin || typeof window === 'undefined') return;
    const backupData = {
      timestamp: new Date().toISOString(),
      year: selectedYear,
      appId: appId,
      collections: {
        games,
        applications,
        assignments,
        umpires: masterUmpires,
        adminUmpireIds
      }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `umpire-backup-${selectedYear}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (analytics) logEvent(analytics, 'download_backup', { year: selectedYear });
  };

  // --- DERIVED DATA ---

  const unconnectedEmails = useMemo(() => {
    const linked = masterUmpires.map(u => (u.linkedEmail || '').toLowerCase()).filter(Boolean);
    return registeredEmails.filter(email => !linked.includes(email.toLowerCase()));
  }, [registeredEmails, masterUmpires]);

  const calendarWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const shiftedFirstDay = firstDay === 0 ? 6 : firstDay - 1; 
    
    let currentWeek = [];
    const weeks = [];

    for (let i = 0; i < shiftedFirstDay; i++) currentWeek.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      currentWeek.push(new Date(year, month, d));
      if (currentWeek.length === 7) {
        const validDate = currentWeek.find(day => day !== null);
        weeks.push({ weekNumber: validDate ? getISOWeekNumber(validDate) : '-', days: currentWeek });
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      const validDate = currentWeek.find(day => day !== null);
      weeks.push({ weekNumber: validDate ? getISOWeekNumber(validDate) : '-', days: currentWeek });
    }

    return weeks;
  }, [currentDate]);

  const groupedAssignments = useMemo(() => {
    const map = {};
    assignments.forEach(asg => {
      if (!map[asg.gameId]) map[asg.gameId] = [];
      map[asg.gameId].push(asg);
    });
    return map;
  }, [assignments]);

  const sortedStatistics = useMemo(() => {
    const stats = {};
    assignments.forEach(asg => {
      if (!asg.userId) return;
      if (!stats[asg.userId]) stats[asg.userId] = { userId: asg.userId, name: asg.userName || 'Unknown', games: 0, interest: 0 };
      stats[asg.userId].games += 1;
    });
    applications.forEach(app => {
      if (!stats[app.userId]) return;
      if (!stats[app.userId]) stats[app.userId] = { userId: app.userId, name: app.userName || 'Unknown', games: 0, interest: 0 };
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
      const hName = (game.home || '').toLowerCase();
      const aName = (game.away || '').toLowerCase();
      const search = searchQuery.toLowerCase();
      
      const matchesSearch = hName.includes(search) || aName.includes(search);
      const matchesLeague = !filterLeague || game.league === filterLeague;
      const matchesLocation = !filterLocation || game.location === filterLocation;
      const isHistorical = (game.date || '') < today;
      
      return showHistory ? isHistorical && matchesSearch && matchesLeague && matchesLocation : !isHistorical && matchesSearch && matchesLeague && matchesLocation;
    });
  }, [games, searchQuery, filterLeague, filterLocation, showHistory, today]);

  const leagues = useMemo(() => [...new Set(games.map(g => g.league || 'Unknown'))], [games]);
  const locations = useMemo(() => [...new Set(games.map(g => g.location || 'Unknown'))], [games]);

  const uiDays = useMemo(() => {
    const arr = [...(t.days || [])];
    if (arr.length > 0) {
      const sunday = arr.shift();
      arr.push(sunday);
    }
    return arr;
  }, [t.days]);

  const sortedUmpireList = useMemo(() => {
    const levelOrder = { 'internationell': 1, 'elit': 2, 'nationell': 3, 'region': 4, 'förening': 5 };
    let umps = masterUmpires.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (umpireSort === 'level') {
      umps.sort((a, b) => {
        const orderA = levelOrder[(a.level || '').toLowerCase()] || 99;
        const orderB = levelOrder[(b.level || '').toLowerCase()] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });
    } else {
      umps.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return umps;
  }, [masterUmpires, searchQuery, umpireSort]);

  const filteredMasterUmpires = useMemo(() => {
    return masterUmpires.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  }, [masterUmpires, searchQuery]);

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

  // --- RENDER ---

  if (firebaseError === 'permission-denied') {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center font-sans">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-red-100 text-center">
           <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
           <h2 className="text-2xl font-black text-slate-800 mb-2">Databasåtkomst Nekad</h2>
           <p className="text-slate-600 mb-6 font-medium leading-relaxed">Applikationen kan inte hämta spelschemat eftersom Firebase-reglerna blockerar åtkomst. För att besökare ska kunna se schemat måste du tillåta publik läsning.</p>
           <div className="bg-slate-900 rounded-xl p-4 text-left overflow-x-auto mb-6 shadow-inner">
             <pre className="text-green-400 text-xs font-mono leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/{document=**} {
      allow read: if true; 
      allow write: if request.auth != null; 
    }
  }
}`}
             </pre>
           </div>
           <p className="text-sm text-slate-500 font-bold mb-4">1. Gå till Firebase Console &rarr; Firestore Database &rarr; Rules.</p>
           <p className="text-sm text-slate-500 font-bold">2. Klistra in koden ovan och klicka "Publish".</p>
         </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-blue-600">
        <RefreshCw className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-100">
      
      <header 
        onClick={() => { 
          setView('schedule'); 
          setScheduleViewMode('list'); 
          setSearchQuery(''); 
          setFilterLeague(''); 
          setFilterLocation(''); 
          setShowHistory(false); 
          scrollToTop(); 
        }} 
        className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-20 cursor-pointer group"
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-none gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="bg-white rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-blue-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold tracking-tight leading-none group-hover:text-blue-200 transition-colors truncate">{t.appTitle}</h1>
              <p className="text-[8px] sm:text-[10px] font-black uppercase text-blue-300 tracking-widest mt-1 truncate">{t.season} {selectedYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto flex-shrink-0">
            <div className="flex bg-blue-800 rounded-lg p-0.5">
              <button onClick={(e) => { e.stopPropagation(); setLang('sv'); }} className={`px-1.5 py-1 sm:px-2 text-[10px] sm:text-xs rounded-md transition-all ${lang === 'sv' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇸🇪</button>
              <button onClick={(e) => { e.stopPropagation(); setLang('en'); }} className={`px-1.5 py-1 sm:px-2 text-[10px] sm:text-xs rounded-md transition-all ${lang === 'en' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇬🇧</button>
            </div>
            <select 
              value={selectedYear} 
              onClick={(e) => e.stopPropagation()} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              className="bg-blue-800 text-[10px] font-black uppercase border-none rounded-lg px-1.5 py-1 sm:px-2 outline-none appearance-none cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (user && user.email) setShowAdminModal(true); 
                else setShowAuthModal(true); 
              }} 
              className="p-1.5 sm:p-2 hover:bg-blue-800 rounded-full transition-colors ml-0.5"
            >
              {user && user.email ? <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {[
            { id: 'schedule', label: t.schedule, icon: CalendarIcon },
            { id: 'umpire-list', label: t.umpireList, icon: Users2 },
            { id: 'my-apps', label: t.myGames, icon: CheckCircle },
            ...(isAdmin ? [
                { id: 'admin', label: t.staffing, icon: Shield }, 
                { id: 'stats', label: t.analytics, icon: BarChart3 }
              ] : [])
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setView(tab.id); scrollToTop(); }} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Global Filters */}
        {(view === 'schedule' || view === 'admin' || view === 'umpire-list') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              
              {(view === 'schedule' || view === 'admin') && (
                <>
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
                </>
              )}
            </div>
          </div>
        )}

        <section className="space-y-4">
          
          {/* VIEW: SCHEDULE */}
          {view === 'schedule' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {showHistory ? t.archived : t.activeSchedule}
                </h2>
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
                        {uiDays.map((d, i) => (
                          <div key={i} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, idx) => {
                          const dateStr = day ? toLocalISO(day) : null;
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
                                      <button 
                                        key={g.id} 
                                        onClick={() => { setSearchQuery(g.home || ''); setScheduleViewMode('list'); }} 
                                        className="w-full text-left p-1 rounded border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden"
                                      >
                                        <div className={`w-full h-1 rounded-full mb-1 ${getLeagueStyles(g.league).split(' ')[0]}`} />
                                        <p className="text-[8px] font-bold text-slate-700 truncate leading-none uppercase">{g.away || '-'} @ {g.home || '-'}</p>
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
                    const required = game.requiredUmpires || 2;
                    
                    return (
                      <div key={game.id} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all ${showHistory ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100 flex flex-col justify-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                              <p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league || '-'}</span>
                                <button onClick={() => handleCalendarExport(game)} className="text-slate-400 hover:text-blue-600 transition-colors" title={t.addToCalendar}>
                                  <CalendarPlus className="w-4 h-4" />
                                </button>
                              </div>
                              <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight">{game.away || '-'} @ {game.home || '-'}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time || '-'}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location || '-'}</span>
                              </div>
                              
                              {gameAssignments.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3 items-center">
                                  {gameAssignments.map(asg => {
                                      const m = masterUmpires.find(mu => mu.id === asg.userId);
                                      return (
                                        <div key={asg.userId} className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-green-100 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> {asg.userName || '-'} 
                                            {m?.level && <span className={`ml-1 px-1 rounded text-[8px] font-black border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                                        </div>
                                      );
                                  })}
                                </div>
                              )}
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
                                <button 
                                  onClick={() => toggleApplication(game.id)} 
                                  disabled={isAssignedToThisGame} 
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
                )
              )}
            </>
          )}

          {/* VIEW: UMPIRE LIST */}
          {view === 'umpire-list' && (
             <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.umpireList}</h2>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.sortBy}:</span>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                       <button 
                         onClick={() => setUmpireSort('level')} 
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${umpireSort === 'level' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                         {t.level}
                       </button>
                       <button 
                         onClick={() => setUmpireSort('name')} 
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${umpireSort === 'name' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                         {t.name}
                       </button>
                    </div>
                 </div>
               </div>
               
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {sortedUmpireList.map(u => (
                   <button 
                     key={u.id} 
                     onClick={() => { setSelectedProfileId(u.id); setView('umpire-profile'); scrollToTop(); }}
                     className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all active:scale-95 group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-blue-900 shadow-sm group-hover:bg-blue-900 group-hover:text-white transition-colors">
                         {(u.name || '?').charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">{u.name || '-'}</span>
                         {u.level && (
                           <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase w-max mt-1 ${getLevelStyles(u.level)}`}>
                             {u.level}
                           </span>
                         )}
                       </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </button>
                 ))}
                 {sortedUmpireList.length === 0 && (
                   <p className="col-span-full text-center py-12 text-slate-400 italic">{t.noGames}</p>
                 )}
               </div>
             </div>
          )}

          {/* VIEW: UMPIRE PROFILE */}
          {view === 'umpire-profile' && selectedProfileId && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {(() => {
                const profileUser = masterUmpires.find(u => u.id === selectedProfileId);
                if (!profileUser) return <div className="text-center p-8">{t.fetchError}</div>;
                
                const profileAsgs = assignments.filter(a => a.userId === selectedProfileId);
                const profileApps = applications.filter(a => a.userId === selectedProfileId);
                const profileGames = games.filter(g => profileAsgs.some(a => a.gameId === g.id)).sort((a,b) => (a.date || '').localeCompare(b.date || ''));
                
                return (
                  <>
                    <button 
                      onClick={() => { setView('umpire-list'); setSelectedProfileId(null); }} 
                      className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> {t.back}
                    </button>
                    
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-900/10 to-transparent" />
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-900 text-white flex items-center justify-center text-4xl font-black shadow-lg border-4 border-white z-10 shrink-0 mt-4 sm:mt-0">
                        {(profileUser.name || '?').charAt(0)}
                      </div>
                      <div className="relative z-10 flex-1 w-full">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{profileUser.name}</h2>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                          {profileUser.level && (
                            <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLevelStyles(profileUser.level)}`}>
                              {profileUser.level}
                            </span>
                          )}
                          {(adminUmpireIds || []).includes(profileUser.id) && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded border uppercase font-black flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center sm:items-start">
                            <span className="text-3xl font-black text-blue-600 leading-none">{profileAsgs.length}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.totalAssignments}</span>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center sm:items-start">
                            <span className="text-3xl font-black text-slate-700 leading-none">{profileApps.length}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.totalInterests}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> {t.assignedMatches}
                      </h3>
                      {profileGames.length === 0 ? (
                        <div className="bg-white p-8 rounded-3xl text-center border border-slate-200">
                          <p className="text-slate-400 font-medium text-sm">{t.noAssignedMatches}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profileGames.map(game => (
                            <div key={game.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
                              <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[65px] border border-slate-100 flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                                <p className="text-xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                              </div>
                              <div>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest mb-1 inline-block ${getLeagueStyles(game.league)}`}>{game.league || '-'}</span>
                                <p className="font-bold text-slate-900 text-sm leading-tight">{game.away || '-'} @ {game.home || '-'}</p>
                                <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {game.time || '-'}
                                  <MapPin className="w-3 h-3 ml-2" /> {game.location || '-'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* VIEW: ADMIN */}
          {view === 'admin' && (
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left"><h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2><p className="text-xs text-slate-500">{selectedYear} Season</p></div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={handleDownloadBackup} className="bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" /> {t.downloadBackup}
                    </button>
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

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Users2 className="w-4 h-4" /> {t.masterList}
                    </h3>
                    {user?.email === 'suecio@tryempire.com' && (
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
                            <input 
                              type="text" 
                              value={tempEditName} 
                              onChange={(e) => setTempEditName(e.target.value)} 
                              className="flex-1 min-w-[120px] bg-white border border-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold outline-none" 
                            />
                            <select 
                              value={tempEditLevel} 
                              onChange={(e) => setTempEditLevel(e.target.value)} 
                              className="w-32 bg-white border border-blue-300 px-2 py-1.5 rounded-lg text-sm font-bold outline-none"
                            >
                              <option value="">- {t.level} -</option>
                              {['Internationell', 'Elit', 'Nationell', 'Region', 'Förening'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            
                            {!showManualEmailInput ? (
                              <select 
                                value={tempEditEmail} 
                                onChange={(e) => {
                                  if (e.target.value === 'MANUAL_ENTRY') {
                                    setShowManualEmailInput(true);
                                    setTempEditEmail('');
                                  } else {
                                    setTempEditEmail(e.target.value);
                                  }
                                }}
                                className="flex-1 min-w-[150px] bg-white border border-blue-300 px-2 py-1.5 rounded-lg text-sm font-bold outline-none"
                              >
                                <option value="">{t.selectEmail}</option>
                                {unconnectedEmails.map(email => (
                                  <option key={email} value={email}>{email}</option>
                                ))}
                                {tempEditEmail && !unconnectedEmails.includes(tempEditEmail) && tempEditEmail !== 'MANUAL_ENTRY' && (
                                  <option value={tempEditEmail}>{tempEditEmail}</option>
                                )}
                                <option value="MANUAL_ENTRY">{t.otherEmail}</option>
                              </select>
                            ) : (
                              <div className="flex-1 flex items-center min-w-[150px] relative">
                                <input 
                                  type="email" 
                                  value={tempEditEmail} 
                                  onChange={(e) => setTempEditEmail(e.target.value)} 
                                  placeholder={t.linkEmailPlaceholder}
                                  className="w-full bg-white border border-blue-300 px-3 py-1.5 pr-8 rounded-lg text-sm font-bold outline-none" 
                                />
                                <button 
                                  onClick={() => { setShowManualEmailInput(false); setTempEditEmail(''); }} 
                                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <div className="flex gap-1 items-center">
                              <button 
                                onClick={async () => { await updateMasterUmpire(u.id, tempEditName, tempEditLevel, tempEditEmail); setEditingUmpireId(null); }} 
                                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditingUmpireId(null)} 
                                className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">{u.name || '-'}</span>
                                {u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}
                                {(adminUmpireIds || []).includes(u.id) && (
                                  <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-black ml-1 flex items-center gap-0.5">
                                    <Shield className="w-2 h-2" /> Admin
                                  </span>
                                )}
                              </div>
                              {u.linkedEmail ? (
                                <span className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> {t.linkedAccount} {u.linkedEmail}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                                  <Info className="w-3 h-3" /> {t.notLinked}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 items-start">
                              {user?.email === 'suecio@tryempire.com' && (
                                <button 
                                  onClick={() => toggleUmpireAdmin(u.id)} 
                                  className={`p-1.5 rounded-lg transition-colors ${(adminUmpireIds || []).includes(u.id) ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                                  title={(adminUmpireIds || []).includes(u.id) ? "Ta bort administratör" : "Gör till administratör"}
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => { 
                                  setEditingUmpireId(u.id); 
                                  setTempEditName(u.name || ''); 
                                  setTempEditLevel(u.level || ''); 
                                  setTempEditEmail(u.linkedEmail || ''); 
                                  setShowManualEmailInput(false);
                                }} 
                                className="p-1.5 text-slate-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteMasterUmpire(u.id)} 
                                className="p-1.5 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Staffing Desk Section */}
                <div className="space-y-4">
                  {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
                    const applicants = applications.filter(a => a.gameId === game.id);
                    const gameAssignments = groupedAssignments[game.id] || [];
                    const required = game.requiredUmpires || 2;
                    const isEditingThisGame = editingGameData?.id === game.id;
                    const isFullyStaffed = gameAssignments.length >= required;

                    return (
                      <div key={game.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isFullyStaffed && !isEditingThisGame ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league || '-'}</span>
                            <p className="text-xs font-bold text-slate-600">{game.away || '-'} @ {game.home || '-'} | {game.date || '-'}</p>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} {t.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => setEditingGameData(isEditingThisGame ? null : { ...game })} 
                              className={`p-2 transition-colors ${isEditingThisGame ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { if(typeof window !== 'undefined' && window.confirm(t.deleteConfirm)) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)); }} 
                              className="p-2 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {isEditingThisGame && (
                          <div className="p-4 bg-blue-50/30 border-b border-slate-100 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black uppercase text-slate-400">{t.requiredUmpires}</label>
                              <select 
                                value={editingGameData.requiredUmpires || 2} 
                                onChange={(e) => setEditingGameData({ ...editingGameData, requiredUmpires: parseInt(e.target.value) })} 
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                              >
                                {[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                            <div className="flex items-end gap-2">
                              <button onClick={saveEditedGame} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs uppercase">{t.save}</button>
                              <button onClick={() => setEditingGameData(null)} className="flex-1 bg-slate-200 text-slate-600 py-2 rounded-lg font-bold text-xs uppercase">{t.cancel}</button>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             {gameAssignments.map(asg => {
                               const m = masterUmpires.find(mu => mu.id === asg.userId);
                               return (
                                 <div key={asg.userId} className="flex items-center justify-between p-2 rounded-xl border border-green-100 bg-green-50/30">
                                   <div className="flex items-center gap-2">
                                     <Users2 className="w-3 h-3 text-green-600" />
                                     <button 
                                       onClick={() => { setSelectedProfileId(asg.userId); setView('umpire-profile'); scrollToTop(); }}
                                       className="text-xs font-bold text-slate-700 hover:text-blue-600 hover:underline text-left"
                                     >
                                       {asg.userName || '-'}
                                     </button>
                                     {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                                   </div>
                                   <button onClick={() => removeAssignment(game.id, asg.userId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                                     <UserMinus className="w-3.5 h-3.5" />
                                   </button>
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
                                        <span className="text-xs font-bold">{app.userName || '-'}</span>
                                        {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                                      </div>
                                      <button 
                                        disabled={isFullyStaffed} 
                                        onClick={() => assignUmpire(game.id, app.userId, app.userName)} 
                                        className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-50"
                                      >
                                        <UserPlus className="w-3 h-3" /> Assign
                                      </button>
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
          )}

          {/* VIEW: STATS */}
          {view === 'stats' && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase cursor-pointer">
                      <div className="flex items-center gap-1">
                        {t.umpire}
                        {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('interest')} className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase cursor-pointer">
                      <div className="flex items-center justify-center gap-1">
                        {t.interests}
                        {sortConfig.key === 'interest' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('games')} className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase cursor-pointer">
                      <div className="flex items-center justify-center gap-1">
                        {t.gamesAssigned}
                        {sortConfig.key === 'games' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('rate')} className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase cursor-pointer">
                      <div className="flex items-center justify-center gap-1">
                        {t.assignmentRate}
                        {sortConfig.key === 'rate' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStatistics.map(stat => (
                    <tr key={stat.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black uppercase">{(stat.name || '?').charAt(0)}</div>
                          <div className="flex flex-col">
                            <button 
                              onClick={() => { setSelectedProfileId(stat.userId); setView('umpire-profile'); scrollToTop(); }}
                              className="font-bold text-slate-700 text-left hover:text-blue-600 hover:underline"
                            >
                              {stat.name}
                            </button>
                            {masterUmpires.find(m => m.name === stat.name)?.level && (
                              <span className={`text-[8px] font-black px-1 rounded border uppercase w-max mt-0.5 ${getLevelStyles(masterUmpires.find(m => m.name === stat.name)?.level)}`}>
                                {masterUmpires.find(m => m.name === stat.name)?.level}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
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
            </div>
          )}

          {/* VIEW: MY GAMES */}
          {view === 'my-apps' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase">{t.mySchedule}</h2>
              {!user || !user.email ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-slate-500 font-medium mb-6">{t.loginRequiredMsg}</p>
                  <button onClick={() => setShowAuthModal(true)} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black uppercase text-xs shadow-lg hover:bg-blue-700 transition-colors">
                    {t.login}
                  </button>
                </div>
              ) : (
                <>
                  {myAssignedGames.map(game => (
                    <div key={game.id} className="bg-white p-4 rounded-2xl border border-green-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100 text-green-600"><CalendarIcon className="w-5 h-5" /></div>
                        <div>
                          <p className="font-bold text-slate-900">{game.away || '-'} @ {game.home || '-'}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">{game.date || '-'} @ {game.time || '-'}</p>
                        </div>
                      </div>
                      <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{t.confirmed}</div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">{t.interestedGames}</h3>
                    {myInterestedGames.map(game => (
                      <div key={game.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-slate-100 text-slate-400"><CalendarIcon className="w-5 h-5" /></div>
                          <div>
                            <p className="font-bold text-slate-900">{game.away || '-'} @ {game.home || '-'}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase">{game.date || '-'} @ {game.time || '-'}</p>
                          </div>
                        </div>
                        <button onClick={() => toggleApplication(game.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Floating Buttons */}
      {showBackToTop && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-6 right-6 bg-blue-900 text-white p-3 rounded-full shadow-2xl z-[70] hover:scale-110 active:scale-90 transition-all"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {user && user.email ? (
        umpireId ? (
          <button 
            onClick={() => setShowNamePrompt(true)} 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-50 border border-blue-800/50 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[11px] font-black uppercase shadow-inner">
                {(userName || '?').charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-blue-300 leading-none mb-0.5">{userName ? t.status : t.setProfile}</p>
                <span className="text-sm font-bold whitespace-nowrap leading-none">{userName || t.selectFromList}</span>
              </div>
            </div>
          </button>
        ) : (
          <button 
            onClick={() => setShowNamePrompt(true)} 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-blue-500 backdrop-blur-md animate-pulse"
          >
            <UserCheck className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">{t.saveName}</span>
          </button>
        )
      ) : (
        <button 
          onClick={() => setShowAuthModal(true)} 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-blue-800/50 backdrop-blur-md hover:bg-blue-800 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-sm font-black uppercase tracking-widest">{t.login}</span>
        </button>
      )}

      {/* Modals */}
      
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">{t.appTitle}</h3>
              <p className="text-xs text-slate-400 font-medium">{isLoginMode ? t.loginToContinue : t.createAnAccount}</p>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 break-words">
                  {authError}
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.email}</label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm mt-1" 
                  placeholder="namn@exempel.se" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.password}</label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm mt-1" 
                  placeholder="••••••••" 
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                {isLoginMode ? t.login : t.register}
              </button>
            </form>
            
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
              <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} 
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                {isLoginMode ? t.noAccount : t.hasAccount}
              </button>
              {isLoginMode && (
                <button 
                  onClick={handleResetPassword} 
                  type="button"
                  className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors mt-2"
                >
                  {t.forgotPassword}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showNamePrompt && (
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
                        onClick={async () => { setUserName(u.name || ''); setUmpireId(u.id); await updateProfile(u.name || '', u.id); setShowNamePrompt(false); setSearchQuery(''); }} 
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">{u.name || '-'}</span>
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
                      onClick={async () => { if (tempEditName.trim()) { const newId = await addMasterUmpire(tempEditName); setUserName(tempEditName); setUmpireId(newId); await updateProfile(tempEditName, newId); setTempEditName(''); setIsAddingNew(false); setShowNamePrompt(false); } }} 
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
      )}

      {showChangelogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-md w-full shadow-2xl animate-in zoom-in border border-white/20 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">{t.systemUpdates}</h3>
                <p className="text-xs text-slate-400 font-medium">Senaste ändringarna</p>
              </div>
            </div>
            
            <div className="space-y-4 min-h-[150px]">
              {loadingChangelog ? (
                <div className="py-8 flex justify-center"><RefreshCw className="animate-spin text-blue-500 w-6 h-6" /></div>
              ) : changelog.length > 0 ? (
                <div className="space-y-3">
                  {changelog.map((commitData) => {
                    const dateObj = new Date(commitData.commit.author.date);
                    const isValidDate = !isNaN(dateObj.getTime());
                    return (
                      <div key={commitData.sha} className="flex gap-4 items-start p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="mt-0.5 bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                          <GitCommit className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm mb-1">{commitData?.commit?.message || 'Update'}</p>
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>{isValidDate ? dateObj.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US') : '-'}</span>
                            <span>•</span>
                            <span>{commitData?.commit?.author?.name || 'Admin'}</span>
                          </div>
                        </div>
                        <a href={commitData.html_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline">
                          {commitData.sha.substring(0, 7)}
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  {GITHUB_REPO.includes("your-github-username") ? 
                    "Configure GITHUB_REPO constant to view updates." : 
                    t.fetchError}
                </div>
              )}
            </div>
            
            <button onClick={() => setShowChangelogModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
              {t.close}
            </button>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20 overflow-y-auto max-h-[90vh]">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">{user?.email}</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.displayName}</p>
                  <p className="text-sm font-bold text-slate-800">{userName || t.setProfile}</p>
                </div>
                <button onClick={logoutUmpire} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 font-black text-[10px] uppercase">
                  <LogOut className="w-4 h-4" /> {t.logout}
                </button>
              </div>
              
              {isAdmin && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-black text-blue-800 uppercase tracking-widest">{t.adminActive}</p>
                    <p className="text-[10px] text-blue-600 font-medium">Behörighet beviljad via e-post</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={() => { setShowAdminModal(false); setShowChangelogModal(true); }} 
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-colors border border-slate-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 group-hover:text-blue-700">{t.systemUpdates}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                </button>
              </div>
            </div>
            
            <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-sm">
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
