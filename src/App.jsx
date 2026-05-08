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
  updateDoc,
  query,
  where,
  orderBy
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

// Import Icons
import { 
  Calendar as CalendarIcon, Shield, CheckCircle, Clock, Settings, Trash2, 
  MapPin, RefreshCw, Trophy, FileText, Plus, ChevronDown, ChevronUp, Search, 
  BarChart3, History as HistoryIcon, Info, User, UserPlus, UserMinus, Download, 
  CalendarPlus, UserCheck, Edit2, Check, LogOut, ChevronRight, List, ChevronLeft, 
  ArrowUpDown, ArrowUp, Users2, Github, X, AlertTriangle, ArrowLeft, Megaphone, 
  HelpCircle, BookOpen, MessageCircle, Code, Mail, Send, Share2, Map, 
  ArrowRightLeft, Star, Navigation, Bell, BellOff, Sliders,
  Calculator, Printer, Car, CreditCard, Phone, Save
} from 'lucide-react';

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

const translations = {
  sv: {
    appTitle: "Domartillsättning",
    season: "Säsong",
    schedule: "Spelschema",
    myGames: "Mina Matcher",
    umpireList: "Domarlista",
    staffing: "Bemanning",
    analytics: "Statistik",
    history: "Historik",
    upcoming: "Kommande",
    archived: "Arkiverade matcher",
    activeSchedule: "Aktivt schema",
    searchPlaceholder: "Sök matcher...",
    allSeries: "Alla serier",
    allLocations: "Alla platser",
    filterStatusAll: "Alla statusar",
    needsUmpire: "Saknar domare",
    noInterests: "Inga anmälningar",
    noGames: "Inga matcher hittades.",
    syncNow: "Synka förbundsdata nu",
    applied: "Anmälda",
    interested: "Intresserad",
    withdraw: "Dra tillbaka",
    assignedTo: "Tillsatta",
    staffed: "Bemannad",
    partiallyStaffed: "Delvis bemannad",
    bulkImport: "Massimport",
    pendingAssignments: "Bemanningsöversikt",
    staffingControl: "Bemanningskontroll",
    hideStaffed: "Dölj helt bemannade",
    showAll: "Visa alla matcher",
    removeAssignment: "Ta bort",
    deleteGame: "Ta bort match",
    deleteAllGames: "Rensa hela säsongen",
    deleteAllConfirm: "ÄR DU HELT SÄKER?",
    deleteAllSuccess: "Säsongen har rensats.",
    downloadBackup: "Ladda ner backup",
    umpire: "Domare",
    interests: "Intresseanmälningar",
    gamesAssigned: "Dömda matcher",
    assignmentRate: "Tillsättningsgrad",
    noStats: "Ingen data finns registrerad än.",
    mySchedule: "Mitt Schema",
    noAssignedMatches: "Du har inga bekräftade matchuppdrag än.",
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
    downloadFullSchedule: "Ladda ner (.ICS)",
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
    locations: "Platser",
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
    login: "Logga in",
    register: "Skapa konto",
    email: "E-postadress",
    phone: "Telefonnummer",
    password: "Lösenord",
    loginToContinue: "Logga in för att fortsätta",
    noAccount: "Inget konto? Registrera dig här",
    hasAccount: "Har du redan ett konto? Logga in",
    adminManagement: "Administratörer",
    masterAdminInfo: "Du är inloggad som Master Admin.",
    linkedAccount: "Konto:",
    notLinked: "Inget konto",
    umpireProfile: "Domarprofil",
    back: "Tillbaka",
    assignedMatches: "Tillsatta matcher",
    totalAssignments: "Tillsättningar",
    totalInterests: "Intresseanmälningar",
    deleteUmpireConfirm: "Är du säker på att du vill ta bort",
    globalAnnouncement: "Globalt Meddelande",
    saveAnnouncement: "Publicera",
    clearAnnouncement: "Ta bort",
    announcementPlaceholder: "Skriv ett viktigt meddelande som visas för alla...",
    bookedIn: "Bokad i",
    coUmpires: "Dömer med:",
    noCoUmpires: "Inga meddomare",
    calendarColumn: "Kalender",
    gameDetails: "Matchinformation",
    mapDirections: "Öppna Karta",
    officials: "Domarteam",
    supervisor: "Supervisor",
    techComm: "Technical Commissioner",
    notAssigned: "Ej tillsatt",
    yourGame: "Din match",
    marketplace: "Marknad",
    marketplaceDesc: "Här visas matcher som andra vill byta bort och matcher som saknar domare.",
    tradeGame: "Byt bort",
    cancelTrade: "Ångra byte",
    takeGame: "Ta match",
    expressInterest: "Anmäl intresse",
    gamesForTrade: "Matcher som bytes bort",
    missingUmpires: "Matcher som saknar domare",
    noMarketplaceGames: "Inga matcher på marknaden just nu.",
    tradeSuccess: "Du har tagit över matchen!",
    tradeConfirm: "Är du säker på att du vill ta över denna match?",
    evaluate: "Utvärdera",
    grade: "Betyg",
    feedback: "Feedback",
    saveEval: "Spara utvärdering",
    evalSaved: "Utvärdering sparad",
    yourEval: "Utvärdering",
    selectAdmin: "Välj Admin...",
    enterTCName: "Ange namn på TC...",
    umpireShort: "DOMARE",
    supShort: "SUP",
    tcShort: "TC",
    address: "Adress",
    facilities: "Faciliteter",
    noFacilities: "Inga faciliteter",
    addFacility: "Lägg till facilitet...",
    editLocation: "Redigera plats",
    matchMovedWarning: "Match flyttad! Bekräfta om du kan den nya tiden.",
    acceptTime: "Acceptera ny tid",
    declineTime: "Kan inte (Avboka)",
    timeChangedBadge: "Tid Ändrad",
    actionRequired: "Kräver åtgärd",
    superAdminSettings: "Systemarkitektur (Super Admin)",
    featureMarketplace: "Aktivera Marknadsplats",
    featureEvaluations: "Aktivera Utvärderingar",
    featureReminders: "E-postpåminnelser",
    reminderPreferences: "Mina Notiser",
    receiveReminders: "Få e-postpåminnelser",
    runRemindersNow: "Kör Påminnelser Nu",
    invoiceTitle: "Reseräkning",
    digitalSubmission: "Digital inlämning",
    personalInfo: "Personuppgifter",
    pnr: "Personnummer",
    streetAddress: "Gatuadress",
    zipCity: "Postnummer & Ort",
    bankAccount: "Bank & Kontonummer",
    tripsAllowance: "Resor (Milersättning & Restid)",
    assignmentDetails: "Ändamål (Vilka lag spelade?)",
    travelFrom: "Resa Från",
    travelTo: "Resa Till",
    roundTrip: "Tur & Retur",
    distanceMil: "Antal Mil",
    calcAuto: "Beräkna avstånd (Auto)",
    calculating: "Beräknar...",
    addTrip: "Lägg till ytterligare en resa",
    expensesAllowance: "Övriga Utlägg & Traktamente",
    description: "Beskrivning",
    amount: "Belopp (kr)",
    addExpense: "Lägg till utlägg",
    overnightNights: "Övernattningstraktamente (Antal nätter)",
    advanceDeduction: "Avgår förskott (kr)",
    summary: "Sammanställning",
    mileageComp: "Milersättning",
    travelTimeComp: "Restidsersättning",
    overnightComp: "Övernattningstraktamente",
    otherExpenses: "Övriga Utlägg",
    totalToReceive: "Totalt att erhålla",
    createPdf: "Skapa PDF / Skriv ut",
    sentSuccess: "Insänt & Klart!",
    newInvoice: "Skapa ny reseräkning",
    selectGame: "-- Välj en av dina matcher --",
    homeLocation: "Hem",
    homeAddressLabel: "Hemadress",
    foundAssignments: "Hittade uppdrag:",
    pastInvoices: "Tidigare reseräkningar",
    historicalStats: "Historisk Statistik (Tidigare säsonger)",
    historicalGames: "Totalt dömda matcher",
    historicalNote: "Datan kan redigeras av administratörer."
  }
};

const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const generateCSV = (gamesToExport, selectedYear) => {
  if (gamesToExport.length === 0 || typeof window === 'undefined') return;
  const header = "Subject,Start Date,Start Time,End Date,End Time,Description,Location\n";
  const rows = gamesToExport.map(game => {
    const [hours, mins] = (game.time || '00:00').split(':');
    const endHours = (parseInt(hours || '0') + 3).toString().padStart(2, '0');
    const endTime = `${endHours}:${mins || '00'}`;
    return `"${game.away} @ ${game.home} (${game.league})",${game.date},${game.time},${game.date},${endTime},"${game.league}","${game.location}"`;
  }).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `schedule-${selectedYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// TravelInvoice Component
function TravelInvoice({ db, appId, locationsData, user, userName, t, myAssignedGames }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calculatingIndex, setCalculatingIndex] = useState(null);
  const [pastInvoices, setPastInvoices] = useState([]);

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

  // Fetch saved personal info & past invoices
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

      const fetchPastInvoices = async () => {
         try {
            const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'invoices'), orderBy('createdAt', 'desc'));
            onSnapshot(q, snap => {
               setPastInvoices(snap.docs.map(d => ({id: d.id, ...d.data()})));
            });
         } catch(e) {}
      };
      fetchPastInvoices();
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

  const calculateDistance = async (index) => {
    const trip = trips[index];
    if (!trip.from || !trip.to) {
      alert("Fyll i både 'Från' och 'Till' för att kunna beräkna avståndet automatiskt.");
      return;
    }

    setCalculatingIndex(index);
    try {
      const resolveAddress = (input) => {
        if (input.toLowerCase() === t.homeLocation.toLowerCase() || input.toLowerCase() === 'hem' || input.toLowerCase() === 'home') {
          return `${personalInfo.address}, ${personalInfo.zipCity}`;
        }
        const found = locationsData.find(l => l.id.toLowerCase() === input.toLowerCase());
        return found && found.address ? found.address : input;
      };

      const fromAddress = resolveAddress(trip.from);
      const toAddress = resolveAddress(trip.to);

      if(!fromAddress || !toAddress || fromAddress === ', ' || toAddress === ', ') {
         throw new Error("Gatuadress och postort saknas.");
      }

      const fromRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddress + ', Sweden')}`);
      const fromData = await fromRes.json();
      
      const toRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddress + ', Sweden')}`);
      const toData = await toRes.json();

      if (fromData.length === 0 || toData.length === 0) throw new Error("Kunde inte hitta exakta koordinater.");

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
      alert("Automatisk beräkning misslyckades. Skriv in avståndet manuellt.");
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
      if (user && user.uid) {
        try {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'invoiceData'), personalInfo, { merge: true });
        } catch(e) {}
      }

      const tripsText = trips.map(t => `- ${t.date}: ${t.from} till ${t.to} (${t.roundTrip ? 'T&R' : 'Enkel'}), ${t.distance} mil. Ändamål: ${t.assignment}`).join('\n');
      const expensesText = expenses.filter(e => e.description && e.amount).map(e => `- ${e.description}: ${e.amount} kr`).join('\n') || 'Inga övriga utlägg';

      const emailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">Reseräkning - ${personalInfo.name}</h2>
          
          <h3 style="color: #475569; margin-top: 20px;">Personuppgifter</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; width: 30%;"><strong>Namn</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${personalInfo.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Personnummer</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${personalInfo.pnr}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Adress</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${personalInfo.address}, ${personalInfo.zipCity}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Bankkonto</strong></td><td style="padding: 8px; border: 1px solid #cbd5e1;">${personalInfo.bank}</td></tr>
          </table>

          <h3 style="color: #475569; margin-top: 20px;">Resor</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8fafc;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Datum & Ändamål</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Sträcka</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Mil</th>
            </tr>
            ${trips.map(tr => `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${tr.date}<br><small style="color: #64748b;">${tr.assignment}</small></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${tr.from} &rarr; ${tr.to}<br><small style="color: #64748b;">${tr.roundTrip ? 'Tur & Retur' : 'Enkel'}</small></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${tr.distance}</td>
              </tr>
            `).join('')}
          </table>

          ${expenses.some(e => e.description && e.amount) ? `
          <h3 style="color: #475569; margin-top: 20px;">Övriga utlägg</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${expenses.filter(e => e.description && e.amount).map(e => `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${e.description}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; width: 100px;">${e.amount} kr</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          <h3 style="color: #475569; margin-top: 20px;">Sammanställning</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Milersättning</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; width: 120px;">${calculated.milageCost} kr</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Restidsersättning</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${calculated.travelBonus} kr</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Övernattningstraktamente</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${calculated.overnightCost} kr</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Övriga utlägg</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${calculated.totalExpenses} kr</td></tr>
            ${calculated.advance > 0 ? `<tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Avgår förskott</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #ef4444;">-${calculated.advance} kr</td></tr>` : ''}
            <tr style="background: #1e3a8a; color: white;"><td style="padding: 10px 8px; border: 1px solid #1e3a8a; font-weight: bold;">TOTALT ATT ERHÅLLA</td><td style="padding: 10px 8px; border: 1px solid #1e3a8a; text-align: right; font-weight: bold; font-size: 16px;">${calculated.total} kr</td></tr>
          </table>
        </div>
      `;

      // Skicka mail
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: personalInfo.email,
        message: {
          subject: `Reseräkning: ${personalInfo.name} (${calculated.total} kr) - TEST`,
          text: "Ny reseräkning inskickad. Vänligen läs mailet i en HTML-kompatibel e-postklient.",
          html: emailHtml
        },
        createdAt: Date.now()
      });

      // Spara fakturan i användarens historik
      if (user && user.uid) {
         await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'invoices'), {
            createdAt: Date.now(),
            total: calculated.total,
            trips: trips.map(tr => ({ date: tr.date, assignment: tr.assignment })),
            status: "Inskickad"
         });
      }

      setSuccess(true);
    } catch (err) {
      alert("Ett fel uppstod. Vänligen försök igen.");
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">{t.sentSuccess}</h2>
          <p className="text-slate-600 mb-8 font-medium">I test-syfte har reseräkningen skickats till <strong>{personalInfo.email}</strong>.</p>
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

        {pastInvoices.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <HistoryIcon className="w-4 h-4" /> {t.pastInvoices}
             </h3>
             <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {pastInvoices.map(inv => (
                 <div key={inv.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <div>
                     <span className="text-xs font-bold text-slate-700">{new Date(inv.createdAt).toLocaleDateString('sv-SE')}</span>
                     <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{inv.trips?.map(tr => tr.assignment).join(', ')}</p>
                   </div>
                   <div className="text-right">
                     <span className="text-sm font-black text-blue-600">{inv.total} kr</span>
                     <p className="text-[9px] font-black uppercase text-green-600 mt-0.5">{inv.status}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

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
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">E-postadress</label>
                <input required type="email" name="email" value={personalInfo.email} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.pnr}</label>
                <input required type="text" name="pnr" value={personalInfo.pnr} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.streetAddress} (Hemadress)</label>
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
                            className="flex-1 text-xs p-1.5 rounded-md border border-blue-200 bg-white outline-none"
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
                        <input required type="text" value={trip.assignment} onChange={(e) => handleTripChange(trip.id, 'assignment', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                      </div>
                      
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelFrom}</label>
                        <input required type="text" list="location-list" value={trip.from} onChange={(e) => handleTripChange(trip.id, 'from', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelTo}</label>
                        <input required type="text" list="location-list" value={trip.to} onChange={(e) => handleTripChange(trip.id, 'to', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                      </div>
                      <div className="sm:col-span-2 space-y-1 flex flex-col justify-end">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-lg h-[42px]">
                          <input type="checkbox" checked={trip.roundTrip} onChange={(e) => handleTripChange(trip.id, 'roundTrip', e.target.checked)} className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase text-slate-600">{t.roundTrip}</span>
                        </label>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.distanceMil}</label>
                        <input required type="number" step="0.1" value={trip.distance} onChange={(e) => handleTripChange(trip.id, 'distance', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600 outline-none" />
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
                  <input type="text" placeholder={t.description} value={exp.description} onChange={(e) => handleExpenseChange(exp.id, 'description', e.target.value)} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                  <input type="number" placeholder={t.amount} value={exp.amount} onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)} className="w-32 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
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
              Skicka in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Critical React Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ett oväntat fel uppstod</h2>
            <button onClick={() => window.location.reload()} className="mt-4 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">Ladda om sidan</button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [umpireId, setUmpireId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUmpireIds, setAdminUmpireIds] = useState([]);
  
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') || 'schedule';
    }
    return 'schedule';
  });
  
  const [scheduleViewMode, setScheduleViewMode] = useState('list');
  const [myGamesViewMode, setMyGamesViewMode] = useState('list');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  const [isDemoEnv, setIsDemoEnv] = useState(true);
  const [federation, setFederation] = useState('swe');
  const federations = [{ id: 'swe', name: '🇸🇪 Sweden', defaultLang: 'sv' }];

  const [lang, setLang] = useState('sv');
  const t = new Proxy(translations[lang], {
      get: (target, prop) => target[prop] !== undefined ? target[prop] : translations['en'][prop]
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [globalNote, setGlobalNote] = useState('');
  
  const [features, setFeatures] = useState({ marketplace: true, evaluations: true, reminders: true });
  
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterUmpires, setMasterUmpires] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedGameDetails, setSelectedGameDetails] = useState(null);
  
  const [showImportTool, setShowImportTool] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [showStaffed, setShowStaffed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeague, setFilterLeague] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [tempEditPhone, setTempEditPhone] = useState('');
  const [tempEditEmail, setTempEditEmail] = useState('');
  const [tempHistoricalGames, setTempHistoricalGames] = useState('');

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  useEffect(() => {
     if (typeof window !== 'undefined') {
        if (window.location.hostname === 'schema.domarweb.se') {
           setIsDemoEnv(false);
        } else {
           setIsDemoEnv(true);
        }
     }
  }, []);

  const appId = useMemo(() => {
    const base = 'baseball-umpire-scheduler';
    return isDemoEnv ? `${base}-sandbox-${selectedYear}` : `${base}-${selectedYear}`;
  }, [selectedYear, isDemoEnv]);

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
    masterUmpires.forEach(u => {
      stats[u.id] = { userId: u.id, name: u.name || 'Unknown', games: 0, interest: 0 };
    });
    assignments.forEach(asg => {
      if (!asg.userId) return;
      if (!stats[asg.userId]) stats[asg.userId] = { userId: asg.userId, name: asg.userName || 'Unknown', games: 0, interest: 0 };
      stats[asg.userId].games += 1;
    });
    applications.forEach(app => {
      if (!app.userId) return;
      if (!stats[app.userId]) stats[app.userId] = { userId: app.userId, name: app.userName || 'Unknown', games: 0, interest: 0 };
      stats[app.userId].interest += 1;
    });
    return Object.values(stats).map(s => {
      const rate = s.interest > 0 ? Math.round((s.games / s.interest) * 100) : (s.games > 0 ? 100 : 0);
      return { ...s, rate };
    }).sort((a, b) => b.games - a.games);
  }, [assignments, applications, masterUmpires]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const hName = (game.home || '').toLowerCase();
      const aName = (game.away || '').toLowerCase();
      const search = searchQuery.toLowerCase();
      const matchesSearch = hName.includes(search) || aName.includes(search);
      const matchesLeague = !filterLeague || game.league === filterLeague;
      const matchesLocation = !filterLocation || game.location === filterLocation;
      
      const isHistorical = (game.date || '') < today;
      
      let statusMatch = true;
      if (filterStatus === 'needs_umpire') {
          const gameAssignments = groupedAssignments[game.id] || [];
          statusMatch = gameAssignments.length < (game.requiredUmpires || 2);
      } else if (filterStatus === 'no_interests') {
          const applicants = applications.filter(a => a.gameId === game.id);
          statusMatch = applicants.length === 0;
      }
      
      if (showHistory) {
        return isHistorical && matchesSearch && matchesLeague && matchesLocation && statusMatch;
      } else {
        return !isHistorical && matchesSearch && matchesLeague && matchesLocation && statusMatch;
      }
    });
  }, [games, searchQuery, filterLeague, filterLocation, filterStatus, showHistory, today, groupedAssignments, applications]);

  const myAssignedGames = useMemo(() => {
    if (!umpireId) return [];
    return games.filter(game => groupedAssignments[game.id]?.some(asg => asg.userId === umpireId))
                .filter(game => showHistory ? (game.date < today) : (game.date >= today));
  }, [games, groupedAssignments, umpireId, showHistory, today]);

  const myInterestedGames = useMemo(() => {
    if (!umpireId) return [];
    return games.filter(game => 
      applications.some(app => app.gameId === game.id && app.userId === umpireId) &&
      !groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)
    );
  }, [games, applications, groupedAssignments, umpireId]);

  const uiDays = useMemo(() => {
    const arr = [...(t.days || [])];
    if (arr.length > 0) { const sunday = arr.shift(); arr.push(sunday); }
    return arr;
  }, [t.days]);

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
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push({ days: currentWeek });
    }
    return weeks;
  }, [currentDate]);

  useEffect(() => {
    const initAuth = async () => {
      try { 
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          try { await signInWithCustomToken(auth, window.__initial_auth_token); } 
          catch (e) { await signInAnonymously(auth); }
        } else { await signInAnonymously(auth); }
      } catch (err) { }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; 
    const handleDbError = (err) => { if (err.code === 'permission-denied') setFirebaseError('permission-denied'); };

    const unsubGames = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'games'), (snap) => setGames(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b)=>a.date.localeCompare(b.date))), handleDbError);
    const unsubApps = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), (snap) => setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubAssign = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'assignments'), (snap) => setAssignments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubUmpires = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), (snap) => setMasterUmpires(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b)=>(a.name||'').localeCompare(b.name||''))), handleDbError);
    const unsubEvals = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), (snap) => setEvaluations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubLocs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), (snap) => setLocationsData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubSet = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setAdminUmpireIds(d.adminUmpireIds || []);
        setGlobalNote(d.globalNote || '');
        if (d.features) setFeatures(prev => ({...prev, ...d.features}));
      }
    }, handleDbError);

    return () => { unsubGames(); unsubApps(); unsubAssign(); unsubUmpires(); unsubEvals(); unsubLocs(); unsubSet(); };
  }, [user, appId]);

  useEffect(() => {
    let unsubscribeProfile = () => {};
    if (user && user.email) {
      const isMaster = user.email.toLowerCase() === 'suecio@tryempire.com';
      setIsSuperAdmin(isMaster);
      
      const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      unsubscribeProfile = onSnapshot(profileDoc, (snap) => {
        if (snap.exists() && snap.data().umpireId) {
          setUserName(snap.data().name || '');
          setUmpireId(snap.data().umpireId || '');
          setIsAdmin(isMaster || (adminUmpireIds || []).includes(snap.data().umpireId));
        } else {
          setUserName(''); setUmpireId(''); setIsAdmin(isMaster);
        }
      });
    } else {
      setIsAdmin(false); setIsSuperAdmin(false); setUserName(''); setUmpireId('');
    }
    return () => unsubscribeProfile();
  }, [user, appId, adminUmpireIds]);

  const toggleApplication = async (gameId) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    const appIdStr = `${gameId}_${umpireId}`;
    const existing = applications.find(a => a.id === appIdStr);
    if (existing) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr));
    } else {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr), { gameId, userId: umpireId, userName, timestamp: Date.now() });
    }
  };

  const assignUmpire = async (gameId, uId, name) => {
    if (!isAdmin) return;
    const asgId = `${gameId}_${uId}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { gameId, userId: uId, userName: name, assignedAt: Date.now() });
  };

  const removeAssignment = async (gameId, uId) => {
    if (!isAdmin && uId !== umpireId) return; // Allow user to remove themselves if needed (decline)
    const asgId = `${gameId}_${uId}`;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId));
  };

  const takeTrade = async (oldAsg, game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    if (oldAsg && oldAsg.userId === umpireId) return; 

    if (!window.confirm(t.tradeConfirm)) return;
    
    try {
      const batch = writeBatch(db);
      if (oldAsg && oldAsg.id) batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', oldAsg.id));
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${game.id}_${umpireId}`), {
        gameId: game.id, userId: umpireId, userName: userName, assignedAt: Date.now(), forTrade: false 
      });
      await batch.commit();
      alert(t.tradeSuccess);
    } catch (e) {}
  };

  const expressInterestMarketplace = async (game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    await toggleApplication(game.id);
    alert("Intresse anmält! Administratörerna kan nu se att du vill ta matchen.");
    // Skickar notis till admin
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
       to: 'suecio@tryempire.com',
       message: {
          subject: `Ny intresseanmälan från Marknaden: ${userName}`,
          text: `${userName} har anmält intresse för matchen ${game.away} @ ${game.home} den ${game.date}.`
       },
       createdAt: Date.now()
    });
  };

  const safeDateDay = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    const dayIndex = d.getDay(); 
    return (t.days && t.days[dayIndex]) ? t.days[dayIndex] : '-';
  };

  const getLeagueStyles = (league) => {
    const l = (league || '').toLowerCase();
    if (l.includes('elit')) return 'bg-green-100 text-green-700 border-green-200';
    if (l.includes('region')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (l.includes('junior')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getLevelStyles = (level) => {
    const l = (level || '').toLowerCase();
    if (l.includes('internationell')) return 'bg-[#204d99] text-white border-[#1a3d7a]';
    if (l.includes('elit')) return 'bg-[#38761d] text-white border-[#2d5f17]';
    if (l.includes('nationell')) return 'bg-[#990000] text-white border-[#7a0000]';
    if (l.includes('region')) return 'bg-[#cfe2f3] text-[#3d85c6] border-[#a2c4c9]';
    return 'bg-slate-200 text-slate-500 border-slate-300';
  };

  const renderCalendar = (gamesToRender) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 overflow-hidden animate-in fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5"/></button>
         <h3 className="font-black text-lg text-slate-800 uppercase">{t.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="w-5 h-5"/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
         {uiDays.map(d => <div key={d} className="text-[10px] font-black uppercase text-slate-400">{d}</div>)}
      </div>
      <div className="flex flex-col gap-1 bg-slate-100 border border-slate-100 rounded-xl overflow-hidden p-1">
        {calendarWeeks.map((week, i) => (
           <div key={i} className="grid grid-cols-7 gap-1">
              {week.days.map((day, j) => {
                 if (!day) return <div key={j} className="p-2" />;
                 const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                 const gamesOnDay = gamesToRender.filter(g => g.date === dateStr);
                 const isToday = dateStr === today;
                 
                 return (
                    <div key={j} className={`bg-white rounded-lg p-1.5 min-h-[80px] flex flex-col ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}>
                       <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                         {day.getDate()}
                       </span>
                       <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                         {gamesOnDay.map(g => (
                            <div key={g.id} onClick={() => setSelectedGameDetails(g)} className="text-[8px] sm:text-[9px] font-bold bg-blue-50 text-blue-800 rounded px-1.5 py-1 truncate cursor-pointer hover:bg-blue-100">
                               {g.away}
                            </div>
                         ))}
                       </div>
                    </div>
                 )
              })}
           </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="animate-spin w-8 h-8 text-blue-600" /></div>;

  if (view === 'invoice') {
    return (
      <div className="relative bg-slate-100 min-h-screen">
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10 print:hidden">
          <button onClick={() => setView('schedule')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-black text-slate-600 uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all">
            <ArrowLeft className="w-4 h-4" /> Tillbaka
          </button>
        </div>
        <TravelInvoice db={db} appId={appId} locationsData={locationsData} user={user} userName={userName} t={t} myAssignedGames={myAssignedGames} />
      </div>
    );
  }

  // UMPIRE PROFILE VIEW (NEW)
  if (view === 'umpire-profile' && selectedProfileId) {
    const umpireData = masterUmpires.find(u => u.id === selectedProfileId);
    if (!umpireData) return null;
    const isMe = umpireId === selectedProfileId;
    const canEdit = isAdmin || isMe;
    
    // Calculate stats
    const currentSeasonGames = assignments.filter(a => a.userId === selectedProfileId).length;
    const historicalGamesCount = parseInt(umpireData.historicGames || 0);

    const saveProfileEdits = async () => {
       await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', selectedProfileId), {
          linkedEmail: tempEditEmail.trim().toLowerCase(),
          phone: tempEditPhone.trim(),
          historicGames: parseInt(tempHistoricalGames) || 0
       }, { merge: true });
       alert("Sparat!");
    };

    return (
      <div className="min-h-screen bg-slate-50 p-4 pt-12 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <button onClick={() => setView('umpire-list')} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Tillbaka till Domarlistan
          </button>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-900 to-blue-600"></div>
             
             <div className="relative z-10">
               {/* Avatar Placeholder */}
               <div className="w-32 h-32 bg-white rounded-full mx-auto border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mb-4">
                  {umpireData.avatarUrl ? (
                     <img src={umpireData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-4xl font-black text-blue-900">{umpireData.name.charAt(0)}</span>
                  )}
               </div>
               
               <h2 className="text-3xl font-black text-slate-800">{umpireData.name}</h2>
               <div className="mt-2 inline-block">
                 <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase ${getLevelStyles(umpireData.level)}`}>{umpireData.level}</span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <User className="w-4 h-4" /> Kontaktuppgifter
               </h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label>
                   {canEdit ? (
                     <input type="email" defaultValue={umpireData.linkedEmail || ''} onChange={e => setTempEditEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1" />
                   ) : (
                     <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 mt-1">{umpireData.linkedEmail || 'Ej angivet'}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.phone}</label>
                   {canEdit ? (
                     <input type="tel" defaultValue={umpireData.phone || ''} onChange={e => setTempEditPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1" />
                   ) : (
                     <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 mt-1">{umpireData.phone || 'Ej angivet'}</p>
                   )}
                 </div>

                 {canEdit && (
                   <button onClick={saveProfileEdits} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700">
                     <Save className="w-4 h-4" /> Spara uppgifter
                   </button>
                 )}
               </div>
             </div>

             <div className="space-y-6">
               <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-sm">
                 <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <CalendarIcon className="w-4 h-4" /> Säsongen {selectedYear}
                 </h3>
                 <div className="flex items-end gap-3">
                   <span className="text-5xl font-black">{currentSeasonGames}</span>
                   <span className="text-sm font-bold text-blue-200 pb-1">tillsatta matcher</span>
                 </div>
               </div>

               <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <HistoryIcon className="w-4 h-4" /> {t.historicalStats}
                 </h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.historicalGames}</label>
                     {isAdmin ? (
                       <input type="number" defaultValue={historicalGamesCount} onChange={e => setTempHistoricalGames(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-blue-600 outline-none mt-1" />
                     ) : (
                       <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xl font-black text-slate-700 mt-1">{historicalGamesCount} st</p>
                     )}
                   </div>
                   <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                     Denna siffra visar matcher dömda under tidigare säsonger. {t.historicalNote}
                   </p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <header className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <div>
                <h1 className="text-sm sm:text-xl font-bold">{t.appTitle}</h1>
                <p className="text-[8px] sm:text-[10px] uppercase text-blue-300">{t.season} {selectedYear}</p>
              </div>
            </div>
            <button onClick={() => setShowAdminModal(true)} className="sm:hidden p-1.5"><Settings className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-blue-800 text-[10px] rounded px-2 py-1 outline-none text-white">
              <option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
            </select>
            <div className="flex bg-blue-800 rounded p-0.5">
              <button onClick={() => setLang('sv')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'sv' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>🇸🇪</button>
              <button onClick={() => setLang('en')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>🇬🇧</button>
            </div>
            <button onClick={() => setShowAdminModal(true)} className="hidden sm:block p-1.5"><Settings className="w-5 h-5 text-white" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto custom-scrollbar sticky top-[68px] z-20">
          {[
            { id: 'schedule', label: t.schedule, icon: CalendarIcon },
            { id: 'locations', label: t.locations, icon: MapPin },
            { id: 'umpire-list', label: t.umpireList, icon: Users2 },
            ...(user?.email ? [
              ...(features.marketplace ? [{ id: 'marketplace', label: t.marketplace, icon: ArrowRightLeft }] : []),
              { id: 'my-apps', label: t.myGames, icon: CheckCircle }
            ] : []),
            ...(isAdmin ? [{ id: 'admin', label: t.staffing, icon: Shield }, { id: 'stats', label: t.analytics, icon: BarChart3 }] : []),
            { id: 'invoice', label: t.invoiceTitle, icon: FileText }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setView(tab.id); setSelectedProfileId(null); }} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === tab.id ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
              <tab.icon className="w-4 h-4 shrink-0" /><span className="inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {view === 'schedule' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black uppercase text-slate-800">{showHistory ? t.archived : t.activeSchedule}</h2>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => generateCSV(filteredGames, selectedYear)} className="text-[10px] font-black uppercase px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Ladda ner (.ICS)
                </button>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setScheduleViewMode('list')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1 ${scheduleViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List className="w-3.5 h-3.5"/> {t.listView}
                  </button>
                  <button onClick={() => setScheduleViewMode('calendar')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1 ${scheduleViewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <CalendarIcon className="w-3.5 h-3.5"/> {t.calendarView}
                  </button>
                </div>
                <button onClick={() => setShowHistory(!showHistory)} className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${showHistory ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  <HistoryIcon className="w-3.5 h-3.5" /> {showHistory ? t.upcoming : t.history}
                </button>
              </div>
            </div>

            {/* Fileringsmeny */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none">
                <option value="">{t.allSeries}</option>
                {leagues.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none">
                <option value="">{t.allLocations}</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {filteredGames.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200">
                <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">{t.noGames}</p>
              </div>
            ) : scheduleViewMode === 'calendar' ? (
              renderCalendar(filteredGames)
            ) : (
              filteredGames.map(game => {
                const gameAssignments = groupedAssignments[game.id] || [];
                const gameApplications = applications.filter(a => a.gameId === game.id);
                const isApplied = umpireId && gameApplications.some(a => a.userId === umpireId);
                const isAssignedToThisGame = umpireId && gameAssignments.some(asg => asg.userId === umpireId);
                const required = game.requiredUmpires || 2;

                return (
                  <div key={game.id} onClick={() => setSelectedGameDetails(game)} className={`bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:border-blue-300 group transition-all ${showHistory ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border group-hover:bg-blue-50 transition-colors">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{safeDateDay(game.date)}</p>
                          <p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{safeDateMonth(game.date)}</p>
                        </div>
                        <div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                          <h3 className="font-bold text-slate-900 mt-1 text-base group-hover:text-blue-700 transition-colors">{game.away} @ {game.home}</h3>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                          </div>
                          {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0">
                        {!showHistory && (
                          <>
                            <div className="flex flex-col items-end">
                              {/* ADMINS SER NAMNEN, ANDRA SER BARA ANTALET */}
                              {isAdmin ? (
                                gameApplications.length > 0 ? (
                                   <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                                     {gameApplications.map(app => (
                                        <span key={app.userId} className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-bold uppercase">{app.userName.split(' ')[0]}</span>
                                     ))}
                                   </div>
                                ) : (
                                   <span className="text-[10px] font-black text-slate-400 uppercase">0 {t.applied}</span>
                                )
                              ) : (
                                <span className="text-[10px] font-black text-slate-400 uppercase">{gameApplications.length} {t.applied}</span>
                              )}
                              {gameAssignments.length > 0 && (<span className="text-[10px] font-black text-green-600 uppercase mt-1">{gameAssignments.length}/{required} {t.staffed}</span>)}
                            </div>
                            
                            {isAssignedToThisGame ? (
                              <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4" /> {t.yourGame}
                              </div>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-colors ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}>
                                {isApplied ? t.withdraw : t.interested}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* LOCATIONS VIEW */}
        {view === 'locations' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {allLocationNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).map(locName => {
                  const locData = locationsData.find(l => l.id === locName) || { id: locName, address: '', facilities: [] };
                  return (
                    <div key={locName} onClick={() => setSelectedLocation(locName)} className="bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
                       <h3 className="font-black text-lg text-slate-800 group-hover:text-blue-600">{locName}</h3>
                       {locData.address && <p className="text-xs font-medium text-slate-500 mt-2 truncate flex items-center gap-1"><MapPin className="w-3 h-3"/>{locData.address}</p>}
                       <div className="mt-4"><span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">{locData.facilities.length || 0} {t.facilities}</span></div>
                    </div>
                  );
               })}
            </div>
          </div>
        )}

        {/* UMPIRE LIST VIEW */}
        {view === 'umpire-list' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex gap-4 mb-4">
               <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-slate-200">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-9 pr-3 py-3 bg-transparent text-sm outline-none" />
               </div>
               <select value={umpireSort} onChange={(e) => setUmpireSort(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase outline-none shadow-sm">
                  <option value="name">{t.name}</option>
                  <option value="level">{t.level}</option>
               </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedUmpireList.map(u => (
                <div key={u.id} onClick={() => { setSelectedProfileId(u.id); setView('umpire-profile'); }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 group-hover:bg-blue-50">
                       <span className="text-sm font-black text-slate-500 group-hover:text-blue-600">{u.name.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block group-hover:text-blue-700">{u.name}</span>
                      {u.level && <span className={`text-[8px] font-black mt-1 inline-block uppercase ${u.level.toLowerCase().includes('elit') ? 'text-green-600' : 'text-slate-500'}`}>{u.level}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MARKETPLACE VIEW */}
        {view === 'marketplace' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <ArrowRightLeft className="w-12 h-12 text-blue-600 mx-auto mb-4" />
               <h2 className="text-2xl font-black text-slate-800 uppercase">{t.marketplace}</h2>
               <p className="text-slate-500 font-medium mt-2">{t.marketplaceDesc}</p>
             </div>
             
             {/* Sektion 1: Matcher som bytes bort */}
             <div>
                <h3 className="text-sm font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {t.gamesForTrade}</h3>
                {games.filter(g => !showHistory && g.date >= today && assignments.some(a => a.gameId === g.id && a.forTrade)).length === 0 ? (
                  <p className="text-slate-400 text-sm italic">{t.noMarketplaceGames}</p>
                ) : (
                  <div className="grid gap-4">
                    {games.filter(g => !showHistory && g.date >= today && assignments.some(a => a.gameId === g.id && a.forTrade)).map(game => {
                      const tradeAssignments = assignments.filter(a => a.gameId === game.id && a.forTrade);
                      return (
                        <div key={game.id} className="bg-white p-5 rounded-2xl shadow-sm border border-yellow-200 flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                            <h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3>
                            <p className="text-sm text-slate-500">{game.date} kl {game.time} • {game.location}</p>
                          </div>
                          <div className="flex flex-col justify-center gap-2">
                            {tradeAssignments.map(asg => (
                              <button key={asg.id} onClick={() => takeTrade(asg, game)} className="bg-yellow-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors">
                                <ArrowRightLeft className="w-4 h-4"/> Ta över från {asg.userName}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>

             {/* Sektion 2: Matcher som saknar domare */}
             <div>
                <h3 className="text-sm font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4" /> {t.missingUmpires}</h3>
                {games.filter(g => !showHistory && g.date >= today && (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).length === 0 ? (
                  <p className="text-slate-400 text-sm italic">Inga matcher saknar domare just nu.</p>
                ) : (
                  <div className="grid gap-4">
                    {games.filter(g => !showHistory && g.date >= today && (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
                      const missingSpots = Math.max(0, (game.requiredUmpires || 2) - (groupedAssignments[game.id]?.length || 0));
                      const isApplied = umpireId && applications.some(a => a.gameId === game.id && a.userId === umpireId);
                      return (
                        <div key={game.id} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                            <h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3>
                            <p className="text-sm text-slate-500">{game.date} kl {game.time} • {game.location}</p>
                            <p className="text-xs font-black text-red-500 mt-2 uppercase">{missingSpots} plats(er) lediga</p>
                          </div>
                          <div className="flex flex-col justify-center">
                             <button onClick={() => isApplied ? toggleApplication(game.id) : expressInterestMarketplace(game)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase shadow-sm flex items-center justify-center gap-2 transition-colors ${isApplied ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                               <Plus className="w-4 h-4"/> {isApplied ? t.withdraw : t.expressInterest}
                             </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>
        )}

        {/* MY GAMES VIEW */}
        {view === 'my-apps' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Information Banners */}
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
               <Megaphone className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
               <div className="text-sm text-amber-800 font-medium leading-relaxed">
                 <p className="font-bold mb-2 text-amber-900">Sista datum för att anmäla tillgänglighet är idag (2026-04-05).</p>
                 <p>Har man inte lämnat in sin tillgänglighet så får man inga matcher den kommande säsongen.</p>
                 <p className="mt-2 text-amber-900 font-bold">Vi tillsätter fram tills sista Juni.</p>
               </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
               <Info className="w-6 h-6 text-blue-600 shrink-0" />
               <p className="text-sm text-blue-800 font-medium leading-relaxed">
                 {t.myGamesReminder}
               </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black uppercase text-slate-800">{t.mySchedule}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => generateCSV(myAssignedGames, selectedYear)} className="text-[10px] font-black uppercase px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Ladda ner (.ICS)
                </button>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setMyGamesViewMode('list')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1 ${myGamesViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List className="w-3.5 h-3.5"/> {t.listView}
                  </button>
                  <button onClick={() => setMyGamesViewMode('calendar')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1 ${myGamesViewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <CalendarIcon className="w-3.5 h-3.5"/> {t.calendarView}
                  </button>
                </div>
                <button onClick={() => setShowHistory(!showHistory)} className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${showHistory ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  <HistoryIcon className="w-3.5 h-3.5" /> {showHistory ? t.upcoming : t.history}
                </button>
              </div>
            </div>

            {/* Warning if any game has changed time */}
            {myAssignedGames.filter(g => groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange).length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-200">
                <h3 className="text-xs font-black text-yellow-700 uppercase mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {t.actionRequired}</h3>
                {myAssignedGames.filter(g => groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange).map(game => (
                  <div key={game.id} className="bg-white p-4 rounded-2xl border border-yellow-400 mb-3 shadow-sm">
                    <p className="font-bold">{game.away} @ {game.home}</p>
                    <p className="text-xs text-slate-500 mb-3">{game.date} @ {game.time}</p>
                    <div className="flex gap-2">
                      <button onClick={() => confirmScheduleChange(groupedAssignments[game.id].find(a => a.userId === umpireId).id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-blue-700">{t.acceptTime}</button>
                      <button onClick={() => removeAssignment(game.id, umpireId)} className="bg-slate-100 text-red-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-50">{t.declineTime}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmed Games */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.confirmedGames}</h2>
              </div>

              {myAssignedGames.length === 0 && <div className="text-center text-slate-400 p-8 bg-white rounded-3xl border border-slate-200">{t.noAssignedMatches}</div>}
              
              {myGamesViewMode === 'calendar' ? renderCalendar(myAssignedGames) : (
                myAssignedGames.filter(g => !groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange).map(game => {
                  const myAsg = groupedAssignments[game.id].find(a => a.userId === umpireId);
                  const coUmpires = groupedAssignments[game.id].filter(a => a.userId !== umpireId);
                  
                  return (
                    <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-5 rounded-2xl border border-green-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:border-green-400 transition-colors">
                      <div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                        <h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><Clock className="w-3 h-3"/> {game.date} @ {game.time} &bull; {game.location}</p>
                        
                        {/* Co-umpires section */}
                        <div className="mt-3 flex gap-2 items-center flex-wrap">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.coUmpires}</span>
                          {coUmpires.length > 0 ? (
                            coUmpires.map(a => (
                              <span key={a.userId} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold">{a.userName}</span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-medium">{t.noCoUmpires}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-center inline-block">{t.confirmed}</span>
                        {game.date >= today && features.marketplace && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, !myAsg.forTrade); }}
                            className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-colors ${myAsg.forTrade ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {myAsg.forTrade ? t.cancelTrade : t.tradeGame}
                          </button>
                        )}
                      </div>
                    </div>
                )})
              )}
            </div>

            {/* Interested Games */}
            {!showHistory && (
              <div className="space-y-4 pt-4">
                <div className="border-b border-slate-200 pb-2">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.interestedGames}</h2>
                </div>
                {myInterestedGames.length === 0 && <div className="text-center text-slate-400 p-8 bg-white rounded-3xl border border-slate-200">{t.noPendingInterest}</div>}
                
                {myInterestedGames.map(game => (
                  <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors">
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                      <h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3>
                      <p className="text-sm text-slate-500 mt-1">{game.date} @ {game.time} &bull; {game.location}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase border border-red-100 hover:bg-red-100 transition-colors w-full sm:w-auto">
                      {t.withdraw}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS VIEW */}
        {view === 'stats' && isAdmin && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="text-xl font-black uppercase">{t.analytics}</h2>
             <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
               <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-slate-50 border-b">
                   <tr>
                     <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black uppercase cursor-pointer hover:bg-slate-100">{t.umpire} {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                     <th onClick={() => handleSort('interest')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer hover:bg-slate-100">{t.interests} {sortConfig.key === 'interest' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                     <th onClick={() => handleSort('games')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer hover:bg-slate-100">{t.gamesAssigned} {sortConfig.key === 'games' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                     <th onClick={() => handleSort('rate')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer hover:bg-slate-100">{t.assignmentRate} {sortConfig.key === 'rate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sortedStatistics.map(stat => (
                     <tr key={stat.userId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-800">
                         <button onClick={() => { setSelectedProfileId(stat.userId); setView('umpire-profile'); }} className="hover:text-blue-600 hover:underline">
                           {stat.name}
                         </button>
                       </td>
                       <td className="px-6 py-4 text-center font-medium text-slate-600">{stat.interest}</td>
                       <td className="px-6 py-4 text-center font-black text-blue-600">{stat.games}</td>
                       <td className="px-6 py-4 text-center font-bold text-slate-700">
                         <span className={`px-3 py-1 rounded-lg text-[10px] ${stat.rate >= 80 ? 'bg-green-100 text-green-700 border border-green-200' : stat.rate >= 40 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{stat.rate}%</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* ADMIN STAFFING VIEW */}
        {view === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="text-center sm:text-left">
                 <h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2>
                 <p className="text-xs text-slate-500">{selectedYear} Season</p>
               </div>
               <div className="flex flex-wrap items-center gap-2">
                 <button onClick={handleDownloadBackup} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 flex items-center gap-2 transition-colors"><Download className="w-4 h-4" /> Backup</button>
                 <button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-200 transition-colors"><Plus className="w-4 h-4" /> {t.bulkImport}</button>
               </div>
             </div>

             {showImportTool && (
               <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 animate-in slide-in-from-top">
                 <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> {t.pasteSheet}</h3>
                 <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="YYYY-MM-DD	HH:MM	Serie	Borta	Hemma	Plats" className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs mb-4 outline-none" />
                 <div className="flex gap-3">
                   <button onClick={handleBulkImport} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs">{t.addGames}</button>
                   <button onClick={() => setShowImportTool(false)} className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-black uppercase text-xs">{t.cancel}</button>
                 </div>
               </div>
             )}

             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4" /> {t.globalAnnouncement}</h3>
               <textarea value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} placeholder={t.announcementPlaceholder} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none min-h-[80px]" />
               <div className="flex gap-2 mt-3">
                 <button onClick={saveGlobalNote} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-blue-700 transition-colors shadow-sm">{t.saveAnnouncement}</button>
                 <button onClick={clearGlobalNote} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-200 transition-colors">{t.clearAnnouncement}</button>
               </div>
             </div>

             <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-600" /> Bemanningsöversikt</h3>
               <div className="flex gap-2">
                 <button onClick={() => setShowHistory(!showHistory)} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-2 transition-colors ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><HistoryIcon className="w-3.5 h-3.5" />{showHistory ? t.upcoming : t.history}</button>
                 <button onClick={() => setShowStaffed(!showStaffed)} className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${showStaffed ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'}`}><CheckCircle className="w-3.5 h-3.5" />{showStaffed ? t.hideStaffed : t.showAll}</button>
               </div>
             </div>
             
             {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
               const gameAssignments = groupedAssignments[game.id] || [];
               const gameApplications = applications.filter(a => a.gameId === game.id);
               const required = game.requiredUmpires || 2;
               const isFullyStaffed = gameAssignments.length >= required;

               return (
                 <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-4 p-5 hover:border-blue-300 transition-colors">
                    {/* Kortets header */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-4 gap-3">
                       <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => setSelectedGameDetails(game)}>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                          <h3 className="font-bold text-lg">{game.away} @ {game.home}</h3>
                          <span className="text-xs font-bold text-slate-500">| {safeDateDay(game.date)} {game.date} @ {game.time}</span>
                       </div>
                       <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} TILLSATTA</span>
                          <button onClick={() => handleDeleteGame(game.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Vänster: Anmälningar */}
                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.applied}</h4>
                          {gameApplications.length > 0 ? (
                             <div className="flex flex-col gap-2">
                                {gameApplications.map(app => (
                                   <div key={app.userId} className="flex justify-between items-center bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                                      <span className="text-xs font-bold text-blue-900">{app.userName}</span>
                                      <button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="text-[9px] font-black tracking-widest uppercase bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Tilldela</button>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <p className="text-xs text-slate-400 italic">Inga intresseanmälningar ännu.</p>
                          )}
                       </div>

                       {/* Höger: Tillsatta & Manuell tilldelning */}
                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktuellt Domarteam</h4>
                          {gameAssignments.length > 0 ? (
                             <div className="flex flex-col gap-2 mb-3">
                                {gameAssignments.map(asg => (
                                   <div key={asg.userId} className="flex justify-between items-center bg-green-50 p-2.5 rounded-xl border border-green-200">
                                      <span className="text-xs font-bold text-green-900 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-600"/> {asg.userName}</span>
                                      <button onClick={() => removeAssignment(game.id, asg.userId)} className="text-[9px] font-black tracking-widest uppercase text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Ta bort</button>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <p className="text-xs text-slate-400 italic mb-3">Inga domare tillsatta.</p>
                          )}

                          {!isFullyStaffed && (
                             <div className="pt-2 border-t border-slate-100">
                                <select 
                                  value="" 
                                  onChange={(e) => { 
                                    if(e.target.value) { assignUmpire(game.id, e.target.value, masterUmpires.find(u=>u.id===e.target.value).name); } 
                                  }} 
                                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value="">+ Manuell tilldelning...</option>
                                  {masterUmpires.map(u => <option key={u.id} value={u.id}>{u.name} ({u.level})</option>)}
                                </select>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </main>

      {user?.email && (
        <button onClick={() => setShowAdminModal(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-blue-800 z-40 hover:scale-105 transition-transform">
          <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[10px] font-black uppercase">{userName ? userName.charAt(0) : '?'}</div>
          <span className="text-sm font-bold">{userName || 'Välj profil'}</span>
        </button>
      )}

      {!user?.email && (
        <button onClick={() => setShowAuthModal(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">Logga in</button>
      )}

      {/* MATCH DETAILS MODAL (Pop-up) */}
      {selectedGameDetails && (() => {
        const game = selectedGameDetails;
        const gameAssignments = groupedAssignments[game.id] || [];
        const gameApplications = applications.filter(a => a.gameId === game.id);
        const isGameSupervisor = Boolean(umpireId && game.supervisorId === umpireId);
        const canEvaluate = Boolean(umpireId && (isAdmin || isGameSupervisor));

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto relative custom-scrollbar">
              <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5"/></button>
              
              <div className="space-y-6 pt-4">
                <div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                  <h3 className="text-2xl font-black mt-3">{game.away} @ {game.home}</h3>
                  <p className="text-sm text-slate-500 font-bold uppercase mt-1">{game.date} @ {game.time}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center border border-blue-100 shadow-inner">
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p>
                    <p className="font-bold text-blue-900 text-sm mt-0.5">{game.location}</p>
                  </div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.location)}`} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors border border-blue-200">
                    <Map className="w-4 h-4"/> {t.mapDirections}
                  </a>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">{t.crew}</h4>
                    {gameAssignments.length > 0 ? (
                      <div className="grid gap-3">
                        {gameAssignments.map(asg => {
                          const m = masterUmpires.find(mu => mu.id === asg.userId);
                          const existingEval = evaluations.find(e => e.gameId === game.id && e.umpireId === asg.userId);
                          
                          return (
                            <div key={asg.userId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-xs">
                                     {asg.userName.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm text-slate-800 block">{asg.userName}</span>
                                    {m?.level && <span className={`text-[8px] font-black inline-block mt-0.5 uppercase ${m.level.toLowerCase().includes('elit') ? 'text-green-600' : 'text-slate-500'}`}>{m.level}</span>}
                                  </div>
                                </div>
                              </div>
                              
                              {features.evaluations && canEvaluate && !existingEval && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <p className="text-[10px] font-black uppercase text-purple-600 mb-2">{t.evaluate}</p>
                                  <div className="flex flex-col gap-2">
                                    <select onChange={(e) => setEvalGrade(parseInt(e.target.value))} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-purple-400">
                                      <option value="0">{t.grade}...</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <textarea placeholder={t.feedback} onChange={(e) => setEvalComment(e.target.value)} className="p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400 min-h-[80px]" />
                                    <button onClick={() => { if(evalGrade > 0) submitEvaluation(game.id, asg.userId, evalGrade, evalComment); }} className="bg-purple-600 hover:bg-purple-700 transition-colors text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-sm tracking-widest mt-1">
                                      {t.saveEval}
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {existingEval && Boolean(umpireId && (isAdmin || isGameSupervisor || asg.userId === umpireId)) && (
                                <div className="mt-3 pt-3 border-t border-slate-200 bg-purple-50 p-3 rounded-xl flex flex-col gap-2">
                                  <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest">{t.yourEval}</p>
                                  <div className="flex items-start gap-3">
                                    <span className="bg-purple-600 text-white w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-sm font-black shadow-sm">{existingEval.grade}</span>
                                    <span className="text-xs text-purple-900 font-medium italic leading-relaxed pt-1">"{existingEval.comment}"</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-400 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{t.notAssigned || "Inga domare tillsatta än."}</p>
                    )}
                  </div>

                  {isAdmin && (
                    <>
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.interests} ({gameApplications.length})</h4>
                        {gameApplications.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {gameApplications.map(app => {
                              const m = masterUmpires.find(mu => mu.id === app.userId);
                              return (
                                <div key={app.userId} className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                  <span className="text-xs font-bold text-blue-800">{app.userName}</span>
                                  {m?.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                                  <button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="ml-2 text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 font-black text-[9px] uppercase tracking-widest shadow-sm transition-colors">
                                    Tilldela
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs italic text-slate-400 font-medium">{t.noInterests}</p>
                        )}
                      </div>

                      <div className="pt-6 border-t border-slate-100 space-y-3 bg-slate-50 p-5 rounded-2xl border mt-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-widest mb-3"><Shield className="w-3.5 h-3.5" /> {t.officials} (Admin)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 pl-1">{t.supervisor}</label>
                            <select value={game.supervisorId || ''} onChange={(e) => assignOfficial(game.id, 'supervisor', e.target.value)} className="w-full mt-1.5 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400">
                              <option value="">{t.selectAdmin}</option>
                              {masterUmpires.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 pl-1">{t.techComm}</label>
                            <input type="text" value={game.tcName || ''} onChange={(e) => assignOfficial(game.id, 'tc', e.target.value)} placeholder={t.enterTCName} className="w-full mt-1.5 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-400" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => setSelectedGameDetails(null)} className="w-full py-4 mt-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">{t.close}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl animate-in zoom-in relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
              <h3 className="text-2xl font-black">{t.login}</h3>
              <p className="text-xs text-slate-400 mt-1">{t.loginToContinue}</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder={t.email}/>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder={t.password}/>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg">{isLoginMode ? t.login : t.register}</button>
            </form>
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full text-xs font-bold text-slate-500">{isLoginMode ? t.noAccount : t.hasAccount}</button>
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
                        onClick={async () => { setUserName(u.name); setUmpireId(u.id); await updateProfile(u.name, u.id); setShowNamePrompt(false); setSearchQuery(''); }} 
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">{u.name}</span>
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

              {features.reminders && umpireId && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.reminderPreferences}</p>
                    <p className="text-xs font-bold text-slate-700">{t.receiveReminders}</p>
                  </div>
                  <button 
                    onClick={() => toggleUmpireReminderPref(umpireId, (masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled)}
                    className={`p-2 rounded-xl transition-colors flex items-center justify-center ${(masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled !== false ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-slate-200 text-slate-400'}`}
                  >
                    {(masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled !== false ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </button>
                </div>
              )}
              
              {isAdmin && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Admin</p>
                    <p className="text-[10px] text-blue-600 font-medium">Behörighet beviljad via e-post</p>
                  </div>
                </div>
              )}

              {isSuperAdmin && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Sliders className="w-4 h-4" /> {t.superAdminSettings}
                  </h4>
                  
                  <button onClick={() => toggleSystemFeature('marketplace')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-xs font-bold text-purple-900">{t.featureMarketplace}</span>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.marketplace ? 'bg-purple-600' : 'bg-slate-300'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.marketplace ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                  
                  <button onClick={() => toggleSystemFeature('evaluations')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-xs font-bold text-purple-900">{t.featureEvaluations}</span>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.evaluations ? 'bg-purple-600' : 'bg-slate-300'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.evaluations ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                  
                  <button onClick={() => toggleSystemFeature('reminders')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="text-xs font-bold text-purple-900">{t.featureReminders}</span>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.reminders ? 'bg-purple-600' : 'bg-slate-300'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.reminders ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>

                  {features.reminders && (
                    <button onClick={forceRunRemindersNow} className="w-full mt-2 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5" /> {t.runRemindersNow}
                    </button>
                  )}
                </div>
              )}
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
