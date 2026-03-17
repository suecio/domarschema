import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Users, 
  Save,
  AlertCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';

/**
 * KONFIGURATION
 * Denna del hanterar både förhandsgranskningsmiljön och din skarpa miljö på Cloudflare.
 */
let firebaseConfig = {};
let appId = 'umpire-app-default';

try {
  // Försök hämta från Vite-miljövariabler (Cloudflare/GitHub)
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  if (env.VITE_FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(env.VITE_FIREBASE_CONFIG);
    appId = env.VITE_APP_ID || 'umpire-app-default';
  } else {
    // Fallback till lokala globala variabler i denna miljö
    firebaseConfig = JSON.parse(__firebase_config);
    appId = typeof __app_id !== 'undefined' ? __app_id : 'umpire-app-default';
  }
} catch (e) {
  console.error("Konfigurationsfel:", e);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Uppdaterat spelschema baserat på Elitserien 2026
const initialMatches = [
  { id: '2026-01', date: '2026-05-02', time: '12:00', home: 'Stockholm BSK', away: 'Leksand BSK', venue: 'Skarpnäck', assignments: { plate: null, base1: null, base2: null } },
  { id: '2026-02', date: '2026-05-02', time: '15:30', home: 'Stockholm BSK', away: 'Leksand BSK', venue: 'Skarpnäck', assignments: { plate: null, base1: null, base2: null } },
  { id: '2026-03', date: '2026-05-03', time: '13:00', home: 'Sundbyberg Heat', away: 'Rättvik BSK', venue: 'Örvallen', assignments: { plate: null, base1: null, base2: null } },
  { id: '2026-04', date: '2026-05-09', time: '12:00', home: 'Leksand BSK', away: 'Sundbyberg Heat', venue: 'Siljansvallen', assignments: { plate: null, base1: null, base2: null } },
  { id: '2026-05', date: '2026-05-09', time: '15:30', home: 'Leksand BSK', away: 'Sundbyberg Heat', venue: 'Siljansvallen', assignments: { plate: null, base1: null, base2: null } },
  { id: '2026-06', date: '2026-05-10', time: '13:00', home: 'Rättvik BSK', away: 'Karlskoga Bats', venue: 'Rättviks Basebollplan', assignments: { plate: null, base1: null, base2: null } },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [tempName, setTempName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [matches, setMatches] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Autentisering misslyckades:", err);
        setErrorMsg("Kunde inte logga in. Kontrollera nätverket.");
      }
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

    const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    getDoc(userRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.name || '');
        setTempName(data.name || '');
      }
    });

    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');
    const availRef = collection(db, 'artifacts', appId, 'public', 'data', 'availability');

    const unsubMatches = onSnapshot(matchesRef, (snapshot) => {
      const matchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (matchData.length === 0) {
        initialMatches.forEach(async (m) => {
          try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'matches', m.id), m);
          } catch (e) { console.warn("Kunde inte lägga till match:", m.id); }
        });
      } else {
        setMatches(matchData.sort((a, b) => a.date.localeCompare(b.date)));
      }
    }, (err) => {
      console.error("Matchfel:", err);
      setErrorMsg("Kunde inte hämta spelschemat.");
    });

    const unsubAvail = onSnapshot(availRef, (snapshot) => {
      const availData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailability(availData);
    });

    return () => {
      unsubMatches();
      unsubAvail();
    };
  }, [user]);

  const saveProfile = async () => {
    if (!user || !tempName.trim()) return;
    try {
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      await setDoc(userRef, { name: tempName });
      setUserName(tempName);
      setActiveTab('schedule');
    } catch (err) {
      setErrorMsg("Kunde inte spara profil.");
    }
  };

  const toggleAvailability = async (matchId) => {
    if (!user) return;
    if (!userName) {
      setActiveTab('profile');
      setErrorMsg("Vänligen ange ditt namn i profilen först.");
      return;
    }

    const availId = `${matchId}_${user.uid}`;
    const existing = availability.find(a => a.id === availId);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'availability', availId);
    
    try {
      if (existing) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          matchId,
          userId: user.uid,
          userName: userName,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      setErrorMsg("Kunde inte uppdatera anmälan.");
    }
  };

  const assignUmpire = async (matchId, role, name) => {
    if (!isAdmin || !user) return;
    try {
      const matchRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId);
      await updateDoc(matchRef, {
        [`assignments.${role}`]: name || null
      });
    } catch (err) {
      setErrorMsg("Kunde inte spara tillsättningen.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-xl sticky top-0 z-30 border-b border-blue-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-inner">
              <ShieldCheck className="text-blue-800" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tight uppercase leading-none">UmpireHub</h1>
              <p className="text-[9px] font-bold text-blue-300 tracking-widest uppercase mt-1">Svensk Baseboll • 2026</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-lg ${isAdmin ? 'bg-amber-400 text-amber-950 scale-105' : 'bg-blue-700 text-blue-100 border border-blue-600'}`}
          >
            {isAdmin ? 'ADMIN AKTIV' : 'GÅ TILL ADMIN'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-6 flex justify-between items-center border-2 border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2 text-sm font-bold"><AlertCircle size={18}/> {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-[10px] font-black uppercase hover:underline tracking-tighter">Stäng</button>
          </div>
        )}

        {!userName && activeTab !== 'profile' && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-[2rem] mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-500">
            <div className="text-center md:text-left">
              <h3 className="font-black text-xl leading-none mb-2 uppercase italic tracking-tighter">Välkommen till säsongen 2026!</h3>
              <p className="text-blue-100 text-sm font-medium opacity-90">Innan du kan anmäla dig till matcher behöver vi veta vem du är.</p>
            </div>
            <button 
              onClick={() => setActiveTab('profile')} 
              className="bg-white text-blue-700 px-8 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-blue-50 transition-all uppercase tracking-widest whitespace-nowrap"
            >
              STÄLL IN NAMN
            </button>
          </div>
        )}

        {/* Tab Nav */}
        <nav className="flex gap-1 mb-10 bg-slate-200/60 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200/50 shadow-inner">
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'schedule' ? 'bg-white shadow-md text-blue-800 scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Spelschema
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'admin' ? 'bg-white shadow-md text-amber-700 scale-[1.02]' : 'text-slate-500 hover:text-amber-800'}`}
            >
              Admin
            </button>
          )}
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'profile' ? 'bg-white shadow-md text-blue-800 scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Min Profil
          </button>
        </nav>

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter flex items-center gap-2">
                <Calendar className="text-blue-600" size={28} />
                Matchlista
              </h2>
            </div>
            {matches.map(match => {
              const myAvail = availability.find(a => a.matchId === match.id && a.userId === user?.uid);
              const signups = availability.filter(a => a.matchId === match.id);
              return (
                <div key={match.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-blue-300 group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="bg-blue-50 text-blue-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 shadow-sm">
                        <Clock size={14}/> {match.date} • {match.time}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 px-1">
                        <MapPin size={12}/> {match.venue}
                      </div>
                    </div>
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">#{match.id}</div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{match.home}</h3>
                      <div className="h-1 bg-slate-100 w-16 my-4 mx-auto md:mx-0 rounded-full"></div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{match.away}</h3>
                    </div>
                    
                    <button 
                      onClick={() => toggleAvailability(match.id)}
                      className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                        myAvail 
                          ? 'bg-green-500 text-white shadow-green-200 ring-4 ring-green-50' 
                          : 'bg-blue-700 text-white shadow-blue-200 hover:bg-blue-800 ring-4 ring-transparent hover:ring-blue-50'
                      }`}
                    >
                      {myAvail ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle size={20} /> Anmäld
                        </span>
                      ) : 'Anmäl Intresse'}
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-50 pt-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {signups.slice(0, 3).map((s, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-black text-blue-600 shadow-sm uppercase" title={s.userName}>
                            {s.userName[0]}
                          </div>
                        ))}
                        {signups.length > 3 && (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                            +{signups.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{signups.length} anmälningar</span>
                    </div>
                    
                    <div className="ml-auto flex gap-2">
                      {[
                        { id: 'plate', label: 'H' },
                        { id: 'base1', label: 'B1' },
                        { id: 'base2', label: 'B2' }
                      ].map(role => (
                        <div key={role.id} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${
                          match.assignments[role.id] 
                            ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' 
                            : 'bg-slate-50 text-slate-300 border-transparent'
                        }`}>
                          <span className="opacity-40 mr-1.5 uppercase tracking-widest">{role.label}:</span>
                          {match.assignments[role.id] || 'Vakant'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2 text-amber-700">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <ShieldCheck size={28} />
                Tillsättning
              </h2>
            </div>
            {matches.map(match => {
              const signups = availability.filter(a => a.matchId === match.id);
              return (
                <div key={match.id} className="bg-white rounded-[2.5rem] p-8 border-l-[12px] border-l-amber-500 border border-slate-200 shadow-xl">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 uppercase italic tracking-tighter">{match.home} vs {match.away}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{match.date} • {match.venue}</p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-5 py-2 rounded-2xl text-xs font-black shadow-sm">
                      {signups.length} SÖKANDE
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'plate', label: 'Huvuddomare' },
                      { id: 'base1', label: 'Bas 1' },
                      { id: 'base2', label: 'Bas 2' }
                    ].map(role => (
                      <div key={role.id} className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5 ml-2 tracking-widest">
                          <User size={12} className="text-amber-500"/> {role.label}
                        </label>
                        <div className="relative">
                          <select 
                            value={match.assignments[role.id] || ''}
                            onChange={(e) => assignUmpire(match.id, role.id, e.target.value)}
                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-amber-500 outline-none appearance-none transition-all shadow-inner cursor-pointer"
                          >
                            <option value="">VÄLJ...</option>
                            {signups.map(s => <option key={s.id} value={s.userName}>{s.userName}</option>)}
                            <option value="EXTERN">EXTERN DOMARE</option>
                            <option value="">RENSA VAKANT</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                             <RefreshCw size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden mt-10 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-12 text-center text-white">
              <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/30 backdrop-blur-md shadow-2xl">
                <User size={56} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Din Profil</h2>
              <p className="text-blue-200 text-[10px] font-black mt-2 tracking-[0.3em] opacity-80 uppercase">Officiella uppgifter</p>
            </div>
            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">För- och Efternamn</label>
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-xl shadow-inner focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Karl Karlsson"
                />
              </div>
              <button 
                onClick={saveProfile} 
                disabled={!tempName.trim() || tempName === userName}
                className="w-full bg-blue-700 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-200 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-3 hover:bg-blue-800"
              >
                <Save size={20}/> SPARA PROFIL
              </button>
              <div className="pt-6 border-t border-slate-50 text-center">
                <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest font-bold">Användar-ID: {user?.uid}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-200 p-5 flex justify-around shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-40 md:rounded-t-[3rem]">
        <button 
          onClick={() => setActiveTab('schedule')} 
          className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'schedule' ? 'text-blue-700 scale-110' : 'text-slate-400 hover:text-blue-600'}`}
        >
          <Calendar size={24} className={activeTab === 'schedule' ? 'fill-blue-50' : ''}/>
          <span className="text-[9px] font-black uppercase tracking-widest">Schema</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'profile' ? 'text-blue-700 scale-110' : 'text-slate-400 hover:text-blue-600'}`}
        >
          <User size={24} className={activeTab === 'profile' ? 'fill-blue-50' : ''}/>
          <span className="text-[9px] font-black uppercase tracking-widest">Profil</span>
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')} 
            className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'admin' ? 'text-amber-600 scale-110' : 'text-slate-400 hover:text-amber-600'}`}
          >
            <ShieldCheck size={24} className={activeTab === 'admin' ? 'fill-amber-50' : ''}/>
            <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
          </button>
        )}
      </div>
    </div>
  );
}
