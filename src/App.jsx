import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, 
  deleteDoc, writeBatch, addDoc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail,
  signInAnonymously, signInWithCustomToken, signOut
} from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Import Icons
import { 
  Calendar as CalendarIcon, Shield, CheckCircle, Clock, Settings, Trash2, 
  MapPin, RefreshCw, Trophy, FileText, Plus, ChevronDown, ChevronUp, Search, 
  BarChart3, History as HistoryIcon, Info, User, UserPlus, Download, 
  UserCheck, Edit2, LogOut, ChevronRight, List, ChevronLeft, 
  ArrowUp, Users2, X, AlertTriangle, ArrowLeft, Megaphone, 
  MessageCircle, Code, Send, Share2, Map, Mail,
  ArrowRightLeft, Star, Navigation, Bell, BellOff, Sliders,
  Calculator, Printer, Car, CreditCard, Save, Camera
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
    appTitle: "Domarportalen", season: "Säsong", schedule: "Spelschema", myGames: "Mina Matcher",
    myProfile: "Min profil", umpireList: "Domarlista", staffing: "Bemanning", analytics: "Statistik",
    history: "Historik", upcoming: "Kommande", archived: "Arkiverade matcher", activeSchedule: "Aktivt schema",
    searchPlaceholder: "Sök matcher...", allSeries: "Alla serier", allLocations: "Alla platser",
    filterStatusAll: "Alla statusar", needsUmpire: "Saknar domare", noInterests: "Inga anmälningar",
    noGames: "Inga matcher hittades.", syncNow: "Synka förbundsdata nu", applied: "Anmälda",
    interested: "Intresserad", withdraw: "Dra tillbaka", assignedTo: "Tillsatta", staffed: "Bemannad",
    partiallyStaffed: "Delvis bemannad", bulkImport: "Massimport", pendingAssignments: "Bemanningsöversikt",
    staffingControl: "Bemanningskontroll", hideStaffed: "Dölj helt bemannade", showAll: "Visa alla matcher",
    removeAssignment: "Ta bort", deleteGame: "Ta bort match", deleteAllGames: "Rensa hela säsongen",
    deleteAllConfirm: "ÄR DU HELT SÄKER?", deleteAllSuccess: "Säsongen har rensats.",
    downloadBackup: "Ladda ner backup", umpire: "Domare", interests: "Intresseanmälningar",
    gamesAssigned: "Dömda matcher", assignmentRate: "Tillsättningsgrad", noStats: "Ingen data finns registrerad än.",
    mySchedule: "Mitt Schema", noAssignedMatches: "Du har inga bekräftade matchuppdrag än.",
    noPendingInterest: "Du har inte anmält intresse för några matcher.", confirmed: "Bekräftad",
    settings: "Inställningar", userSettings: "Användarinställningar", profileAccess: "Konfigurera profil & åtkomst",
    displayName: "Visningsnamn", namePlaceholder: "Sök eller skriv ditt namn...", logout: "Logga ut",
    close: "Stäng", status: "Status", setProfile: "Välj din profil", pasteSheet: "Klistra in från Google Sheets",
    addGames: "Lägg till matcher", importSuccess: "Import lyckades", cancel: "Avbryt", date: "Datum",
    crew: "Domarteam", addToCalendar: "Spara i kalender", downloadFullSchedule: "Ladda ner (.ICS)",
    confirmedGames: "Bekräftade uppdrag", interestedGames: "Anmält intresse", nameRequiredTitle: "Vem är du?",
    nameRequiredDesc: "Välj ditt namn från listan nedan för att koppla ditt konto till dina matcher.",
    saveName: "Välj profil", addNewName: "Hittar du inte ditt namn?", createUmpire: "Skapa ny profil",
    masterList: "Domarlista", editName: "Ändra namn", save: "Spara", selectFromList: "Välj från listan",
    changeUser: "Byt användare", editMatch: "Ändra matchdata", home: "Hemma", away: "Borta",
    time: "Tid", location: "Plats", locations: "Platser", league: "Serie", saveChanges: "Spara ändringar",
    listView: "Lista", calendarView: "Kalender", days: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
    months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
    requiredUmpires: "Antal domare", level: "Nivå", name: "Namn", sortBy: "Sortera", week: "V.",
    login: "Logga in", register: "Skapa konto", email: "E-postadress", phone: "Telefonnummer",
    password: "Lösenord", loginToContinue: "Logga in för att fortsätta", noAccount: "Inget konto? Registrera dig här",
    hasAccount: "Har du redan ett konto? Logga in", adminManagement: "Administratörer", masterAdminInfo: "Du är inloggad som Master Admin.",
    linkedAccount: "Konto:", notLinked: "Inget konto", umpireProfile: "Domarprofil", back: "Tillbaka",
    assignedMatches: "Tillsatta matcher", totalAssignments: "Tillsättningar", totalInterests: "Intresseanmälningar",
    deleteUmpireConfirm: "Är du säker på att du vill ta bort", globalAnnouncement: "Globalt Meddelande",
    saveAnnouncement: "Publicera", clearAnnouncement: "Ta bort", announcementPlaceholder: "Skriv ett viktigt meddelande som visas för alla...",
    bookedIn: "Bokad i", coUmpires: "Dömer med:", noCoUmpires: "Inga meddomare", calendarColumn: "Kalender",
    gameDetails: "Matchinformation", mapDirections: "Öppna Karta", officials: "Domarteam", supervisor: "Supervisor",
    techComm: "Technical Commissioner", notAssigned: "Ej tillsatt", yourGame: "Din match", marketplace: "Marknad",
    marketplaceDesc: "Här visas matcher som andra vill byta bort och matcher som saknar domare.", tradeGame: "Byt bort",
    cancelTrade: "Ångra byte", takeGame: "Ta match", expressInterest: "Anmäl intresse", gamesForTrade: "Matcher som bytes bort",
    missingUmpires: "Matcher som saknar domare", noMarketplaceGames: "Inga matcher på marknaden just nu.",
    tradeSuccess: "Du har tagit över matchen!", tradeConfirm: "Är du säker på att du vill ta över denna match?",
    evaluate: "Utvärdera", grade: "Betyg", feedback: "Feedback", saveEval: "Spara utvärdering", evalSaved: "Utvärdering sparad",
    yourEval: "Utvärdering", selectAdmin: "Välj Admin...", enterTCName: "Ange namn på TC...", umpireShort: "DOMARE",
    supShort: "SUP", tcShort: "TC", address: "Adress", facilities: "Faciliteter", noFacilities: "Inga faciliteter",
    addFacility: "Lägg till facilitet...", editLocation: "Redigera plats", matchMovedWarning: "Match flyttad! Bekräfta om du kan den nya tiden.",
    acceptTime: "Acceptera ny tid", declineTime: "Kan inte (Avboka)", timeChangedBadge: "Tid Ändrad", actionRequired: "Kräver åtgärd",
    superAdminSettings: "Systemarkitektur (Super Admin)", featureMarketplace: "Aktivera Marknadsplats",
    featureEvaluations: "Aktivera Utvärderingar", featureReminders: "E-postpåminnelser", reminderPreferences: "Mina Notiser",
    receiveReminders: "Få e-postpåminnelser", runRemindersNow: "Kör Påminnelser Nu", invoiceTitle: "Reseräkning",
    digitalSubmission: "Digital inlämning", personalInfo: "Personuppgifter", pnr: "Personnummer", streetAddress: "Gatuadress",
    zipCity: "Postnummer & Ort", bankAccount: "Bank & Kontonummer", tripsAllowance: "Resor (Milersättning & Restid)",
    assignmentDetails: "Ändamål (Vilka lag spelade?)", travelFrom: "Resa Från", travelTo: "Resa Till", roundTrip: "Tur & Retur",
    distanceMil: "Antal Mil", calcAuto: "Beräkna avstånd (Auto)", calculating: "Beräknar...", addTrip: "Lägg till ytterligare en resa",
    expensesAllowance: "Övriga Utlägg & Traktamente", description: "Beskrivning", amount: "Belopp (kr)", addExpense: "Lägg till utlägg",
    overnightNights: "Övernattningstraktamente (Antal nätter)", advanceDeduction: "Avgår förskott (kr)", summary: "Sammanställning",
    mileageComp: "Milersättning", travelTimeComp: "Tilläggsarvode (Lång resa)", overnightComp: "Övernattningstraktamente",
    otherExpenses: "Övriga Utlägg", totalToReceive: "Totalt att erhålla", downloadPDF: "Ladda ner PDF", sendToFed: "Skicka till Förbundet",
    sendToSelf: "Skicka test till mig", sentSuccess: "Insänt & Klart!", sentSuccessFed: "Din reseräkning har skickats in till Förbundet.",
    sentSuccessSelf: "En kopia har skickats till din e-post.", newInvoice: "Skapa ny reseräkning", selectGame: "-- Välj en av dina matcher --",
    homeLocation: "Hem", homeAddressLabel: "Hemadress", foundAssignments: "Hämta från schema:", pastInvoices: "Tidigare reseräkningar",
    historicalStats: "Historisk Statistik (Tidigare säsonger)", historicalGames: "Totalt dömda matcher",
    historicalNote: "Datan kan redigeras av administratörer.", streetAddressHidden: "Gatuadress (Dold för andra)",
    cityPublic: "Ort (Offentlig)", changePicture: "Byt bild", backToUmpireList: "Tillbaka till Domarlistan", contactInfo: "Kontaktuppgifter",
    notProvided: "Ej angivet", homeAddress1: "Hemadress 1", cityPlaceholder: "Stockholm", saveDetails: "Spara uppgifter",
    assignedMatchesCount: "tillsatta matcher", updateHistory: "Uppdatera historik", fillFromTo: "Fyll i både 'Från' och 'Till' för att kunna beräkna avståndet automatiskt.",
    addressMissing: "Gatuadress och postort saknas.", coordsMissing: "Kunde inte hitta exakta koordinater.", routeMissing: "Kunde inte hitta en giltig körrutt.",
    autoCalcFailed: "Automatisk beräkning misslyckades. Skriv in avståndet manuellt.", errorOccurred: "Ett fel uppstod. Vänligen försök igen.",
    testInvoiceSentTo: "I test-syfte har reseräkningen skickats till", savedSuccess: "Sparat!",
    conflictApply: "Kan inte anmäla! Du är redan bokad i {location} den här dagen.", interestRegistered: "Intresse anmält! Administratörerna ser nu din anmälan.",
    conflictAssign: "Kan inte tillsätta! {name} är redan bokad i {location} den här dagen.", sandboxLoaded: "50 test-matcher har laddats in i Sandbox!",
    downloadICS: "Ladda ner (.ICS)", availabilityWarningTitle: "Sista datum för att anmäla tillgänglighet är idag.",
    availabilityWarningDesc1: "Har man inte lämnat in sin tillgänglighet så får man inga matcher den kommande säsongen.",
    availabilityWarningDesc2: "Vi tillsätter fram tills sista Juni.", assigned: "TILLSATTA", takeOverFrom: "Ta över från",
    spotsAvailable: "plats(er) lediga", noInterestsYet: "Inga intresseanmälningar ännu.", currentCrew: "Aktuellt Domarteam",
    noUmpiresAssigned: "Inga domare tillsatta.", manualAssign: "+ Manuell tilldelning...", assignBtn: "Tilldela", removeBtn: "Ta bort",
    pasteSchedulePlaceholder: "Klistra in spelschema...", unknown: "Okänd", sandboxWarning: "SANDBOX-MILJÖ - INGEN DATA SPARAS TILL PRODUKTION",
    deleteAvatarConfirm: "Vill du verkligen ta bort din profilbild?", deleteAvatar: "Ta bort bild", open: "Öppna",
    droveCar: "Egen bil", carpooling: "Samåker", invoiceCommentLabel: "Övriga kommentarer",
    invoiceCommentPlaceholder: "T.ex. privat övernattning, samåker med [Namn], eller avvikande rutt...",
    receiptsReminder: "OBS! Om du har övriga utlägg, glöm inte att maila kvittona separat till info@sbslf.se."
  },
  en: {
    appTitle: "Umpire Portal", season: "Season", schedule: "Schedule", myGames: "My Games", myProfile: "My Profile",
    umpireList: "Umpire List", staffing: "Staffing", analytics: "Analytics", history: "History", upcoming: "Upcoming",
    archived: "Archived Games", activeSchedule: "Active Schedule", searchPlaceholder: "Search...", allSeries: "All Series",
    allLocations: "All Locations", filterStatusAll: "All Statuses", needsUmpire: "Needs Umpire", noInterests: "No Interests",
    noGames: "No games found.", syncNow: "Sync Federation Data Now", applied: "Interested", interested: "Interested",
    withdraw: "Withdraw", assignedTo: "Crew", staffed: "Fully Staffed", partiallyStaffed: "Partially Staffed",
    bulkImport: "Bulk Import", pendingAssignments: "Staffing Desk", staffingControl: "Staffing Control",
    hideStaffed: "Hide Fully Staffed", showAll: "Show All Games", removeAssignment: "Remove", deleteGame: "Delete Game",
    deleteConfirm: "Are you sure you want delete this game?", deleteAllGames: "Clear Entire Season",
    deleteAllConfirm: "ARE YOU ABSOLUTELY SURE? This will delete ALL data.", deleteAllSuccess: "Season cleared successfully.",
    downloadBackup: "Download Backup (JSON)", umpire: "Umpire", interests: "Interests", gamesAssigned: "Games Assigned",
    assignmentRate: "Assignment Rate", noStats: "No engagement data recorded yet.", mySchedule: "My Schedule",
    noAssignedMatches: "You have no confirmed assignments yet.", noPendingInterest: "You haven't marked interest in any matches.",
    confirmed: "Confirmed", settings: "Settings", userSettings: "User Settings", profileAccess: "Configure profile & access",
    displayName: "Display Name", namePlaceholder: "Search or type name...", logout: "Logout", close: "Close",
    status: "Status", setProfile: "Select Your Profile", pasteSheet: "Paste from Google Sheets", addGames: "Add Games",
    importSuccess: "Import Successful", cancel: "Cancel", date: "Date", crew: "Umpire Crew", addToCalendar: "Add to Calendar",
    downloadFullSchedule: "Download (.ics)", confirmedGames: "Confirmed Assignments", interestedGames: "Interested Matches",
    nameRequiredTitle: "Who are you?", nameRequiredDesc: "Select your name from the list below to sync your schedule across devices.",
    saveName: "Select Profile", addNewName: "Can't find your name?", createUmpire: "Create new profile", masterList: "Umpire Master List",
    editName: "Edit Name", save: "Save", selectFromList: "Select from list", changeUser: "Change User", editMatch: "Edit Match Details",
    home: "Home", away: "Away", time: "Time", location: "Location", locations: "Locations", league: "League", saveChanges: "Save Changes",
    listView: "List", calendarView: "Calendar", days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    requiredUmpires: "Crew Size", level: "Level", name: "Name", sortBy: "Sort by", week: "W.", login: "Login", register: "Register",
    email: "Email Address", phone: "Phone Number", password: "Password", forgotPassword: "Forgot Password?",
    loginToContinue: "Login to continue", createAnAccount: "Create a new account", noAccount: "No account? Register here",
    hasAccount: "Already have an account? Login", loginRequiredMsg: "You must be logged in to view this.",
    adminManagement: "Admin Roles", masterAdminInfo: "You are logged in as Master Admin.", linkedAccount: "Account:",
    notLinked: "No account", umpireProfile: "Umpire Profile", back: "Back", assignedMatches: "Assigned Matches",
    totalAssignments: "Assignments", totalInterests: "Interests", deleteUmpireConfirm: "Are you sure you want to remove",
    globalAnnouncement: "Global Announcement", saveAnnouncement: "Publish", clearAnnouncement: "Clear",
    announcementPlaceholder: "Type an important message to display to everyone...", bookedIn: "Booked in", coUmpires: "Co-umpires:",
    noCoUmpires: "No co-umpires", calendarColumn: "Calendar", gameDetails: "Game Details", mapDirections: "Open Map",
    officials: "Officials", supervisor: "Supervisor", techComm: "Technical Commissioner", notAssigned: "Not Assigned",
    yourGame: "Your Game", marketplace: "Marketplace", marketplaceDesc: "Find games that other umpires are giving away or games missing umpires.",
    tradeGame: "Give Away", cancelTrade: "Cancel Give Away", takeGame: "Take Game", expressInterest: "Express Interest",
    gamesForTrade: "Games Up For Trade", missingUmpires: "Games missing umpires", noMarketplaceGames: "No games are up for trade right now.",
    tradeSuccess: "You have taken over the game!", tradeConfirm: "Are you sure you want to take over this game?",
    evaluate: "Evaluate", grade: "Grade", feedback: "Feedback / Comment", saveEval: "Save Evaluation", evalSaved: "Evaluation Saved",
    yourEval: "Evaluation", selectAdmin: "Select Admin...", enterTCName: "Enter TC name...", umpireShort: "UMP",
    supShort: "SUP", tcShort: "TC", address: "Address", facilities: "Facilities", noFacilities: "No facilities listed",
    addFacility: "Add facility...", editLocation: "Edit Location", matchMovedWarning: "Game Rescheduled! Please confirm if you can make the new time.",
    acceptTime: "Accept New Time", declineTime: "Cannot Make It", timeChangedBadge: "Time Changed", actionRequired: "Action Required",
    superAdminSettings: "System Architecture (Super Admin)", featureMarketplace: "Enable Marketplace (Trade Board)",
    featureEvaluations: "Enable Evaluation System", featureReminders: "Automated Email Reminders", reminderPreferences: "My Notifications",
    receiveReminders: "Receive email reminders for my upcoming games", runRemindersNow: "Run Reminders Cron", invoiceTitle: "Travel Invoice",
    digitalSubmission: "Digital Submission", personalInfo: "Personal Information", pnr: "Personal ID (PNR)", streetAddress: "Street Address",
    zipCity: "Zip Code & City", bankAccount: "Bank Account", tripsAllowance: "Trips (Mileage & Travel Time)",
    assignmentDetails: "Assignment (Which teams played?)", travelFrom: "Travel From", travelTo: "Travel To", roundTrip: "Round Trip",
    distanceMil: "Distance (Mil)", calcAuto: "Calculate Distance (Auto)", calculating: "Calculating...", addTrip: "Add another trip",
    expensesAllowance: "Other Expenses & Allowance", description: "Description", amount: "Amount (SEK)", addExpense: "Add Expense",
    overnightNights: "Overnight Allowance (Nights)", advanceDeduction: "Advance Deduction (SEK)", summary: "Summary",
    mileageComp: "Mileage Compensation", travelTimeComp: "Additional Fee (Long travel)", overnightComp: "Overnight Allowance",
    otherExpenses: "Other Expenses", totalToReceive: "Total to Receive", downloadPDF: "Download PDF", sendToFed: "Send to Federation",
    sendToSelf: "Send Test to Me", sentSuccess: "Submitted Successfully!", sentSuccessFed: "Your invoice has been submitted.",
    sentSuccessSelf: "A copy has been sent to your email.", newInvoice: "Create new invoice", selectGame: "-- Select an assigned game --",
    homeLocation: "Home", homeAddressLabel: "Home Address", foundAssignments: "Load from schedule:", pastInvoices: "Past Invoices",
    historicalStats: "Historical Stats", historicalGames: "Total officiated games", historicalNote: "Data can be edited by an admin.",
    streetAddressHidden: "Street Address (Hidden)", cityPublic: "City (Public)", changePicture: "Change Picture",
    backToUmpireList: "Back to Umpire List", contactInfo: "Contact Information", notProvided: "Not provided", homeAddress1: "Home Address 1",
    cityPlaceholder: "Stockholm", saveDetails: "Save Details", assignedMatchesCount: "assigned games", updateHistory: "Update History",
    fillFromTo: "Fill in both 'From' and 'To' to calculate distance.", addressMissing: "Street address and city are missing.",
    coordsMissing: "Could not find exact coordinates.", routeMissing: "Could not find a valid driving route.",
    autoCalcFailed: "Automatic calculation failed. Enter distance manually.", errorOccurred: "An error occurred. Please try again.",
    testInvoiceSentTo: "For testing purposes, the invoice was sent to", savedSuccess: "Saved!",
    conflictApply: "Cannot apply! You are already booked in {location} on this day.", interestRegistered: "Interest registered!",
    conflictAssign: "Cannot assign! {name} is already booked in {location} on this day.", sandboxLoaded: "50 test games loaded into Sandbox!",
    downloadICS: "Download (.ICS)", availabilityWarningTitle: "Deadline for availability is today.",
    availabilityWarningDesc1: "If you have not submitted your availability, you will not receive games.", availabilityWarningDesc2: "We assign games until June.",
    assigned: "ASSIGNED", takeOverFrom: "Take over from", spotsAvailable: "spot(s) available", noInterestsYet: "No interests marked yet.",
    currentCrew: "Current Crew", noUmpiresAssigned: "No umpires assigned.", manualAssign: "+ Manual Assignment...", assignBtn: "Assign",
    removeBtn: "Remove", pasteSchedulePlaceholder: "Paste schedule here...", unknown: "Unknown", sandboxWarning: "SANDBOX ENVIRONMENT",
    deleteAvatarConfirm: "Are you sure you want to remove your profile picture?", deleteAvatar: "Remove picture", open: "Open",
    droveCar: "My Car", carpooling: "Carpool", invoiceCommentLabel: "Additional Comments",
    invoiceCommentPlaceholder: "E.g. private accommodation, carpooling with [Name], or route changes...",
    receiptsReminder: "NOTE! If you have additional expenses, email receipts to info@sbslf.se."
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

// ==========================================
// UMPIRE PROFILE MODAL COMPONENT
// ==========================================
function UmpireProfileModal({ 
  selectedProfileId, setSelectedProfileId, masterUmpires, assignments, 
  umpireId, isAdmin, selectedYear, t, getLevelStyles, db, appId 
}) {
  const umpireData = masterUmpires.find(u => u.id === selectedProfileId);
  const isMe = umpireId === selectedProfileId;
  const canEdit = isAdmin || isMe;
  
  const [editData, setEditData] = useState({
     linkedEmail: '', phone: '', address: '', city: '', historicGames: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     if (umpireData) {
        setEditData({
           linkedEmail: umpireData.linkedEmail || '',
           phone: umpireData.phone || '',
           address: umpireData.address || '',
           city: umpireData.city || '',
           historicGames: parseInt(umpireData.historicGames || 0)
        });
     }
  }, [umpireData]);

  if (!umpireData) return null;

  const currentSeasonGames = assignments.filter(a => a.userId === selectedProfileId).length;

  const handleSave = async () => {
     setIsSaving(true);
     try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', selectedProfileId), {
           linkedEmail: editData.linkedEmail.trim().toLowerCase(),
           phone: editData.phone.trim(),
           address: editData.address.trim(),
           city: editData.city.trim(),
           historicGames: parseInt(editData.historicGames) || 0
        }, { merge: true });
        if (typeof window !== 'undefined') alert(t.savedSuccess);
     } catch(e) {
        if (typeof window !== 'undefined') alert(t.errorOccurred);
     }
     setIsSaving(false);
  };

  const handleAvatarUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
         const img = new Image();
         img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 256;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
            else { if (h > MAX) { w *= MAX / h; h = MAX; } }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', selectedProfileId), { avatarUrl: dataUrl }, { merge: true });
         };
         img.src = event.target.result;
      };
      reader.readAsDataURL(file);
  };

  const handleAvatarDelete = async () => {
    if (window.confirm(t.deleteAvatarConfirm)) {
       await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', selectedProfileId), { avatarUrl: null }, { merge: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 relative max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="relative pt-12 pb-6 px-8 text-center bg-slate-50 border-b border-slate-100 shrink-0">
           <button onClick={() => setSelectedProfileId(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition-colors z-10"><X className="w-5 h-5"/></button>
           
           <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                 {umpireData.avatarUrl ? (
                    <img src={umpireData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-4xl font-black text-blue-900">{(umpireData.name || '?').charAt(0)}</span>
                 )}
              </div>
              
              {canEdit && (
                <>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition-colors" title={t.changePicture}>
                     <Camera className="w-4 h-4" />
                     <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {umpireData.avatarUrl && (
                    <button onClick={handleAvatarDelete} className="absolute bottom-0 left-0 bg-red-100 text-red-600 p-2.5 rounded-full shadow-md cursor-pointer hover:bg-red-200 transition-colors" title={t.deleteAvatar}>
                       <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
           </div>
           
           <h2 className="text-3xl font-black text-slate-800">{umpireData.name}</h2>
           
           {umpireData.city && (
             <p className="text-sm font-bold text-slate-500 mt-1 flex items-center justify-center gap-1"><MapPin className="w-3.5 h-3.5"/> {umpireData.city}</p>
           )}

           <div className="mt-3 inline-block">
             <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase ${getLevelStyles(umpireData.level)}`}>{umpireData.level}</span>
           </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <User className="w-4 h-4" /> {t.contactInfo}
               </h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label>
                   {canEdit ? (
                     <input type="email" value={editData.linkedEmail} onChange={e => setEditData({...editData, linkedEmail: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1 focus:border-blue-400" />
                   ) : (
                     <p className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 mt-1 break-all">{editData.linkedEmail || t.notProvided}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.phone}</label>
                   {canEdit ? (
                     <input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1 focus:border-blue-400" />
                   ) : (
                     <p className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 mt-1">{editData.phone || t.notProvided}</p>
                   )}
                 </div>

                 {canEdit && (
                   <>
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.streetAddressHidden}</label>
                       <input type="text" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} placeholder={t.homeAddress1} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1 focus:border-blue-400" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.cityPublic}</label>
                       <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} placeholder={t.cityPlaceholder} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1 focus:border-blue-400" />
                     </div>
                     <button onClick={handleSave} disabled={isSaving} className="w-full py-3 mt-2 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                       {isSaving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} {t.saveDetails}
                     </button>
                   </>
                 )}
               </div>
             </div>

             <div className="space-y-6">
               <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-sm">
                 <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <CalendarIcon className="w-4 h-4" /> {t.season} {selectedYear}
                 </h3>
                 <div className="flex items-end gap-3">
                   <span className="text-5xl font-black">{currentSeasonGames}</span>
                   <span className="text-sm font-bold text-blue-200 pb-1">{t.assignedMatchesCount}</span>
                 </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <HistoryIcon className="w-4 h-4" /> {t.historicalStats}
                 </h3>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.historicalGames}</label>
                     {isAdmin ? (
                       <input type="number" value={editData.historicGames} onChange={e => setEditData({...editData, historicGames: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-blue-600 outline-none mt-1 focus:border-blue-400" />
                     ) : (
                       <p className="p-3 bg-white border border-slate-200 rounded-xl text-xl font-black text-slate-700 mt-1">{editData.historicGames} st</p>
                     )}
                   </div>
                   <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                     {t.historicalNote}
                   </p>
                   {isAdmin && (
                     <button onClick={handleSave} disabled={isSaving} className="w-full py-2 bg-slate-200 text-slate-700 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-300 disabled:opacity-50">
                       {t.updateHistory}
                     </button>
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TRAVEL INVOICE COMPONENT
// ==========================================
function TravelInvoiceView({ db, appId, locationsData, user, userName, t, myAssignedGames, myUmpireData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentTarget, setSentTarget] = useState('');
  const [calculatingIndex, setCalculatingIndex] = useState(null);
  const [pastInvoices, setPastInvoices] = useState([]);

  const [personalInfo, setPersonalInfo] = useState({
    name: '', pnr: '', address: '', zipCity: '', bank: '', email: ''
  });

  const [trips, setTrips] = useState([
    { id: Date.now(), date: '', assignment: '', from: '', to: '', distance: '', roundTrip: true, isDriver: true }
  ]);

  const [expenses, setExpenses] = useState([
    { id: Date.now(), description: '', amount: '' }
  ]);

  const [advance, setAdvance] = useState('');
  const [overnightCount, setOvernightCount] = useState('');
  const [invoiceComment, setInvoiceComment] = useState('');

  useEffect(() => {
    if (user && user.uid) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'invoiceData');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPersonalInfo(prev => ({ 
               ...prev, 
               ...docSnap.data(), 
               address: docSnap.data().address || myUmpireData?.address || '',
               zipCity: docSnap.data().zipCity || myUmpireData?.city || '',
               email: user?.email || docSnap.data().email || prev.email || '' 
            }));
          } else {
            setPersonalInfo(prev => ({ 
               ...prev, 
               name: userName || myUmpireData?.name || '', 
               email: user?.email || '',
               address: myUmpireData?.address || '',
               zipCity: myUmpireData?.city || ''
            }));
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
       setPersonalInfo(prev => ({ 
          ...prev, name: userName, email: user?.email || '', address: myUmpireData?.address || '', zipCity: myUmpireData?.city || '' 
       }));
    }
  }, [user, appId, userName, db, myUmpireData]);

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleTripChange = (id, field, value) => {
    setTrips(trips.map(trip => trip.id === id ? { ...trip, [field]: value } : trip));
  };

  const addTrip = () => {
    setTrips([...trips, { id: Date.now(), date: '', assignment: '', from: '', to: '', distance: '', roundTrip: true, isDriver: true }]);
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
      alert(t.fillFromTo);
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
         throw new Error(t.addressMissing);
      }

      const fromRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddress + ', Sweden')}`);
      const fromData = await fromRes.json();
      
      const toRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddress + ', Sweden')}`);
      const toData = await toRes.json();

      if (fromData.length === 0 || toData.length === 0) throw new Error(t.coordsMissing);

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
         throw new Error(t.routeMissing);
      }
    } catch (err) {
      alert(t.autoCalcFailed);
    } finally {
      setCalculatingIndex(null);
    }
  };

  const calculated = useMemo(() => {
    let totalMilage = 0;
    let travelBonus = 0;

    trips.forEach(trip => {
      const dist = parseFloat(trip.distance) || 0;
      if (trip.isDriver) {
         totalMilage += dist;
      }
      if (dist >= 20) travelBonus += 200;
      else if (dist >= 10) travelBonus += 100;
    });

    const milageCost = totalMilage * 25; 
    const overnightCost = (parseInt(overnightCount) || 0) * 300;
    
    let totalExpenses = 0;
    expenses.forEach(exp => { totalExpenses += (parseFloat(exp.amount) || 0); });

    const advanceNum = parseFloat(advance) || 0;
    const total = (milageCost + travelBonus + overnightCost + totalExpenses) - advanceNum;

    return { 
      totalMilage: Number(totalMilage.toFixed(1)), 
      milageCost: Number(milageCost.toFixed(2)), 
      travelBonus, 
      overnightCost, 
      totalExpenses: Number(totalExpenses.toFixed(2)), 
      advance: advanceNum, 
      total: Number(total.toFixed(2)) 
    };
  }, [trips, expenses, overnightCount, advance]);

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm("Vill du verkligen ta bort denna reseräkning från historiken?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'invoices', invoiceId));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReopenInvoice = (inv) => {
    if (inv.personalInfo) setPersonalInfo(inv.personalInfo);
    if (inv.trips && inv.trips.length > 0) setTrips(inv.trips);
    if (inv.expenses && inv.expenses.length > 0) setExpenses(inv.expenses);
    setAdvance(inv.advance || '');
    setOvernightCount(inv.overnightCount || '');
    setInvoiceComment(inv.invoiceComment || '');
    
    if (typeof window !== 'undefined') {
       window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleDownloadPDF = () => {
    const form = document.getElementById('invoice-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    setIsSubmitting(true);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = document.getElementById('print-invoice-view');
      element.classList.remove('hidden');
      element.classList.remove('print:block');
      
      const opt = {
        margin:       10,
        filename:     `Reserakning_${personalInfo.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('sv-SE')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(element).save().then(async () => {
        element.classList.add('hidden');
        element.classList.add('print:block');
        setIsSubmitting(false);

        if (user && user.uid) {
           try {
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'invoices'), {
                 createdAt: Date.now(),
                 total: calculated.total,
                 status: "Nedladdad (PDF)",
                 personalInfo,
                 trips,
                 expenses,
                 advance,
                 overnightCount,
                 invoiceComment
              });
           } catch(e) {}
        }
      });
    };
    document.body.appendChild(script);
  };

  const handleSubmit = async (e, target) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSentTarget(target);

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
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Rutt</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">Mil</th>
            </tr>
            ${trips.map(tr => `
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${tr.date}<br><small style="color: #64748b;">${tr.assignment}</small></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">${tr.from} &rarr; ${tr.to} <small style="color: #64748b;">${tr.roundTrip ? '(T&R)' : '(Enkel)'}</small><br><small style="color: #1e3a8a; font-weight: bold;">${tr.isDriver ? 'Egen bil' : 'Samåker'}</small></td>
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

          ${invoiceComment ? `
          <h3 style="color: #475569; margin-top: 20px;">Övriga kommentarer</h3>
          <div style="padding: 12px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 14px; white-space: pre-wrap;">${invoiceComment}</div>
          ` : ''}

          <h3 style="color: #475569; margin-top: 20px;">Sammanställning</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Milersättning</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; width: 120px;">${calculated.milageCost} kr</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Tilläggsarvode</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${calculated.travelBonus} kr</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Övernattningstraktamente</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${calculated.overnightCost} kr</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Övriga utlägg</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${calculated.totalExpenses} kr</td></tr>
            ${calculated.advance > 0 ? `<tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Avgår förskott</td><td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #ef4444;">-${calculated.advance} kr</td></tr>` : ''}
            <tr style="background: #1e3a8a; color: white;"><td style="padding: 10px 8px; border: 1px solid #1e3a8a; font-weight: bold;">TOTALT ATT ERHÅLLA</td><td style="padding: 10px 8px; border: 1px solid #1e3a8a; text-align: right; font-weight: bold; font-size: 16px;">${calculated.total} kr</td></tr>
          </table>
        </div>
      `;

      const toEmail = target === 'federation' ? 'info@sbslf.se' : personalInfo.email;
      const emailSubject = target === 'federation' 
        ? `Reseräkning: ${personalInfo.name} (${calculated.total} kr)` 
        : `TEST (Kopia): Reseräkning ${personalInfo.name} (${calculated.total} kr)`;

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: toEmail,
        replyTo: personalInfo.email,
        message: {
          subject: emailSubject,
          text: "Ny reseräkning inskickad. Vänligen läs mailet i en HTML-kompatibel e-postklient.",
          html: emailHtml
        },
        createdAt: Date.now()
      });

      if (user && user.uid && target === 'federation') {
         await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'invoices'), {
            createdAt: Date.now(),
            total: calculated.total,
            status: "Inskickad",
            personalInfo,
            trips,
            expenses,
            advance,
            overnightCount,
            invoiceComment
         });
      }

      setSuccess(true);
    } catch (err) {
      alert(t.errorOccurred);
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
            {sentTarget === 'federation' ? t.sentSuccessFed : t.sentSuccessSelf}
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

        {pastInvoices.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <HistoryIcon className="w-4 h-4" /> {t.pastInvoices}
             </h3>
             <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {pastInvoices.map(inv => (
                 <div key={inv.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <div className="flex-1">
                     <span className="text-xs font-bold text-slate-700">{new Date(inv.createdAt).toLocaleDateString('sv-SE')}</span>
                     <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                       {inv.trips?.map(tr => tr.assignment).join(', ')}
                     </p>
                   </div>
                   <div className="text-right mr-3">
                     <span className="text-sm font-black text-blue-600">{inv.total} kr</span>
                     <p className="text-[9px] font-black uppercase text-green-600 mt-0.5">{inv.status}</p>
                   </div>
                   <div className="flex items-center gap-1">
                     <button onClick={() => handleReopenInvoice(inv)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase hover:bg-blue-200 transition-colors">
                       {t.open}
                     </button>
                     <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Ta bort">
                       <Trash2 className="w-4 h-4" />
                     </button>
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

        <form id="invoice-form" className="space-y-6">
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
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.streetAddressHidden}</label>
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
                      
                      {myAssignedGames.length > 0 && (
                        <div className="sm:col-span-12 bg-blue-100 p-2 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-blue-800 uppercase shrink-0">{t.foundAssignments}</span>
                          <select 
                            className="w-full sm:flex-1 text-xs p-1.5 rounded-md border border-blue-200 bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                            onChange={(e) => {
                               const g = myAssignedGames.find(x => x.id === e.target.value);
                               if(g) {
                                  handleTripChange(trip.id, 'date', g.date);
                                  handleTripChange(trip.id, 'assignment', `${g.away} @ ${g.home}`);
                                  handleTripChange(trip.id, 'to', g.location);
                                  handleTripChange(trip.id, 'from', t.homeLocation);
                               }
                            }}
                          >
                             <option value="">{t.selectGame}</option>
                             {myAssignedGames.map(g => <option key={g.id} value={g.id}>{g.date} | {g.away} @ {g.home}</option>)}
                          </select>
                        </div>
                      )}

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.date}</label>
                        <input required type="date" value={trip.date} onChange={(e) => handleTripChange(trip.id, 'date', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>

                      <div className="sm:col-span-9 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.assignmentDetails}</label>
                        <input required type="text" value={trip.assignment} onChange={(e) => handleTripChange(trip.id, 'assignment', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelFrom}</label>
                        <input required type="text" list="location-list" value={trip.from} onChange={(e) => handleTripChange(trip.id, 'from', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelTo}</label>
                        <input required type="text" list="location-list" value={trip.to} onChange={(e) => handleTripChange(trip.id, 'to', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div className="sm:col-span-4 space-y-1 flex flex-col justify-end">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-lg h-[42px]">
                          <input type="checkbox" checked={trip.roundTrip} onChange={(e) => handleTripChange(trip.id, 'roundTrip', e.target.checked)} className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase text-slate-600">{t.roundTrip}</span>
                        </label>
                      </div>

                      <div className="sm:col-span-8 space-y-1 flex flex-col justify-end">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-lg h-[42px]">
                          <input type="checkbox" checked={trip.isDriver} onChange={(e) => handleTripChange(trip.id, 'isDriver', e.target.checked)} className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase text-slate-600 truncate">{trip.isDriver ? t.droveCar : t.carpooling}</span>
                        </label>
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.distanceMil}</label>
                        <input required type="number" step="0.1" value={trip.distance} onChange={(e) => handleTripChange(trip.id, 'distance', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20" />
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

            <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-xs font-medium mb-4 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{t.receiptsReminder}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex items-center gap-4">
                  <input type="text" placeholder={t.description} value={exp.description} onChange={(e) => handleExpenseChange(exp.id, 'description', e.target.value)} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input type="number" placeholder={t.amount} value={exp.amount} onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)} className="w-32 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
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
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">á 300 kr</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.advanceDeduction}</label>
                <input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
             <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> {t.invoiceCommentLabel}
             </h2>
             <textarea 
               value={invoiceComment} 
               onChange={(e) => setInvoiceComment(e.target.value)} 
               placeholder={t.invoiceCommentPlaceholder}
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]" 
             />
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
                <span className="text-slate-300">{t.travelTimeComp}</span>
                <span>{calculated.travelBonus} kr</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-slate-300">{t.overnightComp} ({overnightCount || 0} st á 300kr)</span>
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
            <button 
              type="button" 
              onClick={handleDownloadPDF}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
              {t.downloadPDF}
            </button>
            <button 
              type="button" 
              onClick={(e) => {
                 const form = document.getElementById('invoice-form');
                 if (form.checkValidity()) handleSubmit(e, 'self');
                 else form.reportValidity();
              }}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-blue-100 text-blue-700 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" /> {t.sendToSelf}
            </button>
            <button 
              type="button" 
              onClick={(e) => {
                 const form = document.getElementById('invoice-form');
                 if (form.checkValidity()) handleSubmit(e, 'federation');
                 else form.reportValidity();
              }}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-yellow-200 hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              {t.sendToFed}
            </button>
          </div>
        </form>
      </div>

      {/* PRINT VIEW (TABLE OPTIMIZED FOR HTML2PDF) */}
      <div id="print-invoice-view" className="hidden print:block w-[190mm] mx-auto text-black p-8 bg-white text-[12px] leading-snug">
        
        <table className="w-full mb-6">
          <tbody>
            <tr>
              <td className="align-bottom">
                <h1 className="text-2xl font-black tracking-widest uppercase">Reseräkning</h1>
                <p className="font-bold text-sm">Svenska Baseboll och Softboll Förbundet</p>
              </td>
              <td className="align-bottom text-right text-[10px]">
                <p>{t.date}: {new Date().toLocaleDateString('sv-SE')}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mb-6 text-[12px]">
          <tbody>
            <tr>
              <td className="py-1.5 w-1/2"><span className="font-bold">{t.name}:</span> {personalInfo.name}</td>
              <td className="py-1.5 w-1/2"><span className="font-bold">{t.pnr}:</span> {personalInfo.pnr}</td>
            </tr>
            <tr>
              <td className="py-1.5"><span className="font-bold">{t.streetAddress}:</span> {personalInfo.address}</td>
              <td className="py-1.5"><span className="font-bold">{t.zipCity}:</span> {personalInfo.zipCity}</td>
            </tr>
            <tr>
              <td className="py-1.5" colSpan="2"><span className="font-bold">{t.bankAccount}:</span> {personalInfo.bank}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="font-bold mb-1 uppercase text-[10px] tracking-wider">Uppdrag & Resor</h3>
        <table className="w-full border-collapse border border-black mb-6 text-[11px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1.5 text-left">{t.date}</th>
              <th className="border border-black p-1.5 text-left">Ändamål</th>
              <th className="border border-black p-1.5 text-left">Rutt</th>
              <th className="border border-black p-1.5 text-center">Fordon</th>
              <th className="border border-black p-1.5 text-right">Mil</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, idx) => (
              <tr key={idx}>
                <td className="border border-black p-1.5">{trip.date}</td>
                <td className="border border-black p-1.5">{trip.assignment}</td>
                <td className="border border-black p-1.5">{trip.from} &rarr; {trip.to}<br/>{trip.roundTrip ? '(T&R)' : '(Enkel)'}</td>
                <td className="border border-black p-1.5 text-center">{trip.isDriver ? 'Egen bil' : 'Samåker'}</td>
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

        <table className="w-full mb-8">
          <tbody>
            <tr>
              <td className="w-1/2 align-top pr-6">
                {invoiceComment && (
                   <>
                     <h3 className="font-bold mb-1 uppercase text-[10px] tracking-wider">Övriga kommentarer</h3>
                     <div className="border border-black p-2 text-[10px] whitespace-pre-wrap min-h-[60px]">{invoiceComment}</div>
                   </>
                )}
              </td>
              <td className="w-1/2 align-top">
                <table className="w-full border-collapse border border-black text-[11px]">
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5">Milersättning (25 kr/mil)</td>
                      <td className="border border-black p-1.5 text-right">{calculated.milageCost} kr</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">Tilläggsarvode</td>
                      <td className="border border-black p-1.5 text-right">{calculated.travelBonus} kr</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1.5">Övernattning ({overnightCount || 0} st á 300kr)</td>
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
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full mt-8 page-break-inside-avoid">
          <tbody>
            <tr>
              <td className="w-1/2 align-top pr-12">
                <p className="font-bold mb-8">Underskrift resenär:</p>
                <div className="border-b border-black w-full"></div>
                <p className="text-[10px] mt-1 text-gray-500">Signatur & Namnförtydligande</p>
              </td>
              <td className="w-1/2 align-top">
                <div className="border-2 border-black p-4">
                  <h3 className="font-black text-sm uppercase mb-4 border-b border-black pb-1">Fylls i av Förbundet</h3>
                  <table className="w-full text-xs h-16">
                    <tbody>
                      <tr>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/4">Konto</td>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/4">K-ställe</td>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/4">Projekt</td>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/4">Fritt</td>
                      </tr>
                    </tbody>
                  </table>
                  <table className="w-full text-xs mt-6 h-16">
                    <tbody>
                      <tr>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/3">Belopp (kr)</td>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/3">Attest (Sign)</td>
                        <td className="border-b border-black align-bottom pb-1 font-bold w-1/3">Beslut (Sign)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// ERROR BOUNDARY
// ==========================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical React Crash:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full text-center border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">{t.errorOccurred}</h2>
            <p className="text-slate-600 mb-6 font-medium">Applikationen kraschade. Felet var:</p>
            
            <pre className="text-red-700 text-xs font-mono whitespace-pre-wrap bg-red-50 p-4 rounded-xl text-left overflow-auto max-h-60 border border-red-200">
              {this.state.error?.toString()}
              {'\n'}
              {this.state.errorInfo?.componentStack}
            </pre>

            <button onClick={() => window.location.reload()} className="mt-8 bg-slate-800 text-white px-8 py-4 rounded-xl font-black uppercase text-xs hover:bg-black transition-colors">
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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUmpireIds, setAdminUmpireIds] = useState([]);
  
  // Navigation & View
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
  
  // Federation Multi-Tenant Setup (Environment detection)
  const [isDemoEnv, setIsDemoEnv] = useState(true);
  const [federation, setFederation] = useState('swe');
  const federations = [
    { id: 'swe', name: '🇸🇪 Sweden', defaultLang: 'sv' },
    { id: 'int', name: '🇬🇧 English', defaultLang: 'en' }
  ];

  // Language & UI Context
  const defaultLang = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('sv') ? 'sv' : 'en';
  const [lang, setLang] = useState(defaultLang);
  
  const getTranslation = (languageCode) => {
    const selected = translations[languageCode] || translations['en'];
    const fallback = translations['en'];
    return new Proxy(selected, {
      get: (target, prop) => target[prop] !== undefined ? target[prop] : (fallback[prop] || '')
    });
  };
  const t = getTranslation(lang);

  // Shared UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [globalNote, setGlobalNote] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // System Feature Flags
  const [features, setFeatures] = useState({
    marketplace: true,
    evaluations: true,
    reminders: true
  });
  
  // Help View State
  const [helpTab, setHelpTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'guide';
    }
    return 'guide';
  });
  const [readmeContent, setReadmeContent] = useState(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('idle');

  // Email Module State
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [sendingBulkEmails, setSendingBulkEmails] = useState(false);

  // Calendar Dropdown States
  const [showScheduleExport, setShowScheduleExport] = useState(false);
  const [showMyGamesExport, setShowMyGamesExport] = useState(false);

  // Data State
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterUmpires, setMasterUmpires] = useState([]);
  const [registeredEmails, setRegisteredEmails] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [mailQueue, setMailQueue] = useState([]);
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
  const [selectedGameDetails, setSelectedGameDetails] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Evaluation Forms State
  const [evaluatingUmpire, setEvaluatingUmpire] = useState(null);
  const [evalGrade, setEvalGrade] = useState(0);
  const [evalComment, setEvalComment] = useState('');

  // Location Editing State
  const [editingLocation, setEditingLocation] = useState(null);
  const [newFacility, setNewFacility] = useState('');
  
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
  const [editNoteText, setEditNoteText] = useState('');
  const [showManualEmailInput, setShowManualEmailInput] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingGameData, setEditingGameData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'games', direction: 'desc' });
  const [umpireSort, setUmpireSort] = useState('name');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeague, setFilterLeague] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tempEditPhone, setTempEditPhone] = useState('');
  const [tempHistoricalGames, setTempHistoricalGames] = useState('');

  // Localized today
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  // Environment Logic
  useEffect(() => {
     if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'schema.domarweb.se') {
           setIsDemoEnv(false);
           setFederation('swe');
           setLang('sv');
        } else {
           setIsDemoEnv(true);
        }
     }
  }, []);

  const appId = useMemo(() => {
    const base = typeof window !== 'undefined' && window.__app_id 
      ? String(window.__app_id).replace(/[\/\\]/g, '-') 
      : 'baseball-umpire-scheduler';
    return isDemoEnv ? `${base}-sandbox-${selectedYear}` : `${base}-${selectedYear}`;
  }, [selectedYear, isDemoEnv]);

  // Derived state that needs to be declared BEFORE it's used
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
  }, [assignments, applications, masterUmpires, sortConfig]);

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

  const leagues = useMemo(() => [...new Set(games.map(g => g.league || 'Unknown'))].sort((a, b) => a.localeCompare(b, lang)), [games, lang]);
  
  const allLocationNames = useMemo(() => {
    const fromGames = games.map(g => g.location);
    const fromData = locationsData.map(l => l.id);
    return [...new Set([...fromGames, ...fromData])].filter(Boolean).sort((a, b) => a.localeCompare(b, lang));
  }, [games, locationsData, lang]);
  
  const locations = useMemo(() => [...new Set(games.map(g => g.location || 'Unknown'))].sort((a, b) => a.localeCompare(b, lang)), [games, lang]);

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

  const allMyAssignedGames = useMemo(() => {
    if (!umpireId) return [];
    return games.filter(game => groupedAssignments[game.id]?.some(asg => asg.userId === umpireId));
  }, [games, groupedAssignments, umpireId]);

  const myAssignedGames = useMemo(() => {
    return allMyAssignedGames.filter(game => {
      const isHistorical = (game.date || '') < today;
      if (showHistory) return isHistorical;
      return !isHistorical;
    });
  }, [allMyAssignedGames, showHistory, today]);

  const invoiceEligibleGames = useMemo(() => {
    return [...allMyAssignedGames]
      .filter(g => (g.date || '') <= today)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [allMyAssignedGames, today]);

  const myInterestedGames = useMemo(() => {
    if (!umpireId) return [];
    return games.filter(game => 
      applications.some(app => app.gameId === game.id && app.userId === umpireId) &&
      !groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)
    );
  }, [games, applications, groupedAssignments, umpireId]);

  const umpiresWithAssignmentsMap = useMemo(() => {
    const map = {};
    assignments.forEach(asg => {
      if (!map[asg.userId]) {
        map[asg.userId] = { umpire: masterUmpires.find(u => u.id === asg.userId), assignedGames: [] };
      }
      const game = games.find(g => g.id === asg.gameId);
      if (game) map[asg.userId].assignedGames.push(game);
    });
    Object.values(map).forEach(obj => {
      obj.assignedGames.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    });
    return map;
  }, [assignments, masterUmpires, games]);

  const emailCandidates = useMemo(() => {
    const list = Object.values(umpiresWithAssignmentsMap).filter(obj => obj.umpire !== undefined);
    const ready = list.filter(obj => obj.umpire.linkedEmail);
    const missing = list.filter(obj => !obj.umpire.linkedEmail);
    return { ready, missing };
  }, [umpiresWithAssignmentsMap]);

  const unconnectedEmails = useMemo(() => {
    const linked = masterUmpires.map(u => (u.linkedEmail || '').toLowerCase()).filter(Boolean);
    return registeredEmails.filter(email => !linked.includes(email.toLowerCase()));
  }, [registeredEmails, masterUmpires]);

  const uiDays = useMemo(() => {
    const arr = [...(t.days || [])];
    if (arr.length > 0) { const sunday = arr.shift(); arr.push(sunday); }
    return arr;
  }, [t.days]);

  // 5. YTTERLIGARE EFFECTS
  useEffect(() => {
    setEditNoteText(globalNote);
  }, [globalNote]);

  useEffect(() => {
    if (view === 'help' && helpTab === 'about' && readmeContent === null) {
      setReadmeLoading(true);
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/readme`)
        .then(res => res.json())
        .then(data => {
          if (data.content) {
            const text = decodeURIComponent(escape(atob(data.content)));
            setReadmeContent(text);
          } else {
            setReadmeContent(t.fetchError);
          }
        })
        .catch(err => {
          setReadmeContent(t.fetchError);
        })
        .finally(() => setReadmeLoading(false));
    }
  }, [view, helpTab, readmeContent, t.fetchError]);

  useEffect(() => {
    setEvaluatingUmpire(null);
    setEvalGrade(0);
    setEvalComment('');
    setEditingGameData(null);
  }, [selectedGameDetails]);

  // Firebase Real-time listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setLoading(false);
      } else {
        try { 
          if (typeof window !== 'undefined' && window.__initial_auth_token) {
            try { await signInWithCustomToken(auth, window.__initial_auth_token); } 
            catch (e) { await signInAnonymously(auth); }
          } else { await signInAnonymously(auth); }
        } catch (err) { setLoading(false); }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const isCanvas = typeof window !== 'undefined' && window.__initial_auth_token != null;
    if (isCanvas && !user) return; 

    const handleDbError = (err) => {
      if (err.code === 'permission-denied') {
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
    
    const evalsCol = collection(db, 'artifacts', appId, 'public', 'data', 'evaluations');
    const unsubscribeEvals = onSnapshot(evalsCol, (snapshot) => {
      setEvaluations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleDbError);

    const locCol = collection(db, 'artifacts', appId, 'public', 'data', 'locations');
    const unsubscribeLocations = onSnapshot(locCol, (snapshot) => {
      setLocationsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleDbError);

    const queueCol = collection(db, 'artifacts', appId, 'public', 'data', 'mail_queue');
    const unsubscribeQueue = onSnapshot(queueCol, (snapshot) => {
      setMailQueue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, handleDbError);

    const settingsDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubscribeSettings = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAdminUmpireIds(data.adminUmpireIds || []);
        setGlobalNote(data.globalNote || '');
        if (data.features) {
           setFeatures(prev => ({ ...prev, ...data.features }));
        }
      }
    }, handleDbError);

    return () => {
      unsubscribeGames(); 
      unsubscribeApps(); 
      unsubscribeAssign(); 
      unsubscribeUmpires();
      unsubscribeRegUsers();
      unsubscribeEvals();
      unsubscribeLocations();
      unsubscribeQueue();
      unsubscribeSettings();
    };
  }, [user, appId]);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    if (user && user.email) {
      const isMaster = user.email.toLowerCase() === 'suecio@tryempire.com';
      setIsSuperAdmin(isMaster);
      setContactEmail(user.email);
      
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registered_users', user.uid), {
        email: user.email.toLowerCase(),
        lastSeen: Date.now()
      }, { merge: true }).catch(err => { });

      const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      unsubscribeProfile = onSnapshot(profileDoc, (snapshot) => {
        if (snapshot.exists() && snapshot.data().umpireId) {
          const data = snapshot.data();
          setUserName(data.name || '');
          setContactName(data.name || '');
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
      });
    } else {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserName('');
      setUmpireId('');
    }

    return () => unsubscribeProfile();
  }, [user, appId, adminUmpireIds, masterUmpires]);

  useEffect(() => {
    if (user && user.email && umpireId && masterUmpires.length > 0) {
      const myUmpire = masterUmpires.find(u => u.id === umpireId);
      if (myUmpire && myUmpire.linkedEmail !== user.email) {
        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', umpireId), {
          linkedUserId: user.uid,
          linkedEmail: user.email
        }).catch(e => { });
      }
    }
  }, [user, umpireId, masterUmpires, appId]);

  useEffect(() => {
    if (!isAdmin || mailQueue.length === 0) return;
    
    const interval = setInterval(() => {
       const now = Date.now();
       const readyToProcess = mailQueue.filter(q => q.processAfter <= now);
       
       if (readyToProcess.length > 0) {
           readyToProcess.forEach(async (queueItem) => {
              const changesTextEn = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Moved from ${c.oldDate} ${c.oldTime} to ${c.newDate} ${c.newTime}`).join('\n');
              const changesTextSv = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Flyttad från ${c.oldDate} ${c.oldTime} till ${c.newDate} ${c.newTime}`).join('\n');
              
              const emailBody = t.emailMatchMovedBody
                 .replace(/\{name\}/g, queueItem.userName)
                 .replace(/\{changesListSv\}/g, changesTextSv)
                 .replace(/\{changesListEn\}/g, changesTextEn);
                 
              try {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
                   to: queueItem.email,
                   message: {
                     subject: t.emailMatchMovedSubject.replace('{count}', queueItem.changes.length),
                     text: emailBody
                   },
                   createdAt: Date.now()
                });
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', queueItem.id));
              } catch(e) { }
           });
       }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAdmin, mailQueue, appId, t]);

  // AUTO REMOVE PENDING CHANGES AFTER 7 DAYS
  useEffect(() => {
    if (!isAdmin || assignments.length === 0) return;
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    
    const expiredAssignments = assignments.filter(asg => 
      asg.pendingChange && 
      asg.pendingChangeTimestamp && 
      (now - asg.pendingChangeTimestamp > ONE_WEEK)
    );

    expiredAssignments.forEach(asg => {
      deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asg.id)).catch(() => {});
    });
  }, [isAdmin, assignments, appId, db]);

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
    const dayIndex = d.getDay(); 
    return (t.days && t.days[dayIndex]) ? t.days[dayIndex] : '-';
  };

  const safeDateNum = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.getDate();
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

  const getAssignmentStatusStyles = (count, required) => {
    const req = required || 2;
    if (count === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (count < req) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const renderOfficialsRow = (game, gameAssignments, masterUmpires) => {
    const hasOfficials = gameAssignments.length > 0 || game.supervisorName || game.tcName;
    if (!hasOfficials) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-3 items-center">
        {gameAssignments.map(asg => {
            const m = masterUmpires.find(mu => mu.id === asg.userId);
            return (
              <div key={asg.userId} className={`${asg.pendingChange ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-100'} text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1`}>
                  {asg.pendingChange ? <AlertTriangle className="w-3 h-3 text-yellow-600" /> : <CheckCircle className="w-3 h-3" />} 
                  {t.umpireShort}: {asg.userName} 
                  {m?.level && <span className={`ml-1 px-1 rounded text-[8px] font-black border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
              </div>
            );
        })}
        {game.supervisorName && (
          <div className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-100 flex items-center gap-1">
              <Star className="w-3 h-3" /> {t.supShort}: {game.supervisorName}
          </div>
        )}
        {game.tcName && (
          <div className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-100 flex items-center gap-1">
              <FileText className="w-3 h-3" /> {t.tcShort}: {game.tcName}
          </div>
        )}
      </div>
    );
  };

  const renderCalendar = (gamesToRender) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 overflow-hidden animate-in fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
         <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5"/></button>
         <h3 className="font-black text-lg text-slate-800 uppercase">{t.months && t.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
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
                            <div key={g.id} onClick={() => setSelectedGameDetails(g)} className="text-[8px] sm:text-[9px] font-bold bg-blue-50 text-blue-800 rounded px-1.5 py-1 truncate cursor-pointer hover:bg-blue-100 transition-colors">
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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setShowAuthModal(false);
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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: 'admin@domarweb.se',
        replyTo: contactEmail,
        message: {
          subject: `[Kontaktformulär] ${contactSubject}`,
          text: `Nytt meddelande från Domarportalen:\n\nAvsändare: ${contactName}\nE-post: ${contactEmail}\n\nMeddelande:\n${contactMessage}`
        },
        createdAt: Date.now()
      });
      setContactStatus('success');
      setContactSubject('');
      setContactMessage('');
    } catch (error) {
      setContactStatus('error');
    }
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

  const saveGlobalNote = async () => {
    if (!isAdmin) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { globalNote: editNoteText }, { merge: true });
  };
  
  const clearGlobalNote = async () => {
    if (!isAdmin) return;
    setEditNoteText('');
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { globalNote: '' }, { merge: true });
  };

  const toggleSystemFeature = async (featureKey) => {
    if (!isSuperAdmin) return;
    const newFeatures = { ...features, [featureKey]: !features[featureKey] };
    setFeatures(newFeatures);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { features: newFeatures }, { merge: true });
  };

  const toggleUmpireReminderPref = async (uId, currentStatus) => {
     if (uId !== umpireId && !isAdmin) return;
     const newStatus = currentStatus === false ? true : false;
     await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', uId), { remindersEnabled: newStatus }, { merge: true });
  };

  const forceRunRemindersNow = async () => {
     if (!isSuperAdmin) return;
     try {
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'cron'), { lastReminderSentDate: 'FORCED' }, { merge: true });
         if (typeof window !== 'undefined') alert(t.runRemindersNow || "Reminders queued!");
     } catch (e) { console.error(e); }
  };

  const copyGuideLink = () => {
    if (typeof window !== 'undefined') {
      const link = `${window.location.origin}${window.location.pathname}?view=help&tab=guide`;
      navigator.clipboard.writeText(link).then(() => {
        alert(t.linkCopied);
      }).catch(() => { });
    }
  };

  const toggleUmpireAdmin = async (uId) => {
    if (!isSuperAdmin) return; 
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
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), { name, level, remindersEnabled: true });
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

  const deleteMasterUmpire = async (id, name, linkedEmail) => {
    if (!isAdmin) return;
    if (typeof window !== 'undefined' && !window.confirm(`${t.deleteUmpireConfirm} "${name}"?`)) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id));
    if (linkedEmail) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: linkedEmail,
        message: {
          subject: t.umpireDeletedSubject,
          text: t.umpireDeletedBody
        },
        createdAt: Date.now()
      });
    }
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
      const game = games.find(g => g.id === gameId);
      if (game) {
        const umpireAssignedGamesToday = assignments
          .filter(asg => asg.userId === umpireId)
          .map(asg => games.find(g => g.id === asg.gameId))
          .filter(g => g && g.date === game.date && g.id !== game.id);
        
        const conflictGame = umpireAssignedGamesToday.find(g => 
          (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim()
        );

        if (conflictGame) {
          if (typeof window !== 'undefined') alert(t.conflictApply.replace('{location}', conflictGame.location));
          return;
        }
      }

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
    
    // KROCK-SKYDD
    const game = games.find(g => g.id === gameId);
    if (game) {
      const umpireAssignedGamesToday = assignments
        .filter(asg => asg.userId === uId)
        .map(asg => games.find(g => g.id === asg.gameId))
        .filter(g => g && g.date === game.date && g.id !== game.id);
      
      const conflictGame = umpireAssignedGamesToday.find(g => 
        (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim()
      );
      
      if (conflictGame) {
        if(typeof window !== 'undefined') alert(t.conflictAssign.replace('{name}', name).replace('{location}', conflictGame.location));
        return;
      }
    }

    const asgId = `${gameId}_${uId}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { 
      gameId, 
      userId: uId, 
      userName: name, 
      assignedAt: Date.now() 
    });
  };

  const removeAssignment = async (gameId, uId) => {
    if (!isAdmin && uId !== umpireId) return; 
    const asgId = `${gameId}_${uId}`;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId));
  };

  const handleDeleteGame = async (gameId) => {
    if (!isAdmin) return;
    if (typeof window !== 'undefined' && !window.confirm(t.deleteConfirm)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId));
    } catch(e) {}
  };
  
  const toggleTradeStatus = async (asgId, status) => {
    if (!umpireId && !isAdmin) return; 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), {
      forTrade: status
    });
  };

  const takeTrade = async (oldAsg, game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    if (oldAsg && oldAsg.userId === umpireId) return; 
    
    const umpireAssignedGamesToday = assignments
      .filter(asg => asg.userId === umpireId)
      .map(asg => games.find(g => g.id === asg.gameId))
      .filter(g => g && g.date === game.date && g.id !== game.id);
    
    const conflictGame = umpireAssignedGamesToday.find(g => 
      (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim()
    );
    
    if (conflictGame) {
      if(typeof window !== 'undefined') alert(`${t.bookedIn} ${conflictGame.location}. Du kan inte ta denna match.`);
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm(t.tradeConfirm)) return;
    
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      if (oldAsg && oldAsg.id) {
         batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', oldAsg.id));
      }
      const newAsgId = `${game.id}_${umpireId}`;
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', newAsgId), {
        gameId: game.id,
        userId: umpireId,
        userName: userName,
        assignedAt: Date.now(),
        forTrade: false 
      });
      await batch.commit();
      if(typeof window !== 'undefined') alert(t.tradeSuccess);
    } catch (e) { } finally {
      setSyncing(false);
    }
  };

  const expressInterestMarketplace = async (game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    
    const gameCheck = games.find(g => g.id === game.id);
    if (gameCheck) {
      const umpireAssignedGamesToday = assignments
        .filter(asg => asg.userId === umpireId)
        .map(asg => games.find(g => g.id === asg.gameId))
        .filter(g => g && g.date === gameCheck.date && g.id !== gameCheck.id);
      
      const conflictGame = umpireAssignedGamesToday.find(g => 
        (g.location || '').toLowerCase().trim() !== (gameCheck.location || '').toLowerCase().trim()
      );

      if (conflictGame) {
        if (typeof window !== 'undefined') alert(t.conflictApply.replace('{location}', conflictGame.location));
        return;
      }
    }

    await toggleApplication(game.id);
    if(typeof window !== 'undefined') alert(t.interestRegistered);
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
       to: 'suecio@tryempire.com',
       message: {
          subject: `Ny intresseanmälan från Marknaden: ${userName}`,
          text: `${userName} har anmält intresse för matchen ${game.away} @ ${game.home} den ${game.date}.`
       },
       createdAt: Date.now()
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
      if(typeof window !== 'undefined') alert(t.importSuccess);
    } catch (e) { } finally { 
      setSyncing(false); 
    }
  };

  const saveEditedGame = async () => {
    if (!isAdmin || !editingGameData) return;
    setSyncing(true);
    try {
      const originalGame = games.find(g => g.id === editingGameData.id);
      const isTimeChanged = originalGame && (originalGame.date !== editingGameData.date || originalGame.time !== editingGameData.time);

      const batch = writeBatch(db);
      const gameRef = doc(db, 'artifacts', appId, 'public', 'data', 'games', editingGameData.id);
      batch.update(gameRef, { 
        date: editingGameData.date, 
        time: editingGameData.time, 
        league: editingGameData.league, 
        home: editingGameData.home, 
        away: editingGameData.away, 
        location: editingGameData.location, 
        requiredUmpires: parseInt(editingGameData.requiredUmpires) || 2 
      });

      if (isTimeChanged) {
        const affectedAssignments = assignments.filter(a => a.gameId === editingGameData.id);
        affectedAssignments.forEach((asg) => {
          const asgRef = doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asg.id);
          batch.update(asgRef, { pendingChange: true, pendingChangeTimestamp: Date.now() });
        });
        const affectedApplications = applications.filter(a => a.gameId === editingGameData.id);
        affectedApplications.forEach((app) => {
          const appRef = doc(db, 'artifacts', appId, 'public', 'data', 'applications', app.id);
          batch.delete(appRef);
        });
      }

      await batch.commit();

      if (isTimeChanged) {
        const affectedAssignments = assignments.filter(a => a.gameId === editingGameData.id);
        for (const asg of affectedAssignments) {
          const ump = masterUmpires.find(u => u.id === asg.userId);
          if (ump && ump.linkedEmail) {
             const existingQueue = mailQueue.find(q => q.id === asg.userId);
             const gameChangeInfo = {
                gameId: editingGameData.id,
                away: editingGameData.away,
                home: editingGameData.home,
                oldDate: originalGame.date,
                oldTime: originalGame.time,
                newDate: editingGameData.date,
                newTime: editingGameData.time
             };
             const currentChanges = existingQueue ? existingQueue.changes : [];
             const updatedChanges = [...currentChanges.filter(c => c.gameId !== editingGameData.id), gameChangeInfo];
             await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', asg.userId), {
                userId: asg.userId,
                email: ump.linkedEmail,
                userName: asg.userName,
                changes: updatedChanges,
                processAfter: Date.now() + 15 * 60 * 1000
             });
          }
        }
      }
      
      if (selectedGameDetails && selectedGameDetails.id === editingGameData.id) {
         setSelectedGameDetails({ ...selectedGameDetails, ...editingGameData, requiredUmpires: parseInt(editingGameData.requiredUmpires) || 2 });
      }
      setEditingGameData(null);
    } catch (e) { } finally {
      setSyncing(false);
    }
  };

  const confirmScheduleChange = async (asgId) => {
     if (!umpireId) return;
     try {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), {
          pendingChange: false
       });
     } catch (e) { }
  };

  const assignOfficial = async (gameId, role, value) => {
    if (!isAdmin) return;
    const updateObj = {};
    if (role === 'supervisor') {
        const uName = value ? masterUmpires.find(u => u.id === value)?.name : '';
        updateObj.supervisorId = value;
        updateObj.supervisorName = uName;
    } else {
        updateObj.tcName = value;
    }
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), updateObj);
      if (selectedGameDetails?.id === gameId) {
        setSelectedGameDetails(prev => ({ ...prev, ...updateObj }));
      }
    } catch (e) { }
  };

  const submitEvaluation = async (gameId, targetUmpireId, grade, comment) => {
    if (!isAdmin && selectedGameDetails?.supervisorId !== umpireId) return;
    const evalId = `${gameId}_${targetUmpireId}`;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', evalId), {
          gameId,
          umpireId: targetUmpireId,
          evaluatorId: umpireId,
          grade,
          comment,
          timestamp: Date.now()
      });
      if (typeof window !== 'undefined') alert(t.evalSaved);
    } catch (e) { }
  };

  const saveLocation = async () => {
    if (!isAdmin || !editingLocation) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', editingLocation.id), {
        address: editingLocation.address || '',
        facilities: editingLocation.facilities || []
      }, { merge: true });
      setEditingLocation(null);
    } catch (e) { }
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
        adminUmpireIds,
        evaluations,
        locations: locationsData
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

  const loadDemoData = async () => {
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      
      const ump1Ref = doc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'));
      batch.set(ump1Ref, { name: "Anna Andersson", level: "Elit", remindersEnabled: true });
      const ump2Ref = doc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'));
      batch.set(ump2Ref, { name: "Björn Borg", level: "Region", remindersEnabled: true });
      const ump3Ref = doc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'));
      batch.set(ump3Ref, { name: "Cecilia Carlsson", level: "Förening", remindersEnabled: true });
      
      const loc1Ref = doc(db, 'artifacts', appId, 'public', 'data', 'locations', 'Örvallen');
      batch.set(loc1Ref, { address: 'Örvallen 1, Sundbyberg', facilities: ['Omklädningsrum', 'Kiosk', 'Toalett'] });
      const loc2Ref = doc(db, 'artifacts', appId, 'public', 'data', 'locations', 'Skarpnäck');
      batch.set(loc2Ref, { address: 'Skarpnäcksfältet, Stockholm', facilities: ['Toalett'] });

      const teams = ['Rättvik', 'Sundbyberg', 'Leksand', 'Stockholm', 'Sölvesborg', 'Karlskoga', 'Gefle', 'Tranås'];
      const locs = ['Örvallen', 'Skarpnäck', 'Leksand IP', 'Shark Park'];
      const leagues = ['Elitserien', 'Regionserien'];
      
      let currentDate = new Date();
      for (let i = 0; i < 50; i++) {
         const gameDate = new Date(currentDate);
         gameDate.setDate(currentDate.getDate() + Math.floor(i / 2));
         const dateStr = `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}-${String(gameDate.getDate()).padStart(2, '0')}`;
         
         const t1 = teams[Math.floor(Math.random() * teams.length)];
         let t2 = teams[Math.floor(Math.random() * teams.length)];
         while(t1 === t2) t2 = teams[Math.floor(Math.random() * teams.length)];
         
         const loc = locs[Math.floor(Math.random() * locs.length)];
         const l = leagues[Math.floor(Math.random() * leagues.length)];
         const timeHour = 10 + Math.floor(Math.random() * 8);
         const timeStr = `${timeHour}:00`;
         
         const gameId = `m-${dateStr.replace(/-/g,'')}-${timeStr.replace(':','')}-${t1}-${t2}`.replace(/\s+/g, '').toLowerCase();
         
         batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), {
           date: dateStr, time: timeStr, league: l, away: t1, home: t2, location: loc, requiredUmpires: 2
         });
      }

      await batch.commit();
      if(typeof window !== 'undefined') alert(t.sandboxLoaded);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Helper för inloggad domare
  const myUmpireData = masterUmpires.find(u => u.id === umpireId);

  // 8. HUVUD-RENDERING
  if (loading) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="animate-spin w-8 h-8 text-blue-600" /></div>;

  if (view === 'invoice') {
    return (
      <div className="relative bg-slate-100 min-h-screen">
        {isDemoEnv && (
          <div className="bg-purple-600 text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm z-50 relative print:hidden">
            <Code className="w-4 h-4" /> {t.sandboxWarning}
          </div>
        )}
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10 print:hidden">
          <button onClick={() => setView('schedule')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-black text-slate-600 uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </button>
        </div>
        <TravelInvoiceView 
          db={db} 
          appId={appId} 
          locationsData={locationsData} 
          user={user} 
          userName={userName} 
          t={t} 
          myAssignedGames={invoiceEligibleGames} 
          myUmpireData={myUmpireData}
        />
      </div>
    );
  }

  // --- TOP NAVIGATION TABS DEFINITION ---
  const tabs = [
    { id: 'schedule', label: t.schedule, icon: CalendarIcon },
    { id: 'locations', label: t.locations, icon: MapPin },
    { id: 'umpire-list', label: t.umpireList, icon: Users2 },
    ...(user?.email ? [
      ...(features.marketplace ? [{ id: 'marketplace', label: t.marketplace, icon: ArrowRightLeft }] : []),
      { id: 'my-apps', label: t.myGames, icon: CheckCircle }
    ] : []),
    ...(isAdmin ? [{ id: 'admin', label: t.staffing, icon: Shield }, { id: 'stats', label: t.analytics, icon: BarChart3 }] : []),
    { id: 'invoice', label: t.invoiceTitle, icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 relative">
      {isDemoEnv && (
        <div className="bg-purple-600 text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm z-50 relative print:hidden">
          <Code className="w-4 h-4" /> {t.sandboxWarning}
        </div>
      )}
      
      <header className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-3">
          {/* Vänster: Logga och titel (Klickbar för scroll till toppen) */}
          <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Trophy className="w-6 h-6 shrink-0" />
            <div className="truncate">
              <h1 className="text-sm sm:text-xl font-bold truncate">{t.appTitle}</h1>
              <p className="text-[8px] sm:text-[10px] uppercase text-blue-300">{t.season} {selectedYear}</p>
            </div>
          </div>

          {/* Höger: Kontroller, Inställningar och Profil/Login */}
          <div className="flex items-center gap-3 shrink-0">
            {isDemoEnv && (
              <select value={federation} onChange={(e) => { setFederation(e.target.value); const newFed = federations.find(f => f.id === e.target.value); if (newFed) setLang(newFed.defaultLang); }} className="bg-blue-800 text-[10px] rounded px-2 py-1 outline-none hidden sm:block">
                {federations.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-blue-800 text-[10px] rounded px-2 py-1 outline-none text-white hidden sm:block">
              <option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
            </select>
            <div className="flex bg-blue-800 rounded p-0.5 hidden sm:flex">
              <button onClick={() => setLang('sv')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'sv' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>🇸🇪</button>
              <button onClick={() => setLang('en')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>🇬🇧</button>
            </div>

            {user?.email ? (
              <>
                {umpireId && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProfileId(umpireId); }} className="w-8 h-8 rounded-full bg-white text-blue-900 border-2 border-blue-400 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform shadow-sm">
                    {myUmpireData?.avatarUrl ? (
                       <img src={myUmpireData.avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-[12px] font-black">{(userName || '?').charAt(0)}</span>
                    )}
                  </button>
                )}
                <button onClick={() => setShowAdminModal(true)} className="p-1.5 hover:bg-blue-800 rounded-full transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {globalNote && view !== 'help' && (
        <div className="bg-blue-50 border-b border-blue-100 p-3 sm:p-4 animate-in slide-in-from-top">
          <div className="max-w-5xl mx-auto flex items-start gap-3">
             <Megaphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
             <p className="text-sm font-medium text-blue-900">{globalNote}</p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {view !== 'help' && (
          <>
            {/* Desktop Tabs */}
            <div className="hidden md:flex flex-wrap bg-white p-1 rounded-2xl shadow-sm border border-slate-200 sticky top-[68px] z-20 gap-1">
              {tabs.map(tab => {
                const isActive = view === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { 
                      setView(tab.id); 
                      setSelectedProfileId(null); 
                    }} 
                    className={`flex-1 min-w-[120px] max-w-[200px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${isActive ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" /><span className="inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Dropdown Menu */}
            <div className="md:hidden sticky top-[68px] z-20">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="w-full bg-blue-900 text-white p-3.5 rounded-2xl shadow-md border border-blue-800 flex justify-between items-center font-black uppercase text-xs tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  <span>
                     {tabs.find(t => t.id === view)?.label || 'Meny'}
                  </span>
                </div>
                {isMobileMenuOpen ? <ChevronUp className="w-5 h-5 text-blue-300"/> : <ChevronDown className="w-5 h-5 text-blue-300"/>}
              </button>
              
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex flex-col gap-1 z-30 max-h-[60vh] overflow-y-auto">
                  {tabs.map(tab => {
                    const isActive = view === tab.id;
                    return (
                      <button 
                        key={tab.id} 
                        onClick={() => { 
                          setView(tab.id); 
                          setSelectedProfileId(null); 
                          setIsMobileMenuOpen(false);
                        }} 
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <tab.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        {isActive && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'schedule' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black uppercase text-slate-800">{showHistory ? t.archived : t.activeSchedule}</h2>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => generateCSV(filteredGames, selectedYear)} className="text-[10px] font-black uppercase px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Download className="w-3.5 h-3.5" /> {t.downloadICS}
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
                {isDemoEnv && (
                   <button onClick={loadDemoData} disabled={syncing} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-700 shadow-md transition-colors">
                     {syncing ? <RefreshCw className="w-4 h-4 animate-spin inline-block" /> : t.sandboxLoaded}
                   </button>
                )}
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
                                        <span key={app.userId} className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-bold uppercase">{(app.userName || '').split(' ')[0]}</span>
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
                       <div className="mt-4"><span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">{(locData.facilities || []).length} {t.facilities}</span></div>
                    </div>
                  );
               })}
            </div>
          </div>
        )}

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
                <div key={u.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProfileId(u.id); }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden group-hover:bg-blue-50">
                       {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                          <span className="text-sm font-black text-slate-500 group-hover:text-blue-600">{(u.name || '?').charAt(0)}</span>
                       )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block group-hover:text-blue-700">{u.name}</span>
                      {u.level && <span className={`text-[8px] font-black mt-1 inline-block uppercase px-1.5 py-0.5 rounded border ${getLevelStyles(u.level)}`}>{u.level}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'marketplace' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
               <ArrowRightLeft className="w-12 h-12 text-blue-600 mx-auto mb-4" />
               <h2 className="text-2xl font-black text-slate-800 uppercase">{t.marketplace}</h2>
               <p className="text-slate-500 font-medium mt-2">{t.marketplaceDesc}</p>
             </div>
             
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
                                <ArrowRightLeft className="w-4 h-4"/> {t.takeOverFrom} {asg.userName}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>

             <div>
                <h3 className="text-sm font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4" /> {t.missingUmpires}</h3>
                {games.filter(g => !showHistory && g.date >= today && (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).length === 0 ? (
                  <p className="text-slate-400 text-sm italic">{t.noMarketplaceGames}</p>
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
                            <p className="text-xs font-black text-red-500 mt-2 uppercase">{missingSpots} {t.spotsAvailable}</p>
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

        {view === 'my-apps' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
               <Megaphone className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
               <div className="text-sm text-amber-800 font-medium leading-relaxed">
                 <p className="font-bold mb-2 text-amber-900">{t.availabilityWarningTitle}</p>
                 <p>{t.availabilityWarningDesc1}</p>
                 <p className="mt-2 text-amber-900 font-bold">{t.availabilityWarningDesc2}</p>
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
                  <Download className="w-3.5 h-3.5" /> {t.downloadICS}
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
                         <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProfileId(stat.userId); }} className="hover:text-blue-600 hover:underline">
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
                 <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder={t.pasteSchedulePlaceholder} className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs mb-4 outline-none" />
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
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-4 gap-3">
                       <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => setSelectedGameDetails(game)}>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                          <h3 className="font-bold text-lg">{game.away} @ {game.home}</h3>
                          <span className="text-xs font-bold text-slate-500">| {safeDateDay(game.date)} {game.date} @ {game.time}</span>
                       </div>
                       <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} {t.assigned}</span>
                          <button onClick={() => handleDeleteGame(game.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.applied}</h4>
                          {gameApplications.length > 0 ? (
                             <div className="flex flex-col gap-2">
                                {gameApplications.map(app => {
                                  // Kontrollera om denna intresserade domare redan är bokad på ANNAN ort samma dag
                                  const umpireAssignedGamesToday = assignments
                                    .filter(asg => asg.userId === app.userId)
                                    .map(asg => games.find(g => g.id === asg.gameId))
                                    .filter(g => g && g.date === game.date && g.id !== game.id);
                                  
                                  const conflictGame = umpireAssignedGamesToday.find(g => 
                                    (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim()
                                  );

                                  if (conflictGame) {
                                    return (
                                      <div key={app.userId} className="flex justify-between items-center bg-red-50 p-2.5 rounded-xl border border-red-100 opacity-70" title={`Bokad i ${conflictGame.location}`}>
                                         <span className="text-xs font-bold text-red-900 line-through decoration-red-500 truncate">{app.userName}</span>
                                         <span className="text-[9px] font-black uppercase text-red-600 px-2 text-right truncate max-w-[100px]">{conflictGame.location}</span>
                                      </div>
                                    )
                                  }

                                  return (
                                    <div key={app.userId} className="flex justify-between items-center bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                                       <span className="text-xs font-bold text-blue-900">{app.userName}</span>
                                       <button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="text-[9px] font-black tracking-widest uppercase bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">{t.assignBtn}</button>
                                    </div>
                                  );
                                })}
                             </div>
                          ) : (
                             <p className="text-xs text-slate-400 italic">{t.noInterestsYet}</p>
                          )}
                       </div>

                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.currentCrew}</h4>
                          {gameAssignments.length > 0 ? (
                             <div className="flex flex-col gap-2 mb-3">
                                {gameAssignments.map(asg => (
                                   <div key={asg.userId} className="flex justify-between items-center bg-green-50 p-2.5 rounded-xl border border-green-200">
                                      <span className="text-xs font-bold text-green-900 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-600"/> {asg.userName}</span>
                                      <button onClick={() => removeAssignment(game.id, asg.userId)} className="text-[9px] font-black tracking-widest uppercase text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">{t.removeBtn}</button>
                                   </div>
                                ))}
                             </div>
                          ) : (
                             <p className="text-xs text-slate-400 italic mb-3">{t.noUmpiresAssigned}</p>
                          )}

                          {!isFullyStaffed && (
                             <div className="pt-2 border-t border-slate-100">
                                <select 
                                  value="" 
                                  onChange={(e) => { 
                                    if(e.target.value) { assignUmpire(game.id, e.target.value, (masterUmpires.find(u=>u.id===e.target.value)?.name || t.unknown)); } 
                                  }} 
                                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value="">{t.manualAssign}</option>
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

      {/* FLOAT BUTTON SCROLL TO TOP */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="fixed bottom-6 right-6 p-3 bg-slate-800 text-white rounded-full shadow-2xl hover:bg-black transition-all z-50 animate-in fade-in"
          title="Till toppen"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* UMPIRE PROFILE MODAL */}
      {!!selectedProfileId && (
         <UmpireProfileModal 
            selectedProfileId={selectedProfileId}
            setSelectedProfileId={setSelectedProfileId}
            masterUmpires={masterUmpires}
            assignments={assignments}
            umpireId={umpireId}
            isAdmin={isAdmin}
            selectedYear={selectedYear}
            t={t}
            getLevelStyles={getLevelStyles}
            db={db}
            appId={appId}
         />
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
              
              {isAdmin && !editingGameData && (
                <button onClick={() => setEditingGameData({...game})} className="absolute top-4 right-14 p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
              )}

              {editingGameData && editingGameData.id === game.id ? (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-black text-slate-800">{t.editMatch}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.date}</label>
                      <input type="date" value={editingGameData.date} onChange={e => setEditingGameData({...editingGameData, date: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.time}</label>
                      <input type="time" value={editingGameData.time} onChange={e => setEditingGameData({...editingGameData, time: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.league}</label>
                      <input type="text" value={editingGameData.league} onChange={e => setEditingGameData({...editingGameData, league: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.requiredUmpires}</label>
                      <input type="number" min="1" max="4" value={editingGameData.requiredUmpires || 2} onChange={e => setEditingGameData({...editingGameData, requiredUmpires: parseInt(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.away}</label>
                      <input type="text" value={editingGameData.away} onChange={e => setEditingGameData({...editingGameData, away: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.home}</label>
                      <input type="text" value={editingGameData.home} onChange={e => setEditingGameData({...editingGameData, home: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.location}</label>
                      <input type="text" list="location-list" value={editingGameData.location} onChange={e => setEditingGameData({...editingGameData, location: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={saveEditedGame} disabled={syncing} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-green-700 flex items-center justify-center gap-2">
                      {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t.saveChanges}
                    </button>
                    <button onClick={() => setEditingGameData(null)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-black uppercase text-xs hover:bg-slate-300">{t.cancel}</button>
                  </div>
                </div>
              ) : (
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
                                    <div className="w-8 h-8 bg-white shadow-sm border border-slate-200 text-slate-500 rounded-full flex items-center justify-center font-black text-xs overflow-hidden">
                                       {m?.avatarUrl ? (
                                          <img src={m.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                       ) : (
                                          (asg.userName || '?').charAt(0)
                                       )}
                                    </div>
                                    <div>
                                      <span className="font-bold text-sm text-slate-800 block cursor-pointer hover:text-blue-600" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProfileId(asg.userId); }}>{asg.userName}</span>
                                      {m?.level && <span className={`text-[8px] font-black inline-block mt-0.5 uppercase px-1.5 py-0.5 rounded border ${(m.level || '').toLowerCase().includes('elit') ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-500 border-slate-200 bg-white'}`}>{m.level}</span>}
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
                                      {t.assignBtn}
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
              )}
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
          <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20 overflow-y-auto max-h-[90vh] custom-scrollbar">
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
