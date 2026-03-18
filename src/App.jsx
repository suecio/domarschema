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
  Plus
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

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Application identifier for 2026 season partitioning
const appId = 'baseball-umpire-scheduler-2026';

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('schedule');
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  // New state for manual import
  const [bulkInput, setBulkInput] = useState('');
  const [showImportTool, setShowImportTool] = useState(false);

  // 1. Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { 
        console.error("Authentication Error:", err); 
      }
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

    // Listen for Game Schedule
    const gamesCol = collection(db, 'artifacts', appId, 'public', 'data', 'games');
    const unsubscribeGames = onSnapshot(gamesCol, (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }, (err) => {
      console.error("Firestore Games Error:", err);
    });

    // Listen for Applications
    const appsCol = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const unsubscribeApps = onSnapshot(appsCol, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen for Assignments
    const assignCol = collection(db, 'artifacts', appId, 'public', 'data', 'assignments');
    const unsubscribeAssign = onSnapshot(assignCol, (snapshot) => {
      const assignObj = {};
      snapshot.docs.forEach(doc => assignObj[doc.id] = doc.data());
      setAssignments(assignObj);
    });

    // Listen for Profile
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
  }, [user]);

  // --- Core Actions ---

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
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', gameId), {
      userId, userName: name, assignedAt: Date.now()
    });
  };

  const deleteGame = async (gameId) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId));
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', gameId));
  };

  /**
   * Manual Bulk Import Logic
   * Parses pasted text from a Google Sheet
   */
  const handleBulkImport = async () => {
    if (!isAdmin || !bulkInput.trim()) return;
    setSyncing(true);
    
    try {
      const batch = writeBatch(db);
      const rows = bulkInput.trim().split('\n');
      let count = 0;

      rows.forEach((row, index) => {
        // Splitting by Tab (typical for Sheets copy-paste) or comma
        const columns = row.split(/\t|,/);
        
        // Expected format: Date, Time, League, Home, Away, Location
        if (columns.length >= 5) {
          const gameData = {
            date: columns[0].trim(),
            time: columns[1].trim(),
            league: columns[2].trim(),
            home: columns[3].trim(),
            away: columns[4].trim(),
            location: (columns[5] || 'Unknown').trim(),
          };

          // Generate a stable ID based on teams and date to prevent duplicates
          const gameId = `manual-${gameData.date}-${gameData.home.replace(/\s+/g, '')}-${gameData.away.replace(/\s+/g, '')}`.toLowerCase();
          
          const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId);
          batch.set(gameRef, gameData);
          count++;
        }
      });

      await batch.commit();
      alert(`Import Successful: ${count} games added/updated.`);
      setBulkInput('');
      setShowImportTool(false);
    } catch (e) {
      console.error("Import Failed:", e);
      alert("Import Failed: Check your data format. (Date, Time, League, Home, Away, Location)");
    } finally {
      setSyncing(false);
    }
  };

  const handleAdminAuth = async () => {
    if (adminCode === 'admin123' && user) {
      setIsAdmin(true);
      setShowAdminModal(false);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: true }, { merge: true });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-blue-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-100">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Elitserien 2026 Portal</h1>
          </div>
          <button 
            onClick={() => setShowAdminModal(true)} 
            className="p-2 hover:bg-blue-800 rounded-full transition-colors flex items-center justify-center"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {[
            { id: 'schedule', label: 'Match Schedule', icon: Calendar },
            { id: 'my-apps', label: 'My Games', icon: CheckCircle },
            ...(isAdmin ? [{ id: 'admin', label: 'Admin Desk', icon: Shield }] : [])
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setView(tab.id)} 
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {view === 'schedule' && (
            <>
              <div className="flex justify-between items-end pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Season 2026</h2>
                <span className="text-xs text-slate-400 font-bold uppercase">{games.length} Fixtures</span>
              </div>
              
              {games.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <RefreshCw className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">The schedule is currently empty.</p>
                  {isAdmin && (
                    <p className="text-sm text-slate-400 mt-2">Go to the Admin Desk to import games from your Google Sheet.</p>
                  )}
                </div>
              ) : (
                games.map(game => {
                  const isApplied = user && applications.some(a => a.gameId === game.id && a.userId === user.uid);
                  const assigned = assignments[game.id];
                  const appsCount = applications.filter(a => a.gameId === game.id).length;
                  
                  return (
                    <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100 group-hover:bg-blue-50 transition-colors">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{game.date.includes('-') ? new Date(game.date).toLocaleDateString('en-US', { month: 'short' }) : 'Date'}</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{game.date.includes('-') ? new Date(game.date).getDate() : '??'}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-blue-100 text-blue-700">
                                {game.league}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight">{game.home} vs {game.away}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                          {assigned ? (
                            <div className="bg-green-50 px-4 py-2 rounded-full flex items-center gap-2 border border-green-100">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase">
                                {assigned.userName.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-green-700">{assigned.userName}</span>
                            </div>
                          ) : (
                            <>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} Applicants</div>
                              <button 
                                onClick={() => toggleApplication(game.id)} 
                                disabled={!userName} 
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all duration-200 ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 disabled:opacity-30'}`}
                              >
                                {isApplied ? 'Withdraw' : 'Interested'}
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
                  <h2 className="text-xl font-black text-slate-800">Admin Desk</h2>
                  <p className="text-xs text-slate-500">Manage staffing and import games from Google Sheets.</p>
                </div>
                <button 
                  onClick={() => setShowImportTool(!showImportTool)}
                  className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                  <Plus className="w-4 h-4" /> Bulk Import Games
                </button>
              </div>

              {/* Import UI */}
              {showImportTool && (
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-2 mb-3 text-blue-800">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-bold">Paste from Google Sheets</h3>
                  </div>
                  <p className="text-xs text-blue-600 mb-4 leading-relaxed">
                    Manage your games in a Google Sheet. Copy the rows (don't include headers) and paste them here. 
                    Format: <strong>Date | Time | League | Home | Away | Location</strong> (Tab separated).
                  </p>
                  <textarea 
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="2026-05-09	14:00	Elitserien	Monarchs	Heat	Skarpnäck"
                    className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs focus:ring-4 focus:ring-blue-500/10 outline-none"
                  />
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={handleBulkImport}
                      disabled={syncing || !bulkInput.trim()}
                      className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-800 transition-all disabled:opacity-50"
                    >
                      {syncing ? 'Processing...' : 'Add Games to Database'}
                    </button>
                    <button 
                      onClick={() => setShowImportTool(false)}
                      className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-black uppercase text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center pl-2">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Assignments</h3>
                </div>
                {games.filter(g => !assignments[g.id]).length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-12 bg-white rounded-2xl border border-slate-100">All games currently in the schedule are assigned.</p>
                ) : (
                  games.filter(g => !assignments[g.id]).map(game => {
                    const applicants = applications.filter(a => a.gameId === game.id);
                    return (
                      <div key={game.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-slate-600">{game.home} vs {game.away} <span className="text-slate-300 mx-1">|</span> {game.date}</p>
                          </div>
                          <button onClick={() => deleteGame(game.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          {applicants.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Waiting for interested umpires...</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {applicants.map(app => (
                                <div key={app.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 transition-all bg-white shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black">{app.userName.charAt(0)}</div>
                                    <span className="text-xs font-bold">{app.userName}</span>
                                  </div>
                                  <button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Assign</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {view === 'my-apps' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">My Schedule</h2>
              {applications.filter(a => a.userId === user?.uid).length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">You haven't marked interest in any games yet.</p>
                </div>
              ) : (
                applications.filter(a => a.userId === user?.uid).map(app => {
                  const game = games.find(g => g.id === app.gameId);
                  if (!game) return null;
                  const isAssigned = assignments[game.id]?.userId === user?.uid;
                  return (
                    <div key={app.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex items-center justify-between ${isAssigned ? 'border-green-200 bg-green-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isAssigned ? 'bg-green-100' : 'bg-slate-100'}`}>
                          <Calendar className={`w-5 h-5 ${isAssigned ? 'text-green-600' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight text-base">{game.home} vs {game.away}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{game.date} @ {game.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAssigned && (
                          <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                          </div>
                        )}
                        <button onClick={() => toggleApplication(game.id)} className="text-slate-300 hover:text-red-500 p-2.5 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
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
          <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">User Settings</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Configure your profile & access</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                <input 
                  type="text" 
                  value={userName} 
                  placeholder="e.g. Johan Andersson" 
                  onChange={(e) => setUserName(e.target.value)} 
                  onBlur={() => updateProfile(userName)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                />
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Admin Verification</label>
                {!isAdmin ? (
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="password" 
                      placeholder="Enter Access Code" 
                      value={adminCode} 
                      onChange={(e) => setAdminCode(e.target.value)} 
                      className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" 
                    />
                    <button 
                      onClick={handleAdminAuth} 
                      className="bg-slate-800 text-white px-5 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center mt-2">
                    <p className="text-blue-700 font-black text-xs uppercase flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" /> Admin Authenticated
                    </p>
                    <button 
                      onClick={async () => {
                        setIsAdmin(false);
                        if (user && db) {
                          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: false }, { merge: true });
                        }
                      }}
                      className="text-[10px] font-black text-red-500 uppercase hover:underline mt-2.5 block w-full text-center"
                    >
                      Disable Admin Mode
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowAdminModal(false)} 
              className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors shadow-sm"
            >
              Return to App
            </button>
          </div>
        </div>
      )}

      {/* Floating Status Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-40 border border-blue-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[11px] font-black uppercase shadow-inner">
            {userName ? userName.charAt(0) : '?'}
          </div>
          <span className="text-sm font-bold whitespace-nowrap">{userName || 'Set Profile Name'}</span>
        </div>
        <div className="h-4 w-px bg-blue-700" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-blue-300 leading-none">Status</span>
          <span className="text-[11px] font-bold leading-none mt-0.5">
            {user && applications.filter(a => a.userId === user.uid).length} Applied
          </span>
        </div>
      </div>
    </div>
  );
}
