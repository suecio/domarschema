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

// Import Icons
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
  BarChart, 
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
  Users, 
  Github,
  X,
  AlertTriangle,
  ArrowLeft,
  Megaphone,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Code,
  Mail,
  Send,
  Share2,
  Map,
  ArrowRightLeft,
  Star,
  Navigation,
  Bell,
  BellOff,
  Sliders
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

const GITHUB_REPO = "suecio/domarschema"; 

// --- Translation Dictionary ---
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
    fetchError: "Kunde inte hämta data",
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
    totalInterests: "Intresseanmälningar",
    deleteUmpireConfirm: "Är du säker på att du vill ta bort",
    umpireDeletedSubject: "Din domarprofil har tagits bort",
    umpireDeletedBody: "Hej,\n\nEn administratör har tagit bort din domarprofil från domarsystemet.",
    assignmentEmailSubject: "Ny matchtillsättning",
    assignmentEmailBody: "Hej {name},\n\nDu har blivit tillsatt på matchen {away} @ {home} den {date} kl {time}.",
    myGamesReminder: "Viktigt! Om du måste lämna återbud till en redan tillsatt match är det ditt ansvar att hitta en ersättare samt att informera Elitdomargruppen.",
    globalAnnouncement: "Globalt Meddelande",
    saveAnnouncement: "Publicera",
    clearAnnouncement: "Ta bort",
    announcementPlaceholder: "Skriv ett viktigt meddelande som visas för alla...",
    helpAndInfo: "Hjälp & Info",
    guide: "Kom igång",
    faq: "Vanliga frågor",
    about: "Om Appen",
    guideStep1Title: "1. Skapa ett konto",
    guideStep1Desc: "Klicka på inloggningsikonen längst ner eller uppe i hörnet och välj 'Skapa ett nytt konto'. Fyll i din e-post och ett valfritt lösenord.",
    guideStep2Title: "2. Sök efter din profil",
    guideStep2Desc: "Direkt efter inloggning visas rutan 'Vem är du?'. Skriv ditt namn i sökfältet för att hitta dig själv i domarlistan.",
    guideStep3Title: "3. Bekräfta & Koppla",
    guideStep3Desc: "Klicka på ditt namn i listan. Detta kopplar ditt konto till profilen permanent så att ditt schema synkas över alla dina enheter.",
    guideStep4Title: "4. Saknas ditt namn?",
    guideStep4Desc: "Om du är helt ny och inte finns i listan klickar du på 'Hittar du inte ditt namn?' för att skapa din domarprofil från grunden.",
    faq1Q: "Kan jag byta namn eller profil om jag valde fel?",
    faq1A: "Nej, av säkerhetsskäl låses ditt konto till den profil du väljer. Råkade du välja fel person måste du kontakta en administratör för att återställa kopplingen.",
    faq2Q: "Hur anmäler jag intresse för att döma en match?",
    faq2A: "Gå till 'Spelschema'. Klicka på den blå knappen 'Intresserad' bredvid de matcher du kan och vill döma.",
    faq3Q: "Vem tillsätter matcherna?",
    faq3A: "Du anmäler intresse, men det är Elitdomargruppen/Administratörerna som gör den slutgiltiga schemaläggningen och tillsättningen.",
    faq4Q: "Varför är min statistiksida tom?",
    faq4A: "Statistiken uppdateras och visas så fort du anmäler intresse för en match eller blir tilldelad ett uppdrag.",
    faq5Q: "Hur fungerar marknaden (Byt bort match)?",
    faq5A: "Om du inte kan döma en match klickar du på 'Byt bort' under Mina Matcher. Den hamnar då på Marknaden. Du ansvarar för matchen tills någon annan klickar på 'Ta match'.",
    loadingReadme: "Hämtar README från GitHub...",
    contactUs: "Kontakta oss",
    contactDesc: "Behöver du hjälp eller har du en fråga? Skicka ett meddelande till oss så hjälper vi dig.",
    subject: "Ämne",
    message: "Meddelande",
    sendMsg: "Skicka Meddelande",
    sending: "Skickar...",
    msgSentTitle: "Meddelande skickat!",
    msgSentDesc: "Tack för ditt meddelande. Vi återkommer till dig så snart som möjligt på den angivna e-postadressen.",
    sendAnother: "Skicka ett nytt meddelande",
    shareGuide: "Dela guide",
    linkCopied: "Länk kopierad till urklipp!",
    sendSchedules: "Skicka spelschema",
    reviewEmails: "Granska Utskick",
    customEmailMessage: "Personligt meddelande (Frivilligt)",
    customEmailPlaceholder: "Skriv ett meddelande som visas högst upp i e-postmeddelandet till alla...",
    sendAllEmails: "Skicka till {count} domare",
    missingEmailWarning: "{count} domare har matcher men saknar e-postadress:",
    emailPreview: "Förhandsgranskning av E-post",
    emailsSentSuccess: "Alla spelscheman har skickats!",
    bookedIn: "Bokad i",
    filterStatusAll: "Alla statusar",
    noInterests: "Inga anmälningar",
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
    marketplaceDesc: "Här visas matcher som andra vill byta bort och matcher som saknar domare. När du tar en match tilldelas du den omedelbart.",
    tradeGame: "Byt bort",
    cancelTrade: "Ångra byte",
    takeGame: "Ta match",
    gamesForTrade: "Matcher som bytes bort",
    noMarketplaceGames: "Inga matcher bytes bort just nu.",
    tradeSuccess: "Du har tagit över matchen! Ditt schema har uppdaterats.",
    tradeConfirm: "Är du säker på att du vill ta över denna match?",
    downloadCalendar: "Ladda ner",
    formatICS: ".ICS Fil",
    subtextICS: "För Apple & Outlook",
    formatCSV: ".CSV Fil",
    subtextCSV: "För Google Kalender",
    evaluate: "Utvärdera",
    grade: "Betyg",
    feedback: "Feedback / Kommentar",
    saveEval: "Spara utvärdering",
    evalSaved: "Utvärdering sparad",
    yourEval: "Utvärdering",
    selectAdmin: "Välj Admin...",
    selectUmpire: "Välj Domare...",
    enterTCName: "Ange namn på TC...",
    umpireShort: "DOMARE",
    supShort: "SUP",
    tcShort: "TC",
    locations: "Platser",
    address: "Adress",
    facilities: "Faciliteter",
    noFacilities: "Inga faciliteter angivna",
    addFacility: "Lägg till facilitet...",
    editLocation: "Redigera plats",
    noLocationsInfo: "Klicka på en plats för att se detaljer eller lägga till en adress och faciliteter.",
    matchMovedWarning: "Match flyttad! Bekräfta om du kan den nya tiden.",
    acceptTime: "Acceptera ny tid",
    declineTime: "Kan inte (Avboka)",
    timeChangedBadge: "Tid Ändrad",
    pendingReply: "Väntar på svar",
    emailMatchMovedSubject: "Spelschema uppdaterat ({count} st) / Schedule Updated",
    emailMatchMovedBody: "Hej {name},\n\nFöljande matcher som du är tillsatt på har bytt datum eller tid:\n\n{changesListSv}\n\nVänligen logga in på domarportalen för att bekräfta om du fortfarande kan döma dessa matcher, eller om du måste lämna återbud.\n\n---\n\nHello {name},\n\nThe following games you are assigned to have been rescheduled:\n\n{changesListEn}\n\nPlease log in to the portal to confirm if you can still make these games, or withdraw if you cannot.",
    pendingEmailsQueued: "⏳ {count} e-postmeddelanden väntar på att skickas till domare om ändrade matcher.",
    sendQueuedNow: "Skicka direkt",
    actionRequired: "Kräver åtgärd",
    superAdminSettings: "Systemarkitektur (Super Admin)",
    featureMarketplace: "Aktivera Marknadsplats (Byt Match)",
    featureEvaluations: "Aktivera Utvärderingssystem",
    featureReminders: "Automatiska E-postpåminnelser (Kommande matcher)",
    reminderPreferences: "Mina Notiser",
    receiveReminders: "Få e-postpåminnelser om mina kommande matcher",
    runRemindersNow: "Kör Påminnelser Nu",
    reminderEmailSubject: "Påminnelse: Kommande Matcher / Upcoming Games",
    reminderEmailBody: "Hej {name},\n\nDetta är en automatisk påminnelse om att du är tillsatt på följande matcher under de kommande dagarna:\n\n{gamesListSv}\n\nGlöm inte att logga in i domarportalen om du behöver byta bort en match i sista minuten.\n\n---\n\nHello {name},\n\nThis is an automated reminder that you are scheduled to officiate the following games in the coming days:\n\n{gamesListEn}\n\nPlease log into the umpire portal if you need to arrange a last-minute replacement."
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
    fetchError: "Could not fetch data",
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
    totalInterests: "Interests",
    deleteUmpireConfirm: "Are you sure you want to remove",
    umpireDeletedSubject: "Your umpire profile has been removed",
    umpireDeletedBody: "Hello,\n\nAn admin has removed your umpire profile from the scheduling system.",
    assignmentEmailSubject: "New Match Assignment",
    assignmentEmailBody: "Hello {name},\n\nYou have been assigned to the match {away} @ {home} on {date} at {time}.",
    myGamesReminder: "Important! If you need to cancel an assigned game, it is your responsibility to find a replacement and notify the elite umpire group.",
    globalAnnouncement: "Global Announcement",
    saveAnnouncement: "Publish",
    clearAnnouncement: "Clear",
    announcementPlaceholder: "Type an important message to display to everyone...",
    helpAndInfo: "Help & Info",
    guide: "Getting Started",
    faq: "FAQ",
    about: "About App",
    guideStep1Title: "1. Create an account",
    guideStep1Desc: "Click the login icon and select 'Create a new account'. Fill in your email address and a secure password.",
    guideStep2Title: "2. Search for your profile",
    guideStep2Desc: "Immediately after logging in, the 'Who are you?' prompt appears. Type your name into the search bar.",
    guideStep3Title: "3. Confirm & Link",
    guideStep3Desc: "Click your name in the list. This permanently links your account to the official profile, syncing your schedule across devices.",
    guideStep4Title: "4. Name Missing?",
    guideStep4Desc: "If you are completely new and not in the list, click 'Can't find your name?' to create a brand new profile from scratch.",
    faq1Q: "Can I change my linked profile if I made a mistake?",
    faq1A: "No, for security reasons your account is locked to the chosen profile. Contact an administrator to reset the link.",
    faq2Q: "How do I apply to umpire a game?",
    faq2A: "Navigate to 'Schedule' and click the blue 'Interested' button next to the games you are available for.",
    faq3Q: "Who assigns the games?",
    faq3A: "You mark your interest, but the Elite Umpire Group/Administrators make the final staffing assignments.",
    faq4Q: "Why is my stats page empty?",
    faq4A: "Your statistics will be generated as soon as you mark interest for a game or receive an assignment.",
    faq5Q: "How does the marketplace work?",
    faq5A: "If you cannot umpire a game, click 'Give Away' under My Games. It will be listed on the Marketplace. You are responsible for the game until someone else clicks 'Take Game'.",
    loadingReadme: "Fetching README from GitHub...",
    contactUs: "Contact Us",
    contactDesc: "Need help or have a question? Send us a message and we'll assist you.",
    subject: "Subject",
    message: "Message",
    sendMsg: "Send Message",
    sending: "Sending...",
    msgSentTitle: "Message Sent!",
    msgSentDesc: "Thank you for your message. We will get back to you as soon as possible at the provided email address.",
    sendAnother: "Send another message",
    shareGuide: "Share Guide",
    linkCopied: "Link copied to clipboard!",
    sendSchedules: "Send Schedules",
    reviewEmails: "Review Emails",
    customEmailMessage: "Custom Message (Optional)",
    customEmailPlaceholder: "Type a message to appear at the top of the email for everyone...",
    sendAllEmails: "Send to {count} umpires",
    missingEmailWarning: "{count} umpires have assignments but no email linked:",
    emailPreview: "Email Preview",
    emailsSentSuccess: "All schedules have been sent successfully!",
    bookedIn: "Booked in",
    filterStatusAll: "All Statuses",
    noInterests: "No Interests",
    coUmpires: "Co-umpires:",
    noCoUmpires: "No co-umpires",
    calendarColumn: "Calendar",
    gameDetails: "Game Details",
    mapDirections: "Open Map",
    officials: "Officials",
    supervisor: "Supervisor",
    techComm: "Technical Commissioner",
    notAssigned: "Not Assigned",
    yourGame: "Your Game",
    marketplace: "Marketplace",
    marketplaceDesc: "Find games that other umpires are giving away or games missing umpires. Taking a game immediately assigns it to you.",
    tradeGame: "Give Away",
    cancelTrade: "Cancel Give Away",
    takeGame: "Take Game",
    gamesForTrade: "Games Up For Trade",
    noMarketplaceGames: "No games are up for trade right now.",
    tradeSuccess: "You have taken over the game! Your schedule is updated.",
    tradeConfirm: "Are you sure you want to take over this game?",
    downloadCalendar: "Download",
    formatICS: ".ICS File",
    subtextICS: "For Apple & Outlook",
    formatCSV: ".CSV File",
    subtextCSV: "For Google Calendar",
    evaluate: "Evaluate",
    grade: "Grade",
    feedback: "Feedback / Comment",
    saveEval: "Save Evaluation",
    evalSaved: "Evaluation Saved",
    yourEval: "Evaluation",
    selectAdmin: "Select Admin...",
    selectUmpire: "Select Umpire...",
    enterTCName: "Enter TC name...",
    umpireShort: "UMP",
    supShort: "SUP",
    tcShort: "TC",
    locations: "Locations",
    address: "Address",
    facilities: "Facilities",
    noFacilities: "No facilities listed",
    addFacility: "Add facility...",
    editLocation: "Edit Location",
    noLocationsInfo: "Click on a location to view details or add an address and facilities.",
    matchMovedWarning: "Game Rescheduled! Please confirm if you can make the new time.",
    acceptTime: "Accept New Time",
    declineTime: "Cannot Make It",
    timeChangedBadge: "Time Changed",
    pendingReply: "Pending Reply",
    emailMatchMovedSubject: "Schedule Updated ({count} games) / Spelschema uppdaterat",
    emailMatchMovedBody: "Hello {name},\n\nThe following games you are assigned to have been rescheduled:\n\n{changesListEn}\n\nPlease log in to the portal to confirm if you can still make these games, or withdraw if you cannot.\n\n---\n\nHej {name},\n\nFöljande matcher som du är tillsatt på har bytt datum eller tid:\n\n{changesListSv}\n\nVänligen logga in på domarportalen för att bekräfta om du fortfarande kan döma nämnda matcher, eller om du måste lämna återbud.",
    pendingEmailsQueued: "⏳ {count} email notifications are queued for rescheduled games.",
    sendQueuedNow: "Send Now",
    actionRequired: "Action Required",
    superAdminSettings: "System Architecture (Super Admin)",
    featureMarketplace: "Enable Marketplace (Trade Board)",
    featureEvaluations: "Enable Evaluation System",
    featureReminders: "Automated Email Reminders (Upcoming Games)",
    reminderPreferences: "My Notifications",
    receiveReminders: "Receive email reminders for my upcoming games",
    runRemindersNow: "Run Reminders Cron",
    reminderEmailSubject: "Upcoming Games Reminder / Påminnelse om kommande matcher",
    reminderEmailBody: "Hello {name},\n\nThis is an automated reminder that you are scheduled to officiate the following games in the coming days:\n\n{gamesListEn}\n\nPlease log into the umpire portal if you need to arrange a last-minute replacement.\n\n---\n\nHej {name},\n\nDetta är en automatisk påminnelse om att du är tillsatt på följande matcher under de kommande dagarna:\n\n{gamesListSv}\n\nGlöm inte att logga in i domarportalen om du behöver byta bort en match i sista minuten."
  },
  fi: {
    appTitle: "Tuomariportaali",
    season: "Kausi",
    schedule: "Aikataulu",
    myGames: "Omat pelit",
    umpireList: "Tuomarilista",
    staffing: "Henkilöstö",
    analytics: "Tilastot",
    history: "Historia",
    upcoming: "Tulevat",
    archived: "Arkistoidut",
    activeSchedule: "Aktiivinen aikataulu",
    searchPlaceholder: "Etsi...",
    allSeries: "Kaikki sarjat",
    allLocations: "Kaikki paikat",
    noGames: "Pelejä ei löytynyt.",
    syncNow: "Synkronoi tiedot",
    applied: "Ilmoittautunut",
    interested: "Kiinnostunut",
    withdraw: "Peruuta",
    assignedTo: "Miehistö",
    staffed: "Miehitetty",
    partiallyStaffed: "Osittain miehitetty",
    needsUmpire: "Tarvitsee tuomarin",
    bulkImport: "Massatuonti",
    pendingAssignments: "Henkilöstönhallinta",
    staffingControl: "Miehityksen hallinta",
    hideStaffed: "Piilota miehitetyt",
    showAll: "Näytä kaikki",
    removeAssignment: "Poista",
    deleteGame: "Poista peli",
    deleteConfirm: "Haluatko varmasti poistaa pelin?",
    deleteAllGames: "Tyhjennä kausi",
    deleteAllConfirm: "OLETKO VARMA? Tämä poistaa KAIKKI tiedot.",
    deleteAllSuccess: "Kausi tyhjennetty.",
    downloadBackup: "Lataa varmuuskopio (JSON)",
    umpire: "Tuomari",
    interests: "Kiinnostukset",
    gamesAssigned: "Pelit jaettu",
    assignmentRate: "Käyttöaste",
    noStats: "Ei tilastoja vielä.",
    mySchedule: "Oma aikataulu",
    noInterest: "Ei vahvistettuja pelejä.",
    noPendingInterest: "Et ole ilmoittanut kiinnostusta peleihin.",
    confirmed: "Vahvistettu",
    settings: "Asetukset",
    userSettings: "Käyttäjäasetukset",
    profileAccess: "Profiilin ja pääsyn hallinta",
    displayName: "Näyttönimi",
    namePlaceholder: "Etsi tai kirjoita nimi...",
    logout: "Kirjaudu ulos",
    close: "Sulje",
    status: "Tila",
    setProfile: "Valitse profiili",
    pasteSheet: "Liitä Google Sheetsistä",
    addGames: "Lisää pelejä",
    importSuccess: "Tuonti onnistui",
    cancel: "Peruuta",
    date: "Päivämäärä",
    crew: "Tuomaristo",
    addToCalendar: "Lisää kalenteriin",
    downloadFullSchedule: "Lataa (.ics)",
    confirmedGames: "Vahvistetut pelit",
    interestedGames: "Kiinnostavat pelit",
    nameRequiredTitle: "Kuka olet?",
    nameRequiredDesc: "Valitse nimesi listalta synkronoidaksesi aikataulusi.",
    saveName: "Valitse profiili",
    addNewName: "Etkö löydä nimeäsi?",
    createUmpire: "Luo uusi profiili",
    masterList: "Tuomareiden pääluettelo",
    editName: "Muokkaa nimeä",
    save: "Tallenna",
    selectFromList: "Valitse listalta",
    changeUser: "Vaihda käyttäjää",
    editMatch: "Muokkaa pelin tietoja",
    home: "Koti",
    away: "Vieras",
    time: "Aika",
    location: "Sijainti",
    league: "Liiga",
    saveChanges: "Tallenna muutokset",
    listView: "Lista",
    calendarView: "Kalenteri",
    days: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"],
    months: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"],
    requiredUmpires: "Tarvittavat tuomarit",
    level: "Taso",
    name: "Nimi",
    sortBy: "Lajittele",
    week: "Vk.",
    systemUpdates: "Järjestelmäpäivitykset",
    fetchError: "Tietoja ei voitu hakea",
    login: "Kirjaudu sisään",
    register: "Rekisteröidy",
    email: "Sähköposti",
    password: "Salasana",
    forgotPassword: "Unohtuiko salasana?",
    loginToContinue: "Kirjaudu jatkaaksesi",
    createAnAccount: "Luo uusi tili",
    noAccount: "Ei tiliä? Rekisteröidy",
    hasAccount: "Onko sinulla jo tili? Kirjaudu",
    loginRequiredMsg: "Sinun on kirjauduttava sisään nähdäksesi tämän.",
    adminManagement: "Järjestelmänvalvojat",
    addAdmin: "Lisää ylläpitäjä",
    adminAdded: "Ylläpitäjä lisätty",
    adminRemoved: "Ylläpitäjä poistettu",
    masterAdminInfo: "Olet kirjautunut pääkäyttäjänä.",
    linkedAccount: "Tili:",
    notLinked: "Ei tiliä",
    linkEmailPlaceholder: "Linkitä sähköposti...",
    selectEmail: "-- Valitse sähköposti --",
    otherEmail: "+ Syötä muu...",
    umpireProfile: "Tuomariprofiili",
    back: "Takaisin",
    assignedMatches: "Jaetut pelit",
    noAssignedMatches: "Ei jaettuja pelejä vielä.",
    totalAssignments: "Tehtävät",
    totalInterests: "Kiinnostukset",
    deleteUmpireConfirm: "Haluatko varmasti poistaa tuomarin?",
    umpireDeletedSubject: "Tuomariprofiilisi on poistettu",
    umpireDeletedBody: "Hei,\n\nYlläpitäjä on poistanut tuomariprofiilisi järjestelmästä.",
    assignmentEmailSubject: "Uusi pelitehtävä",
    assignmentEmailBody: "Hei {name},\n\nSinut on määrätty peliin {away} @ {home} {date} klo {time}.",
    myGamesReminder: "Tärkeää! Jos joudut perumaan jaetun pelin, on sinun vastuullasi löytää korvaaja.",
    globalAnnouncement: "Yleinen ilmoitus",
    saveAnnouncement: "Julkaise",
    clearAnnouncement: "Tyhjennä",
    announcementPlaceholder: "Kirjoita tärkeä viesti kaikille...",
    helpAndInfo: "Ohjeet ja tiedot",
    guide: "Aloitusopas",
    faq: "UKK",
    about: "Tietoja",
    guideStep1Title: "1. Luo tili",
    guideStep1Desc: "Napsauta kirjautumiskuvaketta ja valitse 'Luo uusi tili'.",
    guideStep2Title: "2. Etsi profiilisi",
    guideStep2Desc: "Kirjauduttuasi sisään etsi nimesi listalta.",
    guideStep3Title: "3. Vahvista ja yhdistä",
    guideStep3Desc: "Napsauta nimeäsi yhdistääksesi tilisi profiiliisi.",
    guideStep4Title: "4. Nimi puuttuu?",
    guideStep4Desc: "Jos olet uusi, napsauta 'Etkö löydä nimeäsi?' luodaksesi uuden profiilin.",
    faq1Q: "Voinko vaihtaa profiilini jos tein virheen?",
    faq1A: "Et turvallisuussyistä. Ota yhteyttä ylläpitoon.",
    faq2Q: "Miten haen peliin?",
    faq2A: "Mene 'Aikataulu' -välilehdelle ja napsauta 'Kiinnostunut'.",
    faq3Q: "Kuka jakaa pelit?",
    faq3A: "Ilmaiset kiinnostuksesi, mutta ylläpito tekee lopulliset valinnat.",
    faq4Q: "Miksi tilastosivuni on tyhjä?",
    faq4A: "Tilastot päivittyvät heti kun ilmaiset kiinnostuksesi peliin.",
    faq5Q: "Miten markkinapaikka toimii?",
    faq5A: "Jos et pääse peliin, napsauta 'Luovuta'. Peli siirtyy markkinapaikalle, kunnes joku toinen ottaa sen.",
    loadingReadme: "Ladataan README:tä GitHubista...",
    contactUs: "Ota yhteyttä",
    contactDesc: "Tarvitsetko apua? Lähetä meille viesti.",
    subject: "Aihe",
    message: "Viesti",
    sendMsg: "Lähetä viesti",
    sending: "Lähetetään...",
    msgSentTitle: "Viesti lähetetty!",
    msgSentDesc: "Kiitos viestistäsi. Palaamme asiaan pian.",
    sendAnother: "Lähetä toinen viesti",
    shareGuide: "Jaa opas",
    linkCopied: "Linkki kopioitu!",
    sendSchedules: "Lähetä aikataulut",
    reviewEmails: "Tarkista sähköpostit",
    customEmailMessage: "Oma viesti (valinnainen)",
    customEmailPlaceholder: "Kirjoita viesti sähköpostin yläreunaan...",
    sendAllEmails: "Lähetä {count} tuomarille",
    missingEmailWarning: "{count} tuomarilla on pelejä, mutta ei sähköpostia:",
    emailPreview: "Sähköpostin esikatselu",
    emailsSentSuccess: "Kaikki aikataulut on lähetetty!",
    bookedIn: "Varattu:",
    filterStatusAll: "Kaikki tilat",
    noInterests: "Ei kiinnostuneita",
    coUmpires: "Kanssatuomarit:",
    noCoUmpires: "Ei kanssatuomareita",
    calendarColumn: "Kalenteri",
    gameDetails: "Pelin tiedot",
    mapDirections: "Avaa kartta",
    officials: "Toimitsijat",
    supervisor: "Valvoja",
    techComm: "Tekninen komissaari",
    notAssigned: "Ei jaettu",
    yourGame: "Sinun pelisi",
    marketplace: "Markkinapaikka",
    marketplaceDesc: "Löydä pelejä joista muut luovuttavat tai joista puuttuu tuomari.",
    tradeGame: "Luovuta",
    cancelTrade: "Peruuta luovutus",
    takeGame: "Ota peli",
    gamesForTrade: "Luovutettavat pelit",
    noMarketplaceGames: "Ei luovutettavia pelejä juuri nyt.",
    tradeSuccess: "Otit pelin! Aikataulusi on päivitetty.",
    tradeConfirm: "Haluatko varmasti ottaa tämän pelin?",
    downloadCalendar: "Lataa",
    formatICS: ".ICS-tiedosto",
    subtextICS: "Apple ja Outlook",
    formatCSV: ".CSV-tiedosto",
    subtextCSV: "Google Kalenteri",
    evaluate: "Arvioi",
    grade: "Arvosana",
    feedback: "Palaute",
    saveEval: "Tallenna arviointi",
    evalSaved: "Arviointi tallennettu",
    yourEval: "Arviointisi",
    selectAdmin: "Valitse ylläpitäjä...",
    selectUmpire: "Valitse tuomari...",
    enterTCName: "Syötä TK:n nimi...",
    umpireShort: "TUO",
    supShort: "VAL",
    tcShort: "TK",
    locations: "Paikat",
    address: "Osoite",
    facilities: "Tilat",
    noFacilities: "Ei tiloja",
    addFacility: "Lisää tila...",
    editLocation: "Muokkaa paikkaa",
    noLocationsInfo: "Napsauta paikkaa nähdäksesi tiedot.",
    matchMovedWarning: "Peli siirretty! Vahvista pääsetkö uuteen aikaan.",
    acceptTime: "Hyväksy",
    declineTime: "En pääse",
    timeChangedBadge: "Aika muuttunut",
    pendingReply: "Odottaa vastausta",
    emailMatchMovedSubject: "Aikataulu päivitetty ({count} peliä)",
    emailMatchMovedBody: "Hei {name},\n\nSeuraavien pelien aikataulua on muutettu:\n\n{changesListSv}\n\nKirjaudu portaaliin vahvistaaksesi pääsetkö peliin.",
    pendingEmailsQueued: "⏳ {count} sähköpostia jonossa siirretyistä peleistä.",
    sendQueuedNow: "Lähetä heti",
    actionRequired: "Vaatii toimenpiteitä",
    superAdminSettings: "Järjestelmäasetukset",
    featureMarketplace: "Markkinapaikka",
    featureEvaluations: "Arvioinnit",
    featureReminders: "Muistutukset",
    reminderPreferences: "Muistutukset",
    receiveReminders: "Vastaanota muistutuksia peleistä",
    runRemindersNow: "Aja muistutukset",
    reminderEmailSubject: "Peli muistutus",
    reminderEmailBody: "Hei {name},\n\nMuistutus peleistä:\n\n{gamesListEn}"
  },
  de: {
    appTitle: "Schiedsrichter-Portal",
    season: "Saison",
    schedule: "Spielplan",
    myGames: "Meine Spiele",
    umpireList: "Schiedsrichter",
    staffing: "Einteilung",
    analytics: "Statistik",
    history: "Verlauf",
    upcoming: "Anstehend",
    archived: "Archivierte Spiele",
    activeSchedule: "Aktueller Spielplan",
    searchPlaceholder: "Suchen...",
    allSeries: "Alle Ligen",
    allLocations: "Alle Orte",
    noGames: "Keine Spiele gefunden.",
    syncNow: "Daten jetzt synchronisieren",
    applied: "Interessiert",
    interested: "Interessiert",
    withdraw: "Zurückziehen",
    assignedTo: "Team",
    staffed: "Vollständig besetzt",
    partiallyStaffed: "Teilweise besetzt",
    needsUmpire: "Schiedsrichter gesucht",
    bulkImport: "Massenimport",
    pendingAssignments: "Einteilungsübersicht",
    staffingControl: "Personalverwaltung",
    hideStaffed: "Besetzte ausblenden",
    showAll: "Alle Spiele anzeigen",
    removeAssignment: "Entfernen",
    deleteGame: "Spiel löschen",
    deleteConfirm: "Sind Sie sicher, dass Sie dieses Spiel löschen möchten?",
    deleteAllGames: "Ganze Saison löschen",
    deleteAllConfirm: "SIND SIE SICHER? Dies löscht ALLE Daten.",
    deleteAllSuccess: "Saison erfolgreich gelöscht.",
    downloadBackup: "Backup herunterladen (JSON)",
    umpire: "Umpire",
    interests: "Interessen",
    gamesAssigned: "Eingeteilte Spiele",
    assignmentRate: "Einsatzquote",
    noStats: "Noch keine Daten vorhanden.",
    mySchedule: "Mein Spielplan",
    noInterest: "Du hast noch keine bestätigten Einsätze.",
    noPendingInterest: "Du hast noch kein Interesse an Spielen markiert.",
    confirmed: "Bestätigt",
    settings: "Einstellungen",
    userSettings: "Benutzereinstellungen",
    profileAccess: "Profil & Zugriff",
    displayName: "Anzeigename",
    namePlaceholder: "Name suchen oder eingeben...",
    logout: "Abmelden",
    close: "Schließen",
    status: "Status",
    setProfile: "Profil auswählen",
    pasteSheet: "Aus Google Sheets einfügen",
    addGames: "Spiele hinzufügen",
    importSuccess: "Import erfolgreich",
    cancel: "Abbrechen",
    date: "Datum",
    crew: "Schiedsrichter-Team",
    addToCalendar: "Zum Kalender hinzufügen",
    downloadFullSchedule: "Herunterladen (.ics)",
    confirmedGames: "Bestätigte Spiele",
    interestedGames: "Markierte Spiele",
    nameRequiredTitle: "Wer bist du?",
    nameRequiredDesc: "Wähle deinen Namen aus der Liste, um deinen Spielplan zu synchronisieren.",
    saveName: "Profil speichern",
    addNewName: "Name nicht gefunden?",
    createUmpire: "Neues Profil erstellen",
    masterList: "Master-Liste",
    editName: "Namen bearbeiten",
    save: "Speichern",
    selectFromList: "Aus Liste wählen",
    changeUser: "Benutzer wechseln",
    editMatch: "Spieldetails bearbeiten",
    home: "Heim",
    away: "Gast",
    time: "Zeit",
    location: "Ort",
    league: "Liga",
    saveChanges: "Änderungen speichern",
    listView: "Liste",
    calendarView: "Kalender",
    days: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    requiredUmpires: "Benötigte Schiedsrichter",
    level: "Niveau",
    name: "Name",
    sortBy: "Sortieren nach",
    week: "W.",
    systemUpdates: "System-Updates",
    fetchError: "Daten konnten nicht abgerufen werden",
    login: "Anmelden",
    register: "Registrieren",
    email: "E-Mail-Adresse",
    password: "Passwort",
    forgotPassword: "Passwort vergessen?",
    loginToContinue: "Anmelden um fortzufahren",
    createAnAccount: "Neues Konto erstellen",
    noAccount: "Kein Konto? Hier registrieren",
    hasAccount: "Bereits ein Konto? Anmelden",
    loginRequiredMsg: "Sie müssen angemeldet sein, um dies zu sehen.",
    adminManagement: "Administratoren",
    addAdmin: "Admin hinzufügen",
    adminAdded: "Admin hinzugefügt",
    adminRemoved: "Admin entfernt",
    masterAdminInfo: "Sie sind als Master-Admin angemeldet.",
    linkedAccount: "Konto:",
    notLinked: "Kein Konto",
    linkEmailPlaceholder: "E-Mail verknüpfen...",
    selectEmail: "-- E-Mail auswählen --",
    otherEmail: "+ Andere eingeben...",
    umpireProfile: "Schiedsrichterprofil",
    back: "Zurück",
    assignedMatches: "Eingeteilte Spiele",
    noAssignedMatches: "Noch keine Spiele eingeteilt.",
    totalAssignments: "Einsätze",
    totalInterests: "Interessen",
    deleteUmpireConfirm: "Sind Sie sicher, dass Sie den Schiedsrichter entfernen möchten:",
    umpireDeletedSubject: "Dein Profil wurde entfernt",
    umpireDeletedBody: "Hallo,\n\nEin Administrator hat dein Schiedsrichterprofil aus dem System entfernt.",
    assignmentEmailSubject: "Neue Spieleinteilung",
    assignmentEmailBody: "Hallo {name},\n\nDu wurdest für das Spiel {away} @ {home} am {date} um {time} eingeteilt.",
    myGamesReminder: "Wichtig! Wenn du ein eingeteiltes Spiel absagen musst, bist du dafür verantwortlich, einen Ersatz zu finden.",
    globalAnnouncement: "Globale Ankündigung",
    saveAnnouncement: "Veröffentlichen",
    clearAnnouncement: "Löschen",
    announcementPlaceholder: "Wichtige Nachricht für alle eingeben...",
    helpAndInfo: "Hilfe & Info",
    guide: "Erste Schritte",
    faq: "FAQ",
    about: "Über die App",
    guideStep1Title: "1. Konto erstellen",
    guideStep1Desc: "Klicke auf das Login-Symbol und wähle 'Neues Konto erstellen'.",
    guideStep2Title: "2. Profil suchen",
    guideStep2Desc: "Suche nach dem Login deinen Namen in der Liste.",
    guideStep3Title: "3. Bestätigen & Verknüpfen",
    guideStep3Desc: "Klicke auf deinen Namen, um das Konto dauerhaft zu verknüpfen.",
    guideStep4Title: "4. Name fehlt?",
    guideStep4Desc: "Klicke auf 'Name nicht gefunden?', um ein neues Profil zu erstellen.",
    faq1Q: "Kann ich mein Profil ändern, wenn ich einen Fehler gemacht habe?",
    faq1A: "Nein, aus Sicherheitsgründen ist dies gesperrt. Kontaktiere einen Admin.",
    faq2Q: "Wie bewerbe ich mich für ein Spiel?",
    faq2A: "Gehe zum 'Spielplan' und klicke auf 'Interessiert'.",
    faq3Q: "Wer teilt die Spiele ein?",
    faq3A: "Du zeigst Interesse, aber die Administratoren nehmen die finale Einteilung vor.",
    faq4Q: "Warum ist meine Statistik leer?",
    faq4A: "Die Statistiken werden aktualisiert, sobald du Interesse zeigst oder eingeteilt wirst.",
    faq5Q: "Wie funktioniert der Marktplatz?",
    faq5A: "Wenn du nicht pfeifen kannst, klicke unter Meine Spiele auf 'Abgeben'. Das Spiel erscheint auf dem Marktplatz, bis es jemand übernimmt.",
    loadingReadme: "Lade README von GitHub...",
    contactUs: "Kontakt",
    contactDesc: "Brauchst du Hilfe? Sende uns eine Nachricht.",
    subject: "Betreff",
    message: "Nachricht",
    sendMsg: "Nachricht senden",
    sending: "Wird gesendet...",
    msgSentTitle: "Nachricht gesendet!",
    msgSentDesc: "Danke für deine Nachricht. Wir melden uns in Kürze.",
    sendAnother: "Weitere Nachricht senden",
    shareGuide: "Anleitung teilen",
    linkCopied: "Link in Zwischenablage kopiert!",
    sendSchedules: "Spielpläne senden",
    reviewEmails: "E-Mails überprüfen",
    customEmailMessage: "Persönliche Nachricht (Optional)",
    customEmailPlaceholder: "Nachricht eingeben, die allen oben in der E-Mail angezeigt wird...",
    sendAllEmails: "An {count} Schiedsrichter senden",
    missingEmailWarning: "{count} Schiedsrichter haben Spiele, aber keine E-Mail-Adresse:",
    emailPreview: "E-Mail Vorschau",
    emailsSentSuccess: "Alle Spielpläne wurden erfolgreich versendet!",
    bookedIn: "Gebucht in",
    filterStatusAll: "Alle Status",
    noInterests: "Keine Interessen",
    coUmpires: "Mit-Schiedsrichter:",
    noCoUmpires: "Keine Mit-Schiedsrichter",
    calendarColumn: "Kalender",
    gameDetails: "Spieldetails",
    mapDirections: "Karte öffnen",
    officials: "Offizielle",
    supervisor: "Supervisor",
    techComm: "Technical Commissioner",
    notAssigned: "Nicht eingeteilt",
    yourGame: "Dein Spiel",
    marketplace: "Marktplatz",
    marketplaceDesc: "Finde Spiele, die andere abgeben möchten oder bei denen Schiedsrichter fehlen.",
    tradeGame: "Abgeben",
    cancelTrade: "Abgabe abbrechen",
    takeGame: "Spiel übernehmen",
    gamesForTrade: "Abzugebende Spiele",
    noMarketplaceGames: "Derzeit werden keine Spiele angeboten.",
    tradeSuccess: "Du hast das Spiel übernommen! Dein Spielplan wurde aktualisiert.",
    tradeConfirm: "Möchtest du dieses Spiel wirklich übernehmen?",
    downloadCalendar: "Herunterladen",
    formatICS: ".ICS Datei",
    subtextICS: "Für Apple & Outlook",
    formatCSV: ".CSV Datei",
    subtextCSV: "Für Google Kalender",
    evaluate: "Bewerten",
    grade: "Note",
    feedback: "Feedback / Kommentar",
    saveEval: "Bewertung speichern",
    evalSaved: "Bewertung gespeichert",
    yourEval: "Deine Bewertung",
    selectAdmin: "Admin wählen...",
    selectUmpire: "Schiedricht. wählen...",
    enterTCName: "TC Name eingeben...",
    umpireShort: "UMP",
    supShort: "SUP",
    tcShort: "TC",
    locations: "Standorte",
    address: "Adresse",
    facilities: "Anlagen",
    noFacilities: "Keine Anlagen angegeben",
    addFacility: "Anlage hinzufügen...",
    editLocation: "Standort bearbeiten",
    noLocationsInfo: "Klicke auf einen Standort, um Details anzuzeigen.",
    matchMovedWarning: "Spiel verschoben! Bitte bestätige die neue Zeit.",
    acceptTime: "Zeit akzeptieren",
    declineTime: "Kann nicht (Absagen)",
    timeChangedBadge: "Zeit geändert",
    pendingReply: "Wartet auf Antwort",
    emailMatchMovedSubject: "Spielplan aktualisiert ({count} Spiele)",
    emailMatchMovedBody: "Hallo {name},\n\nDie folgenden deiner Spiele wurden verschoben:\n\n{changesListEn}\n\nBitte melde dich im Portal an, um zu bestätigen, ob du weiterhin teilnehmen kannst.",
    pendingEmailsQueued: "⏳ {count} E-Mails zu verschobenen Spielen sind in der Warteschlange.",
    sendQueuedNow: "Jetzt senden",
    actionRequired: "Aktion erforderlich",
    superAdminSettings: "System (Super Admin)",
    featureMarketplace: "Marktplatz (Trade Board)",
    featureEvaluations: "Bewertungssystem",
    featureReminders: "E-Mail-Erinnerungen",
    reminderPreferences: "Benachrichtigungen",
    receiveReminders: "Erinnerungen für meine anstehenden Spiele",
    runRemindersNow: "Erinnerungen starten",
    reminderEmailSubject: "Erinnerung: Anstehende Spiele",
    reminderEmailBody: "Hallo {name},\n\nErinnerung an deine Spiele in den nächsten Tagen:\n\n{gamesListEn}"
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const formatCalendarDate = (dateStr, timeStr, addHours = 3) => {
  const cleanDate = (dateStr || '').replace(/-/g, '');
  const cleanTime = (timeStr || '00:00').replace(/:/g, '');
  const start = `${cleanDate}T${cleanTime}00`;
  const [hours, mins] = (timeStr || '00:00').split(':');
  const endHours = (parseInt(hours || '0') + addHours).toString().padStart(2, '0');
  const end = `${cleanDate}T${endHours}${mins || '00'}00`;
  return { start, end };
};

const getGoogleCalendarLink = (game) => {
  if (!game.date || !game.time) return '#';
  const { start, end } = formatCalendarDate(game.date, game.time);
  const title = encodeURIComponent(`${game.away} @ ${game.home} (${game.league})`);
  const details = encodeURIComponent(`League: ${game.league}\nLocation: ${game.location}`);
  const location = encodeURIComponent(game.location);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

const getOutlookCalendarLink = (game) => {
  if (!game.date || !game.time) return '#';
  const { start, end } = formatCalendarDate(game.date, game.time);
  const title = encodeURIComponent(`${game.away} @ ${game.home} (${game.league})`);
  const details = encodeURIComponent(`League: ${game.league}\nLocation: ${game.location}`);
  const location = encodeURIComponent(game.location);
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${location}`;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-slate-800 mb-4 mt-8 tracking-tight">{line.substring(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mb-3 mt-6 pb-2 border-b border-slate-100">{line.substring(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-700 mb-2 mt-4">{line.substring(4)}</h3>;
    if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-1 text-slate-600 font-medium">{line.substring(2)}</li>;
    if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-blue-400 bg-blue-50 p-3 my-4 italic text-slate-700 rounded-r-lg">{line.substring(2)}</blockquote>;
    if (line.trim() === '') return <div key={i} className="h-2"></div>;
    return <p key={i} className="mb-2 text-slate-600 font-medium leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
  });
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
  // 1. Core State Hooks
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [umpireId, setUmpireId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUmpireIds, setAdminUmpireIds] = useState([]);
  
  // 2. Navigation & View State
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
  
  // 3. Federation Multi-Tenant Setup
  const [isDemoEnv, setIsDemoEnv] = useState(true);
  const [federation, setFederation] = useState('swe');
  const federations = [
    { id: 'swe', name: '🇸🇪 Sweden', defaultLang: 'sv' },
    { id: 'fin', name: '🇫🇮 Finland', defaultLang: 'fi' },
    { id: 'sui', name: '🇨🇭 Switzerland', defaultLang: 'de' }
  ];

  // 4. Language Context
  const defaultLang = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('sv') ? 'sv' : 'en';
  const [lang, setLang] = useState(defaultLang);
  
  const getTranslation = (languageCode) => {
    const selected = translations[languageCode] || translations['en'];
    const fallback = translations['en'];
    return new Proxy(selected, {
      get: (target, prop) => target[prop] !== undefined ? target[prop] : fallback[prop]
    });
  };
  const t = getTranslation(lang);

  // 5. App Data State
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterUmpires, setMasterUmpires] = useState([]);
  const [registeredEmails, setRegisteredEmails] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [mailQueue, setMailQueue] = useState([]);
  
  // 6. UI & Modals State
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [globalNote, setGlobalNote] = useState('');
  
  const [features, setFeatures] = useState({ marketplace: true, evaluations: true, reminders: true });
  const [helpTab, setHelpTab] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'guide' : 'guide'));
  const [readmeContent, setReadmeContent] = useState(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState('idle');

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [sendingBulkEmails, setSendingBulkEmails] = useState(false);

  const [showScheduleExport, setShowScheduleExport] = useState(false);
  const [showMyGamesExport, setShowMyGamesExport] = useState(false);
  
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
  
  const [evaluatingUmpire, setEvaluatingUmpire] = useState(null);
  const [evalGrade, setEvalGrade] = useState(0);
  const [evalComment, setEvalComment] = useState('');

  const [editingLocation, setEditingLocation] = useState(null);
  const [newFacility, setNewFacility] = useState('');
  
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [changelog, setChangelog] = useState([]);
  const [loadingChangelog, setLoadingChangelog] = useState(false);
  
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
  const [umpireSort, setUmpireSort] = useState('level');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeague, setFilterLeague] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  // Environment & Domain Logic
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
    return `${base}-${federation}-${selectedYear}`;
  }, [federation, selectedYear]);

  // ==========================================
  // USE MEMO HOOKS (Strict Order)
  // ==========================================

  const groupedAssignments = useMemo(() => {
    const map = {};
    assignments.forEach(asg => {
      if (!map[asg.gameId]) map[asg.gameId] = [];
      map[asg.gameId].push(asg);
    });
    return map;
  }, [assignments]);

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
      
      return showHistory ? isHistorical && matchesSearch && matchesLeague && matchesLocation && statusMatch : !isHistorical && matchesSearch && matchesLeague && matchesLocation && statusMatch;
    });
  }, [games, searchQuery, filterLeague, filterLocation, filterStatus, showHistory, today, groupedAssignments, applications]);

  const leagues = useMemo(() => [...new Set(games.map(g => g.league || 'Unknown'))].sort((a, b) => a.localeCompare(b, lang)), [games, lang]);
  const allLocationNames = useMemo(() => {
    const fromGames = games.map(g => g.location);
    const fromData = locationsData.map(l => l.id);
    return [...new Set([...fromGames, ...fromData])].filter(Boolean).sort((a, b) => a.localeCompare(b, lang));
  }, [games, locationsData, lang]);
  const locations = useMemo(() => [...new Set(games.map(g => g.location || 'Unknown'))].sort((a, b) => a.localeCompare(b, lang)), [games, lang]);
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

  // ==========================================
  // HELPER UI FUNCTIONS
  // ==========================================
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

  // ==========================================
  // EFFECT HOOKS
  // ==========================================
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
  }, [selectedGameDetails]);

  useEffect(() => {
    const initAuth = async () => {
      try { 
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          try {
            await signInWithCustomToken(auth, window.__initial_auth_token);
          } catch (customErr) {
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth); 
        }
      } catch (err) { }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
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
      const isMaster = user.email === 'suecio@tryempire.com';
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


  // ==========================================
  // ACTIONS / HANDLERS
  // ==========================================
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
         if (typeof window !== 'undefined') alert(t.remindersSent || "Reminders queued!");
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
  
  const toggleTradeStatus = async (asgId, status) => {
    if (!umpireId && !isAdmin) return; 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), {
      forTrade: status
    });
  };

  const takeTrade = async (oldAsg, game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    if (oldAsg.userId === umpireId) return; 
    
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
      batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', oldAsg.id));
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
          batch.update(asgRef, { pendingChange: true });
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
      setEditingGameData(null);
    } catch (e) { } finally {
      setSyncing(false);
    }
  };

  const forceSendQueue = async () => {
    if (!isAdmin) return;
    setSyncing(true);
    try {
       const promises = mailQueue.map(async (queueItem) => {
          const changesTextEn = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Moved from ${c.oldDate} ${c.oldTime} to ${c.newDate} ${c.newTime}`).join('\n');
          const changesTextSv = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Flyttad från ${c.oldDate} ${c.oldTime} till ${c.newDate} ${c.newTime}`).join('\n');
          const emailBody = t.emailMatchMovedBody
             .replace(/\{name\}/g, queueItem.userName)
             .replace(/\{changesListSv\}/g, changesTextSv)
             .replace(/\{changesListEn\}/g, changesTextEn);
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
             to: queueItem.email,
             message: {
               subject: t.emailMatchMovedSubject.replace('{count}', queueItem.changes.length),
               text: emailBody
             },
             createdAt: Date.now()
          });
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', queueItem.id));
       });
       await Promise.all(promises);
    } catch(e) { } finally {
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

  const generateCSV = (gamesToExport) => {
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

  const deleteAllGames = async () => {
    if (!isAdmin) return;
    if (typeof window !== 'undefined' && !window.confirm(t.deleteAllConfirm)) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      games.forEach(game => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)));
      assignments.forEach(asg => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${asg.gameId}_${asg.userId}`)));
      applications.forEach(app => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'applications', `${app.gameId}_${app.userId}`)));
      evaluations.forEach(ev => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', ev.id)));
      await batch.commit();
      if (typeof window !== 'undefined') alert(t.deleteAllSuccess);
    } catch (e) { 
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

  const generateEmailHtml = (umpireName, umpireGames) => {
    const customHtml = customEmailMessage ? `<p style="font-size: 14px; line-height: 1.5; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">${customEmailMessage.replace(/\n/g, '<br/>')}</p>` : '';
    
    const rows = umpireGames.map(g => {
      const googleLnk = getGoogleCalendarLink(g);
      const outlookLnk = getOutlookCalendarLink(g);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 8px; font-size: 14px; color: #334155; white-space: nowrap;">
            <strong>${g.date}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">${g.time}</span>
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #0f172a;">
            <strong>${g.away} @ ${g.home}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">${g.league} • ${g.location}</span>
          </td>
          <td style="padding: 12px 8px; font-size: 12px; text-align: right; white-space: nowrap;">
            <a href="${googleLnk}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold; display: block; margin-bottom: 6px;">+ Google</a>
            <a href="${outlookLnk}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold; display: block;">+ Outlook</a>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Domaruppdrag / Umpire Assignments ${selectedYear}</h2>
        <p style="font-size: 16px;">Hej / Hello <strong>${umpireName}</strong>,</p>
        ${customHtml}
        <p style="font-size: 15px; color: #334155; margin-top: 20px;">Här är dina tilldelade matcher för säsongen / Here are your assigned matches for the season:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 32px;">
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Datum / Date</th>
            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Match / Game</th>
            <th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; text-align: right;">${t.calendarColumn}</th>
          </tr>
          ${rows}
        </table>
        
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
           <a href="https://schema.domarweb.se/?view=my-apps" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
             Se ditt schema & Ladda ner alla matcher (.ics)<br/>
             <span style="font-size: 12px; font-weight: normal; opacity: 0.9;">View schedule & Download all matches</span>
           </a>
        </div>
      </div>
    `;
  };

  const handleSendAllSchedules = async () => {
    if (!isAdmin) return;
    setSendingBulkEmails(true);
    
    try {
      const promises = emailCandidates.ready.map(candidate => {
        return addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
          to: candidate.umpire.linkedEmail,
          message: {
            subject: `Domaruppdrag ${selectedYear} / Umpire Assignments`,
            html: generateEmailHtml(candidate.umpire.name, candidate.assignedGames)
          },
          createdAt: Date.now()
        });
      });
      
      await Promise.all(promises);
      
      if (typeof window !== 'undefined') alert(t.emailsSentSuccess);
      setShowEmailPreview(false);
      setCustomEmailMessage('');
    } catch (error) {
      if (typeof window !== 'undefined') alert("Ett fel uppstod när mejlen skulle skickas.");
    } finally {
      setSendingBulkEmails(false);
    }
  };

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
          setFilterStatus('');
          setShowHistory(false); 
          scrollToTop(); 
        }} 
        className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-20 cursor-pointer group"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center pointer-events-none gap-3 sm:gap-2">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-white rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-blue-900" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-xl font-bold tracking-tight leading-none group-hover:text-blue-200 transition-colors truncate">{t.appTitle}</h1>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-blue-300 tracking-widest mt-1 truncate">{t.season} {selectedYear}</p>
              </div>
            </div>
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (user && user.email) setShowAdminModal(true); 
                else setShowAuthModal(true); 
              }} 
              className="p-1.5 sm:hidden hover:bg-blue-800 rounded-full transition-colors pointer-events-auto"
            >
              {user && user.email ? <Settings className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-shrink-0 justify-between sm:justify-end w-full sm:w-auto">
            
            {isDemoEnv && (
              <select
                value={federation}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setFederation(e.target.value);
                  const newFed = federations.find(f => f.id === e.target.value);
                  if (newFed) setLang(newFed.defaultLang);
                }}
                className="bg-blue-800 text-[10px] font-black uppercase border-none rounded-lg px-2 py-1.5 outline-none appearance-none cursor-pointer flex-1 sm:flex-none shadow-inner"
              >
                {federations.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}

            <select 
              value={selectedYear} 
              onClick={(e) => e.stopPropagation()} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              className="bg-blue-800 text-[10px] font-black uppercase border-none rounded-lg px-2 py-1.5 outline-none appearance-none cursor-pointer shadow-inner"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <div className="flex bg-blue-800 rounded-lg p-0.5 shadow-inner">
              <button onClick={(e) => { e.stopPropagation(); setLang('sv'); }} className={`px-1.5 py-1 text-[10px] rounded-md transition-all ${lang === 'sv' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇸🇪</button>
              {isDemoEnv && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setLang('fi'); }} className={`px-1.5 py-1 text-[10px] rounded-md transition-all ${lang === 'fi' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇫🇮</button>
                  <button onClick={(e) => { e.stopPropagation(); setLang('de'); }} className={`px-1.5 py-1 text-[10px] rounded-md transition-all ${lang === 'de' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇨🇭</button>
                </>
              )}
              <button onClick={(e) => { e.stopPropagation(); setLang('en'); }} className={`px-1.5 py-1 text-[10px] rounded-md transition-all ${lang === 'en' ? 'bg-blue-600 shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇬🇧</button>
            </div>
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setView('help');
                setHelpTab('guide');
              }} 
              className="p-1.5 hover:bg-blue-800 rounded-full transition-colors"
              title={t.helpAndInfo}
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (user && user.email) setShowAdminModal(true); 
                else setShowAuthModal(true); 
              }} 
              className="p-1.5 hidden sm:block hover:bg-blue-800 rounded-full transition-colors"
            >
              {user && user.email ? <Settings className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        
        {view !== 'help' && (
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto custom-scrollbar whitespace-nowrap">
            {[
              { id: 'schedule', label: t.schedule, icon: CalendarIcon },
              { id: 'locations', label: t.locations, icon: MapPin },
              { id: 'umpire-list', label: t.umpireList, icon: Users },
              ...(user && user.email ? [
                  ...(features.marketplace ? [{ id: 'marketplace', label: t.marketplace, icon: ArrowRightLeft }] : []),
                  { id: 'my-apps', label: t.myGames, icon: CheckCircle }
                ] : []),
              ...(isAdmin ? [
                  { id: 'admin', label: t.staffing, icon: Shield }, 
                  { id: 'stats', label: t.analytics, icon: BarChart }
                ] : [])
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setView(tab.id); scrollToTop(); }} 
                className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-200 ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="inline">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {globalNote && view !== 'help' && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl shadow-sm flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
            <Megaphone className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-yellow-800 whitespace-pre-wrap">{globalNote}</p>
          </div>
        )}

        {(view === 'schedule' || view === 'admin' || view === 'umpire-list' || view === 'marketplace' || view === 'locations') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {(view === 'schedule' || view === 'admin' || view === 'marketplace') && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={() => setFilterStatus('')} 
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-colors ${filterStatus === '' ? 'bg-blue-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {t.filterStatusAll}
                </button>
                <button 
                  onClick={() => setFilterStatus('needs_umpire')} 
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-colors ${filterStatus === 'needs_umpire' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'}`}
                >
                  {t.needsUmpire}
                </button>
                <button 
                  onClick={() => setFilterStatus('no_interests')} 
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-colors ${filterStatus === 'no_interests' ? 'bg-red-500 text-white shadow-sm' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
                >
                  {t.noInterests}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`relative sm:col-span-2 ${view === 'locations' ? 'lg:col-span-4' : 'lg:col-span-2'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
              
              {(view === 'schedule' || view === 'admin' || view === 'marketplace') && (
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
          
          {view === 'help' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <button 
                onClick={() => { setView('schedule'); }} 
                className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> {t.back}
              </button>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto custom-scrollbar">
                  <button 
                    onClick={() => setHelpTab('guide')}
                    className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'guide' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <BookOpen className="w-4 h-4" /> {t.guide}
                  </button>
                  <button 
                    onClick={() => setHelpTab('faq')}
                    className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'faq' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <MessageCircle className="w-4 h-4" /> {t.faq}
                  </button>
                  <button 
                    onClick={() => setHelpTab('contact')}
                    className={`min-w-[140px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'contact' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <Mail className="w-4 h-4" /> {t.contactUs}
                  </button>
                  <button 
                    onClick={() => setHelpTab('about')}
                    className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'about' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <Code className="w-4 h-4" /> {t.about}
                  </button>
                </div>

                <div className="p-6 sm:p-8">
                  {helpTab === 'guide' && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                      <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{t.guide}</h2>
                        <p className="text-slate-500 font-medium mt-2">Hur du kopplar ditt konto till din domarprofil</p>
                        
                        <button 
                          onClick={copyGuideLink}
                          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-colors shadow-sm active:scale-95"
                        >
                          <Share2 className="w-4 h-4" /> {t.shareGuide}
                        </button>
                      </div>

                      <div className="grid gap-6">
                        <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="flex gap-4 sm:gap-6 items-start">
                            <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200">
                              <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">{t.guideStep1Title}</h3>
                              <p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep1Desc}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="flex gap-4 sm:gap-6 items-start">
                            <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200">
                              <Search className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">{t.guideStep2Title}</h3>
                              <p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep2Desc}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                          <div className="flex gap-4 sm:gap-6 items-start">
                            <div className="bg-blue-600 p-3 rounded-xl shadow-md shrink-0">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-blue-900">{t.guideStep3Title}</h3>
                              <p className="text-blue-800 font-medium leading-relaxed mt-1">{t.guideStep3Desc}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4">
                          <div className="flex gap-4 sm:gap-6 items-start">
                            <div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200">
                              <Info className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-800">{t.guideStep4Title}</h3>
                              <p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep4Desc}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {helpTab === 'faq' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{t.faq}</h2>
                      </div>

                      <div className="space-y-4">
                        {[
                          { q: t.faq1Q, a: t.faq1A },
                          { q: t.faq2Q, a: t.faq2A },
                          { q: t.faq3Q, a: t.faq3A },
                          { q: t.faq4Q, a: t.faq4A },
                          { q: t.faq5Q, a: t.faq5A }
                        ].map((faq, idx) => (
                          <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="text-sm font-black uppercase text-slate-800 mb-2">{faq.q}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {helpTab === 'contact' && (
                    <div className="max-w-2xl mx-auto">
                      <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{t.contactUs}</h2>
                        <p className="text-slate-500 font-medium mt-2">{t.contactDesc}</p>
                      </div>

                      {contactStatus === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-black text-green-800 mb-2">{t.msgSentTitle}</h3>
                          <p className="text-green-700 font-medium mb-6">{t.msgSentDesc}</p>
                          <button 
                            onClick={() => setContactStatus('idle')} 
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-green-700 transition-colors shadow-md"
                          >
                            {t.sendAnother}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleContactSubmit} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.name}</label>
                              <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label>
                              <input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.subject}</label>
                            <input type="text" required value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.message}</label>
                            <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" />
                          </div>

                          <div className="pt-2">
                            <button 
                              type="submit" 
                              disabled={contactStatus === 'sending'} 
                              className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                              {contactStatus === 'sending' ? (
                                <><RefreshCw className="w-4 h-4 animate-spin" /> {t.sending}</>
                              ) : (
                                <><Send className="w-4 h-4" /> {t.sendMsg}</>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {helpTab === 'about' && (
                    <div className="max-w-3xl mx-auto">
                      <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Code className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{t.about}</h2>
                      </div>
                      
                      <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100">
                        {readmeLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
                            <RefreshCw className="w-8 h-8 animate-spin" />
                            <p className="text-sm font-bold">{t.loadingReadme}</p>
                          </div>
                        ) : (
                          <div className="markdown-body text-sm sm:text-base">
                            {renderMarkdown(readmeContent)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LOCATIONS DIRECTORY */}
          {view === 'locations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> {t.locations}
                </h2>
              </div>

              {allLocationNames.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-center text-slate-400 font-medium">
                  {t.noLocationsInfo}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {allLocationNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).map(locName => {
                    const locData = locationsData.find(l => l.id === locName);
                    return (
                      <button 
                        key={locName} 
                        onClick={() => setSelectedLocation(locName)}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left group flex flex-col justify-between min-h-[120px]"
                      >
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{locName}</h3>
                          {locData?.address && (
                            <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                              <Navigation className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{locData.address}</span>
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                           {locData?.facilities && locData.facilities.length > 0 ? (
                             <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                               {locData.facilities.length} {t.facilities}
                             </span>
                           ) : (
                             <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                               {t.noFacilities}
                             </span>
                           )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SCHEDULE */}
          {view === 'schedule' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                  {showHistory ? t.archived : t.activeSchedule}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  {filteredGames.length > 0 && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowScheduleExport(!showScheduleExport)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <CalendarPlus className="w-4 h-4" /> {t.downloadCalendar} <ChevronDown className="w-3 h-3" />
                      </button>
                      {showScheduleExport && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowScheduleExport(false)}></div>
                          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => { generateICS(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-700">{t.formatICS}</span>
                              <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextICS}</span>
                            </button>
                            <button onClick={() => { generateCSV(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-700">{t.formatCSV}</span>
                              <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextCSV}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                        {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map(d => (
                          <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarWeeks.flatMap((week) => 
                          week.days.map((day, idx) => {
                            const dateStr = day ? toLocalISO(day) : null;
                            const matches = dateStr ? filteredGames.filter(g => g.date === dateStr) : [];
                            const isToday = dateStr === today;
                            
                            return (
                              <div key={`${week.weekNumber}-${idx}`} className={`min-h-[100px] p-2 border-r border-b border-slate-50 relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                                {day && (
                                  <>
                                    <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>
                                      {day.getDate()}
                                    </span>
                                    <div className="mt-2 space-y-1">
                                      {matches.map(g => (
                                        <button 
                                          key={g.id} 
                                          onClick={(e) => { e.stopPropagation(); setSelectedGameDetails(g); }} 
                                          className="w-full text-left p-1 rounded border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden"
                                        >
                                          <div className={`w-full h-1 rounded-full mb-1 ${getLeagueStyles(g.league).split(' ')[0]}`} />
                                          <p className="text-[8px] font-bold text-slate-700 truncate leading-none uppercase">{g.away} @ {g.home}</p>
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })
                        )}
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
                      <div 
                        key={game.id} 
                        onClick={() => setSelectedGameDetails(game)}
                        className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all cursor-pointer hover:border-blue-300 group ${showHistory ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100 flex flex-col justify-center group-hover:bg-blue-50 transition-colors">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                              <p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                              </div>
                              <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight group-hover:text-blue-700 transition-colors">{game.away} @ {game.home}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                              </div>
                              
                              {/* Centralized Officials Output */}
                              {renderOfficialsRow(game, gameAssignments, masterUmpires)}
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
                                {isAssignedToThisGame ? (
                                  <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4" /> {t.yourGame}
                                  </div>
                                ) : (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} 
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white shadow-lg active:scale-95 hover:bg-blue-700'}`}
                                  >
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
                )
              )}
            </>
          )}
          
          {/* VIEW: MARKETPLACE */}
          {view === 'marketplace' && features.marketplace && (
            <div className="space-y-8">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                   <ArrowRightLeft className="w-5 h-5 text-blue-600" /> {t.marketplace}
                 </h2>
               </div>

               {/* Section 1: Up for trade */}
               <div className="space-y-4">
                 <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                    <Info className="w-6 h-6 text-orange-600 shrink-0" />
                    <p className="text-sm font-medium text-orange-800">{t.marketplaceDesc}</p>
                 </div>
                 
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.gamesForTrade}</h3>
                 
                 {(() => {
                   const tradedAssignments = assignments.filter(asg => asg.forTrade);
                   const tradedGames = tradedAssignments.map(asg => ({ asg, game: games.find(g => g.id === asg.gameId) })).filter(item => item.game && item.game.date >= today);
                   
                   if (tradedGames.length === 0) return <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-center text-slate-400 font-medium">{t.noMarketplaceGames}</div>;
                   
                   return (
                     <div className="grid gap-4">
                       {tradedGames.map(({asg, game}) => (
                          <div 
                            key={asg.id} 
                            onClick={() => setSelectedGameDetails(game)}
                            className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4 group cursor-pointer hover:border-orange-400 transition-colors"
                          >
                            {/* Game info */}
                            <div className="flex gap-4">
                               {/* date block */}
                               <div className="bg-orange-50 p-3 rounded-xl text-center min-w-[75px] border border-orange-100 flex flex-col justify-center">
                                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                                  <p className="text-2xl font-black text-orange-700 leading-none">{safeDateNum(game.date)}</p>
                                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                                </div>
                                <div>
                                   <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest mb-1 inline-block ${getLeagueStyles(game.league)}`}>{game.league}</span>
                                   <h3 className="font-bold text-slate-900 text-sm leading-tight">{game.away} @ {game.home}</h3>
                                   <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time} <MapPin className="w-3.5 h-3.5 ml-2" /> {game.location}</p>
                                   
                                   {/* Officials Render */}
                                   {renderOfficialsRow(game, groupedAssignments[game.id] || [], masterUmpires)}

                                   <div className="mt-3 bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 w-fit flex items-center gap-2">
                                     <UserMinus className="w-3.5 h-3.5 text-orange-600"/>
                                     <span className="text-[10px] font-black uppercase text-orange-800">Bytes bort av: {asg.userName}</span>
                                   </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); takeTrade(asg, game); }} 
                                 disabled={asg.userId === umpireId}
                                 className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                               >
                                 <ArrowRightLeft className="w-4 h-4" />
                                 {asg.userId === umpireId ? t.yourGame : t.takeGame}
                               </button>
                            </div>
                          </div>
                       ))}
                     </div>
                   );
                 })()}
               </div>

               {/* Section 2: Missing Umpires */}
               <div className="space-y-4 pt-6 border-t border-slate-200">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.needsUmpire}</h3>
                 {(() => {
                    const unstaffedGames = filteredGames.filter(g => (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2) && g.date >= today);
                    if (unstaffedGames.length === 0) return <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl text-center text-slate-400 font-medium">Inga matcher saknar domare just nu.</div>;
                    
                    return (
                      <div className="grid gap-4">
                        {unstaffedGames.map(game => {
                           const appsCount = applications.filter(a => a.gameId === game.id).length;
                           const isApplied = umpireId && applications.some(a => a.gameId === game.id && a.userId === umpireId);
                           const gameAssignments = groupedAssignments[game.id] || [];
                           const isAssignedToThisGame = umpireId && gameAssignments.some(asg => asg.userId === umpireId);
                           const required = game.requiredUmpires || 2;
                           
                           return (
                             <div 
                               key={game.id} 
                               onClick={() => setSelectedGameDetails(game)}
                               className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden transition-all cursor-pointer hover:border-blue-300 group"
                             >
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex gap-4">
                                    <div className="bg-yellow-50 p-3 rounded-xl text-center min-w-[75px] border border-yellow-100 flex flex-col justify-center group-hover:bg-blue-50 transition-colors">
                                      <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                                      <p className="text-2xl font-black text-yellow-700 leading-none">{safeDateNum(game.date)}</p>
                                      <p className="text-[9px] font-black text-yellow-600 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                                      </div>
                                      <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight group-hover:text-blue-700 transition-colors">{game.away} @ {game.home}</h3>
                                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span>
                                      </div>

                                      {/* Officials Render */}
                                      {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} {t.applied}</span>
                                      <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mt-0.5">
                                        {gameAssignments.length}/{required} {t.assignedTo}
                                      </span>
                                    </div>
                                    {isAssignedToThisGame ? (
                                      <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4" /> {t.yourGame}
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} 
                                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white shadow-lg active:scale-95 hover:bg-blue-700'}`}
                                      >
                                        {isApplied ? t.withdraw : t.interested}
                                      </button>
                                    )}
                                  </div>
                                </div>
                             </div>
                           );
                        })}
                      </div>
                    );
                 })()}
               </div>
            </div>
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
                         {u.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">{u.name}</span>
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
                        {profileUser.name.charAt(0)}
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
                          {profileGames.map(game => {
                            const gameAssignments = groupedAssignments[game.id] || [];
                            return (
                              <div 
                                key={game.id} 
                                onClick={() => setSelectedGameDetails(game)}
                                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-blue-200 cursor-pointer transition-colors group"
                              >
                                <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[65px] border border-slate-100 flex flex-col justify-center group-hover:bg-blue-50 transition-colors">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{safeDateDay(game.date)}</p>
                                  <p className="text-xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                                </div>
                                <div>
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest mb-1 inline-block ${getLeagueStyles(game.league)}`}>{game.league}</span>
                                  <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">{game.away} @ {game.home}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {game.time}
                                    <MapPin className="w-3 h-3 ml-2" /> {game.location}
                                  </p>
                                  {/* Officials Render */}
                                  {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                                </div>
                              </div>
                            );
                          })}
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
                    <button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-sm text-xs uppercase"><Plus className="w-4 h-4" /> {t.bulkImport}</button>
                    <button onClick={() => setShowEmailPreview(true)} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg text-xs uppercase">
                      <Mail className="w-4 h-4" /> {t.sendSchedules}
                    </button>
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
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> {t.globalAnnouncement}
                  </h3>
                  <textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    placeholder={t.announcementPlaceholder}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px]"
                  />
                  <div className="flex gap-2 mt-3">
                    <button onClick={saveGlobalNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.saveAnnouncement}</button>
                    <button onClick={clearGlobalNote} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.clearAnnouncement}</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4" /> {t.masterList}
                    </h3>
                    {isSuperAdmin && (
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
                                <span className="text-sm font-bold text-slate-700">{u.name}</span>
                                {u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}
                                {(adminUmpireIds || []).includes(u.id) && (
                                  <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-black ml-1 flex items-center gap-0.5">
                                    <Shield className="w-2 h-2" /> Admin
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                {u.linkedEmail ? (
                                  <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {t.linkedAccount} {u.linkedEmail}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                    <Info className="w-3 h-3" /> {t.notLinked}
                                  </span>
                                )}
                                
                                {features.reminders && (
                                  <button
                                    onClick={() => toggleUmpireReminderPref(u.id, u.remindersEnabled)}
                                    className={`text-[10px] flex items-center gap-1 font-bold ${u.remindersEnabled !== false ? 'text-blue-600' : 'text-slate-400'}`}
                                    title="Toggle Reminders"
                                  >
                                    {u.remindersEnabled !== false ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                                    Reminders
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 items-start">
                              {isSuperAdmin && (
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
                                onClick={() => deleteMasterUmpire(u.id, u.name, u.linkedEmail)} 
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
                  {mailQueue.length > 0 && isAdmin && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
                      <p className="text-sm font-bold text-yellow-800 flex-1 leading-relaxed">
                         {t.pendingEmailsQueued.replace('{count}', mailQueue.length)}
                      </p>
                      <button 
                        onClick={forceSendQueue} 
                        disabled={syncing}
                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50"
                      >
                         {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.sendQueuedNow}
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" /> {t.pendingAssignments}
                    </h3>
                    <button 
                      onClick={() => setShowStaffed(!showStaffed)} 
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${showStaffed ? 'bg-slate-800 text-white shadow-md hover:bg-black' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {showStaffed ? t.hideStaffed : t.showAll}
                    </button>
                  </div>
                  
                  {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
                    const applicants = applications.filter(a => a.gameId === game.id);
                    const gameAssignments = groupedAssignments[game.id] || [];
                    const required = game.requiredUmpires || 2;
                    const isEditingThisGame = editingGameData?.id === game.id;
                    const isFullyStaffed = gameAssignments.length >= required;

                    return (
                      <div 
                        key={game.id} 
                        className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isFullyStaffed && !isEditingThisGame ? 'opacity-60 grayscale' : 'border-slate-200'}`}
                      >
                        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center hover:bg-slate-100/50 cursor-pointer transition-colors" onClick={() => setSelectedGameDetails(game)}>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
                            <p className="text-xs font-bold text-slate-600">{game.away} @ {game.home} | {safeDateDay(game.date)} {game.date} @ {game.time}</p>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} {t.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingGameData(isEditingThisGame ? null : { ...game }); }} 
                              className={`p-2 transition-colors ${isEditingThisGame ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if(typeof window !== 'undefined' && window.confirm(t.deleteConfirm)) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)); }} 
                              className="p-2 text-slate-300 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {isEditingThisGame && (
                          <div className="p-4 bg-blue-50/30 border-b border-slate-100 flex flex-col gap-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">{t.date}</label>
                                <input type="date" value={editingGameData.date || ''} onChange={e => setEditingGameData({...editingGameData, date: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">{t.time}</label>
                                <input type="time" value={editingGameData.time || ''} onChange={e => setEditingGameData({...editingGameData, time: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">{t.league}</label>
                                <input type="text" value={editingGameData.league || ''} onChange={e => setEditingGameData({...editingGameData, league: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                              </div>
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
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">{t.away}</label>
                                <input type="text" value={editingGameData.away || ''} onChange={e => setEditingGameData({...editingGameData, away: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">{t.home}</label>
                                <input type="text" value={editingGameData.home || ''} onChange={e => setEditingGameData({...editingGameData, home: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">{t.location}</label>
                                <input type="text" value={editingGameData.location || ''} onChange={e => setEditingGameData({...editingGameData, location: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={saveEditedGame} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase shadow-sm hover:bg-green-700">{t.saveChanges}</button>
                              <button onClick={() => setEditingGameData(null)} className="flex-1 bg-slate-200 text-slate-600 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-slate-300">{t.cancel}</button>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             {gameAssignments.map(asg => {
                               const m = masterUmpires.find(mu => mu.id === asg.userId);
                               return (
                                 <div key={asg.userId} className={`flex items-center justify-between p-2 rounded-xl border ${asg.pendingChange ? 'border-yellow-200 bg-yellow-50' : 'border-green-100 bg-green-50/30'}`}>
                                   <div className="flex items-center gap-2">
                                     {asg.pendingChange ? <AlertTriangle className="w-3 h-3 text-yellow-600" /> : <Users className="w-3 h-3 text-green-600" />}
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); setSelectedProfileId(asg.userId); setView('umpire-profile'); scrollToTop(); }}
                                       className="text-xs font-bold text-slate-700 hover:text-blue-600 hover:underline text-left flex items-center"
                                     >
                                       {asg.userName}
                                       {asg.pendingChange && <span className="ml-2 text-[9px] text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">{t.pendingReply}</span>}
                                     </button>
                                     {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                                   </div>
                                   <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, asg.userId); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
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
                                  
                                  // Conflict Detection Logic
                                  const umpireAssignedGamesToday = assignments
                                    .filter(asg => asg.userId === app.userId)
                                    .map(asg => games.find(g => g.id === asg.gameId))
                                    .filter(g => g && g.date === game.date && g.id !== game.id);
                                  
                                  const conflictGame = umpireAssignedGamesToday.find(g => 
                                    (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim()
                                  );
                                  const isConflict = !!conflictGame;

                                  return (
                                    <div key={app.userId} className={`flex items-center justify-between p-2 rounded-xl border ${isConflict ? 'border-red-100 bg-red-50/30' : 'border-slate-100 bg-white hover:border-blue-300'} transition-all`}>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${isConflict ? 'text-red-700' : ''}`}>{app.userName}</span>
                                        {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                                      </div>
                                      <button 
                                        disabled={isFullyStaffed || isConflict} 
                                        onClick={(e) => { e.stopPropagation(); assignUmpire(game.id, app.userId, app.userName); }} 
                                        className={`${isConflict ? 'bg-red-100 text-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'} text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${isFullyStaffed && !isConflict ? 'opacity-50' : ''} transition-colors`}
                                        title={isConflict ? `${t.bookedIn} ${conflictGame.location}` : ''}
                                      >
                                        {isConflict ? (
                                          <><AlertTriangle className="w-3 h-3" /> {conflictGame.location}</>
                                        ) : (
                                          <><UserPlus className="w-3 h-3" /> Assign</>
                                        )}
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
                          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black uppercase">{stat.name.charAt(0)}</div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black uppercase">{t.mySchedule}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {myAssignedGames.length > 0 && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowMyGamesExport(!showMyGamesExport)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <CalendarPlus className="w-4 h-4" /> {t.downloadCalendar} <ChevronDown className="w-3 h-3" />
                      </button>
                      {showMyGamesExport && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMyGamesExport(false)}></div>
                          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => { generateICS(myAssignedGames); setShowMyGamesExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-700">{t.formatICS}</span>
                              <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextICS}</span>
                            </button>
                            <button onClick={() => { generateCSV(myAssignedGames); setShowMyGamesExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-700">{t.formatCSV}</span>
                              <span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextCSV}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
                     <button 
                       onClick={() => setMyGamesViewMode('list')} 
                       className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       <List className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => setMyGamesViewMode('calendar')} 
                       className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                       <CalendarIcon className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start mb-6">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium text-blue-800 leading-relaxed">
                  {t.myGamesReminder}
                </p>
              </div>

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
              ) : myGamesViewMode === 'calendar' ? (
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
                        {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map(d => (
                          <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarWeeks.flatMap((week) => 
                          week.days.map((day, idx) => {
                            const dateStr = day ? toLocalISO(day) : null;
                            const myMatches = dateStr ? [...myAssignedGames, ...myInterestedGames].filter(g => g.date === dateStr) : [];
                            const isToday = dateStr === today;
                            
                            return (
                              <div key={`${week.weekNumber}-${idx}`} className={`min-h-[100px] p-2 border-r border-b border-slate-50 relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                                {day && (
                                  <>
                                    <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>
                                      {day.getDate()}
                                    </span>
                                    <div className="mt-2 space-y-1">
                                      {myMatches.map(g => {
                                        const myAsg = groupedAssignments[g.id]?.find(a => a.userId === umpireId);
                                        const isAssigned = myAsg !== undefined;
                                        const isPending = myAsg?.pendingChange;
                                        
                                        return (
                                          <div 
                                            key={g.id} 
                                            onClick={() => setSelectedGameDetails(g)}
                                            className={`w-full text-left p-1 rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${isPending ? 'border-yellow-300 bg-yellow-50' : isAssigned ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-white'}`}
                                          >
                                            <div className={`w-full h-1 rounded-full mb-1 ${isPending ? 'bg-yellow-500' : isAssigned ? 'bg-green-500' : getLeagueStyles(g.league).split(' ')[0]}`} />
                                            <p className={`text-[8px] font-bold truncate leading-none uppercase ${isPending ? 'text-yellow-800' : isAssigned ? 'text-green-800' : 'text-slate-700'}`}>{g.away} @ {g.home}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })
                        )}
                    </div>
                </div>
              ) : (
                <>
                  {(() => {
                    const pendingAssignedGames = myAssignedGames.filter(g => groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange);
                    const confirmedAssignedGames = myAssignedGames.filter(g => !groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange);

                    const renderGameCard = (game) => {
                      const gameAssignments = groupedAssignments[game.id] || [];
                      const coUmpires = gameAssignments.filter(asg => asg.userId !== umpireId);
                      const myAsg = gameAssignments.find(a => a.userId === umpireId);

                      return (
                        <div 
                          key={game.id} 
                          onClick={() => setSelectedGameDetails(game)}
                          className={`bg-white p-4 sm:p-5 rounded-2xl border ${myAsg?.pendingChange ? 'border-yellow-400 shadow-sm shadow-yellow-100 ring-2 ring-yellow-400/20' : 'border-green-200 hover:shadow-md'} flex flex-col gap-3 cursor-pointer transition-all group`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${myAsg?.pendingChange ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'} shrink-0 transition-colors`}>
                                <CalendarIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-base">{game.away} @ {game.home}</p>
                                <p className="text-[11px] text-slate-500 font-black uppercase mt-1">{game.date} @ {game.time} • {game.location}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                               {myAsg?.pendingChange ? (
                                 <div className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start sm:self-end w-fit shadow-sm">{t.timeChangedBadge}</div>
                               ) : (
                                 <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start sm:self-end w-fit">{t.confirmed}</div>
                               )}
                               
                               {myAsg && !myAsg.pendingChange && features.marketplace && (
                                 myAsg.forTrade ? (
                                    <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, false); }} className="text-[10px] font-black uppercase bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors w-fit">
                                      {t.cancelTrade}
                                    </button>
                                 ) : (
                                    <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, true); }} className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1 w-fit">
                                      <ArrowRightLeft className="w-3 h-3" /> {t.tradeGame}
                                    </button>
                                 )
                               )}
                            </div>
                          </div>

                          {/* Pending Change Warning Block */}
                          {myAsg?.pendingChange && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-2 flex flex-col gap-3">
                              <p className="text-xs font-bold text-yellow-800 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {t.matchMovedWarning}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <button onClick={(e) => { e.stopPropagation(); confirmScheduleChange(myAsg.id); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.acceptTime}</button>
                                <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, umpireId); }} className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.declineTime}</button>
                              </div>
                            </div>
                          )}

                          {/* Co-umpires section */}
                          <div className="pt-3 border-t border-slate-50 mt-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.officials}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {coUmpires.map(u => (
                                 <span key={u.userId} className="text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-md flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {u.userName}</span>
                              ))}
                              {game.supervisorName && (
                                 <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md flex items-center gap-1"><Star className="w-3 h-3"/> SUP: {game.supervisorName}</span>
                              )}
                              {game.tcName && (
                                 <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md flex items-center gap-1"><FileText className="w-3 h-3"/> TC: {game.tcName}</span>
                              )}
                              {coUmpires.length === 0 && !game.supervisorName && !game.tcName && (
                                 <span className="text-xs font-medium text-slate-400 italic">{t.noCoUmpires}</span>
                              )}
                            </div>
                          </div>

                          {/* Calendar links */}
                          <div className="pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                             <a href={getGoogleCalendarLink(game)} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">+ Google</a>
                             <a href={getOutlookCalendarLink(game)} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">+ Outlook</a>
                             <button onClick={(e) => { e.stopPropagation(); handleCalendarExport(game); }} className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">.ICS</button>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="space-y-6">
                        {pendingAssignedGames.length > 0 && (
                          <div className="bg-yellow-50/50 p-4 rounded-3xl border border-yellow-200 shadow-inner">
                            <h3 className="text-sm font-black text-yellow-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" /> {t.actionRequired}
                            </h3>
                            <div className="space-y-4">
                              {pendingAssignedGames.map(renderGameCard)}
                            </div>
                          </div>
                        )}

                        {confirmedAssignedGames.length > 0 && (
                          <div>
                            {pendingAssignedGames.length > 0 && (
                              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 mt-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> {t.confirmedGames}
                              </h3>
                            )}
                            <div className="space-y-4">
                              {confirmedAssignedGames.map(renderGameCard)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">{t.interestedGames}</h3>
                    {myInterestedGames.map(game => (
                      <div 
                        key={game.id} 
                        onClick={() => setSelectedGameDetails(game)}
                        className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-2 cursor-pointer hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-slate-100 text-slate-400"><CalendarIcon className="w-5 h-5" /></div>
                          <div>
                            <p className="font-bold text-slate-900">{game.away} @ {game.home}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase">{game.date} @ {game.time}</p>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
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
            onClick={() => setShowAdminModal(true)} 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-50 border border-blue-800/50 backdrop-blur-md hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[11px] font-black uppercase shadow-inner">
                {userName ? userName.charAt(0) : '?'}
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-blue-300 leading-none mb-0.5">{t.userSettings}</p>
                <span className="text-sm font-bold whitespace-nowrap leading-none">{userName}</span>
              </div>
            </div>
          </button>
        ) : (
          <button 
            onClick={() => setShowNamePrompt(true)} 
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-blue-50 backdrop-blur-md animate-pulse"
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

      {/* Location Details Modal */}
      {selectedLocation && (() => {
        const locDetail = locationsData.find(l => l.id === selectedLocation) || { id: selectedLocation, address: '', facilities: [] };
        const mapQuery = locDetail.address ? locDetail.address : locDetail.id;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-end sm:justify-center z-[90] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => setSelectedLocation(null)} 
                className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {editingLocation?.id === selectedLocation ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-800">{t.editLocation}: {locDetail.id}</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.address}</label>
                    <input 
                      type="text" 
                      value={editingLocation.address} 
                      onChange={(e) => setEditingLocation({...editingLocation, address: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.facilities}</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newFacility} 
                        onChange={(e) => setNewFacility(e.target.value)}
                        placeholder={t.addFacility}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if(newFacility.trim()){
                              setEditingLocation({...editingLocation, facilities: [...(editingLocation.facilities || []), newFacility.trim()]});
                              setNewFacility('');
                            }
                          }
                        }}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                      <button 
                        onClick={() => {
                          if(newFacility.trim()){
                            setEditingLocation({...editingLocation, facilities: [...(editingLocation.facilities || []), newFacility.trim()]});
                            setNewFacility('');
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xl hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(editingLocation.facilities || []).map((fac, idx) => (
                        <div key={idx} className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-700">
                          {fac}
                          <button onClick={() => {
                            const newFacs = [...editingLocation.facilities];
                            newFacs.splice(idx, 1);
                            setEditingLocation({...editingLocation, facilities: newFacs});
                          }} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5"/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={saveLocation} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black uppercase text-xs shadow-sm hover:bg-green-700">{t.saveChanges}</button>
                    <button onClick={() => setEditingLocation(null)} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-black uppercase text-xs hover:bg-slate-300">{t.cancel}</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 pr-8 leading-tight">{locDetail.id}</h3>
                    {locDetail.address && (
                      <p className="text-slate-500 mt-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {locDetail.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.facilities}</h4>
                    {locDetail.facilities && locDetail.facilities.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {locDetail.facilities.map((fac, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <CheckCircle className="w-4 h-4 text-green-500" /> {fac}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm font-medium text-slate-500 italic">{t.noFacilities}</p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-center shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Map className="w-4 h-4" /> {t.mapDirections}
                    </a>
                    {isAdmin && (
                      <button 
                        onClick={() => setEditingLocation({ ...locDetail })} 
                        className="sm:flex-none px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> {t.editLocation}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {selectedGameDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
            <div className="space-y-6 pt-4">
              <div>
                <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLeagueStyles(selectedGameDetails.league)}`}>{selectedGameDetails.league}</span>
                <h3 className="text-2xl font-black mt-3">{selectedGameDetails.away} @ {selectedGameDetails.home}</h3>
                <p className="text-sm text-slate-500 font-bold uppercase mt-1">{selectedGameDetails.date} @ {selectedGameDetails.time}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center">
                <div><p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p><p className="font-bold text-blue-900">{selectedGameDetails.location}</p></div>
                <a href={`https://www.google.com/maps/search/?api=1&query=$?q=${selectedGameDetails.location}`} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2"><Map className="w-4 h-4"/> {t.mapDirections}</a>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400">{t.crew}</h4>
                {(groupedAssignments[selectedGameDetails.id] || []).map(asg => (
                  <div key={asg.userId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="font-bold">{asg.userName}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedGameDetails(null)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-xs">{t.close}</button>
            </div>
          </div>
        </div>
      )}

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
