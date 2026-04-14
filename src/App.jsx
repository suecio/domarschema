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
  ArrowUpDown, CalendarPlus, ChevronLeft, List, Edit2, Check, LogOut, Bell, BellOff, Sliders
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
// VIEWS & MODALS (Combined into single file for canvas)
// ==========================================

function HelpView({ t, setView, helpTab, setHelpTab, copyGuideLink, contactName, setContactName, contactEmail, setContactEmail, contactSubject, setContactSubject, contactMessage, setContactMessage, contactStatus, setContactStatus, handleContactSubmit, readmeLoading, readmeContent }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button onClick={() => { setView('schedule'); }} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"><ArrowLeft className="w-4 h-4" /> {t.back}</button>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto custom-scrollbar">
          <button onClick={() => setHelpTab('guide')} className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'guide' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><BookOpen className="w-4 h-4" /> {t.guide}</button>
          <button onClick={() => setHelpTab('faq')} className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'faq' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><MessageCircle className="w-4 h-4" /> {t.faq}</button>
          <button onClick={() => setHelpTab('contact')} className={`min-w-[140px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'contact' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><Mail className="w-4 h-4" /> {t.contactUs}</button>
          <button onClick={() => setHelpTab('about')} className={`min-w-[120px] flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${helpTab === 'about' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}><Code className="w-4 h-4" /> {t.about}</button>
        </div>
        <div className="p-6 sm:p-8">
          {helpTab === 'guide' && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-blue-600" /></div>
                <h2 className="text-2xl font-black text-slate-800">{t.guide}</h2><p className="text-slate-500 font-medium mt-2">Hur du kopplar ditt konto till din domarprofil</p>
                <button onClick={copyGuideLink} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-200 transition-colors shadow-sm active:scale-95"><Share2 className="w-4 h-4" /> {t.shareGuide}</button>
              </div>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100"><div className="flex gap-4 sm:gap-6 items-start"><div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200"><UserPlus className="w-6 h-6 text-blue-600" /></div><div><h3 className="text-lg font-bold text-slate-800">{t.guideStep1Title}</h3><p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep1Desc}</p></div></div></div>
                <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100"><div className="flex gap-4 sm:gap-6 items-start"><div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200"><Search className="w-6 h-6 text-blue-600" /></div><div><h3 className="text-lg font-bold text-slate-800">{t.guideStep2Title}</h3><p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep2Desc}</p></div></div></div>
                <div className="flex flex-col gap-4 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm"><div className="flex gap-4 sm:gap-6 items-start"><div className="bg-blue-600 p-3 rounded-xl shadow-md shrink-0"><CheckCircle className="w-6 h-6 text-white" /></div><div><h3 className="text-lg font-bold text-blue-900">{t.guideStep3Title}</h3><p className="text-blue-800 font-medium leading-relaxed mt-1">{t.guideStep3Desc}</p></div></div></div>
                <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4"><div className="flex gap-4 sm:gap-6 items-start"><div className="bg-white p-3 rounded-xl shadow-sm shrink-0 border border-slate-200"><Info className="w-6 h-6 text-slate-400" /></div><div><h3 className="text-lg font-bold text-slate-800">{t.guideStep4Title}</h3><p className="text-slate-600 font-medium leading-relaxed mt-1">{t.guideStep4Desc}</p></div></div></div>
              </div>
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
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8 text-blue-600" /></div><h2 className="text-2xl font-black text-slate-800">{t.contactUs}</h2><p className="text-slate-500 font-medium mt-2">{t.contactDesc}</p></div>
              {contactStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8" /></div>
                  <h3 className="text-xl font-black text-green-800 mb-2">{t.msgSentTitle}</h3><p className="text-green-700 font-medium mb-6">{t.msgSentDesc}</p>
                  <button onClick={() => setContactStatus('idle')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-green-700 transition-colors shadow-md">{t.sendAnother}</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.name}</label><input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label><input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.subject}</label><input type="text" required value={contactSubject} onChange={e => setContactSubject(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20" /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.message}</label><textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[150px]" /></div>
                  <div className="pt-2">
                    <button type="submit" disabled={contactStatus === 'sending'} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                      {contactStatus === 'sending' ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t.sending}</> : <><Send className="w-4 h-4" /> {t.sendMsg}</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          {helpTab === 'about' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Code className="w-8 h-8 text-blue-600" /></div><h2 className="text-2xl font-black text-slate-800">{t.about}</h2></div>
              <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100">
                {readmeLoading ? <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4"><RefreshCw className="w-8 h-8 animate-spin" /><p className="text-sm font-bold">{t.loadingReadme}</p></div> : <div className="markdown-body text-sm sm:text-base">{renderMarkdown(readmeContent)}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LocationsView({ t, allLocationNames, searchQuery, locationsData, setSelectedLocation }) {
  return (
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
}

function StatsView({ t, sortedStatistics, handleSort, setSelectedProfileId, setView }) {
  return (
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
                 <td className="px-6 py-4 font-bold">
                   <button onClick={() => { setSelectedProfileId(stat.userId); setView('umpire-profile'); }} className="hover:underline">
                     {stat.name}
                   </button>
                 </td>
                 <td className="px-6 py-4 text-center">{stat.interest}</td>
                 <td className="px-6 py-4 text-center font-bold text-blue-600">{stat.games}</td>
                 <td className="px-6 py-4 text-center">{stat.rate}%</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
  );
}

function ScheduleView({ t, showHistory, setShowHistory, filteredGames, showScheduleExport, setShowScheduleExport, generateICS, generateCSV, scheduleViewMode, setScheduleViewMode, currentDate, setCurrentDate, calendarWeeks, toLocalISO, today, setSelectedGameDetails, getLeagueStyles, safeDateDay, safeDateNum, safeDateMonth, groupedAssignments, masterUmpires, renderOfficialsRow, umpireId, applications, toggleApplication, lang }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{showHistory ? t.archived : t.activeSchedule}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {filteredGames.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowScheduleExport(!showScheduleExport)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"><CalendarPlus className="w-4 h-4" /> {t.downloadCalendar} <ChevronDown className="w-3 h-3" /></button>
              {showScheduleExport && (
                <><div className="fixed inset-0 z-10" onClick={() => setShowScheduleExport(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { generateICS(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex flex-col gap-0.5"><span className="text-xs font-black text-slate-700">{t.formatICS}</span><span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextICS}</span></button>
                    <button onClick={() => { generateCSV(filteredGames); setShowScheduleExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5"><span className="text-xs font-black text-slate-700">{t.formatCSV}</span><span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextCSV}</span></button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
               <button onClick={() => setScheduleViewMode('list')} className={`p-2 rounded-lg transition-all ${scheduleViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
               <button onClick={() => setScheduleViewMode('calendar')} className={`p-2 rounded-lg transition-all ${scheduleViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><CalendarIcon className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><HistoryIcon className="w-3.5 h-3.5" />{showHistory ? t.upcoming : t.history}</button>
          </div>
        </div>
      </div>

      {scheduleViewMode === 'calendar' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">{t.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">IDAG</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-sm"><ChevronRight className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">
                {(t.days || []).map((d, i) => (<div key={i} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{d}</div>))}
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
                            <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>{day.getDate()}</span>
                            <div className="mt-2 space-y-1">
                              {matches.map(g => (
                                <button key={g.id} onClick={(e) => { e.stopPropagation(); setSelectedGameDetails(g); }} className="w-full text-left p-1 rounded border border-slate-100 hover:border-blue-200 transition-all group overflow-hidden">
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
          <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200"><Info className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-500 font-medium">{t.noGames}</p></div>
        ) : (
          filteredGames.map(game => {
            const gameAssignments = groupedAssignments[game.id] || [];
            const appsCount = applications.filter(a => a.gameId === game.id).length;
            const isApplied = umpireId && applications.some(a => a.gameId === game.id && a.userId === umpireId);
            const isAssignedToThisGame = umpireId && gameAssignments.some(asg => asg.userId === umpireId);
            const required = game.requiredUmpires || 2;
            
            return (
              <div key={game.id} onClick={() => setSelectedGameDetails(game)} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all cursor-pointer hover:border-blue-300 group ${showHistory ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border border-slate-100 flex flex-col justify-center group-hover:bg-blue-50 transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{safeDateDay(game.date)}</p><p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{safeDateMonth(game.date)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2"><span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span></div>
                      <h3 className="font-bold text-slate-900 mt-1 text-base leading-tight group-hover:text-blue-700 transition-colors">{game.away} @ {game.home}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span></div>
                      {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    {!showHistory && (
                      <>
                        <div className="flex flex-col items-end"><span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{appsCount} {t.applied}</span>{gameAssignments.length > 0 && (<span className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5">{gameAssignments.length}/{required} {t.staffed}</span>)}</div>
                        {isAssignedToThisGame ? (
                          <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {t.yourGame}</div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${isApplied ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-blue-600 text-white shadow-lg active:scale-95 hover:bg-blue-700'}`}>{isApplied ? t.withdraw : t.interested}</button>
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
}

function MyGamesView({ t, user, myAssignedGames, myInterestedGames, showMyGamesExport, setShowMyGamesExport, generateICS, generateCSV, myGamesViewMode, setMyGamesViewMode, currentDate, setCurrentDate, calendarWeeks, toLocalISO, today, umpireId, groupedAssignments, setSelectedGameDetails, getLeagueStyles, confirmScheduleChange, removeAssignment, toggleTradeStatus, features, toggleApplication, safeDateDay, safeDateNum, safeDateMonth, renderOfficialsRow, masterUmpires }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black uppercase">{t.mySchedule}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {myAssignedGames.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowMyGamesExport(!showMyGamesExport)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"><CalendarPlus className="w-4 h-4" /> {t.downloadCalendar} <ChevronDown className="w-3 h-3" /></button>
              {showMyGamesExport && (
                <><div className="fixed inset-0 z-10" onClick={() => setShowMyGamesExport(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { generateICS(myAssignedGames); setShowMyGamesExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex flex-col gap-0.5"><span className="text-xs font-black text-slate-700">{t.formatICS}</span><span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextICS}</span></button>
                    <button onClick={() => { generateCSV(myAssignedGames); setShowMyGamesExport(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5"><span className="text-xs font-black text-slate-700">{t.formatCSV}</span><span className="text-[10px] font-bold text-slate-400 normal-case">{t.subtextCSV}</span></button>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
             <button onClick={() => setMyGamesViewMode('list')} className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
             <button onClick={() => setMyGamesViewMode('calendar')} className={`p-2 rounded-lg transition-all ${myGamesViewMode === 'calendar' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><CalendarIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start mb-6">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-medium text-blue-800 leading-relaxed">{t.myGamesReminder}</p>
      </div>

      {!user || !user.email ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><CalendarIcon className="w-8 h-8 text-blue-600" /></div><p className="text-slate-500 font-medium mb-6">{t.loginRequiredMsg}</p></div>
      ) : myGamesViewMode === 'calendar' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-800 uppercase tracking-tight">{t.months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">IDAG</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-colors shadow-sm"><ChevronRight className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100">{(t.days || []).map((d, i) => (<div key={i} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-r last:border-r-0 border-slate-50">{d}</div>))}</div>
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
                            <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-400'}`}>{day.getDate()}</span>
                            <div className="mt-2 space-y-1">
                              {myMatches.map(g => {
                                const myAsg = groupedAssignments[g.id]?.find(a => a.userId === umpireId);
                                const isAssigned = myAsg !== undefined;
                                const isPending = myAsg?.pendingChange;
                                return (
                                  <div key={g.id} onClick={() => setSelectedGameDetails(g)} className={`w-full text-left p-1 rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${isPending ? 'border-yellow-300 bg-yellow-50' : isAssigned ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-white'}`}>
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
                <div key={game.id} onClick={() => setSelectedGameDetails(game)} className={`bg-white p-4 sm:p-5 rounded-2xl border ${myAsg?.pendingChange ? 'border-yellow-400 shadow-sm shadow-yellow-100 ring-2 ring-yellow-400/20' : 'border-green-200 hover:shadow-md'} flex flex-col gap-3 cursor-pointer transition-all group`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${myAsg?.pendingChange ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'} shrink-0 transition-colors`}><CalendarIcon className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{game.away} @ {game.home}</p>
                        <p className="text-[11px] text-slate-500 font-black uppercase mt-1">{game.date} @ {game.time} • {game.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       {myAsg?.pendingChange ? (<div className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start sm:self-end w-fit shadow-sm">{t.timeChangedBadge}</div>) : (<div className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase self-start sm:self-end w-fit">{t.confirmed}</div>)}
                       {myAsg && !myAsg.pendingChange && features.marketplace && (
                         myAsg.forTrade ? (
                            <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, false); }} className="text-[10px] font-black uppercase bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors w-fit">{t.cancelTrade}</button>
                         ) : (
                            <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(myAsg.id, true); }} className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1 w-fit"><ArrowRightLeft className="w-3 h-3" /> {t.tradeGame}</button>
                         )
                       )}
                    </div>
                  </div>

                  {myAsg?.pendingChange && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-2 flex flex-col gap-3">
                      <p className="text-xs font-bold text-yellow-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t.matchMovedWarning}</p>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={(e) => { e.stopPropagation(); confirmScheduleChange(myAsg.id); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.acceptTime}</button>
                        <button onClick={(e) => { e.stopPropagation(); removeAssignment(game.id, umpireId); }} className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-sm">{t.declineTime}</button>
                      </div>
                    </div>
                  )}

                  {renderOfficialsRow(game, gameAssignments, masterUmpires)}

                  <div className="pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                     <a href={getGoogleCalendarLink(game)} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">+ Google</a>
                     <a href={getOutlookCalendarLink(game)} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">+ Outlook</a>
                     <button onClick={(e) => { e.stopPropagation(); generateICS([game]); }} className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">.ICS</button>
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-6">
                {pendingAssignedGames.length > 0 && (
                  <div className="bg-yellow-50/50 p-4 rounded-3xl border border-yellow-200 shadow-inner">
                    <h3 className="text-sm font-black text-yellow-700 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> {t.actionRequired}</h3>
                    <div className="space-y-4">{pendingAssignedGames.map(renderGameCard)}</div>
                  </div>
                )}
                {confirmedAssignedGames.length > 0 && (
                  <div>
                    {pendingAssignedGames.length > 0 && <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 mt-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t.confirmedGames}</h3>}
                    <div className="space-y-4">{confirmedAssignedGames.map(renderGameCard)}</div>
                  </div>
                )}
              </div>
            );
          })()}
          
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">{t.interestedGames}</h3>
            {myInterestedGames.map(game => (
              <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-2 cursor-pointer hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-400"><CalendarIcon className="w-5 h-5" /></div>
                  <div><p className="font-bold text-slate-900">{game.away} @ {game.home}</p><p className="text-[10px] text-slate-400 font-black uppercase">{game.date} @ {game.time}</p></div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AdminView({ t, selectedYear, handleDownloadBackup, showImportTool, setShowImportTool, bulkInput, setBulkInput, handleBulkImport, setShowEmailPreview, editNoteText, setEditNoteText, saveGlobalNote, clearGlobalNote, masterUmpires, isSuperAdmin, adminUmpireIds, toggleUmpireAdmin, deleteMasterUmpire, editingUmpireId, setEditingUmpireId, tempEditName, setTempEditName, tempEditLevel, setTempEditLevel, tempEditEmail, setTempEditEmail, showManualEmailInput, setShowManualEmailInput, unconnectedEmails, updateMasterUmpire, mailQueue, forceSendQueue, syncing, showStaffed, setShowStaffed, filteredGames, groupedAssignments, applications, editingGameData, setEditingGameData, saveEditedGame, setSelectedGameDetails, handleDeleteGame, getLeagueStyles, safeDateDay, safeDateNum, safeDateMonth, getAssignmentStatusStyles, renderOfficialsRow, removeAssignment, assignUmpire, umpireId, today }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left"><h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2><p className="text-xs text-slate-500">{selectedYear} Season</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDownloadBackup} className="bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 shadow-sm"><Download className="w-4 h-4" /> {t.downloadBackup}</button>
          <button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-sm text-xs uppercase"><Plus className="w-4 h-4" /> {t.bulkImport}</button>
          <button onClick={() => setShowEmailPreview(true)} className="bg-blue-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg text-xs uppercase"><Mail className="w-4 h-4" /> {t.sendSchedules}</button>
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
        <textarea value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} placeholder={t.announcementPlaceholder} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px]" />
        <div className="flex gap-2 mt-3"><button onClick={saveGlobalNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.saveAnnouncement}</button><button onClick={clearGlobalNote} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs uppercase">{t.clearAnnouncement}</button></div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> {t.masterList}</h3>
          {isSuperAdmin && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1"><Shield className="w-3 h-3" /> Master Admin</span>}
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {masterUmpires.map(u => (
            <div key={u.id} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              {editingUmpireId === u.id ? (
                <div className="flex flex-1 gap-2 flex-wrap sm:flex-nowrap">
                  <input type="text" value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} className="flex-1 min-w-[120px] bg-white border border-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold outline-none" />
                  <select value={tempEditLevel} onChange={(e) => setTempEditLevel(e.target.value)} className="w-32 bg-white border border-blue-300 px-2 py-1.5 rounded-lg text-sm font-bold outline-none"><option value="">- {t.level} -</option>{['Internationell', 'Elit', 'Nationell', 'Region', 'Förening'].map(l => <option key={l} value={l}>{l}</option>)}</select>
                  {!showManualEmailInput ? (
                    <select value={tempEditEmail} onChange={(e) => { if (e.target.value === 'MANUAL_ENTRY') { setShowManualEmailInput(true); setTempEditEmail(''); } else { setTempEditEmail(e.target.value); } }} className="flex-1 min-w-[150px] bg-white border border-blue-300 px-2 py-1.5 rounded-lg text-sm font-bold outline-none">
                      <option value="">{t.selectEmail}</option>{unconnectedEmails.map(email => <option key={email} value={email}>{email}</option>)}{tempEditEmail && !unconnectedEmails.includes(tempEditEmail) && tempEditEmail !== 'MANUAL_ENTRY' && <option value={tempEditEmail}>{tempEditEmail}</option>}<option value="MANUAL_ENTRY">{t.otherEmail}</option>
                    </select>
                  ) : (
                    <div className="flex-1 flex items-center min-w-[150px] relative">
                      <input type="email" value={tempEditEmail} onChange={(e) => setTempEditEmail(e.target.value)} placeholder={t.linkEmailPlaceholder} className="w-full bg-white border border-blue-300 px-3 py-1.5 pr-8 rounded-lg text-sm font-bold outline-none" />
                      <button onClick={() => { setShowManualEmailInput(false); setTempEditEmail(''); }} className="absolute right-2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  <div className="flex gap-1 items-center">
                    <button onClick={async () => { await updateMasterUmpire(u.id, tempEditName, tempEditLevel, tempEditEmail); setEditingUmpireId(null); }} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingUmpireId(null)} className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">{u.name}</span>{u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLeagueStyles(u.level)}`}>{u.level}</span>}{(adminUmpireIds || []).includes(u.id) && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-black ml-1 flex items-center gap-0.5"><Shield className="w-2 h-2" /> Admin</span>}</div>
                    <div className="flex items-center gap-4 mt-1">{u.linkedEmail ? <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t.linkedAccount} {u.linkedEmail}</span> : <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Info className="w-3 h-3" /> {t.notLinked}</span>}</div>
                  </div>
                  <div className="flex gap-1 items-start">
                    {isSuperAdmin && <button onClick={() => toggleUmpireAdmin(u.id)} className={`p-1.5 rounded-lg transition-colors ${(adminUmpireIds || []).includes(u.id) ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><Shield className="w-4 h-4" /></button>}
                    <button onClick={() => { setEditingUmpireId(u.id); setTempEditName(u.name || ''); setTempEditLevel(u.level || ''); setTempEditEmail(u.linkedEmail || ''); setShowManualEmailInput(false); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteMasterUmpire(u.id, u.name, u.linkedEmail)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {mailQueue.length > 0 && isSuperAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
            <p className="text-sm font-bold text-yellow-800 flex-1 leading-relaxed">{t.pendingEmailsQueued.replace('{count}', mailQueue.length)}</p>
            <button onClick={forceSendQueue} disabled={syncing} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50">{syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.sendQueuedNow}</button>
          </div>
        )}

        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-600" /> {t.pendingAssignments}</h3>
          <button onClick={() => setShowStaffed(!showStaffed)} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${showStaffed ? 'bg-slate-800 text-white shadow-md hover:bg-black' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}><CheckCircle className="w-3.5 h-3.5" />{showStaffed ? t.hideStaffed : t.showAll}</button>
        </div>
        
        {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
          const applicants = applications.filter(a => a.gameId === game.id);
          const gameAssignments = groupedAssignments[game.id] || [];
          const required = game.requiredUmpires || 2;
          const isEditingThisGame = editingGameData?.id === game.id;
          const isFullyStaffed = gameAssignments.length >= required;

          return (
            <div key={game.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isFullyStaffed && !isEditingThisGame ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center hover:bg-slate-100/50 cursor-pointer transition-colors" onClick={() => setSelectedGameDetails(game)}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getLeagueStyles(game.league)}`}>{game.league}</span>
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
    </div>
  );
}

function AuthModal({ t, setShowAuthModal, handleAuthSubmit, authEmail, setAuthEmail, authPassword, setAuthPassword, isLoginMode, setIsLoginMode, authError, setAuthError, handleResetPassword }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 relative">
        <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
        <div className="text-center space-y-2"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-blue-600" /></div><h3 className="text-2xl font-black text-slate-800 leading-tight">{t.appTitle}</h3><p className="text-xs text-slate-400 font-medium">{isLoginMode ? t.loginToContinue : t.createAnAccount}</p></div>
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 break-words">{authError}</div>}
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.email}</label><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm mt-1" placeholder="namn@exempel.se" /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.password}</label><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm mt-1" placeholder="••••••••" /></div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">{isLoginMode ? t.login : t.register}</button>
        </form>
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
          <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">{isLoginMode ? t.noAccount : t.hasAccount}</button>
          {isLoginMode && <button onClick={handleResetPassword} type="button" className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors mt-2">{t.forgotPassword}</button>}
        </div>
      </div>
    </div>
  );
}

function NamePromptModal({ t, setShowNamePrompt, searchQuery, setSearchQuery, filteredMasterUmpires, setUserName, setUmpireId, updateProfile, isAddingNew, setIsAddingNew, tempEditName, setTempEditName, addMasterUmpire, getLevelStyles }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20">
        <div className="text-center space-y-2"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><UserCheck className="w-8 h-8 text-blue-600" /></div><h3 className="text-2xl font-black text-slate-800 leading-tight">{t.nameRequiredTitle}</h3><p className="text-xs text-slate-400 font-medium leading-relaxed">{t.nameRequiredDesc}</p></div>
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
                  <button key={u.id} onClick={async () => { setUserName(u.name); setUmpireId(u.id); await updateProfile(u.name, u.id); setShowNamePrompt(false); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">{u.name}</span>{u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}</div>
                    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))
              ) : (<div className="p-4 text-center"><p className="text-xs text-slate-400 font-medium italic">{t.noGames}</p></div>)}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button onClick={() => setIsAddingNew(!isAddingNew)} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase hover:underline"><Plus className="w-3 h-3" /> {t.addNewName}</button>
            {isAddingNew && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <input type="text" autoFocus value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} placeholder="För- och efternamn" className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-sm outline-none" />
                <button onClick={async () => { if (tempEditName.trim()) { const newId = await addMasterUmpire(tempEditName); setUserName(tempEditName); setUmpireId(newId); await updateProfile(tempEditName, newId); setTempEditName(''); setIsAddingNew(false); setShowNamePrompt(false); } }} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200">{t.createUmpire}</button>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setShowNamePrompt(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">{t.cancel}</button>
      </div>
    </div>
  );
}

function AdminModal({ t, user, userName, umpireId, isAdmin, isSuperAdmin, features, toggleSystemFeature, masterUmpires, toggleUmpireReminderPref, forceRunRemindersNow, setShowAdminModal, logoutUmpire }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl animate-in zoom-in border border-white/20 overflow-y-auto max-h-[90vh]">
        <div><h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3><p className="text-xs text-slate-400 font-medium tracking-wider uppercase">{user?.email}</p></div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.displayName}</p><p className="text-sm font-bold text-slate-800">{userName || t.setProfile}</p></div>
            <button onClick={logoutUmpire} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 font-black text-[10px] uppercase"><LogOut className="w-4 h-4" /> {t.logout}</button>
          </div>
          {features.reminders && umpireId && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.reminderPreferences}</p><p className="text-xs font-bold text-slate-700">{t.receiveReminders}</p></div>
              <button onClick={() => toggleUmpireReminderPref(umpireId, (masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled)} className={`p-2 rounded-xl transition-colors flex items-center justify-center ${(masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled !== false ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-slate-200 text-slate-400'}`}>{(masterUmpires.find(u => u.id === umpireId) || {}).remindersEnabled !== false ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}</button>
            </div>
          )}
          {isAdmin && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" /><div><p className="text-xs font-black text-blue-800 uppercase tracking-widest">Admin</p><p className="text-[10px] text-blue-600 font-medium">Behörighet beviljad via e-post</p></div>
            </div>
          )}
          {isSuperAdmin && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-4"><Sliders className="w-4 h-4" /> {t.superAdminSettings}</h4>
              <button onClick={() => toggleSystemFeature('marketplace')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-xs font-bold text-purple-900">{t.featureMarketplace}</span><div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.marketplace ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.marketplace ? 'translate-x-5' : 'translate-x-0'}`} /></div></button>
              <button onClick={() => toggleSystemFeature('evaluations')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-xs font-bold text-purple-900">{t.featureEvaluations}</span><div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.evaluations ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.evaluations ? 'translate-x-5' : 'translate-x-0'}`} /></div></button>
              <button onClick={() => toggleSystemFeature('reminders')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-xs font-bold text-purple-900">{t.featureReminders}</span><div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.reminders ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.reminders ? 'translate-x-5' : 'translate-x-0'}`} /></div></button>
              {features.reminders && <button onClick={forceRunRemindersNow} className="w-full mt-2 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> {t.runRemindersNow}</button>}
            </div>
          )}
        </div>
        <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-sm">{t.close}</button>
      </div>
    </div>
  );
}

function GameDetailsModal({ t, selectedGameDetails, setSelectedGameDetails, groupedAssignments, getLeagueStyles }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
        <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
        <div className="space-y-6 pt-4">
          <div>
            <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLeagueStyles(selectedGameDetails.league)}`}>{selectedGameDetails.league}</span>
            <h3 className="text-2xl font-black mt-3">{selectedGameDetails.away} @ {selectedGameDetails.home}</h3>
            <p className="text-sm text-slate-500 font-bold uppercase mt-1">{selectedGameDetails.date} @ {selectedGameDetails.time}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center">
            <div><p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p><p className="font-bold text-blue-900">{selectedGameDetails.location}</p></div>
            <a href={`https://www.google.com/maps/search/?api=1&query=$?q=$${selectedGameDetails.location}`} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors"><Map className="w-4 h-4"/> {t.mapDirections}</a>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400">{t.crew}</h4>
            {(groupedAssignments[selectedGameDetails.id] || []).map(asg => (
              <div key={asg.userId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"><span className="font-bold">{asg.userName}</span></div>
            ))}
            {(groupedAssignments[selectedGameDetails.id] || []).length === 0 && <p className="text-xs italic text-slate-400">{t.notAssigned || "Inga domare tillsatta än."}</p>}
          </div>
          <button onClick={() => setSelectedGameDetails(null)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-xs hover:bg-slate-200 transition-colors">{t.close}</button>
        </div>
      </div>
    </div>
  );
}

// Export the application wrapped in ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
