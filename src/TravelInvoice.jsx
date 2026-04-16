import React, { useState, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { 
  Calculator, Send, Printer, Car, FileText, User, 
  CreditCard, Calendar, CheckCircle, AlertTriangle, ArrowRight 
} from 'lucide-react';

/**
 * Firebase Configuration (Same as main app to use the mail extension)
 */
let firebaseConfig = {
  apiKey: "AIzaSyCDCo185Kc7wHHjDPsM750R9eBVi6Loltw",
  authDomain: "baseball-umpire-portal.firebaseapp.com",
  projectId: "baseball-umpire-portal",
  storageBucket: "baseball-umpire-portal.firebasestorage.app",
  messagingSenderId: "163069788280",
  appId: "1:163069788280:web:0d236c7ff9710a306c2d8d",
  measurementId: "G-VSWDNDQKE5"
};

// Sandbox override
if (typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined') {
  try { firebaseConfig = JSON.parse(window.__firebase_config); } catch (e) { }
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    pnr: '',
    address: '',
    zipCity: '',
    bank: '',
    date: '',
    assignment: '',
    location: '',
    travelFrom: '',
    travelTo: '',
    milage: '',
    expenses: '',
    advance: '',
    overnight: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculations based on SBSF Document rules
  const calculated = useMemo(() => {
    const milageNum = parseFloat(formData.milage) || 0;
    const expensesNum = parseFloat(formData.expenses) || 0;
    const advanceNum = parseFloat(formData.advance) || 0;

    // 25 kr per mil
    const milageCost = milageNum * 25;
    
    // Restidsersättning: 100kr > 10 mil, 200kr > 20 mil
    let travelBonus = 0;
    if (milageNum >= 20) travelBonus = 200;
    else if (milageNum >= 10) travelBonus = 100;

    // Övernattningstraktamente
    const overnightCost = formData.overnight ? 150 : 0;

    // Totalt (inklusive avdrag för förskott)
    const total = (milageCost + travelBonus + overnightCost + expensesNum) - advanceNum;

    return {
      milageCost,
      travelBonus,
      overnightCost,
      expenses: expensesNum,
      advance: advanceNum,
      total
    };
  }, [formData]);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine appropriate App ID based on environment
      const isDemoEnv = typeof window !== 'undefined' && window.location.hostname !== 'schema.domarweb.se';
      const base = typeof window !== 'undefined' && window.__app_id ? String(window.__app_id).replace(/[\/\\]/g, '-') : 'baseball-umpire-scheduler';
      const currentYear = new Date().getFullYear();
      const appId = isDemoEnv ? `${base}-sandbox-swe-${currentYear}` : `${base}-swe-${currentYear}`;

      const emailBody = `
NY RESERÄKNING INSKICKAD
--------------------------------------------------
PERSONUPPGIFTER
Namn: ${formData.name}
Personnummer: ${formData.pnr}
Adress: ${formData.address}, ${formData.zipCity}
Bankkonto: ${formData.bank}

UPPDRAG
Datum: ${formData.date}
Ort: ${formData.location}
Uppdrag: ${formData.assignment}

RESA & UTLÄGG
Från: ${formData.travelFrom}
Till: ${formData.travelTo}
Antal mil: ${formData.milage || 0}
Biljett/Övriga utlägg: ${calculated.expenses} kr
Erhållet förskott: ${calculated.advance} kr
Övernattning: ${formData.overnight ? 'Ja (150 kr)' : 'Nej'}

ERSÄTTNING ATT UTBETALA
Milersättning (25 kr/mil): ${calculated.milageCost} kr
Restidsersättning: ${calculated.travelBonus} kr
Övernattningstraktamente: ${calculated.overnightCost} kr
Utlägg: ${calculated.expenses} kr
Avdrag förskott: -${calculated.advance} kr
--------------------------------------------------
TOTALT ATT ERHÅLLA: ${calculated.total} kr
      `;

      // Skicka mail via befintlig Firebase extension
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: 'info@sbslf.se',
        message: {
          subject: `Reseräkning: ${formData.name} - ${formData.date}`,
          text: emailBody
        },
        createdAt: Date.now()
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Ett fel uppstod när reseräkningen skulle skickas. Vänligen försök igen eller skriv ut som PDF.");
    }
    
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Insänt & Klart!</h2>
          <p className="text-slate-600 mb-8 font-medium">Din reseräkning har skickats till Förbundet (info@sbslf.se).</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-black uppercase text-xs hover:bg-slate-200 transition-colors">
            Skicka in en till
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans print:bg-white print:p-0 print:py-0">
      
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header - Hidden in print, replaced by simple text */}
        <div className="text-center space-y-2 print:hidden">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">SBSF Reseräkning</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Digital inlämning</p>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-8">
          <h1 className="text-2xl font-black">RESERÄKNING</h1>
          <p className="text-sm font-medium">Svenska Baseboll och Softboll Förbundet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Kort 1: Personuppgifter */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Personuppgifter
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Namn</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Personnummer</label>
                <input required type="text" name="pnr" value={formData.pnr} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Gatuadress</label>
                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Postnummer & Ort</label>
                <input required type="text" name="zipCity" value={formData.zipCity} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Bank & Kontonummer</label>
                <input required type="text" name="bank" value={formData.bank} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
            </div>
          </div>

          {/* Kort 2: Uppdrag */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Uppdragsinformation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Datum</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Ort</label>
                <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Uppdrag (Vilka lag spelade?)</label>
                <input required type="text" name="assignment" value={formData.assignment} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
            </div>
          </div>

          {/* Kort 3: Resa & Utlägg */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Car className="w-4 h-4" /> Resa & Utlägg
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Från</label>
                <input type="text" name="travelFrom" value={formData.travelFrom} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Till</label>
                <input type="text" name="travelTo" value={formData.travelTo} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Antal Mil (Egen bil)</label>
                <input type="number" step="0.1" name="milage" value={formData.milage} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 print:border-none flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Biljettkostnader / Utlägg (kr)</label>
                <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
              <div className="w-full space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">Avgår förskott (kr)</label>
                <input type="number" name="advance" value={formData.advance} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 print:bg-white print:border-b print:rounded-none print:p-1" />
              </div>
            </div>

            <div className="mt-6 bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 print:bg-white print:border-none print:p-0">
              <div>
                <p className="font-bold text-slate-800">Övernattning</p>
                <p className="text-[10px] uppercase font-black text-slate-400 mt-1">Traktamente 150 kr</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="overnight" checked={formData.overnight} onChange={handleChange} className="sr-only peer" />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Kort 4: Sammanställning */}
          <div className="bg-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl print:text-black print:bg-white print:shadow-none print:border print:border-slate-800">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-black">
              <Calculator className="w-4 h-4" /> Sammanställning
            </h2>
            
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 print:border-slate-200">
                <span className="text-slate-300 print:text-black">Milersättning (25 kr/mil)</span>
                <span>{calculated.milageCost} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 print:border-slate-200">
                <span className="text-slate-300 print:text-black">Restidsersättning (>10 mil: 100kr, >20 mil: 200kr)</span>
                <span>{calculated.travelBonus} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 print:border-slate-200">
                <span className="text-slate-300 print:text-black">Övernattningstraktamente</span>
                <span>{calculated.overnightCost} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 print:border-slate-200">
                <span className="text-slate-300 print:text-black">Biljetter & Utlägg</span>
                <span>{calculated.expenses} kr</span>
              </div>
              {calculated.advance > 0 && (
                <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-red-400 print:text-black">
                  <span>Avgår förskott</span>
                  <span>-{calculated.advance} kr</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 print:text-black">Totalt att erhålla</span>
              <span className="text-4xl font-black text-green-400 print:text-black">{calculated.total} <span className="text-xl">kr</span></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 print:hidden">
            <button 
              type="button" 
              onClick={handlePrint}
              className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> Skapa PDF / Skriv ut
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              Skicka in till Förbundet
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
