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
  signInWithCustomToken,
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
  History
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Updated ID for the 2026 season data
const appId = typeof __app_id !== 'undefined' ? __app_id : 'baseball-umpire-scheduler-2026';

// --- Latest 2026 Schedule Data (Excluding Softbollserien) ---
const FEDERATION_LATEST_DATA = [
  // Elitserien 2026
  { id: '26e1', date: '2026-05-09', time: '14:00', league: 'Elitserien', home: 'Stockholm Monarchs', away: 'Sundbyberg Heat', location: 'Skarpnäck' },
  { id: '26e2', date: '2026-05-10', time: '13:00', league: 'Elitserien', home: 'Rättvik', away: 'Leksand', location: 'Rättvik Park' },
  { id: '26e3', date: '2026-05-16', time: '14:00', league: 'Elitserien', home: 'Karlskoga Bats', away: 'Stockholm Monarchs', location: 'Nobelstadion' },
  { id: '26e4', date: '2026-05-23', time: '14:00', league: 'Elitserien', home: 'Sundbyberg Heat', away: 'Rättvik', location: 'Örvallen' },
  { id: '26e5', date: '2026-05-30', time: '14:00', league: 'Elitserien', home: 'Leksand', away: 'Karlskoga Bats', location: 'Leksand Park' },
  
  // Regionserien 2026
  { id: '26r1', date: '2026-06-06', time: '12:00', league: 'Regionserien', home: 'Gefle', away: 'Enköping', location: 'Gefle BSC' },
  { id: '26r2', date: '2026-06-13', time: '11:00', league: 'Regionserien', home: 'Skellefteå', away: 'Umeå', location: 'Skellefteå' },
  { id: '26r3', date: '2026-06-20', time: '14:00', league: 'Regionserien', home: 'Göteborg Sharks', away: 'Malmö Pilot', location: 'Shark Park' },
  
  // Juniorserien 2026
  { id: '26j1', date: '2026-08-15', time: '11:00', league: 'Juniorserien', home: 'Sundbyberg', away: 'Leksand', location: 'Örvallen' },
  { id: '26j2', date: '2026-08-22', time: '13:00', league: 'Juniorserien', home: 'Stockholm', away: 'Rättvik', location: 'Skarpnäck' },
];

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const gamesCol = collection(db, 'artifacts', appId, 'public', 'data', 'games');
    const unsubscribeGames = onSnapshot(gamesCol, (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList.sort((a, b) => new Date(a.date) - new Date(b.date)));
    }, (err) => console.error(err));

    const appsCol = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const unsubscribeApps = onSnapshot(appsCol, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error(err));

    const assignCol = collection(db, 'artifacts', appId, 'public', 'data', 'assignments');
    const unsubscribeAssign = onSnapshot(assignCol, (snapshot) => {
      const assignObj = {};
      snapshot.docs.forEach(doc => assignObj[doc.id] = doc.data());
      setAssignments(assignObj);
    }, (err) => console.error(err));

    const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    const unsubscribeProfile = onSnapshot(profileDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserName(data.name || '');
        setIsAdmin(data.isAdmin || false);
      }
    }, (err) => console.error(err));

    return () => {
      unsubscribeGames();
      unsubscribeApps();
      unsubscribeAssign();
      unsubscribeProfile();
    };
  }, [user]);

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

  const removeAssignment = async (gameId) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', gameId));
  };

  const syncSchedule = async () => {
    if (!isAdmin) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      const changesFound = [];

      for (const freshGame of FEDERATION_LATEST_DATA) {
        const existing = games.find(g => g.id === freshGame.id);
        
        if (existing) {
          const hasChanged = 
            existing.date !== freshGame.date || 
            existing.time !== freshGame.time || 
            existing.location !== freshGame.location;

          if (hasChanged) {
            changesFound.push(freshGame.id);
            batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', freshGame.id));
          }
        }
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', freshGame.id), freshGame);
      }

      await batch.commit();
      alert(changesFound.length > 0 ? `Sync Complete: ${changesFound.length} games updated.` : "Sync Complete: 2026 Schedule is up to date.");
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleAdminAuth = async () => {
    if (adminCode === 'admin123') {
      setIsAdmin(true);
      setShowAdminModal(false);
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: true }, { merge: true });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold tracking-tight">Baseball Umpire Portal 2026</h1>
          </div>
          <button onClick={() => setShowAdminModal(true)} className="p-2 hover:bg-blue-800 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          {[
            { id: 'schedule', label: '2026 Schedule', icon: Calendar },
            { id: 'my-apps', label: 'My Games', icon: CheckCircle },
            ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : [])
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
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
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Unified 2026 Season</h2>
                <span className="text-xs text-slate-400 font-bold uppercase">{games.length} Baseball Matches</span>
              </div>
              
              {games.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <RefreshCw className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No 2026 matches synced yet.</p>
                  {isAdmin && <button onClick={syncSchedule} className="mt-4 text-blue-600 font-black uppercase text-xs hover:underline">Sync 2026 Data Now</button>}
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
                            <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(game.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{new Date(game.date).getDate()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${game.league === 'Elitserien' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                {game.league}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 mt-1 text-base">{game.home} vs {game.away}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                          {assigned ? (
                            <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-100">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase">{assigned.userName.charAt(0)}</div>
                              <span className="text-xs font-bold text-green-700">{assigned.userName}</span>
                            </div>
                          ) : (
                            <>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} Applied</div>
                              <button 
                                onClick={() => toggleApplication(game.id)}
                                disabled={!userName}
                                className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg active:scale-95 disabled:opacity-30'}`}
                              >
                                {isApplied ? 'Withdraw' : 'Apply'}
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
                <div>
                  <h2 className="text-xl font-black text-slate-800">Admin Dashboard</h2>
                  <p className="text-sm text-slate-500">Sync latest 2026 data and manage staffing.</p>
                </div>
                <button 
                  disabled={syncing}
                  onClick={syncSchedule}
                  className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync 2026 Federation Data'}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Pending Staffing</h3>
                {games.filter(g => !assignments[g.id]).map(game => {
                  const applicants = applications.filter(a => a.gameId === game.id);
                  return (
                    <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-600">
                          <span className="text-blue-600">{game.league}</span> • {game.home} vs {game.away} • {game.date}
                        </div>
                        <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase">Open</span>
                      </div>
                      <div className="p-4">
                        {applicants.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No applications yet...</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {applicants.map(app => (
                              <div key={app.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-300 transition-all">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black">{app.userName.charAt(0)}</div>
                                  <span className="text-xs font-bold">{app.userName}</span>
                                </div>
                                <button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Assign</button>
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

          {view === 'my-apps' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">My Appointments</h2>
              {applications.filter(a => a.userId === user?.uid).length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">You haven't applied for any matches yet.</p>
                </div>
              ) : (
                applications.filter(a => a.userId === user?.uid).map(app => {
                  const game = games.find(g => g.id === app.gameId);
                  if (!game) return null;
                  const isAssigned = assignments[game.id]?.userId === user?.uid;
                  return (
                    <div key={app.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex items-center justify-between ${isAssigned ? 'border-green-200 bg-green-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${isAssigned ? 'bg-green-100' : 'bg-slate-100'}`}>
                          <Calendar className={`w-5 h-5 ${isAssigned ? 'text-green-600' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{game.home} vs {game.away}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{game.date} @ {game.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAssigned && (
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Confirmed
                          </div>
                        )}
                        <button onClick={() => toggleApplication(game.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
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

      {/* Profile/Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden p-8 space-y-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">My Profile</h3>
              <p className="text-sm text-slate-500">Manage your identity and app permissions.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={userName}
                    placeholder="Enter full name"
                    onChange={(e) => setUserName(e.target.value)}
                    onBlur={() => updateProfile(userName)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                  />
                </div>
              </div>

              {!isAdmin ? (
                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Admin Access</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      placeholder="Access Code"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm"
                    />
                    <button onClick={handleAdminAuth} className="bg-slate-800 text-white px-5 py-3.5 rounded-2xl font-black text-xs uppercase hover:bg-black transition-all">Verify</button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">* admin123</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-700 uppercase">Admin Mode Active</span>
                  <button 
                    onClick={async () => {
                      setIsAdmin(false);
                      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { isAdmin: false }, { merge: true });
                    }}
                    className="text-[10px] font-black text-red-500 uppercase hover:underline"
                  >
                    Logout Admin
                  </button>
                </div>
              )}
            </div>
            
            <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 uppercase text-xs tracking-widest transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Sticky User Summary */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white text-blue-900 rounded-full flex items-center justify-center text-[10px] font-black uppercase">
            {userName ? userName.charAt(0) : '?'}
          </div>
          <span className="text-xs font-bold whitespace-nowrap">{userName || 'Set Name'}</span>
        </div>
        <div className="h-4 w-px bg-blue-700" />
        <div className="text-[10px] font-black uppercase text-blue-300">
          {user && applications.filter(a => a.userId === user.uid).length} Applied
        </div>
      </div>
    </div>
  );
}
