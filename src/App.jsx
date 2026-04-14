import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, onSnapshot, 
  deleteDoc, writeBatch, addDoc, updateDoc
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
  BarChart, History as HistoryIcon, Info, User, UserPlus, UserMinus, Download, 
  CalendarPlus, UserCheck, Edit2, Check, LogOut, ChevronRight, List, ChevronLeft, 
  ArrowUpDown, ArrowUp, Users, Github, X, AlertTriangle, ArrowLeft, Megaphone, 
  HelpCircle, BookOpen, MessageCircle, Code, Mail, Send, Share2, Map, ArrowRightLeft, 
  Star, Navigation, Bell, BellOff, Sliders
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
    appTitle: "Domartillsättning", season: "Säsong", schedule: "Spelschema", myGames: "Mina Matcher",
    umpireList: "Domarlista", staffing: "Bemanning", analytics: "Statistik", history: "Historik",
    upcoming: "Kommande", archived: "Arkiverade matcher", activeSchedule: "Aktivt schema", searchPlaceholder: "Sök...",
    allSeries: "Alla serier", allLocations: "Alla platser", noGames: "Inga matcher hittades.", syncNow: "Synka förbundsdata nu",
    applied: "Anmälda", interested: "Intresserad", withdraw: "Dra tillbaka", assignedTo: "Tillsatta",
    staffed: "Bemannad", partiallyStaffed: "Delvis bemannad", needsUmpire: "Behöver domare", bulkImport: "Massimport",
    pendingAssignments: "Bemanningsöversikt", staffingControl: "Bemanningskontroll", hideStaffed: "Dölj helt bemannade",
    showAll: "Visa alla matcher", removeAssignment: "Ta bort", deleteGame: "Ta bort match", deleteConfirm: "Är du säker på att du vill ta bort matchen?",
    deleteAllGames: "Rensa hela säsongen", deleteAllConfirm: "ÄR DU HELT SÄKER? Detta kommer radera ALLA matcher, intresseanmälningar och tillsättningar för det valda året.",
    deleteAllSuccess: "Säsongen har rensats.", downloadBackup: "Ladda ner backup (JSON)", umpire: "Domare", interests: "Intresseanmälningar",
    gamesAssigned: "Dömda matcher", assignmentRate: "Tillsättningsgrad", noStats: "Ingen data finns registrerad än.",
    mySchedule: "Mitt Schema", noInterest: "Du har inga bekräftade matchuppdrag än.", noPendingInterest: "Du har inte anmält intresse för några matcher.",
    confirmed: "Bekräftad", settings: "Inställningar", userSettings: "Användarinställningar", profileAccess: "Konfigurera profil & åtkomst",
    displayName: "Visningsnamn", namePlaceholder: "Sök eller skriv ditt namn...", logout: "Logga ut", close: "Stäng",
    status: "Status", setProfile: "Välj din profil", pasteSheet: "Klistra in från Google Sheets", addGames: "Lägg till matcher",
    importSuccess: "Import lyckades", cancel: "Avbryt", date: "Datum", crew: "Domarteam", addToCalendar: "Spara i kalender",
    downloadFullSchedule: "Ladda ner (.ics)", confirmedGames: "Bekräftade uppdrag", interestedGames: "Anmält intresse",
    nameRequiredTitle: "Vem är du?", nameRequiredDesc: "Välj ditt namn från listan nedan för att koppla ditt konto till dina matcher.",
    saveName: "Välj profil", addNewName: "Hittar du inte ditt namn?", createUmpire: "Skapa ny profil", masterList: "Domarlista",
    editName: "Ändra namn", save: "Spara", selectFromList: "Välj från listan", changeUser: "Byt användare", editMatch: "Ändra matchdata",
    home: "Hemma", away: "Borta", time: "Tid", location: "Plats", league: "Serie", saveChanges: "Spara ändringar",
    listView: "Lista", calendarView: "Kalender", days: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
    months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
    requiredUmpires: "Antal domare", level: "Nivå", name: "Namn", sortBy: "Sortera", week: "V.", systemUpdates: "Systemuppdateringar",
    fetchError: "Kunde inte hämta data", login: "Logga in", register: "Skapa konto", email: "E-postadress", password: "Lösenord",
    forgotPassword: "Glömt lösenord?", loginToContinue: "Logga in för att fortsätta", createAnAccount: "Skapa ett nytt konto",
    noAccount: "Inget konto? Registrera dig här", hasAccount: "Har du redan ett konto? Logga in", loginRequiredMsg: "Du måste logga in för att se detta.",
    adminManagement: "Administratörer", addAdmin: "Lägg till admin", adminAdded: "Admin tillagd", adminRemoved: "Admin borttagen",
    masterAdminInfo: "Du är inloggad som Master Admin.", linkedAccount: "Konto:", notLinked: "Inget konto", linkEmailPlaceholder: "Koppla e-post...",
    selectEmail: "-- Välj E-post --", otherEmail: "+ Ange annan...", umpireProfile: "Domarprofil", back: "Tillbaka",
    assignedMatches: "Tillsatta matcher", noAssignedMatches: "Inga tillsatta matcher än.", totalAssignments: "Tillsättningar",
    totalInterests: "Intresseanmälningar", deleteUmpireConfirm: "Är du säker på att du vill ta bort", umpireDeletedSubject: "Din domarprofil har tagits bort",
    umpireDeletedBody: "Hej,\n\nEn administratör har tagit bort din domarprofil från domarsystemet.", assignmentEmailSubject: "Ny matchtillsättning",
    assignmentEmailBody: "Hej {name},\n\nDu har blivit tillsatt på matchen {away} @ {home} den {date} kl {time}.",
    myGamesReminder: "Viktigt! Om du måste lämna återbud till en redan tillsatt match är det ditt ansvar att hitta en ersättare samt att informera Elitdomargruppen.",
    globalAnnouncement: "Globalt Meddelande", saveAnnouncement: "Publicera", clearAnnouncement: "Ta bort",
    announcementPlaceholder: "Skriv ett viktigt meddelande som visas för alla...", helpAndInfo: "Hjälp & Info", guide: "Kom igång",
    faq: "Vanliga frågor", about: "Om Appen", guideStep1Title: "1. Skapa ett konto", guideStep1Desc: "Klicka på inloggningsikonen längst ner eller uppe i hörnet och välj 'Skapa ett nytt konto'. Fyll i din e-post och ett valfritt lösenord.",
    guideStep2Title: "2. Sök efter din profil", guideStep2Desc: "Direkt efter inloggning visas rutan 'Vem är du?'. Skriv ditt namn i sökfältet för att hitta dig själv i domarlistan.",
    guideStep3Title: "3. Bekräfta & Koppla", guideStep3Desc: "Klicka på ditt namn i listan. Detta kopplar ditt konto till profilen permanent så att ditt schema synkas över alla dina enheter.",
    guideStep4Title: "4. Saknas ditt namn?", guideStep4Desc: "Om du är helt ny och inte finns i listan klickar du på 'Hittar du inte ditt namn?' för att skapa din domarprofil från grunden.",
    faq1Q: "Kan jag byta namn eller profil om jag valde fel?", faq1A: "Nej, av säkerhetsskäl låses ditt konto till den profil du väljer. Råkade du välja fel person måste du kontakta en administratör för att återställa kopplingen.",
    faq2Q: "Hur anmäler jag intresse för att döma en match?", faq2A: "Gå till 'Spelschema'. Klicka på den blå knappen 'Intresserad' bredvid de matcher du kan och vill döma.",
    faq3Q: "Vem tillsätter matcherna?", faq3A: "Du anmäler intresse, men det är Elitdomargruppen/Administratörerna som gör den slutgiltiga schemaläggningen och tillsättningen.",
    faq4Q: "Varför är min statistiksida tom?", faq4A: "Statistiken uppdateras och visas så fort du anmäler intresse för en match eller blir tilldelad ett uppdrag.",
    faq5Q: "Hur fungerar marknaden (Byt bort match)?", faq5A: "Om du inte kan döma en match klickar du på 'Byt bort' under Mina Matcher. Den hamnar då på Marknaden. Du ansvarar för matchen tills någon annan klickar på 'Ta match'.",
    loadingReadme: "Hämtar README från GitHub...", contactUs: "Kontakta oss", contactDesc: "Behöver du hjälp eller har du en fråga? Skicka ett meddelande till oss så hjälper vi dig.",
    subject: "Ämne", message: "Meddelande", sendMsg: "Skicka Meddelande", sending: "Skickar...", msgSentTitle: "Meddelande skickat!",
    msgSentDesc: "Tack för ditt meddelande. Vi återkommer till dig så snart som möjligt på den angivna e-postadressen.", sendAnother: "Skicka ett nytt meddelande",
    shareGuide: "Dela guide", linkCopied: "Länk kopierad till urklipp!", sendSchedules: "Skicka spelschema", reviewEmails: "Granska Utskick",
    customEmailMessage: "Personligt meddelande (Frivilligt)", customEmailPlaceholder: "Skriv ett meddelande som visas högst upp i e-postmeddelandet till alla...",
    sendAllEmails: "Skicka till {count} domare", missingEmailWarning: "{count} domare har matcher men saknar e-postadress:",
    emailPreview: "Förhandsgranskning av E-post", emailsSentSuccess: "Alla spelscheman har skickats!", bookedIn: "Bokad i",
    filterStatusAll: "Alla statusar", noInterests: "Inga anmälningar", coUmpires: "Dömer med:", noCoUmpires: "Inga meddomare",
    calendarColumn: "Kalender", gameDetails: "Matchinformation", mapDirections: "Öppna Karta", officials: "Domarteam",
    supervisor: "Supervisor", techComm: "Technical Commissioner", notAssigned: "Ej tillsatt", yourGame: "Din match",
    marketplace: "Marknad", marketplaceDesc: "Här visas matcher som andra vill byta bort och matcher som saknar domare. När du tar en match tilldelas du den omedelbart.",
    tradeGame: "Byt bort", cancelTrade: "Ångra byte", takeGame: "Ta match", gamesForTrade: "Matcher som bytes bort",
    noMarketplaceGames: "Inga matcher bytes bort just nu.", tradeSuccess: "Du har tagit över matchen! Ditt schema har uppdaterats.",
    tradeConfirm: "Är du säker på att du vill ta över denna match?", downloadCalendar: "Ladda ner", formatICS: ".ICS Fil",
    subtextICS: "För Apple & Outlook", formatCSV: ".CSV Fil", subtextCSV: "För Google Kalender", evaluate: "Utvärdera",
    grade: "Betyg", feedback: "Feedback / Kommentar", saveEval: "Spara utvärdering", evalSaved: "Utvärdering sparad",
    yourEval: "Utvärdering", selectAdmin: "Välj Admin...", selectUmpire: "Välj Domare...", enterTCName: "Ange namn på TC...",
    umpireShort: "DOMARE", supShort: "SUP", tcShort: "TC", locations: "Platser", address: "Adress", facilities: "Faciliteter",
    noFacilities: "Inga faciliteter angivna", addFacility: "Lägg till facilitet...", editLocation: "Redigera plats",
    noLocationsInfo: "Klicka på en plats för att se detaljer eller lägga till en adress och faciliteter.", matchMovedWarning: "Match flyttad! Bekräfta om du kan den nya tiden.",
    acceptTime: "Acceptera ny tid", declineTime: "Kan inte (Avboka)", timeChangedBadge: "Tid Ändrad", pendingReply: "Väntar på svar",
    emailMatchMovedSubject: "Spelschema uppdaterat ({count} st) / Schedule Updated",
    emailMatchMovedBody: "Hej {name},\n\nFöljande matcher som du är tillsatt på har bytt datum eller tid:\n\n{changesListSv}\n\nVänligen logga in på domarportalen för att bekräfta om du fortfarande kan döma dessa matcher, eller om du måste lämna återbud.\n\n---\n\nHello {name},\n\nThe following games you are assigned to have been rescheduled:\n\n{changesListEn}\n\nPlease log in to the portal to confirm if you can still make these games, or withdraw if you cannot.",
    pendingEmailsQueued: "⏳ {count} e-postmeddelanden väntar på att skickas till domare om ändrade matcher.", sendQueuedNow: "Skicka direkt",
    actionRequired: "Kräver åtgärd", superAdminSettings: "Systemarkitektur (Super Admin)", featureMarketplace: "Aktivera Marknadsplats (Byt Match)",
    featureEvaluations: "Aktivera Utvärderingssystem", featureReminders: "Automatiska E-postpåminnelser (Kommande matcher)",
    reminderPreferences: "Mina Notiser", receiveReminders: "Få e-postpåminnelser om mina kommande matcher", runRemindersNow: "Kör Påminnelser Nu",
    reminderEmailSubject: "Påminnelse: Kommande Matcher / Upcoming Games",
    reminderEmailBody: "Hej {name},\n\nDetta är en automatisk påminnelse om att du är tillsatt på följande matcher under de kommande dagarna:\n\n{gamesListSv}\n\nGlöm inte att logga in i domarportalen om du behöver byta bort en match i sista minuten.\n\n---\n\nHello {name},\n\nThis is an automated reminder that you are scheduled to officiate the following games in the coming days:\n\n{gamesListEn}\n\nPlease log into the umpire portal if you need to arrange a last-minute replacement."
  },
  en: {
    appTitle: "Umpire Portal", season: "Season", schedule: "Schedule", myGames: "My Games", umpireList: "Umpire List",
    staffing: "Staffing", analytics: "Analytics", history: "History", upcoming: "Upcoming", archived: "Archived Games",
    activeSchedule: "Active Schedule", searchPlaceholder: "Search...", allSeries: "All Series", allLocations: "All Locations",
    noGames: "No games found.", syncNow: "Sync Federation Data Now", applied: "Interested", interested: "Interested",
    withdraw: "Withdraw", assignedTo: "Crew", staffed: "Fully Staffed", partiallyStaffed: "Partially Staffed",
    needsUmpire: "Needs Umpire", bulkImport: "Bulk Import", pendingAssignments: "Staffing Desk", staffingControl: "Staffing Control",
    hideStaffed: "Hide Fully Staffed", showAll: "Show All Games", removeAssignment: "Remove", deleteGame: "Delete Game",
    deleteConfirm: "Are you sure you want delete this game?", deleteAllGames: "Clear Entire Season", deleteAllConfirm: "ARE YOU ABSOLUTELY SURE? This will delete ALL data.",
    deleteAllSuccess: "Season cleared successfully.", downloadBackup: "Download Backup (JSON)", umpire: "Umpire", interests: "Interests",
    gamesAssigned: "Games Assigned", assignmentRate: "Assignment Rate", noStats: "No engagement data recorded yet.", mySchedule: "My Schedule",
    noInterest: "You have no confirmed assignments yet.", noPendingInterest: "You haven't marked interest in any matches.", confirmed: "Confirmed",
    settings: "Settings", userSettings: "User Settings", profileAccess: "Configure profile & access", displayName: "Display Name",
    namePlaceholder: "Search or type name...", logout: "Logout", close: "Close", status: "Status", setProfile: "Select Your Profile",
    pasteSheet: "Paste from Google Sheets", addGames: "Add Games", importSuccess: "Import Successful", cancel: "Cancel", date: "Date",
    crew: "Umpire Crew", addToCalendar: "Add to Calendar", downloadFullSchedule: "Download (.ics)", confirmedGames: "Confirmed Assignments",
    interestedGames: "Interested Matches", nameRequiredTitle: "Who are you?", nameRequiredDesc: "Select your name from the list below to sync your schedule across devices.",
    saveName: "Select Profile", addNewName: "Can't find your name?", createUmpire: "Create new profile", masterList: "Umpire Master List",
    editName: "Edit Name", save: "Save", selectFromList: "Select from list", changeUser: "Change User", editMatch: "Edit Match Details",
    home: "Home", away: "Away", time: "Time", location: "Location", league: "League", saveChanges: "Save Changes", listView: "List",
    calendarView: "Calendar", days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    requiredUmpires: "Crew Size", level: "Level", name: "Name", sortBy: "Sort by", week: "W.", systemUpdates: "System Updates",
    fetchError: "Could not fetch data", login: "Login", register: "Register", email: "Email Address", password: "Password",
    forgotPassword: "Forgot Password?", loginToContinue: "Login to continue", createAnAccount: "Create a new account",
    noAccount: "No account? Register here", hasAccount: "Already have an account? Login", loginRequiredMsg: "You must be logged in to view this.",
    adminManagement: "Admin Roles", addAdmin: "Add Admin", adminAdded: "Admin added", adminRemoved: "Admin removed",
    masterAdminInfo: "You are logged in as Master Admin.", linkedAccount: "Account:", notLinked: "No account", linkEmailPlaceholder: "Link email...",
    selectEmail: "-- Select Email --", otherEmail: "+ Enter other...", umpireProfile: "Umpire Profile", back: "Back",
    assignedMatches: "Assigned Matches", noAssignedMatches: "No assigned matches yet.", totalAssignments: "Assignments",
    totalInterests: "Interests", deleteUmpireConfirm: "Are you sure you want to remove", umpireDeletedSubject: "Your umpire profile has been removed",
    umpireDeletedBody: "Hello,\n\nAn admin has removed your umpire profile from the scheduling system.", assignmentEmailSubject: "New Match Assignment",
    assignmentEmailBody: "Hello {name},\n\nYou have been assigned to the match {away} @ {home} on {date} at {time}.",
    myGamesReminder: "Important! If you need to cancel an assigned game, it is your responsibility to find a replacement and notify the elite umpire group.",
    globalAnnouncement: "Global Announcement", saveAnnouncement: "Publish", clearAnnouncement: "Clear",
    announcementPlaceholder: "Type an important message to display to everyone...", helpAndInfo: "Help & Info", guide: "Getting Started",
    faq: "FAQ", about: "About App", guideStep1Title: "1. Create an account", guideStep1Desc: "Click the login icon and select 'Create a new account'. Fill in your email address and a secure password.",
    guideStep2Title: "2. Search for your profile", guideStep2Desc: "Immediately after logging in, the 'Who are you?' prompt appears. Type your name into the search bar.",
    guideStep3Title: "3. Confirm & Link", guideStep3Desc: "Click your name in the list. This permanently links your account to the official profile, syncing your schedule across devices.",
    guideStep4Title: "4. Name Missing?", guideStep4Desc: "If you are completely new and not in the list, click 'Can't find your name?' to create a brand new profile from scratch.",
    faq1Q: "Can I change my linked profile if I made a mistake?", faq1A: "No, for security reasons your account is locked to the chosen profile. Contact an administrator to reset the link.",
    faq2Q: "How do I apply to umpire a game?", faq2A: "Navigate to 'Schedule' and click the blue 'Interested' button next to the games you are available for.",
    faq3Q: "Who assigns the games?", faq3A: "You mark your interest, but the Elite Umpire Group/Administrators make the final staffing assignments.",
    faq4Q: "Why is my stats page empty?", faq4A: "Your statistics will be generated as soon as you mark interest for a game or receive an assignment.",
    faq5Q: "How does the marketplace work?", faq5A: "If you cannot umpire a game, click 'Give Away' under My Games. It will be listed on the Marketplace. You are responsible for the game until someone else clicks 'Take Game'.",
    loadingReadme: "Fetching README from GitHub...", contactUs: "Contact Us", contactDesc: "Need help or have a question? Send us a message and we'll assist you.",
    subject: "Subject", message: "Message", sendMsg: "Send Message", sending: "Sending...", msgSentTitle: "Message Sent!",
    msgSentDesc: "Thank you for your message. We will get back to you as soon as possible at the provided email address.", sendAnother: "Send another message",
    shareGuide: "Share Guide", linkCopied: "Link copied to clipboard!", sendSchedules: "Send Schedules", reviewEmails: "Review Emails",
    customEmailMessage: "Custom Message (Optional)", customEmailPlaceholder: "Type a message to appear at the top of the email for everyone...",
    sendAllEmails: "Send to {count} umpires", missingEmailWarning: "{count} umpires have assignments but no email linked:",
    emailPreview: "Email Preview", emailsSentSuccess: "All schedules have been sent successfully!", bookedIn: "Booked in",
    filterStatusAll: "All Statuses", noInterests: "No Interests", coUmpires: "Co-umpires:", noCoUmpires: "No co-umpires",
    calendarColumn: "Calendar", gameDetails: "Game Details", mapDirections: "Open Map", officials: "Officials",
    supervisor: "Supervisor", techComm: "Technical Commissioner", notAssigned: "Not Assigned", yourGame: "Your Game",
    marketplace: "Marketplace", marketplaceDesc: "Find games that other umpires are giving away or games missing umpires. Taking a game immediately assigns it to you.",
    tradeGame: "Give Away", cancelTrade: "Cancel Give Away", takeGame: "Take Game", gamesForTrade: "Games Up For Trade",
    noMarketplaceGames: "No games are up for trade right now.", tradeSuccess: "You have taken over the game! Your schedule is updated.",
    tradeConfirm: "Are you sure you want to take over this game?", downloadCalendar: "Download", formatICS: ".ICS File",
    subtextICS: "For Apple & Outlook", formatCSV: ".CSV File", subtextCSV: "For Google Calendar", evaluate: "Evaluate",
    grade: "Grade", feedback: "Feedback / Comment", saveEval: "Save Evaluation", evalSaved: "Evaluation Saved",
    yourEval: "Evaluation", selectAdmin: "Select Admin...", selectUmpire: "Select Umpire...", enterTCName: "Enter TC name...",
    umpireShort: "UMP", supShort: "SUP", tcShort: "TC", locations: "Locations", address: "Address", facilities: "Facilities",
    noFacilities: "No facilities listed", addFacility: "Add facility...", editLocation: "Edit Location", noLocationsInfo: "Click on a location to view details or add an address and facilities.",
    matchMovedWarning: "Game Rescheduled! Please confirm if you can make the new time.", acceptTime: "Accept New Time",
    declineTime: "Cannot Make It", timeChangedBadge: "Time Changed", pendingReply: "Pending Reply",
    emailMatchMovedSubject: "Schedule Updated ({count} games) / Spelschema uppdaterat",
    emailMatchMovedBody: "Hello {name},\n\nThe following games you are assigned to have been rescheduled:\n\n{changesListEn}\n\nPlease log in to the portal to confirm if you can still make these games, or withdraw if you cannot.\n\n---\n\nHej {name},\n\nFöljande matcher som du är tillsatt på har bytt datum eller tid:\n\n{changesListSv}\n\nVänligen logga in på domarportalen för att bekräfta om du fortfarande kan döma nämnda matcher, eller om du måste lämna återbud.",
    pendingEmailsQueued: "⏳ {count} email notifications are queued for rescheduled games.", sendQueuedNow: "Send Now",
    actionRequired: "Action Required", superAdminSettings: "System Architecture (Super Admin)", featureMarketplace: "Enable Marketplace (Trade Board)",
    featureEvaluations: "Enable Evaluation System", featureReminders: "Automated Email Reminders (Upcoming Games)",
    reminderPreferences: "My Notifications", receiveReminders: "Receive email reminders for my upcoming games", runRemindersNow: "Run Reminders Cron",
    reminderEmailSubject: "Upcoming Games Reminder / Påminnelse om kommande matcher",
    reminderEmailBody: "Hello {name},\n\nThis is an automated reminder that you are scheduled to officiate the following games in the coming days:\n\n{gamesListEn}\n\nPlease log into the umpire portal if you need to arrange a last-minute replacement.\n\n---\n\nHej {name},\n\nDetta är en automatisk påminnelse om att du är tillsatt på följande matcher under de kommande dagarna:\n\n{gamesListSv}\n\nGlöm inte att logga in i domarportalen om du behöver byta bort en match i sista minuten."
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
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Critical React Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ett oväntat fel uppstod</h2>
            <p className="text-slate-600 mb-6 font-medium">Applikationen kraschade under laddning. Felet var:</p>
            <div className="bg-red-50 rounded-xl p-4 text-left overflow-x-auto mb-6 border border-red-100">
              <pre className="text-red-700 text-xs font-mono whitespace-pre-wrap">{this.state.error?.toString()}</pre>
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
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [umpireId, setUmpireId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUmpireIds, setAdminUmpireIds] = useState([]);
  
  const [view, setView] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') || 'schedule' : 'schedule'));
  const [scheduleViewMode, setScheduleViewMode] = useState('list');
  const [myGamesViewMode, setMyGamesViewMode] = useState('list');
  const [selectedYear, setSelectedYear] = useState('2026');
  
  const [isDemoEnv, setIsDemoEnv] = useState(true);
  const [federation, setFederation] = useState('swe');
  const federations = [
    { id: 'swe', name: '🇸🇪 Sweden', defaultLang: 'sv' },
    { id: 'fin', name: '🇫🇮 Finland', defaultLang: 'fi' },
    { id: 'sui', name: '🇨🇭 Switzerland', defaultLang: 'de' }
  ];

  const defaultLang = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('sv') ? 'sv' : 'en';
  const [lang, setLang] = useState(defaultLang);
  const t = new Proxy(translations[lang] || translations['en'], { get: (target, prop) => target[prop] !== undefined ? target[prop] : translations['en'][prop] });

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
  const [editingLocation, setEditingLocation] = useState(null);
  const [newFacility, setNewFacility] = useState('');
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  
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

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

  useEffect(() => {
     if (typeof window !== 'undefined') {
        if (window.location.hostname === 'schema.domarweb.se') {
           setIsDemoEnv(false); setFederation('swe'); setLang('sv');
        } else setIsDemoEnv(true);
     }
  }, []);

  const appId = useMemo(() => {
    const base = typeof window !== 'undefined' && window.__app_id ? String(window.__app_id).replace(/[\/\\]/g, '-') : 'baseball-umpire-scheduler';
    return federation === 'swe' ? `${base}-${selectedYear}` : `${base}-${federation}-${selectedYear}`;
  }, [federation, selectedYear]);

  const calendarWeeks = useMemo(() => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const shiftedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    let currentWeek = []; const weeks = [];
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
    const map = {}; assignments.forEach(asg => { if (!map[asg.gameId]) map[asg.gameId] = []; map[asg.gameId].push(asg); }); return map;
  }, [assignments]);

  const sortedStatistics = useMemo(() => {
    const stats = {}; masterUmpires.forEach(u => { stats[u.id] = { userId: u.id, name: u.name || 'Unknown', games: 0, interest: 0 }; });
    assignments.forEach(asg => { if (!asg.userId) return; if (!stats[asg.userId]) stats[asg.userId] = { userId: asg.userId, name: asg.userName || 'Unknown', games: 0, interest: 0 }; stats[asg.userId].games += 1; });
    applications.forEach(app => { if (!app.userId) return; if (!stats[app.userId]) stats[app.userId] = { userId: app.userId, name: app.userName || 'Unknown', games: 0, interest: 0 }; stats[app.userId].interest += 1; });
    const data = Object.values(stats).map(s => { const rate = s.interest > 0 ? Math.round((s.games / s.interest) * 100) : (s.games > 0 ? 100 : 0); return { ...s, rate }; });
    return data.sort((a, b) => {
      let valA = a[sortConfig.key]; let valB = b[sortConfig.key];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; return 0;
    });
  }, [assignments, applications, masterUmpires, sortConfig]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const hName = (game.home || '').toLowerCase(); const aName = (game.away || '').toLowerCase(); const search = searchQuery.toLowerCase();
      const matchesSearch = hName.includes(search) || aName.includes(search);
      const matchesLeague = !filterLeague || game.league === filterLeague;
      const matchesLocation = !filterLocation || game.location === filterLocation;
      const isHistorical = (game.date || '') < today;
      let statusMatch = true;
      if (filterStatus === 'needs_umpire') { const gameAssignments = groupedAssignments[game.id] || []; statusMatch = gameAssignments.length < (game.requiredUmpires || 2); }
      else if (filterStatus === 'no_interests') { const applicants = applications.filter(a => a.gameId === game.id); statusMatch = applicants.length === 0; }
      return showHistory ? isHistorical && matchesSearch && matchesLeague && matchesLocation && statusMatch : !isHistorical && matchesSearch && matchesLeague && matchesLocation && statusMatch;
    });
  }, [games, searchQuery, filterLeague, filterLocation, filterStatus, showHistory, today, groupedAssignments, applications]);

  const leagues = useMemo(() => [...new Set(games.map(g => g.league || 'Unknown'))].sort((a, b) => a.localeCompare(b, lang)), [games, lang]);
  const allLocationNames = useMemo(() => [...new Set([...games.map(g => g.location), ...locationsData.map(l => l.id)])].filter(Boolean).sort((a, b) => a.localeCompare(b, lang)), [games, locationsData, lang]);
  const locations = useMemo(() => [...new Set(games.map(g => g.location || 'Unknown'))].sort((a, b) => a.localeCompare(b, lang)), [games, lang]);

  const sortedUmpireList = useMemo(() => {
    const levelOrder = { 'internationell': 1, 'elit': 2, 'nationell': 3, 'region': 4, 'förening': 5 };
    let umps = masterUmpires.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (umpireSort === 'level') umps.sort((a, b) => { const orderA = levelOrder[(a.level || '').toLowerCase()] || 99; const orderB = levelOrder[(b.level || '').toLowerCase()] || 99; if (orderA !== orderB) return orderA - orderB; return (a.name || '').localeCompare(b.name || ''); });
    else umps.sort((a, b) => (a.name || '').localeCompare(b.name || '')); return umps;
  }, [masterUmpires, searchQuery, umpireSort]);

  const filteredMasterUmpires = useMemo(() => masterUmpires.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())), [masterUmpires, searchQuery]);
  const myAssignedGames = useMemo(() => umpireId ? games.filter(game => groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)) : [], [games, groupedAssignments, umpireId]);
  const myInterestedGames = useMemo(() => umpireId ? games.filter(game => applications.some(app => app.gameId === game.id && app.userId === umpireId) && !groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)) : [], [games, applications, groupedAssignments, umpireId]);

  const umpiresWithAssignmentsMap = useMemo(() => {
    const map = {};
    assignments.forEach(asg => {
      if (!map[asg.userId]) map[asg.userId] = { umpire: masterUmpires.find(u => u.id === asg.userId), assignedGames: [] };
      const game = games.find(g => g.id === asg.gameId); if (game) map[asg.userId].assignedGames.push(game);
    });
    Object.values(map).forEach(obj => obj.assignedGames.sort((a, b) => (a.date || '').localeCompare(b.date || ''))); return map;
  }, [assignments, masterUmpires, games]);

  const emailCandidates = useMemo(() => {
    const list = Object.values(umpiresWithAssignmentsMap).filter(obj => obj.umpire !== undefined);
    return { ready: list.filter(obj => obj.umpire.linkedEmail), missing: list.filter(obj => !obj.umpire.linkedEmail) };
  }, [umpiresWithAssignmentsMap]);

  const unconnectedEmails = useMemo(() => {
    const linked = masterUmpires.map(u => (u.linkedEmail || '').toLowerCase()).filter(Boolean);
    return registeredEmails.filter(email => !linked.includes(email.toLowerCase()));
  }, [registeredEmails, masterUmpires]);

  const safeDateMonth = (dateString) => { if (!dateString) return ''; const d = new Date(dateString); if (isNaN(d.getTime())) return dateString; return d.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', { month: 'short' }); };
  const safeDateDay = (dateString) => { if (!dateString) return '-'; const d = new Date(dateString); if (isNaN(d.getTime())) return '-'; const dayIndex = d.getDay(); return (t.days && t.days[dayIndex]) ? t.days[dayIndex] : '-'; };
  const safeDateNum = (dateString) => { if (!dateString) return '-'; const d = new Date(dateString); if (isNaN(d.getTime())) return '-'; return d.getDate(); };
  const toLocalISO = (date) => { if (!date || isNaN(date.getTime())) return ""; const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; };
  const scrollToTop = () => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const getLeagueStyles = (league) => { const l = (league || '').toLowerCase(); if (l.includes('elit')) return 'bg-green-100 text-green-700 border-green-200'; if (l.includes('region')) return 'bg-blue-100 text-blue-700 border-blue-200'; if (l.includes('pre') || l.includes('off')) return 'bg-red-100 text-red-700 border-red-200'; if (l.includes('junior')) return 'bg-purple-100 text-purple-700 border-purple-200'; return 'bg-slate-100 text-slate-700 border-slate-200'; };
  const getLevelStyles = (level) => { const l = (level || '').toLowerCase(); if (l.includes('internationell')) return 'bg-[#204d99] text-white border-[#1a3d7a]'; if (l.includes('elit')) return 'bg-[#38761d] text-white border-[#2d5f17]'; if (l.includes('nationell')) return 'bg-[#990000] text-white border-[#7a0000]'; if (l.includes('region')) return 'bg-[#cfe2f3] text-[#3d85c6] border-[#a2c4c9]'; if (l.includes('förening')) return 'bg-[#efefef] text-[#666666] border-[#cccccc]'; return 'bg-slate-200 text-slate-500 border-slate-300'; };
  const getAssignmentStatusStyles = (count, required) => { const req = required || 2; if (count === 0) return 'bg-red-100 text-red-700 border-red-200'; if (count < req) return 'bg-yellow-100 text-yellow-700 border-yellow-200'; return 'bg-green-100 text-green-700 border-green-200'; };

  const renderOfficialsRow = (game, gameAssignments, masterUmpires) => {
    if (gameAssignments.length === 0 && !game.supervisorName && !game.tcName) return null;
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
        {game.supervisorName && <div className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-purple-100 flex items-center gap-1"><Star className="w-3 h-3" /> {t.supShort}: {game.supervisorName}</div>}
        {game.tcName && <div className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-100 flex items-center gap-1"><FileText className="w-3 h-3" /> {t.tcShort}: {game.tcName}</div>}
      </div>
    );
  };

  useEffect(() => { setEditNoteText(globalNote); }, [globalNote]);

  useEffect(() => {
    if (view === 'help' && helpTab === 'about' && readmeContent === null) {
      setReadmeLoading(true);
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/readme`).then(res => res.json())
        .then(data => { if (data.content) { setReadmeContent(decodeURIComponent(escape(atob(data.content)))); } else { setReadmeContent(t.fetchError); }})
        .catch(err => { setReadmeContent(t.fetchError); }).finally(() => setReadmeLoading(false));
    }
  }, [view, helpTab, readmeContent, t.fetchError]);

  useEffect(() => { const initAuth = async () => { try { if (typeof window !== 'undefined' && window.__initial_auth_token) { try { await signInWithCustomToken(auth, window.__initial_auth_token); } catch (customErr) { await signInAnonymously(auth); } } else { await signInAnonymously(auth); } } catch (err) { } }; initAuth(); const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); return () => unsubscribe(); }, []);

  useEffect(() => {
    const isCanvas = typeof window !== 'undefined' && window.__initial_auth_token != null; if (isCanvas && !user) return; 
    const handleDbError = (err) => { if (err.code === 'permission-denied') setFirebaseError('permission-denied'); };
    const gamesCol = collection(db, 'artifacts', appId, 'public', 'data', 'games'); const unsubscribeGames = onSnapshot(gamesCol, (snapshot) => { setGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.date || '').localeCompare(b.date || ''))); setFirebaseError(null); }, handleDbError);
    const appsCol = collection(db, 'artifacts', appId, 'public', 'data', 'applications'); const unsubscribeApps = onSnapshot(appsCol, (snapshot) => { setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, handleDbError);
    const assignCol = collection(db, 'artifacts', appId, 'public', 'data', 'assignments'); const unsubscribeAssign = onSnapshot(assignCol, (snapshot) => { setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, handleDbError);
    const umpiresCol = collection(db, 'artifacts', appId, 'public', 'data', 'umpires'); const unsubscribeUmpires = onSnapshot(umpiresCol, (snapshot) => { setMasterUmpires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))); }, handleDbError);
    const regUsersCol = collection(db, 'artifacts', appId, 'public', 'data', 'registered_users'); const unsubscribeRegUsers = onSnapshot(regUsersCol, (snapshot) => { setRegisteredEmails([...new Set(snapshot.docs.map(doc => doc.data().email).filter(Boolean))]); }, handleDbError);
    const evalsCol = collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'); const unsubscribeEvals = onSnapshot(evalsCol, (snapshot) => { setEvaluations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, handleDbError);
    const locCol = collection(db, 'artifacts', appId, 'public', 'data', 'locations'); const unsubscribeLocations = onSnapshot(locCol, (snapshot) => { setLocationsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, handleDbError);
    const queueCol = collection(db, 'artifacts', appId, 'public', 'data', 'mail_queue'); const unsubscribeQueue = onSnapshot(queueCol, (snapshot) => { setMailQueue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); }, handleDbError);
    const settingsDoc = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'); const unsubscribeSettings = onSnapshot(settingsDoc, (snapshot) => { if (snapshot.exists()) { const data = snapshot.data(); setAdminUmpireIds(data.adminUmpireIds || []); setGlobalNote(data.globalNote || ''); if (data.features) { setFeatures(prev => ({ ...prev, ...data.features })); } } }, handleDbError);
    return () => { unsubscribeGames(); unsubscribeApps(); unsubscribeAssign(); unsubscribeUmpires(); unsubscribeRegUsers(); unsubscribeEvals(); unsubscribeLocations(); unsubscribeQueue(); unsubscribeSettings(); };
  }, [user, appId]);

  useEffect(() => {
    let unsubscribeProfile = () => {};
    if (user && user.email) {
      const isMaster = user.email === 'suecio@tryempire.com'; setIsSuperAdmin(isMaster); setContactEmail(user.email);
      setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'registered_users', user.uid), { email: user.email.toLowerCase(), lastSeen: Date.now() }, { merge: true }).catch(err => { });
      const profileDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      unsubscribeProfile = onSnapshot(profileDoc, (snapshot) => {
        if (snapshot.exists() && snapshot.data().umpireId) {
          const data = snapshot.data(); setUserName(data.name || ''); setContactName(data.name || ''); setUmpireId(data.umpireId || '');
          setIsAdmin(isMaster || (Array.isArray(adminUmpireIds) && adminUmpireIds.includes(data.umpireId)));
        } else {
          const preLinkedUmpire = masterUmpires.find(u => u.linkedEmail && u.linkedEmail.toLowerCase() === user.email.toLowerCase());
          if (preLinkedUmpire) { setDoc(profileDoc, { name: preLinkedUmpire.name, umpireId: preLinkedUmpire.id }, { merge: true }); } 
          else { setUserName(''); setUmpireId(''); setIsAdmin(isMaster); }
        }
      });
    } else { setIsAdmin(false); setIsSuperAdmin(false); setUserName(''); setUmpireId(''); }
    return () => unsubscribeProfile();
  }, [user, appId, adminUmpireIds, masterUmpires]);

  useEffect(() => {
    if (user && user.email && umpireId && masterUmpires.length > 0) {
      const myUmpire = masterUmpires.find(u => u.id === umpireId);
      if (myUmpire && myUmpire.linkedEmail !== user.email) { updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', umpireId), { linkedUserId: user.uid, linkedEmail: user.email }).catch(e => { }); }
    }
  }, [user, umpireId, masterUmpires, appId]);

  useEffect(() => {
    if (!isAdmin || mailQueue.length === 0) return;
    const interval = setInterval(() => {
       const now = Date.now(); const readyToProcess = mailQueue.filter(q => q.processAfter <= now);
       if (readyToProcess.length > 0) {
           readyToProcess.forEach(async (queueItem) => {
              const changesTextEn = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Moved from ${c.oldDate} ${c.oldTime} to ${c.newDate} ${c.newTime}`).join('\n');
              const changesTextSv = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Flyttad från ${c.oldDate} ${c.oldTime} till ${c.newDate} ${c.newTime}`).join('\n');
              const emailBody = t.emailMatchMovedBody.replace(/\{name\}/g, queueItem.userName).replace(/\{changesListSv\}/g, changesTextSv).replace(/\{changesListEn\}/g, changesTextEn);
              try {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), { to: queueItem.email, message: { subject: t.emailMatchMovedSubject.replace('{count}', queueItem.changes.length), text: emailBody }, createdAt: Date.now() });
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', queueItem.id));
              } catch(e) { }
           });
       }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAdmin, mailQueue, appId, t]);

  useEffect(() => {
    if (analytics) logEvent(analytics, 'screen_view', { firebase_screen: view, year: selectedYear, lang: lang });
    const handleScroll = () => { if(typeof window !== 'undefined') setShowBackToTop(window.scrollY > 300); };
    if (typeof window !== 'undefined') { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }
  }, [view, selectedYear, lang]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault(); setAuthError('');
    try {
      if (isLoginMode) await signInWithEmailAndPassword(auth, authEmail, authPassword);
      else await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      setShowAuthModal(false);
    } catch (err) { setAuthError(err.message); }
  };

  const handleResetPassword = async () => {
    if (!authEmail) { setAuthError(lang === 'sv' ? 'Fyll i e-postadressen ovan först.' : 'Please enter your email address first.'); return; }
    try { await sendPasswordResetEmail(auth, authEmail); if (typeof window !== 'undefined') alert(lang === 'sv' ? 'Lösenordsåterställning skickad!' : 'Password reset email sent!'); } catch (err) { setAuthError(err.message); }
  };

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  const updateProfile = async (name, id) => { if (!user || !user.email) return; await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { name, umpireId: id }, { merge: true }); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id), { linkedUserId: user.uid, linkedEmail: user.email }, { merge: true }); };
  const logoutUmpire = async () => { await signOut(auth); try { await signInAnonymously(auth); } catch (e) { } setShowAdminModal(false); setView('schedule'); };
  const saveGlobalNote = async () => { if (!isAdmin) return; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { globalNote: editNoteText }, { merge: true }); };
  const clearGlobalNote = async () => { if (!isAdmin) return; setEditNoteText(''); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { globalNote: '' }, { merge: true }); };
  const toggleSystemFeature = async (featureKey) => { if (!isSuperAdmin) return; const newFeatures = { ...features, [featureKey]: !features[featureKey] }; setFeatures(newFeatures); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { features: newFeatures }, { merge: true }); };
  const toggleUmpireReminderPref = async (uId, currentStatus) => { if (uId !== umpireId && !isAdmin) return; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', uId), { remindersEnabled: currentStatus === false ? true : false }, { merge: true }); };
  const forceRunRemindersNow = async () => { if (!isSuperAdmin) return; try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'cron'), { lastReminderSentDate: 'FORCED' }, { merge: true }); if (typeof window !== 'undefined') alert(t.remindersSent || "Reminders queued!"); } catch (e) { console.error(e); } };
  const copyGuideLink = () => { if (typeof window !== 'undefined') { navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?view=help&tab=guide`).then(() => { alert(t.linkCopied); }).catch(() => { }); } };
  const toggleUmpireAdmin = async (uId) => { if (!isSuperAdmin) return; let updatedIds = [...(adminUmpireIds || [])]; if (updatedIds.includes(uId)) updatedIds = updatedIds.filter(id => id !== uId); else updatedIds.push(uId); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { adminUmpireIds: updatedIds }, { merge: true }); };
  const addMasterUmpire = async (name, level = "") => { if (!name.trim()) return ""; const exists = masterUmpires.find(u => (u.name || '').toLowerCase() === name.toLowerCase()); if (exists) return exists.id; const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), { name, level, remindersEnabled: true }); return docRef.id; };
  const updateMasterUmpire = async (id, newName, newLevel, newEmail) => { if (!isAdmin || !newName.trim()) return; const updateData = { name: newName, level: newLevel }; if (newEmail !== undefined) updateData.linkedEmail = newEmail.trim().toLowerCase(); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id), updateData, { merge: true }); };
  const deleteMasterUmpire = async (id, name, linkedEmail) => { if (!isAdmin) return; if (typeof window !== 'undefined' && !window.confirm(`${t.deleteUmpireConfirm} "${name}"?`)) return; await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', id)); if (linkedEmail) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), { to: linkedEmail, message: { subject: t.umpireDeletedSubject, text: t.umpireDeletedBody }, createdAt: Date.now() }); };
  const toggleApplication = async (gameId) => { if (!user || !user.email) { setShowAuthModal(true); return; } if (!umpireId) { setShowNamePrompt(true); return; } const appIdStr = `${gameId}_${umpireId}`; const existing = applications.find(a => a.id === appIdStr); if (existing) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr)); else await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr), { gameId, userId: umpireId, userName, timestamp: Date.now() }); };
  const assignUmpire = async (gameId, uId, name) => { if (!isAdmin) return; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${gameId}_${uId}`), { gameId, userId: uId, userName: name, assignedAt: Date.now() }); };
  const removeAssignment = async (gameId, uId) => { if (!isAdmin) return; await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${gameId}_${uId}`)); };
  const toggleTradeStatus = async (asgId, status) => { if (!umpireId && !isAdmin) return; await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { forTrade: status }); };
  const handleContactSubmit = async (e) => { e.preventDefault(); setContactStatus('sending'); try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), { to: 'admin@domarweb.se', replyTo: contactEmail, message: { subject: `[Kontaktformulär] ${contactSubject}`, text: `Avsändare: ${contactName}\nE-post: ${contactEmail}\n\nMeddelande:\n${contactMessage}` }, createdAt: Date.now() }); setContactStatus('success'); setContactSubject(''); setContactMessage(''); } catch (error) { setContactStatus('error'); } };
  const confirmScheduleChange = async (asgId) => { if (!umpireId) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { pendingChange: false }); } catch (e) { } };

  const takeTrade = async (oldAsg, game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    if (oldAsg.userId === umpireId) return; 
    const umpireAssignedGamesToday = assignments.filter(asg => asg.userId === umpireId).map(asg => games.find(g => g.id === asg.gameId)).filter(g => g && g.date === game.date && g.id !== game.id);
    const conflictGame = umpireAssignedGamesToday.find(g => (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim());
    if (conflictGame) { if(typeof window !== 'undefined') alert(`${t.bookedIn} ${conflictGame.location}. Du kan inte ta denna match.`); return; }
    if (typeof window !== 'undefined' && !window.confirm(t.tradeConfirm)) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db); batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', oldAsg.id));
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${game.id}_${umpireId}`), { gameId: game.id, userId: umpireId, userName: userName, assignedAt: Date.now(), forTrade: false });
      await batch.commit(); if(typeof window !== 'undefined') alert(t.tradeSuccess);
    } catch (e) { } finally { setSyncing(false); }
  };

  const handleBulkImport = async () => {
    if (!isAdmin || !bulkInput.trim()) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      bulkInput.trim().split('\n').forEach((row) => {
        const columns = row.split(/\t|,/);
        if (columns.length >= 5) {
          const gameData = { date: columns[0].trim(), time: columns[1].trim(), league: columns[2].trim(), away: columns[3].trim(), home: columns[4].trim(), location: (columns[5] || 'Unknown').trim(), requiredUmpires: 2 };
          const gameId = `m-${gameData.date}-${gameData.time}-${gameData.away}-${gameData.home}`.replace(/\s+/g, '').replace(/:/g, '').toLowerCase();
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), gameData);
        }
      });
      await batch.commit(); setBulkInput(''); setShowImportTool(false); if(typeof window !== 'undefined') alert(t.importSuccess);
    } catch (e) { } finally { setSyncing(false); }
  };

  const saveEditedGame = async () => {
    if (!isAdmin || !editingGameData) return;
    setSyncing(true);
    try {
      const originalGame = games.find(g => g.id === editingGameData.id);
      const isTimeChanged = originalGame && (originalGame.date !== editingGameData.date || originalGame.time !== editingGameData.time);
      const batch = writeBatch(db);
      batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'games', editingGameData.id), { date: editingGameData.date, time: editingGameData.time, league: editingGameData.league, home: editingGameData.home, away: editingGameData.away, location: editingGameData.location, requiredUmpires: parseInt(editingGameData.requiredUmpires) || 2 });
      if (isTimeChanged) {
        assignments.filter(a => a.gameId === editingGameData.id).forEach((asg) => batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asg.id), { pendingChange: true }));
        applications.filter(a => a.gameId === editingGameData.id).forEach((app) => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'applications', app.id)));
      }
      await batch.commit();
      if (isTimeChanged) {
        for (const asg of assignments.filter(a => a.gameId === editingGameData.id)) {
          const ump = masterUmpires.find(u => u.id === asg.userId);
          if (ump && ump.linkedEmail) {
             const existingQueue = mailQueue.find(q => q.id === asg.userId);
             const gameChangeInfo = { gameId: editingGameData.id, away: editingGameData.away, home: editingGameData.home, oldDate: originalGame.date, oldTime: originalGame.time, newDate: editingGameData.date, newTime: editingGameData.time };
             const updatedChanges = [...(existingQueue ? existingQueue.changes : []).filter(c => c.gameId !== editingGameData.id), gameChangeInfo];
             await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', asg.userId), { userId: asg.userId, email: ump.linkedEmail, userName: asg.userName, changes: updatedChanges, processAfter: Date.now() + 15 * 60 * 1000 });
          }
        }
      }
      setEditingGameData(null);
    } catch (e) { } finally { setSyncing(false); }
  };

  const forceSendQueue = async () => {
    if (!isAdmin) return;
    setSyncing(true);
    try {
       await Promise.all(mailQueue.map(async (queueItem) => {
          const changesTextEn = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Moved from ${c.oldDate} ${c.oldTime} to ${c.newDate} ${c.newTime}`).join('\n');
          const changesTextSv = queueItem.changes.map(c => `- ${c.away} @ ${c.home}: Flyttad från ${c.oldDate} ${c.oldTime} till ${c.newDate} ${c.newTime}`).join('\n');
          const emailBody = t.emailMatchMovedBody.replace(/\{name\}/g, queueItem.userName).replace(/\{changesListSv\}/g, changesTextSv).replace(/\{changesListEn\}/g, changesTextEn);
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), { to: queueItem.email, message: { subject: t.emailMatchMovedSubject.replace('{count}', queueItem.changes.length), text: emailBody }, createdAt: Date.now() });
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', queueItem.id));
       }));
    } catch(e) { } finally { setSyncing(false); }
  };

  const saveLocation = async () => {
    if (!isAdmin || !editingLocation) return;
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'locations', editingLocation.id), { address: editingLocation.address || '', facilities: editingLocation.facilities || [] }, { merge: true }); setEditingLocation(null); } catch (e) { }
  };

  const generateCSV = (gamesToExport) => {
    if (gamesToExport.length === 0 || typeof window === 'undefined') return;
    const rows = gamesToExport.map(game => {
      const [hours, mins] = (game.time || '00:00').split(':');
      return `"${game.away} @ ${game.home} (${game.league})",${game.date},${game.time},${game.date},${(parseInt(hours || '0') + 3).toString().padStart(2, '0')}:${mins || '00'},"${game.league}","${game.location}"`;
    }).join('\n');
    const blob = new Blob(["Subject,Start Date,Start Time,End Date,End Time,Description,Location\n" + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.setAttribute('download', `schedule-${selectedYear}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const generateICS = (gamesToExport) => {
    if (gamesToExport.length === 0 || typeof window === 'undefined') return;
    if (analytics) logEvent(analytics, 'calendar_bulk_export', { count: gamesToExport.length });
    const events = gamesToExport.map(game => {
      const [hours, mins] = (game.time || '00:00').split(':');
      return ['BEGIN:VEVENT', `UID:${game.id}@domartillsattning.portal`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`, `DTSTART:${(game.date || '').replace(/-/g, '')}T${(game.time || '00:00').replace(/:/g, '')}00`, `DTEND:${(game.date || '').replace(/-/g, '')}T${(parseInt(hours || '0') + 3).toString().padStart(2, '0')}${mins || '00'}00`, `SUMMARY:${game.away || 'TBA'} @ ${game.home || 'TBA'} (${game.league || 'Unknown'})`, `DESCRIPTION:League: ${game.league || ''}\\nLocation: ${game.location || ''}`, `LOCATION:${game.location || ''}`, 'END:VEVENT'].join('\n');
    }).join('\n');
    const blob = new Blob([['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Domartillsättning//Baseball Scheduler//EN', events, 'END:VCALENDAR'].join('\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.setAttribute('download', `schedule-${selectedYear}.ics`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const handleCalendarExport = (game) => { if (!game.date || !game.time) return; if (analytics) logEvent(analytics, 'calendar_single_export', { game_id: game.id }); generateICS([game]); };

  const handleDownloadBackup = () => {
    if (!isAdmin || typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify({ timestamp: new Date().toISOString(), year: selectedYear, appId, collections: { games, applications, assignments, umpires: masterUmpires, adminUmpireIds, evaluations, locations: locationsData } }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.setAttribute('download', `umpire-backup-${selectedYear}-${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const deleteAllGames = async () => {
    if (!isAdmin || (typeof window !== 'undefined' && !window.confirm(t.deleteAllConfirm))) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      games.forEach(game => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'games', game.id)));
      assignments.forEach(asg => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${asg.gameId}_${asg.userId}`)));
      applications.forEach(app => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'applications', `${app.gameId}_${app.userId}`)));
      evaluations.forEach(ev => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', ev.id)));
      await batch.commit(); if (typeof window !== 'undefined') alert(t.deleteAllSuccess);
    } catch (e) { } finally { setSyncing(false); }
  };

  const handleSendAllSchedules = async () => {
    if (!isAdmin) return;
    setSendingBulkEmails(true);
    try {
      await Promise.all(emailCandidates.ready.map(candidate => addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
        to: candidate.umpire.linkedEmail,
        message: { subject: `Domaruppdrag ${selectedYear} / Umpire Assignments`, html: generateEmailHtml(candidate.umpire.name, candidate.assignedGames) },
        createdAt: Date.now()
      })));
      if (typeof window !== 'undefined') alert(t.emailsSentSuccess);
      setShowEmailPreview(false); setCustomEmailMessage('');
    } catch (error) { if (typeof window !== 'undefined') alert("Ett fel uppstod när mejlen skulle skickas."); } finally { setSendingBulkEmails(false); }
  };

  const generateEmailHtml = (umpireName, umpireGames) => {
    const customHtml = customEmailMessage ? `<p style="font-size: 14px; line-height: 1.5; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">${customEmailMessage.replace(/\n/g, '<br/>')}</p>` : '';
    const rows = umpireGames.map(g => `<tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 8px; font-size: 14px; color: #334155; white-space: nowrap;"><strong>${g.date}</strong><br/><span style="font-size: 12px; color: #64748b;">${g.time}</span></td><td style="padding: 12px 8px; font-size: 14px; color: #0f172a;"><strong>${g.away} @ ${g.home}</strong><br/><span style="font-size: 12px; color: #64748b;">${g.league} • ${g.location}</span></td><td style="padding: 12px 8px; font-size: 12px; text-align: right; white-space: nowrap;"><a href="${getGoogleCalendarLink(g)}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold; display: block; margin-bottom: 6px;">+ Google</a><a href="${getOutlookCalendarLink(g)}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold; display: block;">+ Outlook</a></td></tr>`).join('');
    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;"><h2 style="color: #1e3a8a; margin-top: 0;">Domaruppdrag / Umpire Assignments ${selectedYear}</h2><p style="font-size: 16px;">Hej / Hello <strong>${umpireName}</strong>,</p>${customHtml}<p style="font-size: 15px; color: #334155; margin-top: 20px;">Här är dina tilldelade matcher för säsongen / Here are your assigned matches for the season:</p><table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 32px;"><tr style="background-color: #f1f5f9; text-align: left;"><th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Datum / Date</th><th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Match / Game</th><th style="padding: 12px 8px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; text-align: right;">${t.calendarColumn}</th></tr>${rows}</table><div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;"><a href="https://schema.domarweb.se/?view=my-apps" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Se ditt schema & Ladda ner alla matcher (.ics)<br/><span style="font-size: 12px; font-weight: normal; opacity: 0.9;">View schedule & Download all matches</span></a></div></div>`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="animate-spin w-8 h-8 text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <header className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('schedule'); scrollToTop(); }}>
              <Trophy className="w-6 h-6" />
              <div>
                <h1 className="text-sm sm:text-xl font-bold">{t.appTitle}</h1>
                <p className="text-[8px] sm:text-[10px] uppercase text-blue-300">{t.season} {selectedYear}</p>
              </div>
            </div>
            <button onClick={() => setShowAdminModal(true)} className="sm:hidden p-1.5"><Settings className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-2">
            {isDemoEnv && (
              <select value={federation} onChange={(e) => { setFederation(e.target.value); const newFed = federations.find(f => f.id === e.target.value); if (newFed) setLang(newFed.defaultLang); }} className="bg-blue-800 text-[10px] rounded px-2 py-1 outline-none">
                {federations.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            )}
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-blue-800 text-[10px] rounded px-2 py-1 outline-none">
              <option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
            </select>
            <div className="flex bg-blue-800 rounded p-0.5">
              <button onClick={() => setLang('sv')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'sv' ? 'bg-blue-600' : ''}`}>🇸🇪</button>
              {isDemoEnv && <button onClick={() => setLang('fi')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'fi' ? 'bg-blue-600' : ''}`}>🇫🇮</button>}
              {isDemoEnv && <button onClick={() => setLang('de')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'de' ? 'bg-blue-600' : ''}`}>🇨🇭</button>}
              <button onClick={() => setLang('en')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'en' ? 'bg-blue-600' : ''}`}>🇬🇧</button>
            </div>
            <button onClick={() => { setView('help'); setHelpTab('guide'); }} className="p-1.5"><HelpCircle className="w-5 h-5" /></button>
            <button onClick={() => setShowAdminModal(true)} className="hidden sm:block p-1.5"><Settings className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {view !== 'help' && (
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            {[
              { id: 'schedule', label: t.schedule, icon: CalendarIcon },
              { id: 'locations', label: t.locations, icon: MapPin },
              { id: 'umpire-list', label: t.umpireList, icon: Users },
              ...(user?.email ? [
                ...(features.marketplace ? [{ id: 'marketplace', label: t.marketplace, icon: ArrowRightLeft }] : []),
                { id: 'my-apps', label: t.myGames, icon: CheckCircle }
              ] : []),
              ...(isAdmin ? [{ id: 'admin', label: t.staffing, icon: Shield }, { id: 'stats', label: t.analytics, icon: BarChart }] : [])
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        )}

        {(view === 'schedule' || view === 'admin' || view === 'marketplace' || view === 'locations' || view === 'umpire-list') && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {(view === 'schedule' || view === 'admin' || view === 'marketplace') && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filterStatus === '' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{t.filterStatusAll}</button>
                <button onClick={() => setFilterStatus('needs_umpire')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filterStatus === 'needs_umpire' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700'}`}>{t.needsUmpire}</button>
                <button onClick={() => setFilterStatus('no_interests')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filterStatus === 'no_interests' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700'}`}>{t.noInterests}</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              {(view === 'schedule' || view === 'admin' || view === 'marketplace') && (
                <>
                  <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"><option value="">{t.allSeries}</option>{leagues.map(l => <option key={l} value={l}>{l}</option>)}</select>
                  <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"><option value="">{t.allLocations}</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'schedule' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase">{showHistory ? t.archived : t.activeSchedule}</h2>
              <div className="flex gap-2">
                {filteredGames.length > 0 && <button onClick={() => generateICS(filteredGames)} className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Download className="w-3 h-3"/> ICS</button>}
                <button onClick={() => setScheduleViewMode(m => m === 'list' ? 'calendar' : 'list')} className="p-1 bg-white border rounded-lg shadow-sm"><CalendarIcon className="w-4 h-4"/></button>
                <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-full">{showHistory ? t.upcoming : t.history}</button>
              </div>
            </div>
            
            {scheduleViewMode === 'calendar' ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
                   <div className="p-4 border-b flex justify-between bg-slate-50">
                        <h3 className="font-black uppercase">{t.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 bg-white rounded border"><ChevronLeft className="w-4 h-4"/></button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white rounded border text-[10px] font-black">IDAG</button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 bg-white rounded border"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 border-b">{uiDays.map(d => <div key={d} className="py-2 text-center text-[10px] font-black">{d}</div>)}</div>
                    <div className="grid grid-cols-7">
                        {calendarWeeks.flatMap((week) => week.days.map((day, idx) => {
                            const dateStr = day ? toLocalISO(day) : null;
                            const matches = dateStr ? filteredGames.filter(g => g.date === dateStr) : [];
                            return (
                              <div key={`${week.weekNumber}-${idx}`} className={`min-h-[100px] p-2 border-r border-b relative ${!day ? 'bg-slate-50' : 'bg-white'}`}>
                                {day && (
                                  <>
                                    <span className={`text-xs font-black ${dateStr === today ? 'bg-blue-600 text-white rounded-full px-2 py-0.5' : ''}`}>{day.getDate()}</span>
                                    <div className="mt-1 space-y-1">
                                      {matches.map(g => (
                                        <div key={g.id} onClick={() => setSelectedGameDetails(g)} className="text-[8px] p-1 border rounded truncate cursor-pointer bg-slate-50">{g.away} @ {g.home}</div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                        }))}
                    </div>
                </div>
            ) : (
               filteredGames.map(game => (
                <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="bg-slate-50 p-2 rounded-xl text-center min-w-[60px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400">{safeDateDay(game.date)}</p>
                        <p className="text-xl font-black">{safeDateNum(game.date)}</p>
                        <p className="text-[8px] font-black text-slate-400">{safeDateMonth(game.date)}</p>
                      </div>
                      <div>
                        <span className={`text-[9px] font-black px-1.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                        <h3 className="font-bold text-slate-900 text-base">{game.away} @ {game.home}</h3>
                        <p className="text-xs text-slate-500 mt-1">{game.time} • {game.location}</p>
                        {renderOfficialsRow(game, groupedAssignments[game.id] || [], masterUmpires)}
                      </div>
                    </div>
                    {umpireId && !showHistory && (
                      <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${applications.some(a => a.gameId === game.id && a.userId === umpireId) ? 'bg-red-50 text-red-600' : 'bg-blue-600 text-white'}`}>
                        {applications.some(a => a.gameId === game.id && a.userId === umpireId) ? t.withdraw : t.interested}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {allLocationNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).map(locName => {
                const locData = locationsData.find(l => l.id === locName) || { id: locName, address: '', facilities: [] };
                return (
                  <div key={locName} onClick={() => setSelectedLocation(locName)} className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-md">
                     <h3 className="font-bold text-slate-800">{locName}</h3>
                     {locData.address && <p className="text-xs text-slate-500 mt-1 truncate">{locData.address}</p>}
                     <div className="mt-2"><span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">{locData.facilities.length} {t.facilities}</span></div>
                  </div>
                );
             })}
          </div>
        )}

        {view === 'umpire-list' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
               <h2 className="text-xl font-black">{t.umpireList}</h2>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
               {sortedUmpireList.map(u => (
                 <div key={u.id} onClick={() => { setSelectedProfileId(u.id); setView('umpire-profile'); }} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md cursor-pointer group">
                   <div className="flex gap-3 items-center">
                     <div className="w-10 h-10 rounded-full bg-white font-black flex items-center justify-center border group-hover:bg-blue-900 group-hover:text-white">{u.name.charAt(0)}</div>
                     <div><span className="font-bold block">{u.name}</span>{u.level && <span className={`text-[9px] font-black px-1.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}</div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'umpire-profile' && selectedProfileId && (() => {
           const profileUser = masterUmpires.find(u => u.id === selectedProfileId);
           const profileAsgs = assignments.filter(a => a.userId === selectedProfileId);
           const profileGames = games.filter(g => profileAsgs.some(a => a.gameId === g.id)).sort((a,b) => (a.date || '').localeCompare(b.date || ''));
           return (
             <div className="space-y-6">
                <button onClick={() => setView('umpire-list')} className="text-xs font-black text-slate-400 uppercase hover:text-blue-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> {t.back}</button>
                <div className="bg-white p-8 rounded-3xl border shadow-sm flex items-center gap-6">
                   <div className="w-24 h-24 rounded-full bg-blue-900 text-white flex items-center justify-center text-4xl font-black">{profileUser?.name.charAt(0)}</div>
                   <div>
                     <h2 className="text-3xl font-black">{profileUser?.name}</h2>
                     <p className="text-sm font-bold text-slate-500 mt-1">{profileAsgs.length} {t.assignedMatches}</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {profileGames.map(g => (
                      <div key={g.id} onClick={() => setSelectedGameDetails(g)} className="bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md">
                        <p className="text-[10px] font-black text-slate-400">{g.date}</p>
                        <p className="font-bold">{g.away} @ {g.home}</p>
                      </div>
                   ))}
                </div>
             </div>
           );
        })()}

        {view === 'stats' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
             <table className="w-full text-left min-w-[600px]">
               <thead className="bg-slate-50 border-b">
                 <tr>
                   <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black uppercase cursor-pointer">{t.umpire}</th>
                   <th onClick={() => handleSort('interest')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.interests}</th>
                   <th onClick={() => handleSort('games')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.gamesAssigned}</th>
                   <th onClick={() => handleSort('rate')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.assignmentRate}</th>
                 </tr>
               </thead>
               <tbody>
                 {sortedStatistics.map(stat => (
                   <tr key={stat.userId} className="border-b border-slate-50 hover:bg-slate-50">
                     <td className="px-6 py-4 font-bold"><button onClick={() => { setSelectedProfileId(stat.userId); setView('umpire-profile'); }} className="hover:underline">{stat.name}</button></td>
                     <td className="px-6 py-4 text-center">{stat.interest}</td>
                     <td className="px-6 py-4 text-center font-bold text-blue-600">{stat.games}</td>
                     <td className="px-6 py-4 text-center">{stat.rate}%</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {view === 'my-apps' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase">{t.mySchedule}</h2>
            {myAssignedGames.map(game => (
              <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-4 rounded-2xl border border-green-200 flex justify-between items-center cursor-pointer hover:shadow-md">
                <div>
                  <p className="font-bold">{game.away} @ {game.home}</p>
                  <p className="text-xs text-slate-500">{game.date} @ {game.time}</p>
                </div>
                <span className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{t.confirmed}</span>
              </div>
            ))}
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 justify-between items-center">
               <h2 className="text-xl font-black uppercase">{t.staffingControl}</h2>
               <div className="flex gap-2">
                 <button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase">{t.bulkImport}</button>
                 <button onClick={handleDownloadBackup} className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Backup</button>
               </div>
             </div>
             
             {showImportTool && (
               <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200">
                 <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} className="w-full h-40 p-4 rounded-xl border border-blue-200 mb-4 font-mono text-xs" placeholder="Klistra in spelschema (Datum, Tid, Serie, Borta, Hemma, Plats)..."/>
                 <button onClick={handleBulkImport} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs">{t.addGames}</button>
               </div>
             )}

             <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="text-sm font-black uppercase mb-4">{t.masterList}</h3>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                   {masterUmpires.map(u => (
                     <div key={u.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center">
                        <span className="font-bold text-sm">{u.name} {u.linkedEmail && <span className="text-[10px] text-green-600 ml-2">✓ Verifierad</span>}</span>
                        <div className="flex gap-2">
                           {isSuperAdmin && <button onClick={() => toggleUmpireAdmin(u.id)} className={`p-1 rounded ${adminUmpireIds.includes(u.id) ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}><Shield className="w-4 h-4"/></button>}
                           <button onClick={() => deleteMasterUmpire(u.id, u.name)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

      </main>

      {user?.email && (
        <button onClick={() => setShowAdminModal(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-blue-800">
          <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[10px] font-black uppercase">{userName ? userName.charAt(0) : '?'}</div>
          <span className="text-sm font-bold">{userName || 'Välj profil'}</span>
        </button>
      )}

      {!user?.email && (
        <button onClick={() => setShowAuthModal(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-2xl font-black uppercase text-xs tracking-widest">{t.login}</button>
      )}

      {selectedLocation && (() => {
        const locDetail = locationsData.find(l => l.id === selectedLocation) || { id: selectedLocation, address: '', facilities: [] };
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md relative">
              <button onClick={() => setSelectedLocation(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              <h3 className="text-2xl font-black mb-2">{locDetail.id}</h3>
              <p className="text-sm text-slate-500 mb-4">{locDetail.address || 'Ingen adress angiven'}</p>
              <div className="bg-slate-50 p-4 rounded-xl mb-6">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.facilities}</p>
                <div className="flex flex-wrap gap-2">
                  {locDetail.facilities.map(f => <span key={f} className="text-xs bg-white border px-2 py-1 rounded">{f}</span>)}
                  {locDetail.facilities.length === 0 && <span className="text-xs italic text-slate-400">Inga faciliteter registrerade</span>}
                </div>
              </div>
              <button onClick={() => setSelectedLocation(null)} className="w-full py-3 bg-slate-100 font-black uppercase text-xs rounded-xl">{t.close}</button>
            </div>
          </div>
        );
      })()}

      {selectedGameDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md relative">
            <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
            <h3 className="text-2xl font-black mt-4">{selectedGameDetails.away} @ {selectedGameDetails.home}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase mt-1">{selectedGameDetails.date} @ {selectedGameDetails.time}</p>
            <div className="mt-6 space-y-4">
               <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center">
                 <div><p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p><p className="font-bold text-blue-900">{selectedGameDetails.location}</p></div>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.crew}</h4>
                  {(groupedAssignments[selectedGameDetails.id] || []).map(asg => (
                    <div key={asg.userId} className="p-3 bg-slate-50 rounded-xl border mb-2"><span className="font-bold text-sm">{asg.userName}</span></div>
                  ))}
                  {(groupedAssignments[selectedGameDetails.id] || []).length === 0 && <p className="text-xs italic text-slate-400">Inga domare tillsatta än.</p>}
               </div>
            </div>
            <button onClick={() => setSelectedGameDetails(null)} className="w-full py-4 mt-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-xs">{t.close}</button>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2"/>
              <h3 className="text-2xl font-black">{t.login}</h3>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder={t.email} required/>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder={t.password} required/>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-xs">{isLoginMode ? t.login : t.register}</button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-xs font-bold text-slate-500">{isLoginMode ? t.noAccount : t.hasAccount}</button>
            </div>
          </div>
        </div>
      )}

      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm">
            <h3 className="text-2xl font-black text-center mb-6">{t.nameRequiredTitle}</h3>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-11 bg-slate-50 border rounded-2xl font-bold text-sm" placeholder={t.namePlaceholder} />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
              {filteredMasterUmpires.map(u => (
                <button key={u.id} onClick={async () => { setUserName(u.name); setUmpireId(u.id); await updateProfile(u.name, u.id); setShowNamePrompt(false); }} className="w-full text-left p-4 hover:bg-slate-50 font-bold text-sm">{u.name}</button>
              ))}
            </div>
            <button onClick={() => setShowNamePrompt(false)} className="w-full py-4 mt-6 bg-slate-100 font-black rounded-2xl uppercase text-xs">{t.cancel}</button>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm">
            <h3 className="text-2xl font-black mb-6">{t.userSettings}</h3>
            <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center mb-6">
              <div><p className="text-[10px] font-black text-slate-400 uppercase">{t.displayName}</p><p className="font-bold">{userName || 'Ej vald'}</p></div>
              <button onClick={logoutUmpire} className="text-red-500 font-black text-[10px] uppercase">{t.logout}</button>
            </div>
            {isSuperAdmin && (
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-black text-purple-600 uppercase mb-2 flex items-center gap-2"><Sliders className="w-4 h-4"/> System</h4>
                <button onClick={() => toggleSystemFeature('marketplace')} className={`w-full p-3 rounded-xl font-bold text-xs text-left ${features.marketplace ? 'bg-purple-600 text-white' : 'bg-slate-100'}`}>Marknadsplats: {features.marketplace ? 'PÅ' : 'AV'}</button>
              </div>
            )}
            <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 font-black rounded-2xl uppercase text-xs">{t.close}</button>
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
