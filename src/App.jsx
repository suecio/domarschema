import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, 
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
  MapPin, RefreshCw, Trophy, Search, BarChart, History as HistoryIcon, Info, 
  User, UserMinus, ArrowUp, Users, Megaphone, HelpCircle, ArrowRightLeft, 
  ChevronRight, AlertTriangle, Star, FileText, ArrowLeft, BookOpen, MessageCircle,
  Mail, Code, Share2, UserPlus, Send, Navigation, X, ChevronUp, ChevronDown,
  ArrowUpDown, CalendarPlus, ChevronLeft, List, Edit2, Check, LogOut, Bell, BellOff, Sliders, Download, Plus, UserCheck, Map
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

// ==========================================
// TRANSLATIONS
// ==========================================
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
// HELPERS
// ==========================================
const getISOWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const formatCalendarDate = (dateStr, timeStr, addHours = 3) => {
  const cleanDate = (dateStr || '').replace(/-/g, ''); const cleanTime = (timeStr || '00:00').replace(/:/g, '');
  const start = `${cleanDate}T${cleanTime}00`; const [hours, mins] = (timeStr || '00:00').split(':');
  const endHours = (parseInt(hours || '0') + addHours).toString().padStart(2, '0');
  const end = `${cleanDate}T${endHours}${mins || '00'}00`; return { start, end };
};

const getGoogleCalendarLink = (game) => {
  if (!game.date || !game.time) return '#'; const { start, end } = formatCalendarDate(game.date, game.time);
  const title = encodeURIComponent(`${game.away} @ ${game.home} (${game.league})`);
  const details = encodeURIComponent(`League: ${game.league}\nLocation: ${game.location}`);
  const location = encodeURIComponent(game.location);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

const getOutlookCalendarLink = (game) => {
  if (!game.date || !game.time) return '#'; const { start, end } = formatCalendarDate(game.date, game.time);
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
// ERROR BOUNDARY (ENHANCED)
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full text-center border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ett oväntat fel uppstod</h2>
            <p className="text-slate-600 mb-6 font-medium">Applikationen kraschade. Här är detaljerna som hjälper dig att hitta felet:</p>
            
            <div className="bg-red-50 rounded-xl p-4 text-left overflow-x-auto mb-6 border border-red-100">
              <pre className="text-red-700 text-sm font-black whitespace-pre-wrap mb-4">
                {this.state.error && this.state.error.toString()}
              </pre>
              <pre className="text-red-900 text-[10px] font-mono whitespace-pre-wrap leading-relaxed opacity-80">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            
            <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg">
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
  
  // --- 1. CORE STATE ---
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
  const [evalInputs, setEvalInputs] = useState({}); // Stores temporary evaluation input state
  
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

  // --- 2. ENVIRONMENT & APP ID ---
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


  // --- 3. DERIVED DATA (USEMEMO) ---
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


  // --- 4. HELPER UTILS ---
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


  // --- 5. EFFECTS ---
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


  // --- 6. ACTIONS & HANDLERS ---
  const handleAuthSubmit = async (e) => { e.preventDefault(); setAuthError(''); try { if (isLoginMode) await signInWithEmailAndPassword(auth, authEmail, authPassword); else await createUserWithEmailAndPassword(auth, authEmail, authPassword); setShowAuthModal(false); } catch (err) { setAuthError(err.message); } };
  const handleResetPassword = async () => { if (!authEmail) { setAuthError(lang === 'sv' ? 'Fyll i e-postadressen ovan först.' : 'Please enter your email address first.'); return; } try { await sendPasswordResetEmail(auth, authEmail); if (typeof window !== 'undefined') alert(lang === 'sv' ? 'Lösenordsåterställning skickad!' : 'Password reset email sent!'); } catch (err) { setAuthError(err.message); } };
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
  const handleDeleteGame = async (gameId) => { if(typeof window !== 'undefined' && window.confirm(t.deleteConfirm)) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId)); } };

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
      if (selectedGameDetails?.id === gameId) setSelectedGameDetails(prev => ({ ...prev, ...updateObj }));
    } catch (e) { }
  };

  const submitEvaluation = async (gameId, targetUmpireId, grade, comment) => {
    if (!isAdmin && selectedGameDetails?.supervisorId !== umpireId) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', `${gameId}_${targetUmpireId}`), { gameId, umpireId: targetUmpireId, evaluatorId: umpireId, grade, comment, timestamp: Date.now() });
      if (typeof window !== 'undefined') alert(t.evalSaved);
    } catch (e) { }
  };

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

  const handleDownloadBackup = () => {
    if (!isAdmin || typeof window === 'undefined') return;
    const blob = new Blob([JSON.stringify({ timestamp: new Date().toISOString(), year: selectedYear, appId, collections: { games, applications, assignments, umpires: masterUmpires, adminUmpireIds, evaluations, locations: locationsData } }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.setAttribute('download', `umpire-backup-${selectedYear}-${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };


  // ==========================================
  // RENDER FUNCTIONS (INLINE FOR SCOPE)
  // ==========================================
  
  const renderHelpView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button onClick={() => setView('schedule')} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"><ArrowLeft className="w-4 h-4" /> {t.back}</button>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto custom-scrollbar">
          <button onClick={() => setHelpTab('guide')} className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'guide' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><BookOpen className="w-4 h-4" /> {t.guide}</button>
          <button onClick={() => setHelpTab('faq')} className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'faq' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><MessageCircle className="w-4 h-4" /> {t.faq}</button>
          <button onClick={() => setHelpTab('contact')} className={`min-w-[140px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'contact' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><Mail className="w-4 h-4" /> {t.contactUs}</button>
          <button onClick={() => setHelpTab('about')} className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'about' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><Code className="w-4 h-4" /> {t.about}</button>
        </div>
        <div className="p-6 sm:p-8">
          {helpTab === 'guide' && (
            <div className="space-y-8 max-w-2xl mx-auto text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-blue-600" /></div>
              <h2 className="text-2xl font-black text-slate-800">{t.guide}</h2>
              <p className="text-slate-500 font-medium">{t.guideStep1Desc}</p>
              <button onClick={copyGuideLink} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full font-black text-[10px] uppercase shadow-sm"><Share2 className="w-4 h-4" /> {t.shareGuide}</button>
            </div>
          )}
          {helpTab === 'faq' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-8"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-8 h-8 text-blue-600" /></div><h2 className="text-2xl font-black text-slate-800">{t.faq}</h2></div>
              <div className="space-y-4">
                {[{ q: t.faq1Q, a: t.faq1A }, { q: t.faq2Q, a: t.faq2A }, { q: t.faq3Q, a: t.faq3A }, { q: t.faq4Q, a: t.faq4A }, { q: t.faq5Q, a: t.faq5A }].map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100"><h3 className="text-sm font-black uppercase text-slate-800 mb-2">{faq.q}</h3><p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p></div>
                ))}
              </div>
            </div>
          )}
          {helpTab === 'contact' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-blue-600" /></div>
              <h2 className="text-2xl font-black text-slate-800 mb-6">{t.contactUs}</h2>
              {contactStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-8"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><h3 className="text-xl font-black text-green-800 mb-2">{t.msgSentTitle}</h3><button onClick={() => setContactStatus('idle')} className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs">{t.sendAnother}</button></div>
              ) : (
                <form onSubmit={handleContactSubmit} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.name}</label><input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <div><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label><input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  </div>
                  <div><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.subject}</label><input type="text" required value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.message}</label><textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" /></div>
                  <button type="submit" disabled={contactStatus === 'sending'} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] flex items-center justify-center gap-2">{contactStatus === 'sending' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
                </form>
              )}
            </div>
          )}
          {helpTab === 'about' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code className="w-8 h-8 text-blue-600" /></div><h2 className="text-2xl font-black text-slate-800">{t.about}</h2></div>
              <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100">{readmeLoading ? <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" /> : <div className="markdown-body text-sm">{renderMarkdown(readmeContent)}</div>}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLocationsView = () => (
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
  );

  const renderStatsView = () => (
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
               <td className="px-6 py-4 font-bold"><button onClick={() => { setSelectedProfileId(stat.userId); setView('umpire-profile'); scrollToTop(); }} className="hover:underline">{stat.name}</button></td>
               <td className="px-6 py-4 text-center">{stat.interest}</td>
               <td className="px-6 py-4 text-center font-bold text-blue-600">{stat.games}</td>
               <td className="px-6 py-4 text-center">{stat.rate}%</td>
             </tr>
           ))}
         </tbody>
       </table>
    </div>
  );

  const renderScheduleView = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{showHistory ? t.archived : t.activeSchedule}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {filteredGames.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowScheduleExport(!showScheduleExport)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-700 flex items-center gap-2"><CalendarPlus className="w-4 h-4" /> {t.downloadCalendar}</button>
              {showScheduleExport && (
                <><div className="fixed inset-0 z-10" onClick={() => setShowScheduleExport(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                    <button onClick={() => { generateICS(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b flex flex-col"><span className="text-xs font-black text-slate-700">{t.formatICS}</span></button>
                    <button onClick={() => { generateCSV(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col"><span className="text-xs font-black text-slate-700">{t.formatCSV}</span></button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
               <button onClick={() => setScheduleViewMode('list')} className={`p-2 rounded-lg ${scheduleViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
               <button onClick={() => setScheduleViewMode('calendar')} className={`p-2 rounded-lg ${scheduleViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><CalendarIcon className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}><HistoryIcon className="w-3.5 h-3.5" />{showHistory ? t.upcoming : t.history}</button>
          </div>
        </div>
      </div>

      {scheduleViewMode === 'calendar' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase">{t.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white rounded-xl border"><ChevronLeft className="w-4 h-4"/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white rounded-xl border text-[10px] font-black">IDAG</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white rounded-xl border"><ChevronRight className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">{(t.days || []).map((d, i) => (<div key={i} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase">{d}</div>))}</div>
            <div className="grid grid-cols-7">
                {calendarWeeks.flatMap((week) => 
                  week.days.map((day, idx) => {
                    const dateStr = day ? toLocalISO(day) : null;
                    const matches = dateStr ? filteredGames.filter(g => g.date === dateStr) : [];
                    const isToday = dateStr === today;
                    return (
                      <div key={`${week.weekNumber}-${idx}`} className={`min-h-[100px] p-2 border-r border-b relative ${!day ? 'bg-slate-50/30' : 'bg-white'}`}>
                        {day && (
                          <>
                            <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>{day.getDate()}</span>
                            <div className="mt-2 space-y-1">
                              {matches.map(g => (
                                <button key={g.id} onClick={() => setSelectedGameDetails(g)} className="w-full text-left p-1 rounded border hover:border-blue-200 group overflow-hidden">
                                  <div className={`w-full h-1 rounded-full mb-1 ${getLeagueStyles(g.league).split(' ')[0]}`} />
                                  <p className="text-[8px] font-bold text-slate-700 truncate">{g.away} @ {g.home}</p>
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
          <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200"><Info className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-500 font-medium">{t.noGames}</p></div>
        ) : (
          filteredGames.map(game => {
            const gameAssignments = groupedAssignments[game.id] || [];
            const appsCount = applications.filter(a => a.gameId === game.id).length;
            const isApplied = umpireId && applications.some(a => a.gameId === game.id && a.userId === umpireId);
            const isAssignedToThisGame = umpireId && gameAssignments.some(asg => asg.userId === umpireId);
            const required = game.requiredUmpires || 2;
            
            return (
              <div key={game.id} onClick={() => setSelectedGameDetails(game)} className={`bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:border-blue-300 group ${showHistory ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border group-hover:bg-blue-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase">{safeDateDay(game.date)}</p><p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p><p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{safeDateMonth(game.date)}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                      <h3 className="font-bold text-slate-900 mt-1 text-base group-hover:text-blue-700">{game.away} @ {game.home}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span></div>
                      {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0">
                    {!showHistory && (
                      <>
                        <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-400 uppercase">{appsCount} {t.applied}</span>{gameAssignments.length > 0 && (<span className="text-[10px] font-black text-green-600 uppercase mt-0.5">{gameAssignments.length}/{required} {t.staffed}</span>)}</div>
                        {isAssignedToThisGame ? (
                          <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {t.yourGame}</div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isApplied ? t.withdraw : t.interested}</button>
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
    </div>
  );

  const renderMyGamesView = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black uppercase">{t.mySchedule}</h2>
      </div>
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start mb-6">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-medium text-blue-800 leading-relaxed">{t.myGamesReminder}</p>
      </div>

      {!user || !user.email ? (
        <div className="bg-white p-12 rounded-3xl text-center border shadow-sm"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CalendarIcon className="w-8 h-8 text-blue-600" /></div><p className="text-slate-500 font-medium mb-6">{t.loginRequiredMsg}</p></div>
      ) : (
        <>
          {myAssignedGames.map(game => {
              const myAsg = groupedAssignments[game.id]?.find(a => a.userId === umpireId);
              return (
                <div key={game.id} onClick={() => setSelectedGameDetails(game)} className={`bg-white p-4 rounded-2xl border ${myAsg?.pendingChange ? 'border-yellow-400' : 'border-green-200 hover:shadow-md'} flex flex-col gap-3 cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-base">{game.away} @ {game.home}</p>
                      <p className="text-[11px] text-slate-500 font-black uppercase mt-1">{game.date} @ {game.time} • {game.location}</p>
                    </div>
                    {myAsg?.pendingChange ? <div className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{t.timeChangedBadge}</div> : <div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{t.confirmed}</div>}
                  </div>
                  {myAsg?.pendingChange && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-2 flex flex-col gap-3">
                      <p className="text-xs font-bold text-yellow-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t.matchMovedWarning}</p>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); confirmScheduleChange(myAsg.id); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">{t.acceptTime}</button>
                        <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, umpireId); }} className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase">{t.declineTime}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
          })}
          {myAssignedGames.length === 0 && <div className="p-8 text-center text-slate-400">{t.noAssignedMatches}</div>}
        </>
      )}
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left"><h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2><p className="text-xs text-slate-500">{selectedYear} Season</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDownloadBackup} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 flex items-center gap-2"><Download className="w-4 h-4" /> Backup</button>
          <button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-slate-200"><Plus className="w-4 h-4" /> {t.bulkImport}</button>
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
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4" /> {t.globalAnnouncement}</h3>
        <textarea value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} placeholder={t.announcementPlaceholder} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none min-h-[80px]" />
        <div className="flex gap-2 mt-3"><button onClick={saveGlobalNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.saveAnnouncement}</button><button onClick={clearGlobalNote} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.clearAnnouncement}</button></div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-600" /> {t.pendingAssignments}</h3>
        <button onClick={() => setShowStaffed(!showStaffed)} className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2 ${showStaffed ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'}`}><CheckCircle className="w-3.5 h-3.5" />{showStaffed ? t.hideStaffed : t.showAll}</button>
      </div>
      
      {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
        const applicants = applications.filter(a => a.gameId === game.id);
        const gameAssignments = groupedAssignments[game.id] || [];
        const required = game.requiredUmpires || 2;
        const isEditingThisGame = editingGameData?.id === game.id;
        const isFullyStaffed = gameAssignments.length >= required;

        return (
          <div key={game.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isFullyStaffed && !isEditingThisGame ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center hover:bg-slate-100/50 cursor-pointer" onClick={() => setSelectedGameDetails(game)}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
                <p className="text-xs font-bold text-slate-600">{game.away} @ {game.home} | {safeDateDay(game.date)} {game.date} @ {game.time}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getAssignmentStatusStyles(gameAssignments.length, required)}`}>{gameAssignments.length} / {required} {t.assignedTo}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); setEditingGameData(isEditingThisGame ? null : { ...game }); }} className={`p-2 transition-colors ${isEditingThisGame ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}><Edit2 className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteGame(game.id); }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            {isEditingThisGame && (
              <div className="p-4 bg-blue-50/30 border-b border-slate-100 flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.date}</label><input type="date" value={editingGameData.date || ''} onChange={e => setEditingGameData({...editingGameData, date: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.time}</label><input type="time" value={editingGameData.time || ''} onChange={e => setEditingGameData({...editingGameData, time: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.league}</label><input type="text" value={editingGameData.league || ''} onChange={e => setEditingGameData({...editingGameData, league: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.requiredUmpires}</label><select value={editingGameData.requiredUmpires || 2} onChange={(e) => setEditingGameData({ ...editingGameData, requiredUmpires: parseInt(e.target.value) })} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold">{[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.away}</label><input type="text" value={editingGameData.away || ''} onChange={e => setEditingGameData({...editingGameData, away: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{t.home}</label><input type="text" value={editingGameData.home || ''} onChange={e => setEditingGameData({...editingGameData, home: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                  <div className="space-y-1 sm:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">{t.location}</label><input type="text" value={editingGameData.location || ''} onChange={e => setEditingGameData({...editingGameData, location: e.target.value})} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" /></div>
                </div>
                <div className="flex gap-2"><button onClick={saveEditedGame} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold text-xs uppercase shadow-sm hover:bg-green-700">{t.saveChanges}</button><button onClick={() => setEditingGameData(null)} className="flex-1 bg-slate-200 text-slate-600 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-slate-300">{t.cancel}</button></div>
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
                         <span className="text-xs font-bold text-slate-700 text-left flex items-center">{asg.userName}{asg.pendingChange && <span className="ml-2 text-[9px] text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest">{t.pendingReply}</span>}</span>
                         {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLeagueStyles(m.level)}`}>{m.level}</span>}
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, asg.userId); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><UserMinus className="w-3.5 h-3.5" /></button>
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
                            <span className="text-xs font-bold">{app.userName}</span>
                            {m?.level && <span className={`text-[8px] font-black px-1 rounded border uppercase ${getLeagueStyles(m.level)}`}>{m.level}</span>}
                          </div>
                          <button disabled={isFullyStaffed} onClick={(e) => { e.stopPropagation(); assignUmpire(game.id, app.userId, app.userName); }} className="bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"><UserPlus className="w-3 h-3" /> Assign</button>
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
  );

  const renderAuthModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl relative">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5" /></button>
        <div className="text-center space-y-2"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-blue-600" /></div><h3 className="text-2xl font-black text-slate-800">{t.appTitle}</h3><p className="text-xs text-slate-400 font-medium">{isLoginMode ? t.loginToContinue : t.createAnAccount}</p></div>
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 break-words">{authError}</div>}
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.email}</label><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold mt-1" placeholder="namn@exempel.se" /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.password}</label><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold mt-1" placeholder="••••••••" /></div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700">{isLoginMode ? t.login : t.register}</button>
        </form>
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
          <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} className="text-xs font-bold text-slate-500">{isLoginMode ? t.noAccount : t.hasAccount}</button>
          {isLoginMode && <button onClick={handleResetPassword} type="button" className="text-[10px] font-black text-slate-400 uppercase mt-2">{t.forgotPassword}</button>}
        </div>
      </div>
    </div>
  );

  const renderNamePromptModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl relative">
        <div className="text-center space-y-2"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><UserCheck className="w-8 h-8 text-blue-600" /></div><h3 className="text-2xl font-black text-slate-800">{t.nameRequiredTitle}</h3><p className="text-xs text-slate-400 font-medium">{t.nameRequiredDesc}</p></div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.masterList}</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500" />
              <input type="text" value={searchQuery} placeholder={t.namePlaceholder} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" />
            </div>
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filteredMasterUmpires.length > 0 ? (
                filteredMasterUmpires.map(u => (
                  <button key={u.id} onClick={async () => { setUserName(u.name); setUmpireId(u.id); await updateProfile(u.name, u.id); setShowNamePrompt(false); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between group">
                    <span className="text-sm font-bold text-slate-700">{u.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))
              ) : (<div className="p-4 text-center"><p className="text-xs text-slate-400 italic">{t.noGames}</p></div>)}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button onClick={() => setIsAddingNew(!isAddingNew)} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase"><Plus className="w-3 h-3" /> {t.addNewName}</button>
            {isAddingNew && (
              <div className="space-y-2">
                <input type="text" autoFocus value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} placeholder="För- och efternamn" className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-sm outline-none" />
                <button onClick={async () => { if (tempEditName.trim()) { const newId = await addMasterUmpire(tempEditName); setUserName(tempEditName); setUmpireId(newId); await updateProfile(tempEditName, newId); setTempEditName(''); setIsAddingNew(false); setShowNamePrompt(false); } }} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg shadow-blue-200">{t.createUmpire}</button>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setShowNamePrompt(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px]">{t.cancel}</button>
      </div>
    </div>
  );

  const renderAdminModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <div><h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3><p className="text-xs text-slate-400 font-medium uppercase">{user?.email}</p></div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t.displayName}</p><p className="text-sm font-bold text-slate-800">{userName || t.setProfile}</p></div>
            <button onClick={logoutUmpire} className="p-2 text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-1 font-black text-[10px] uppercase"><LogOut className="w-4 h-4" /> {t.logout}</button>
          </div>
          {isAdmin && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" /><div><p className="text-xs font-black text-blue-800 uppercase">Admin</p><p className="text-[10px] text-blue-600 font-medium">Behörighet beviljad via e-post</p></div>
            </div>
          )}
        </div>
        <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px]">{t.close}</button>
      </div>
    </div>
  );

  const renderGameDetailsModal = () => {
    const game = selectedGameDetails;
    const gameAssignments = groupedAssignments[game.id] || [];
    const gameApplications = applications.filter(a => a.gameId === game.id);
    const isGameSupervisor = game.supervisorId === umpireId;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto relative">
          <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
          
          <div className="space-y-6 pt-4">
            <div>
              <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span>
              <h3 className="text-2xl font-black mt-3">{game.away} @ {game.home}</h3>
              <p className="text-sm text-slate-500 font-bold uppercase mt-1">{game.date} @ {game.time}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center">
              <div><p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p><p className="font-bold text-blue-900">{game.location}</p></div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.location)}`} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"><Map className="w-4 h-4"/> {t.mapDirections}</a>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.crew}</h4>
                {gameAssignments.length > 0 ? (
                  <div className="grid gap-2">
                    {gameAssignments.map(asg => {
                      const m = masterUmpires.find(mu => mu.id === asg.userId);
                      const existingEval = evaluations.find(e => e.gameId === game.id && e.umpireId === asg.userId);
                      
                      return (
                        <div key={asg.userId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">{asg.userName}</span>
                              {m?.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                            </div>
                          </div>
                          
                          {features.evaluations && isGameSupervisor && !existingEval && (
                            <div className="mt-2 pt-3 border-t border-slate-200">
                              <p className="text-[10px] font-black uppercase text-purple-600 mb-2">{t.evaluate}</p>
                              <div className="flex flex-col gap-2">
                                <select onChange={(e) => setEvalInputs(prev => ({...prev, [asg.userId]: {...prev[asg.userId], grade: e.target.value}}))} className="p-2 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-purple-400">
                                  <option value="0">{t.grade}...</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <textarea placeholder={t.feedback} onChange={(e) => setEvalInputs(prev => ({...prev, [asg.userId]: {...prev[asg.userId], comment: e.target.value}}))} className="p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-400 min-h-[60px]" />
                                <button onClick={() => { const input = evalInputs[asg.userId]; if(input && parseInt(input.grade) > 0) { submitEvaluation(game.id, asg.userId, parseInt(input.grade), input.comment || ''); } }} className="bg-purple-600 hover:bg-purple-700 transition-colors text-white py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">
                                  {t.saveEval}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {existingEval && (isAdmin || asg.userId === umpireId || isGameSupervisor) && (
                            <div className="mt-2 pt-2 border-t border-slate-200 bg-purple-50 p-3 rounded-lg flex flex-col gap-1">
                              <p className="text-[10px] font-black uppercase text-purple-600">{t.yourEval}</p>
                              <div className="flex items-start gap-3 mt-1">
                                <span className="bg-purple-600 text-white w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-xs font-black">{existingEval.grade}</span>
                                <span className="text-xs text-purple-900 font-medium italic leading-relaxed">"{existingEval.comment}"</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">{t.notAssigned || "Inga domare tillsatta än."}</p>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.interests} ({gameApplications.length})</h4>
                {gameApplications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {gameApplications.map(app => {
                      const m = masterUmpires.find(mu => mu.id === app.userId);
                      return (
                        <div key={app.userId} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-800">{app.userName}</span>
                          {m?.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(m.level)}`}>{m.level}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">{t.noInterests}</p>
                )}
              </div>

              {isAdmin && (
                <div className="pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-2xl border">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3" /> {t.officials} (Admin)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">{t.supervisor}</label>
                      <select value={game.supervisorId || ''} onChange={(e) => assignOfficial(game.id, 'supervisor', e.target.value)} className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none">
                        <option value="">{t.selectAdmin}</option>
                        {masterUmpires.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">{t.techComm}</label>
                      <input type="text" value={game.tcName || ''} onChange={(e) => assignOfficial(game.id, 'tc', e.target.value)} placeholder={t.enterTCName} className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setSelectedGameDetails(null)} className="w-full py-4 mt-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-xs hover:bg-slate-200 transition-colors">{t.close}</button>
          </div>
        </div>
      </div>
    );
  };

  // --- 7. MAIN RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-blue-100">
      <header onClick={() => { setView('schedule'); scrollToTop(); }} className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-20 cursor-pointer">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-white" />
              <div><h1 className="text-sm sm:text-xl font-bold">{t.appTitle}</h1><p className="text-[8px] sm:text-[10px] font-black uppercase text-blue-300">{t.season} {selectedYear}</p></div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); if(user) setShowAdminModal(true); else setShowAuthModal(true); }} className="p-1.5 sm:hidden">{user ? <Settings className="w-4 h-4"/> : <User className="w-4 h-4"/>}</button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <select value={selectedYear} onClick={(e) => e.stopPropagation()} onChange={(e) => setSelectedYear(e.target.value)} className="bg-blue-800 text-[10px] font-black uppercase border-none rounded-lg px-2 py-1.5 outline-none appearance-none cursor-pointer shadow-inner">
              <option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
            </select>
            <div className="flex bg-blue-800 rounded-lg p-0.5 shadow-inner">
              <button onClick={(e) => { e.stopPropagation(); setLang('sv'); }} className={`px-1.5 py-1 text-[10px] rounded-md ${lang === 'sv' ? 'bg-blue-600' : 'opacity-50'}`}>🇸🇪</button>
              <button onClick={(e) => { e.stopPropagation(); setLang('en'); }} className={`px-1.5 py-1 text-[10px] rounded-md ${lang === 'en' ? 'bg-blue-600' : 'opacity-50'}`}>🇬🇧</button>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setView('help'); setHelpTab('guide'); }} className="p-1.5 hover:bg-blue-800 rounded-full"><HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); if(user) setShowAdminModal(true); else setShowAuthModal(true); }} className="p-1.5 hidden sm:block hover:bg-blue-800 rounded-full">{user ? <Settings className="w-5 h-5"/> : <User className="w-5 h-5"/>}</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {view !== 'help' && (
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto whitespace-nowrap">
            {[
              { id: 'schedule', label: t.schedule, icon: CalendarIcon },
              { id: 'locations', label: t.locations, icon: MapPin },
              { id: 'umpire-list', label: t.umpireList, icon: Users },
              ...(user?.email ? [{ id: 'my-apps', label: t.myGames, icon: CheckCircle }] : []),
              ...(isAdmin ? [{ id: 'admin', label: t.staffing, icon: Shield }, { id: 'stats', label: t.analytics, icon: BarChart }] : [])
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase ${view === tab.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                <tab.icon className="w-4 h-4 shrink-0" /><span className="inline">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {globalNote && view !== 'help' && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl shadow-sm flex gap-3 items-start animate-in fade-in">
            <Megaphone className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-yellow-800 whitespace-pre-wrap">{globalNote}</p>
          </div>
        )}

        {['schedule', 'admin', 'locations'].includes(view) && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {['schedule', 'admin'].includes(view) && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filterStatus === '' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{t.filterStatusAll}</button>
                <button onClick={() => setFilterStatus('needs_umpire')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filterStatus === 'needs_umpire' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700'}`}>{t.needsUmpire}</button>
                <button onClick={() => setFilterStatus('no_interests')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${filterStatus === 'no_interests' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700'}`}>{t.noInterests}</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className={`relative ${view === 'locations' ? 'md:col-span-4' : 'md:col-span-2'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              {['schedule', 'admin'].includes(view) && (
                <>
                  <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"><option value="">{t.allSeries}</option>{leagues.map(l => <option key={l} value={l}>{l}</option>)}</select>
                  <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"><option value="">{t.allLocations}</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select>
                </>
              )}
            </div>
          </div>
        )}

        {view === 'help' && renderHelpView()}
        {view === 'locations' && renderLocationsView()}
        {view === 'stats' && renderStatsView()}
        {view === 'schedule' && renderScheduleView()}
        {view === 'my-apps' && renderMyGamesView()}
        {view === 'admin' && renderAdminView()}

        {view === 'umpire-list' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50"><h2 className="text-xl font-black">{t.umpireList}</h2></div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
               {sortedUmpireList.map(u => (
                 <div key={u.id} onClick={() => { setSelectedProfileId(u.id); setView('umpire-profile'); }} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md cursor-pointer group">
                   <div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-full bg-white font-black flex items-center justify-center border">{u.name.charAt(0)}</div><div><span className="font-bold block">{u.name}</span>{u.level && <span className={`text-[9px] font-black px-1.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}</div></div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* Floating Buttons */}
      {showBackToTop && <button onClick={scrollToTop} className="fixed bottom-6 right-6 bg-blue-900 text-white p-3 rounded-full shadow-2xl z-[70]"><ArrowUp className="w-6 h-6" /></button>}

      {user?.email ? (
        umpireId ? (
          <button onClick={() => setShowAdminModal(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-5 z-50 border border-blue-800/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-blue-900 rounded-full flex items-center justify-center text-[11px] font-black uppercase">{userName ? userName.charAt(0) : '?'}</div>
              <div className="text-left"><p className="text-[8px] font-black uppercase text-blue-300 leading-none mb-0.5">{t.userSettings}</p><span className="text-sm font-bold leading-none">{userName}</span></div>
            </div>
          </button>
        ) : (
          <button onClick={() => setShowNamePrompt(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-blue-50 backdrop-blur-md animate-pulse"><UserCheck className="w-5 h-5" /><span className="text-sm font-black uppercase">{t.saveName}</span></button>
        )
      ) : (
        <button onClick={() => setShowAuthModal(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-blue-800/50 backdrop-blur-md"><User className="w-5 h-5" /><span className="text-sm font-black uppercase">{t.login}</span></button>
      )}

      {/* Modals */}
      {showAuthModal && renderAuthModal()}
      {showNamePrompt && renderNamePromptModal()}
      {showAdminModal && renderAdminModal()}
      {selectedGameDetails && renderGameDetailsModal()}
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
