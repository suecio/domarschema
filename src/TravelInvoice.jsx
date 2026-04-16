import React, { useState, useEffect, useMemo } from 'react';
import { collection, doc, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { 
  Calculator, Send, Printer, Car, FileText, User, 
  CreditCard, CheckCircle, Plus, Trash2, MapPin, Navigation, RefreshCw, X
} from 'lucide-react';

export default function TravelInvoice({ db, appId, locationsData, user, userName, t, myAssignedGames }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calculatingIndex, setCalculatingIndex] = useState(null);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: '', pnr: '', address: '', zipCity: '', bank: '', email: ''
  });

  const [trips, setTrips] = useState([
    { id: Date.now(), date: '', assignment: '', from: '', to: '', distance: '', roundTrip: true }
  ]);

  const [expenses, setExpenses] = useState([
    { id: Date.now(), description: '', amount: '' }
  ]);

  const [advance, setAdvance] = useState('');
  const [overnightCount, setOvernightCount] = useState('');

  // Ladda sparad profildata för reseräkningen
  useEffect(() => {
    if (user && user.uid) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'invoiceData');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPersonalInfo(prev => ({ ...prev, ...docSnap.data(), email: user?.email || prev.email || '' }));
          } else if (userName) {
            setPersonalInfo(prev => ({ ...prev, name: userName, email: user?.email || '' }));
          }
        } catch(e) {}
      };
      fetchProfile();
    } else if (userName) {
       setPersonalInfo(prev => ({ ...prev, name: userName, email: user?.email || '' }));
    }
  }, [user, appId, userName, db]);

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleTripChange = (id, field, value) => {
    setTrips(trips.map(trip => trip.id === id ? { ...trip, [field]: value } : trip));
  };

  const addTrip = () => {
    setTrips([...trips, { id: Date.now(), date: '', assignment: '', from: '', to: '', distance: '', roundTrip: true }]);
  };

  const removeTrip = (id) => {
    if (trips.length > 1) setTrips(trips.filter(trip => trip.id !== id));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const addExpense = () => {
    setExpenses([...expenses, { id: Date.now(), description: '', amount: '' }]);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  // --- Auto Calculate Distance (OpenStreetMap/OSRM) ---
  const calculateDistance = async (index) => {
    const trip = trips[index];
    if (!trip.from || !trip.to) {
      alert("Fyll i både 'Från' och 'Till' för att kunna beräkna avståndet automatiskt.");
      return;
    }

    setCalculatingIndex(index);
    try {
      const resolveAddress = (input) => {
        // Special case: Home address
        if (input.toLowerCase() === t.homeLocation.toLowerCase() || input.toLowerCase() === 'hem' || input.toLowerCase() === 'home') {
          return `${personalInfo.address}, ${personalInfo.zipCity}`;
        }
        // Lookup in locations
        const found = locationsData.find(l => l.id.toLowerCase() === input.toLowerCase());
        return found && found.address ? found.address : input;
      };

      const fromAddress = resolveAddress(trip.from);
      const toAddress = resolveAddress(trip.to);

      if(!fromAddress || !toAddress || fromAddress === ', ' || toAddress === ', ') {
         throw new Error("Gatuadress och postort saknas för automatisk sökning.");
      }

      const fromRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddress + ', Sweden')}`);
      const fromData = await fromRes.json();
      
      const toRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddress + ', Sweden')}`);
      const toData = await toRes.json();

      if (fromData.length === 0 || toData.length === 0) {
        throw new Error("Kunde inte hitta exakta koordinater för angivna platser.");
      }

      const lon1 = fromData[0].lon; const lat1 = fromData[0].lat;
      const lon2 = toData[0].lon; const lat2 = toData[0].lat;

      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
      const routeData = await routeRes.json();

      if (routeData.routes && routeData.routes.length > 0) {
        const distanceMeters = routeData.routes[0].distance;
        let mil = distanceMeters / 10000; 
        if (trip.roundTrip) mil *= 2;
        
        handleTripChange(trip.id, 'distance', mil.toFixed(1));
      } else {
         throw new Error("Kunde inte hitta en giltig körrutt.");
      }
    } catch (err) {
      console.error(err);
      alert("Automatisk beräkning misslyckades. Vänligen skriv in avståndet manuellt.");
    } finally {
      setCalculatingIndex(null);
    }
  };

  const calculated = useMemo(() => {
    let totalMilage = 0;
    let travelBonus = 0;

    trips.forEach(trip => {
      const dist = parseFloat(trip.distance) || 0;
      totalMilage += dist;
      if (dist >= 20) travelBonus += 200;
      else if (dist >= 10) travelBonus += 100;
    });

    const milageCost = totalMilage * 25; 
    const overnightCost = (parseInt(overnightCount) || 0) * 150;
    
    let totalExpenses = 0;
    expenses.forEach(exp => { totalExpenses += (parseFloat(exp.amount) || 0); });

    const advanceNum = parseFloat(advance) || 0;
    const total = (milageCost + travelBonus + overnightCost + totalExpenses) - advanceNum;

    return { totalMilage, milageCost, travelBonus, overnightCost, totalExpenses, advance: advanceNum, total };
  }, [trips, expenses, overnightCount, advance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Spara profildata till nästa gång
      if (user && user.uid) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'invoiceData'), personalInfo, { merge: true });
        } catch(e) {}
      }

      const tripsText = trips.map(t => `- ${t.date}: ${t.from} till ${t.to} (${t.roundTrip ? 'T&R' : 'Enkel'}), ${t.distance} mil. Ändamål: ${t.assignment}`).join('\n');
      const expensesText = expenses.filter(e => e.description && e.amount).map(e => `- ${e.description}: ${e.amount} kr`).join('\n') || 'Inga övriga utlägg';

      const emailBody = `
NY RESERÄKNING INSKICKAD
--------------------------------------------------
PERSONUPPGIFTER
Namn: ${personalInfo.name}
Personnummer: ${personalInfo.pnr}
E-post: ${personalInfo.email}
Adress: ${personalInfo.address}, ${personalInfo.zipCity}
Bankkonto: ${personalInfo.bank}

RESOR
${tripsText}

ERSÄTTNING ATT UTBETALA
Milersättning (${calculated.totalMilage} mil á 25 kr): ${calculated.milageCost} kr
Restidsersättning: ${calculated.travelBonus} kr
Övernattningstraktamente (${overnightCount || 0} st): ${calculated.overnightCost} kr

ÖVRIGA UTLÄGG
${expensesText}
Totalt utlägg: ${calculated.totalExpenses} kr

AVDRAG FÖRSKOTT: -${calculated.advance} kr
--------------------------------------------------
TOTALT ATT ERHÅLLA: ${calculated.total} kr
      `;

      // TESTLÄGE: Skickar mailet till inloggad domare istället för info@sbslf.se
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: personalInfo.email,
        message: {
          subject: `TEST: Reseräkning ${personalInfo.name} (${calculated.total} kr)`,
          text: emailBody
        },
        createdAt: Date.now()
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Ett fel uppstod. Vänligen försök igen eller skriv ut som PDF.");
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">{t.sentSuccess}</h2>
          <p className="text-slate-600 mb-8 font-medium">
            I test-syfte har reseräkningen skickats till <strong>{personalInfo.email}</strong> istället för till Förbundet.
          </p>
          <button onClick={() => setSuccess(false)} className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-black uppercase text-xs hover:bg-slate-200 transition-colors">
            {t.newInvoice}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-8 print:hidden pt-20 sm:pt-8">
        
        <div className="text-center space-y-2 mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">{t.invoiceTitle}</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t.digitalSubmission}</p>
        </div>

        {/* Datalist för auto-complete av platser */}
        <datalist id="location-list">
          <option value={t.homeLocation}>{t.homeAddressLabel}</option>
          {locationsData.map((loc, i) => <option key={i} value={loc.id}>{loc.address || loc.id}</option>)}
        </datalist>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> {t.personalInfo}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.name}</label>
                <input required type="text" name="name" value={personalInfo.name} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">E-postadress (Kvitto skickas hit)</label>
                <input required type="email" name="email" value={personalInfo.email} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.pnr}</label>
                <input required type="text" name="pnr" value={personalInfo.pnr} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.streetAddress}</label>
                <input required type="text" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.zipCity}</label>
                <input required type="text" name="zipCity" value={personalInfo.zipCity} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.bankAccount}</label>
                <input required type="text" name="bank" value={personalInfo.bank} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Car className="w-4 h-4" /> {t.tripsAllowance}
              </h2>
            </div>
            
            <div className="space-y-6">
              {trips.map((trip, index) => {
                // Filtrera ut domarens uppdrag baserat på inmatat datum
                const gamesOnDate = trip.date ? myAssignedGames.filter(g => g.date === trip.date) : [];

                return (
                  <div key={trip.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                    {trips.length > 1 && (
                      <button type="button" onClick={() => removeTrip(trip.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.date}</label>
                        <input required type="date" value={trip.date} onChange={(e) => handleTripChange(trip.id, 'date', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                      </div>
                      
                      {gamesOnDate.length > 0 && (
                        <div className="sm:col-span-9 bg-blue-100 p-2 rounded-lg flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-blue-800 uppercase">{t.foundAssignments}</span>
                          <select 
                            className="flex-1 text-xs p-1.5 rounded-md border border-blue-200 bg-white"
                            onChange={(e) => {
                               const g = gamesOnDate.find(x => x.id === e.target.value);
                               if(g) {
                                  handleTripChange(trip.id, 'assignment', `${g.away} @ ${g.home}`);
                                  handleTripChange(trip.id, 'to', g.location);
                                  handleTripChange(trip.id, 'from', t.homeLocation);
                               }
                            }}
                          >
                             <option value="">{t.selectGame}</option>
                             {gamesOnDate.map(g => <option key={g.id} value={g.id}>{g.away} @ {g.home} ({g.time})</option>)}
                          </select>
                        </div>
                      )}

                      <div className={`space-y-1 ${gamesOnDate.length > 0 ? 'sm:col-span-12' : 'sm:col-span-9'}`}>
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.assignmentDetails}</label>
                        <input required type="text" value={trip.assignment} onChange={(e) => handleTripChange(trip.id, 'assignment', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                      </div>
                      
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelFrom}</label>
                        <input required type="text" list="location-list" value={trip.from} onChange={(e) => handleTripChange(trip.id, 'from', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelTo}</label>
                        <input required type="text" list="location-list" value={trip.to} onChange={(e) => handleTripChange(trip.id, 'to', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div className="sm:col-span-2 space-y-1 flex flex-col justify-end">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-lg h-[42px]">
                          <input type="checkbox" checked={trip.roundTrip} onChange={(e) => handleTripChange(trip.id, 'roundTrip', e.target.checked)} className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase text-slate-600">{t.roundTrip}</span>
                        </label>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.distanceMil}</label>
                        <input required type="number" step="0.1" value={trip.distance} onChange={(e) => handleTripChange(trip.id, 'distance', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600" />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => calculateDistance(index)}
                        disabled={calculatingIndex === index}
                        className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
                      >
                        {calculatingIndex === index ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                        {calculatingIndex === index ? t.calculating : t.calcAuto}
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <button type="button" onClick={addTrip} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-black uppercase text-xs hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> {t.addTrip}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> {t.expensesAllowance}
            </h2>
            
            <div className="space-y-4 mb-6">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex items-center gap-4">
                  <input type="text" placeholder={t.description} value={exp.description} onChange={(e) => handleExpenseChange(exp.id, 'description', e.target.value)} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  <input type="number" placeholder={t.amount} value={exp.amount} onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)} className="w-32 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  {expenses.length > 1 && (
                    <button type="button" onClick={() => removeExpense(exp.id)} className="text-slate-300 hover:text-red-500"><X className="w-5 h-5"/></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addExpense} className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> {t.addExpense}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.overnightNights}</label>
                <div className="relative">
                  <input type="number" min="0" value={overnightCount} onChange={(e) => setOvernightCount(e.target.value)} placeholder="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">á 150 kr</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.advanceDeduction}</label>
                <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> {t.summary}
            </h2>
            
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-300">{t.mileageComp} ({calculated.totalMilage} mil á 25 kr)</span>
                <span>{calculated.milageCost} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-300">{t.travelTimeComp} (>10 mil/resa: 100kr, >20 mil: 200kr)</span>
                <span>{calculated.travelBonus} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-300">{t.overnightComp} ({overnightCount || 0} st)</span>
                <span>{calculated.overnightCost} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-300">{t.otherExpenses}</span>
                <span>{calculated.totalExpenses} kr</span>
              </div>
              {calculated.advance > 0 && (
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-red-400">
                  <span>{t.advanceDeduction}</span>
                  <span>-{calculated.advance} kr</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t.totalToReceive}</span>
              <span className="text-4xl font-black text-green-400">{calculated.total} <span className="text-xl">kr</span></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 print:hidden">
            <button 
              type="button" 
              onClick={() => window.print()}
              className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> {t.createPdf}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-yellow-200 hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              Skicka in (TEST: Kvitto till din E-post)
            </button>
          </div>
        </form>
      </div>

      {/* PRINT VIEW (A4 Optimized Template) */}
      <div className="hidden print:block w-[190mm] mx-auto text-black p-4 text-[12px] leading-snug">
        <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase">Reseräkning</h1>
            <p className="font-bold text-sm">Svenska Baseboll och Softboll Förbundet</p>
          </div>
          <div className="text-right text-[10px]">
            <p>{t.date}: {new Date().toLocaleDateString('sv-SE')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
          <div><span className="font-bold">{t.name}:</span> {personalInfo.name}</div>
          <div><span className="font-bold">{t.pnr}:</span> {personalInfo.pnr}</div>
          <div><span className="font-bold">{t.streetAddress}:</span> {personalInfo.address}</div>
          <div><span className="font-bold">{t.zipCity}:</span> {personalInfo.zipCity}</div>
          <div className="col-span-2"><span className="font-bold">{t.bankAccount}:</span> {personalInfo.bank}</div>
        </div>

        <h3 className="font-bold mb-1 uppercase text-[10px] tracking-wider">Uppdrag & Resor</h3>
        <table className="w-full border-collapse border border-black mb-6 text-[11px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1.5 text-left">{t.date}</th>
              <th className="border border-black p-1.5 text-left">Ändamål</th>
              <th className="border border-black p-1.5 text-left">Från</th>
              <th className="border border-black p-1.5 text-left">Till</th>
              <th className="border border-black p-1.5 text-center">T&R</th>
              <th className="border border-black p-1.5 text-right">Mil</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, idx) => (
              <tr key={idx}>
                <td className="border border-black p-1.5">{trip.date}</td>
                <td className="border border-black p-1.5">{trip.assignment}</td>
                <td className="border border-black p-1.5">{trip.from}</td>
                <td className="border border-black p-1.5">{trip.to}</td>
                <td className="border border-black p-1.5 text-center">{trip.roundTrip ? 'Ja' : 'Nej'}</td>
                <td className="border border-black p-1.5 text-right font-bold">{trip.distance}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.some(e => e.description && e.amount) && (
          <>
            <h3 className="font-bold mb-1 uppercase text-[10px] tracking-wider">Utlägg</h3>
            <table className="w-full border-collapse border border-black mb-6 text-[11px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1.5 text-left">Beskrivning</th>
                  <th className="border border-black p-1.5 text-right w-32">Belopp (kr)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.filter(e => e.description && e.amount).map((exp, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-1.5">{exp.description}</td>
                    <td className="border border-black p-1.5 text-right">{exp.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="flex justify-end mb-8 page-break-inside-avoid">
          <div className="w-1/2">
            <table className="w-full border-collapse border border-black text-[11px]">
              <tbody>
                <tr>
                  <td className="border border-black p-1.5">Milersättning (25 kr/mil)</td>
                  <td className="border border-black p-1.5 text-right">{calculated.milageCost} kr</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5">Restidsersättning</td>
                  <td className="border border-black p-1.5 text-right">{calculated.travelBonus} kr</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5">Övernattning ({overnightCount || 0} st á 150kr)</td>
                  <td className="border border-black p-1.5 text-right">{calculated.overnightCost} kr</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5">Övriga Utlägg</td>
                  <td className="border border-black p-1.5 text-right">{calculated.totalExpenses} kr</td>
                </tr>
                {calculated.advance > 0 && (
                  <tr>
                    <td className="border border-black p-1.5">Avgår förskott</td>
                    <td className="border border-black p-1.5 text-right">-{calculated.advance} kr</td>
                  </tr>
                )}
                <tr className="bg-gray-100 font-bold text-sm">
                  <td className="border border-black p-1.5">TOTALT ATT ERHÅLLA</td>
                  <td className="border border-black p-1.5 text-right">{calculated.total} kr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-break-inside-avoid mt-8">
          <div className="mb-12">
            <p className="font-bold mb-6">Underskrift resenär:</p>
            <div className="border-b border-black w-1/2"></div>
            <p className="text-[10px] mt-1 text-gray-500">Signatur & Namnförtydligande</p>
          </div>

          <div className="border-2 border-black p-4">
            <h3 className="font-black text-sm uppercase mb-4 border-b border-black pb-1">Fylls i av Förbundet</h3>
            <div className="grid grid-cols-4 gap-4 text-xs h-16">
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Konto</div>
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Kostnadsställe</div>
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Projekt</div>
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Fritt</div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-xs mt-8 h-16">
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Belopp (kr)</div>
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Attesteras (Sign/Datum)</div>
              <div className="border-b border-black flex flex-col justify-end pb-1 font-bold">Beslutas (Sign/Datum)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
