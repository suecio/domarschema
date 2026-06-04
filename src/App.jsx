import React, { useState, useEffect, useMemo, Component } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, deleteDoc, writeBatch, addDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInAnonymously, signInWithCustomToken, signOut } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { Calendar as CalendarIcon, Shield, CheckCircle, Clock, Settings, Trash2, MapPin, RefreshCw, Trophy, FileText, Plus, ChevronDown, ChevronUp, Search, BarChart3, History as HistoryIcon, Info, User, UserPlus, Download, UserCheck, Edit2, LogOut, ChevronRight, List, ChevronLeft, ArrowUp, X, AlertTriangle, ArrowLeft, Megaphone, MessageCircle, Code, Send, Map, Mail, ArrowRightLeft, Star, Navigation, Bell, BellOff, Sliders, Calculator, Printer, Car, CreditCard, Save, Camera } from 'lucide-react';

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
  sv: { appTitle: "Domarportalen", season: "Säsong", schedule: "Spelschema", myGames: "Mina Matcher", myProfile: "Min profil", umpireList: "Domarlista", staffing: "Bemanning", analytics: "Statistik", history: "Historik", upcoming: "Kommande", archived: "Arkiverade matcher", activeSchedule: "Aktivt schema", searchPlaceholder: "Sök matcher...", allSeries: "Alla serier", allLocations: "Alla platser", filterStatusAll: "Alla statusar", needsUmpire: "Saknar domare", noInterests: "Inga anmälningar", noGames: "Inga matcher hittades.", syncNow: "Synka förbundsdata nu", applied: "Anmälda", interested: "Intresserad", withdraw: "Dra tillbaka", assignedTo: "Tillsatta", staffed: "Bemannad", partiallyStaffed: "Delvis bemannad", bulkImport: "Massimport", pendingAssignments: "Bemanningsöversikt", staffingControl: "Bemanningskontroll", hideStaffed: "Dölj helt bemannade", showAll: "Visa alla matcher", removeAssignment: "Ta bort", deleteGame: "Ta bort match", deleteAllGames: "Rensa hela säsongen", deleteAllConfirm: "ÄR DU HELT SÄKER?", deleteAllSuccess: "Säsongen har rensats.", downloadBackup: "Ladda ner backup", umpire: "Domare", interests: "Intresseanmälningar", gamesAssigned: "Dömda matcher", assignmentRate: "Tillsättningsgrad", noStats: "Ingen data finns registrerad än.", mySchedule: "Mitt Schema", noAssignedMatches: "Du har inga bekräftade matchuppdrag än.", noPendingInterest: "Du har inte anmält intresse för några matcher.", confirmed: "Bekräftad", settings: "Inställningar", userSettings: "Användarinställningar", profileAccess: "Konfigurera profil & åtkomst", displayName: "Visningsnamn", namePlaceholder: "Sök eller skriv ditt namn...", logout: "Logga ut", close: "Stäng", status: "Status", setProfile: "Välj din profil", pasteSheet: "Klistra in från Google Sheets", addGames: "Lägg till matcher", importSuccess: "Import lyckades", cancel: "Avbryt", date: "Datum", crew: "Domarteam", addToCalendar: "Spara i kalender", downloadFullSchedule: "Ladda ner (.ICS)", confirmedGames: "Bekräftade uppdrag", interestedGames: "Anmält intresse", nameRequiredTitle: "Vem är du?", nameRequiredDesc: "Välj ditt namn från listan nedan för att koppla ditt konto till dina matcher.", saveName: "Välj profil", addNewName: "Hittar du inte ditt namn?", createUmpire: "Skapa ny profil", masterList: "Domarlista", editName: "Ändra namn", save: "Spara", selectFromList: "Välj från listan", changeUser: "Byt användare", editMatch: "Ändra matchdata", home: "Hemma", away: "Borta", time: "Tid", location: "Plats", locations: "Platser", league: "Serie", saveChanges: "Spara ändringar", listView: "Lista", calendarView: "Kalender", days: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"], months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"], requiredUmpires: "Antal domare", level: "Nivå", name: "Namn", sortBy: "Sortera", week: "V.", login: "Logga in", register: "Skapa konto", email: "E-postadress", phone: "Telefonnummer", password: "Lösenord", loginToContinue: "Logga in för att fortsätta", noAccount: "Inget konto? Registrera dig här", hasAccount: "Har du redan ett konto? Logga in", adminManagement: "Administratörer", masterAdminInfo: "Du är inloggad som Master Admin.", linkedAccount: "Konto:", notLinked: "Inget konto", umpireProfile: "Domarprofil", back: "Tillbaka", assignedMatches: "Tillsatta matcher", totalAssignments: "Tillsättningar", totalInterests: "Intresseanmälningar", deleteUmpireConfirm: "Är du säker på att du vill ta bort", globalAnnouncement: "Globalt Meddelande", saveAnnouncement: "Publicera", clearAnnouncement: "Ta bort", announcementPlaceholder: "Skriv ett viktigt meddelande som visas för alla...", bookedIn: "Bokad i", coUmpires: "Dömer med:", noCoUmpires: "Inga meddomare", calendarColumn: "Kalender", gameDetails: "Matchinformation", mapDirections: "Öppna Karta", officials: "Domarteam", supervisor: "Supervisor", techComm: "Technical Commissioner", notAssigned: "Ej tillsatt", yourGame: "Din match", marketplace: "Marknad", marketplaceDesc: "Här visas matcher som andra vill byta bort och matcher som saknar domare.", tradeGame: "Byt bort", cancelTrade: "Ångra byte", takeGame: "Ta match", expressInterest: "Anmäl intresse", gamesForTrade: "Matcher som bytes bort", missingUmpires: "Matcher som saknar domare", noMarketplaceGames: "Inga matcher på marknaden just nu.", tradeSuccess: "Du har tagit över matchen!", tradeConfirm: "Är du säker på att du vill ta över denna match?", evaluate: "Utvärdera", grade: "Betyg", feedback: "Feedback", saveEval: "Spara utvärdering", evalSaved: "Utvärdering sparad", yourEval: "Utvärdering", selectAdmin: "Välj Admin...", enterTCName: "Ange namn på TC...", umpireShort: "DOMARE", supShort: "SUP", tcShort: "TC", address: "Adress", facilities: "Faciliteter", noFacilities: "Inga faciliteter", addFacility: "Lägg till facilitet...", editLocation: "Redigera plats", matchMovedWarning: "Match flyttad! Bekräfta om du kan den nya tiden.", acceptTime: "Acceptera ny tid", declineTime: "Kan inte (Avboka)", timeChangedBadge: "Tid Ändrad", actionRequired: "Kräver åtgärd", superAdminSettings: "Systemarkitektur (Super Admin)", featureMarketplace: "Aktivera Marknadsplats", featureEvaluations: "Aktivera Utvärderingar", featureReminders: "E-postpåminnelser", reminderPreferences: "Mina Notiser", receiveReminders: "Få e-postpåminnelser", runRemindersNow: "Kör Påminnelser Nu", invoiceTitle: "Reseräkning", digitalSubmission: "Digital inlämning", personalInfo: "Personuppgifter", pnr: "Personnummer", streetAddress: "Gatuadress", zipCity: "Postnummer & Ort", bankAccount: "Bank & Kontonummer", tripsAllowance: "Resor (Milersättning & Restid)", assignmentDetails: "Ändamål (Vilka lag spelade?)", travelFrom: "Resa Från", travelTo: "Resa Till", roundTrip: "Tur & Retur", distanceMil: "Antal Mil", calcAuto: "Beräkna avstånd (Auto)", calculating: "Beräknar...", addTrip: "Lägg till ytterligare en resa", expensesAllowance: "Övriga Utlägg & Traktamente", description: "Beskrivning", amount: "Belopp (kr)", addExpense: "Lägg till utlägg", overnightNights: "Övernattningstraktamente (Antal nätter)", advanceDeduction: "Avgår förskott (kr)", summary: "Sammanställning", mileageComp: "Milersättning", travelTimeComp: "Tilläggsarvode (Lång resa)", overnightComp: "Övernattningstraktamente", otherExpenses: "Övriga Utlägg", totalToReceive: "Totalt att erhålla", downloadPDF: "Ladda ner PDF", sendToFed: "Skicka till Förbundet", sendToSelf: "Skicka test till mig", sentSuccess: "Insänt & Klart!", sentSuccessFed: "Din reseräkning har skickats in till Förbundet.", sentSuccessSelf: "En kopia har skickats till din e-post.", newInvoice: "Skapa ny reseräkning", selectGame: "-- Välj en av dina matcher --", homeLocation: "Hem", homeAddressLabel: "Hemadress", foundAssignments: "Hämta från schema:", pastInvoices: "Tidigare reseräkningar", historicalStats: "Historisk Statistik (Tidigare säsonger)", historicalGames: "Totalt dömda matcher", historicalNote: "Datan kan redigeras av administratörer.", streetAddressHidden: "Gatuadress (Dold för andra)", cityPublic: "Ort (Offentlig)", changePicture: "Byt bild", backToUmpireList: "Tillbaka till Domarlistan", contactInfo: "Kontaktuppgifter", notProvided: "Ej angivet", homeAddress1: "Hemadress 1", cityPlaceholder: "Stockholm", saveDetails: "Spara uppgifter", assignedMatchesCount: "tillsatta matcher", updateHistory: "Uppdatera historik", fillFromTo: "Fyll i både 'Från' och 'Till' för att kunna beräkna avståndet automatiskt.", addressMissing: "Gatuadress och postort saknas.", coordsMissing: "Kunde inte hitta exakta koordinater.", routeMissing: "Kunde inte hitta en giltig körrutt.", autoCalcFailed: "Automatisk beräkning misslyckades. Skriv in avståndet manuellt.", errorOccurred: "Ett fel uppstod. Vänligen försök igen.", testInvoiceSentTo: "I test-syfte har reseräkningen skickats till", savedSuccess: "Sparat!", conflictApply: "Kan inte anmäla! Du är redan bokad i {location} den här dagen.", interestRegistered: "Intresse anmält! Administratörerna ser nu din anmälan.", conflictAssign: "Kan inte tillsätta! {name} är redan bokad i {location} den här dagen.", sandboxLoaded: "50 test-matcher har laddats in i Sandbox!", downloadICS: "Ladda ner (.ICS)", availabilityWarningTitle: "Sista datum för att anmäla tillgänglighet är idag.", availabilityWarningDesc1: "Har man inte lämnat in sin tillgänglighet så får man inga matcher den kommande säsongen.", availabilityWarningDesc2: "Vi tillsätter fram tills sista Juni.", assigned: "TILLSATTA", takeOverFrom: "Ta över från", spotsAvailable: "plats(er) lediga", noInterestsYet: "Inga intresseanmälningar ännu.", currentCrew: "Aktuellt Domarteam", noUmpiresAssigned: "Inga domare tillsatta.", manualAssign: "+ Manuell tilldelning...", assignBtn: "Tilldela", removeBtn: "Ta bort", pasteSchedulePlaceholder: "Klistra in spelschema...", unknown: "Okänd", sandboxWarning: "SANDBOX-MILJÖ - INGEN DATA SPARAS TILL PRODUKTION", deleteAvatarConfirm: "Vill du verkligen ta bort din profilbild?", deleteAvatar: "Ta bort bild", open: "Öppna", droveCar: "Egen bil", carpooling: "Samåker", invoiceCommentLabel: "Övriga kommentarer", invoiceCommentPlaceholder: "T.ex. privat övernattning, samåker med [Namn], eller avvikande rutt...", receiptsReminder: "OBS! Om du har övriga utlägg, glöm inte att maila kvittona separat till info@sbslf.se.", nonUmpire: "Ej domare", economy: "Ekonomi", economyDesc: "Hantera alla inskickade reseräkningar", statusNotPaid: "Ej betald", statusPaid: "Utbetald", statusVoid: "Makulerad", exportSummary: "Exportera (CSV)", fedAdminSettings: "Förbundsadmins (E-postadresser, kommaseparerade)" },
  en: { appTitle: "Umpire Portal", season: "Season", schedule: "Schedule", myGames: "My Games", myProfile: "My Profile", umpireList: "Umpire List", staffing: "Staffing", analytics: "Analytics", history: "History", upcoming: "Upcoming", archived: "Archived Games", activeSchedule: "Active Schedule", searchPlaceholder: "Search...", allSeries: "All Series", allLocations: "All Locations", filterStatusAll: "All Statuses", needsUmpire: "Needs Umpire", noInterests: "No Interests", noGames: "No games found.", syncNow: "Sync Federation Data Now", applied: "Interested", interested: "Interested", withdraw: "Withdraw", assignedTo: "Crew", staffed: "Fully Staffed", partiallyStaffed: "Partially Staffed", bulkImport: "Bulk Import", pendingAssignments: "Staffing Desk", staffingControl: "Staffing Control", hideStaffed: "Hide Fully Staffed", showAll: "Show All Games", removeAssignment: "Remove", deleteGame: "Delete Game", deleteConfirm: "Are you sure you want delete this game?", deleteAllGames: "Clear Entire Season", deleteAllConfirm: "ARE YOU ABSOLUTELY SURE?", deleteAllSuccess: "Season cleared successfully.", downloadBackup: "Download Backup (JSON)", umpire: "Umpire", interests: "Interests", gamesAssigned: "Games Assigned", assignmentRate: "Assignment Rate", noStats: "No engagement data recorded yet.", mySchedule: "My Schedule", noAssignedMatches: "You have no confirmed assignments yet.", noPendingInterest: "You haven't marked interest in any matches.", confirmed: "Confirmed", settings: "Settings", userSettings: "User Settings", profileAccess: "Configure profile & access", displayName: "Display Name", namePlaceholder: "Search or type name...", logout: "Logout", close: "Close", status: "Status", setProfile: "Select Your Profile", pasteSheet: "Paste from Google Sheets", addGames: "Add Games", importSuccess: "Import Successful", cancel: "Cancel", date: "Date", crew: "Umpire Crew", addToCalendar: "Add to Calendar", downloadFullSchedule: "Download (.ics)", confirmedGames: "Confirmed Assignments", interestedGames: "Interested Matches", nameRequiredTitle: "Who are you?", nameRequiredDesc: "Select your name from the list below to sync your schedule across devices.", saveName: "Select Profile", addNewName: "Can't find your name?", createUmpire: "Create new profile", masterList: "Umpire Master List", editName: "Edit Name", save: "Save", selectFromList: "Select from list", changeUser: "Change User", editMatch: "Edit Match Details", home: "Home", away: "Away", time: "Time", location: "Location", locations: "Locations", league: "League", saveChanges: "Save Changes", listView: "List", calendarView: "Calendar", days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], requiredUmpires: "Crew Size", level: "Level", name: "Name", sortBy: "Sort by", week: "W.", login: "Login", register: "Register", email: "Email Address", phone: "Phone Number", password: "Password", forgotPassword: "Forgot Password?", loginToContinue: "Login to continue", createAnAccount: "Create a new account", noAccount: "No account? Register here", hasAccount: "Already have an account? Login", loginRequiredMsg: "You must be logged in to view this.", adminManagement: "Admin Roles", masterAdminInfo: "You are logged in as Master Admin.", linkedAccount: "Account:", notLinked: "No account", umpireProfile: "Umpire Profile", back: "Back", assignedMatches: "Assigned Matches", totalAssignments: "Assignments", totalInterests: "Interests", deleteUmpireConfirm: "Are you sure you want to remove", globalAnnouncement: "Global Announcement", saveAnnouncement: "Publish", clearAnnouncement: "Clear", announcementPlaceholder: "Type an important message...", bookedIn: "Booked in", coUmpires: "Co-umpires:", noCoUmpires: "No co-umpires", calendarColumn: "Calendar", gameDetails: "Game Details", mapDirections: "Open Map", officials: "Officials", supervisor: "Supervisor", techComm: "Technical Commissioner", notAssigned: "Not Assigned", yourGame: "Your Game", marketplace: "Marketplace", marketplaceDesc: "Find games that other umpires are giving away or games missing umpires.", tradeGame: "Give Away", cancelTrade: "Cancel Give Away", takeGame: "Take Game", expressInterest: "Express Interest", gamesForTrade: "Games Up For Trade", missingUmpires: "Games missing umpires", noMarketplaceGames: "No games are up for trade right now.", tradeSuccess: "You have taken over the game!", tradeConfirm: "Are you sure you want to take over this game?", evaluate: "Evaluate", grade: "Grade", feedback: "Feedback / Comment", saveEval: "Save Evaluation", evalSaved: "Evaluation Saved", yourEval: "Evaluation", selectAdmin: "Select Admin...", enterTCName: "Enter TC name...", umpireShort: "UMP", supShort: "SUP", tcShort: "TC", address: "Address", facilities: "Facilities", noFacilities: "No facilities listed", addFacility: "Add facility...", editLocation: "Edit Location", matchMovedWarning: "Game Rescheduled! Please confirm if you can make the new time.", acceptTime: "Accept New Time", declineTime: "Cannot Make It", timeChangedBadge: "Time Changed", actionRequired: "Action Required", superAdminSettings: "System Architecture (Super Admin)", featureMarketplace: "Enable Marketplace", featureEvaluations: "Enable Evaluation System", featureReminders: "Automated Email Reminders", reminderPreferences: "My Notifications", receiveReminders: "Receive email reminders for my upcoming games", runRemindersNow: "Run Reminders Cron", invoiceTitle: "Travel Invoice", digitalSubmission: "Digital Submission", personalInfo: "Personal Information", pnr: "Personal ID (PNR)", streetAddress: "Street Address", zipCity: "Zip Code & City", bankAccount: "Bank Account", tripsAllowance: "Trips (Mileage & Travel Time)", assignmentDetails: "Assignment", travelFrom: "Travel From", travelTo: "Travel To", roundTrip: "Round Trip", distanceMil: "Distance (Mil)", calcAuto: "Calculate Distance", calculating: "Calculating...", addTrip: "Add another trip", expensesAllowance: "Other Expenses & Allowance", description: "Description", amount: "Amount", addExpense: "Add Expense", overnightNights: "Overnight Allowance (Nights)", advanceDeduction: "Advance Deduction", summary: "Summary", mileageComp: "Mileage Compensation", travelTimeComp: "Travel Time Compensation", overnightComp: "Overnight Allowance", otherExpenses: "Other Expenses", totalToReceive: "Total to Receive", downloadPDF: "Download PDF", sendToFed: "Send to Federation", sendToSelf: "Send Test to Me", sentSuccess: "Submitted Successfully!", sentSuccessFed: "Your invoice has been submitted.", sentSuccessSelf: "A copy has been sent to your email.", newInvoice: "Create new invoice", selectGame: "-- Select an assigned game --", homeLocation: "Home", homeAddressLabel: "Home Address", foundAssignments: "Load from schedule:", pastInvoices: "Past Invoices", historicalStats: "Historical Stats", historicalGames: "Total officiated games", historicalNote: "Data can be edited by an admin.", streetAddressHidden: "Street Address (Hidden)", cityPublic: "City (Public)", changePicture: "Change Picture", backToUmpireList: "Back to Umpire List", contactInfo: "Contact Information", notProvided: "Not provided", homeAddress1: "Home Address 1", cityPlaceholder: "Stockholm", saveDetails: "Save Details", assignedMatchesCount: "assigned games", updateHistory: "Update History", fillFromTo: "Fill in both 'From' and 'To'.", addressMissing: "Street address and city are missing.", coordsMissing: "Could not find exact coordinates.", routeMissing: "Could not find a valid driving route.", autoCalcFailed: "Automatic calculation failed. Enter distance manually.", errorOccurred: "An error occurred.", testInvoiceSentTo: "For testing purposes, the invoice was sent to", savedSuccess: "Saved!", conflictApply: "Cannot apply! You are already booked in {location}.", interestRegistered: "Interest registered!", conflictAssign: "Cannot assign! {name} is already booked in {location}.", sandboxLoaded: "50 test games loaded into Sandbox!", downloadICS: "Download (.ICS)", availabilityWarningTitle: "Deadline for availability is today.", availabilityWarningDesc1: "If you have not submitted your availability, you will not receive games.", availabilityWarningDesc2: "We assign games until June.", assigned: "ASSIGNED", takeOverFrom: "Take over from", spotsAvailable: "spot(s) available", noInterestsYet: "No interests marked yet.", currentCrew: "Current Crew", noUmpiresAssigned: "No umpires assigned.", manualAssign: "+ Manual Assignment...", assignBtn: "Assign", removeBtn: "Remove", pasteSchedulePlaceholder: "Paste schedule here...", unknown: "Unknown", sandboxWarning: "SANDBOX ENVIRONMENT - NO DATA SAVED", deleteAvatarConfirm: "Are you sure you want to remove your profile picture?", deleteAvatar: "Remove picture", open: "Open", droveCar: "My Car", carpooling: "Carpool", invoiceCommentLabel: "Additional Comments", invoiceCommentPlaceholder: "E.g. private accommodation...", receiptsReminder: "NOTE! If you have additional expenses, email receipts to info@sbslf.se.", nonUmpire: "Non-umpire", economy: "Economy", economyDesc: "Manage all submitted travel invoices", statusNotPaid: "Not paid", statusPaid: "Paid", statusVoid: "Void", exportSummary: "Export (CSV)", fedAdminSettings: "Federation Admins (Emails, comma separated)" }
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

function PrintableInvoice({ data, t, containerId }) {
  if (!data) return null;
  const { personalInfo, trips, expenses, overnightCount, advance, calculated, invoiceComment, createdAt } = data;
  const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('sv-SE') : new Date().toLocaleDateString('sv-SE');

  return (
    <div id={containerId} className="hidden print:block w-[190mm] mx-auto text-black p-8 bg-white text-[12px] leading-snug">
      <table className="w-full mb-6">
        <tbody>
          <tr>
            <td className="align-bottom">
              <h1 className="text-2xl font-black tracking-widest uppercase">Reseräkning</h1>
              <p className="font-bold text-sm">Svenska Baseboll och Softboll Förbundet</p>
            </td>
            <td className="align-bottom text-right text-[10px]">
              <p>{t.date}: {dateStr}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full mb-6 text-[12px]">
        <tbody>
          <tr>
            <td className="py-1.5 w-1/2"><span className="font-bold">{t.name}:</span> {personalInfo?.name}</td>
            <td className="py-1.5 w-1/2"><span className="font-bold">{t.pnr}:</span> {personalInfo?.pnr}</td>
          </tr>
          <tr>
            <td className="py-1.5"><span className="font-bold">{t.streetAddress}:</span> {personalInfo?.address}</td>
            <td className="py-1.5"><span className="font-bold">{t.zipCity}:</span> {personalInfo?.zipCity}</td>
          </tr>
          <tr>
            <td className="py-1.5" colSpan="2"><span className="font-bold">{t.bankAccount}:</span> {personalInfo?.bank}</td>
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
          {(trips || []).map((trip, idx) => (
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

      {(expenses || []).some(e => e.description && e.amount) && (
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
                    <td className="border border-black p-1.5 text-right">{calculated?.milageCost} kr</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5">Tilläggsarvode</td>
                    <td className="border border-black p-1.5 text-right">{calculated?.travelBonus} kr</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5">Övernattning ({overnightCount || 0} st á 300kr)</td>
                    <td className="border border-black p-1.5 text-right">{calculated?.overnightCost} kr</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5">Övriga Utlägg</td>
                    <td className="border border-black p-1.5 text-right">{calculated?.totalExpenses} kr</td>
                  </tr>
                  {calculated?.advance > 0 && (
                    <tr>
                      <td className="border border-black p-1.5">Avgår förskott</td>
                      <td className="border border-black p-1.5 text-right">-{calculated.advance} kr</td>
                    </tr>
                  )}
                  <tr className="bg-gray-100 font-bold text-sm">
                    <td className="border border-black p-1.5">TOTALT ATT ERHÅLLA</td>
                    <td className="border border-black p-1.5 text-right">{calculated?.total} kr</td>
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
  );
}

function InvoiceReviewModal({ invoice, setInvoice, t }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = document.getElementById('admin-print-invoice-view');
      element.classList.remove('hidden');
      element.classList.remove('print:block');
      const opt = {
        margin: 10,
        filename: `Reserakning_${invoice.userName.replace(/\s+/g, '_')}_${new Date(invoice.createdAt).toLocaleDateString('sv-SE')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save().then(() => {
        element.classList.add('hidden');
        element.classList.add('print:block');
        setIsDownloading(false);
      });
    };
    document.body.appendChild(script);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl animate-in zoom-in-95 relative max-h-[90vh] flex flex-col overflow-hidden">
        <div className="relative pt-8 pb-4 px-8 text-center bg-slate-50 border-b border-slate-100 shrink-0">
           <button onClick={() => setInvoice(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 z-10"><X className="w-5 h-5"/></button>
           <h2 className="text-2xl font-black text-slate-800">Reseräkning: {invoice.userName}</h2>
           <p className="text-xs font-bold text-slate-500 mt-1">{new Date(invoice.createdAt).toLocaleDateString('sv-SE')}</p>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50">
           <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <PrintableInvoice data={invoice} t={t} containerId="admin-print-invoice-view" />
              <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-lg">Sammanställning</h3>
                   <span className="text-2xl font-black text-green-600">{invoice.total} kr</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Domare</h4>
                     <p className="font-bold text-sm">{invoice.personalInfo?.name}</p>
                     <p className="text-xs text-slate-600">{invoice.personalInfo?.pnr}</p>
                     <p className="text-xs text-slate-600">{invoice.personalInfo?.email}</p>
                   </div>
                   <div>
                     <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Utbetalning</h4>
                     <p className="font-bold text-sm">{invoice.personalInfo?.bank}</p>
                   </div>
                 </div>
                 <div className="mt-6 border-t border-slate-100 pt-6">
                   <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Resor</h4>
                   {invoice.trips?.map((t, idx) => (
                     <p key={idx} className="text-xs font-medium text-slate-700 mb-1">{t.date}: {t.from} till {t.to} ({t.distance} mil) - {t.assignment}</p>
                   ))}
                 </div>
              </div>
           </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3">
           <button onClick={() => setInvoice(null)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black uppercase text-xs hover:bg-slate-200">Stäng</button>
           <button onClick={handleDownloadPDF} disabled={isDownloading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-sm hover:bg-blue-700 flex items-center gap-2">
              {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Ladda ner som PDF
           </button>
        </div>
      </div>
    </div>
  );
}

function UmpireProfileModal({ selectedProfileId, setSelectedProfileId, masterUmpires, assignments, umpireId, isAdmin, t, getLevelStyles, db, appId }) {
  const umpireData = masterUmpires.find(u => u.id === selectedProfileId);
  const isMe = umpireId === selectedProfileId;
  const canEdit = isAdmin || isMe;
  const [editData, setEditData] = useState({ linkedEmail: '', phone: '', address: '', city: '', historicGames: 0, level: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     if (umpireData) {
        setEditData({
           linkedEmail: umpireData.linkedEmail || '', phone: umpireData.phone || '',
           address: umpireData.address || '', city: umpireData.city || '',
           historicGames: parseInt(umpireData.historicGames || 0), level: umpireData.level || ''
        });
     }
  }, [umpireData]);

  if (!umpireData) return null;

  const currentSeasonGames = assignments.filter(a => a.userId === selectedProfileId).length;

  const handleSave = async () => {
     setIsSaving(true);
     try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', selectedProfileId), {
           linkedEmail: editData.linkedEmail.trim().toLowerCase(), phone: editData.phone.trim(),
           address: editData.address.trim(), city: editData.city.trim(),
           historicGames: parseInt(editData.historicGames) || 0, level: editData.level.trim()
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
            if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', selectedProfileId), { avatarUrl: canvas.toDataURL('image/jpeg', 0.8) }, { merge: true });
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
        <div className="relative pt-12 pb-6 px-8 text-center bg-slate-50 border-b border-slate-100 shrink-0">
           <button onClick={() => setSelectedProfileId(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 z-10"><X className="w-5 h-5"/></button>
           <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                 {umpireData.avatarUrl ? <img src={umpireData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-blue-900">{(umpireData.name || '?').charAt(0)}</span>}
              </div>
              {canEdit && (
                <>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-md cursor-pointer hover:bg-blue-700" title={t.changePicture}>
                     <Camera className="w-4 h-4" />
                     <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {umpireData.avatarUrl && (
                    <button onClick={handleAvatarDelete} className="absolute bottom-0 left-0 bg-red-100 text-red-600 p-2.5 rounded-full shadow-md hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                  )}
                </>
              )}
           </div>
           <h2 className="text-3xl font-black text-slate-800">{umpireData.name}</h2>
           {umpireData.city && <p className="text-sm font-bold text-slate-500 mt-1 flex items-center justify-center gap-1"><MapPin className="w-3.5 h-3.5"/> {umpireData.city}</p>}
           <div className="mt-3 inline-block">
             <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase ${getLevelStyles(umpireData.level)}`}>{umpireData.level}</span>
           </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><User className="w-4 h-4" /> {t.contactInfo}</h3>
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.email}</label>
                   {canEdit ? <input type="email" value={editData.linkedEmail} onChange={e => setEditData({...editData, linkedEmail: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1 focus:border-blue-400" /> : <p className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 mt-1 break-all">{editData.linkedEmail || t.notProvided}</p>}
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.phone}</label>
                   {canEdit ? <input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none mt-1 focus:border-blue-400" /> : <p className="p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 mt-1">{editData.phone || t.notProvided}</p>}
                 </div>
                 {canEdit && (
                   <>
                     <div><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.streetAddressHidden}</label><input type="text" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none mt-1 focus:border-blue-400" /></div>
                     <div><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.cityPublic}</label><input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none mt-1 focus:border-blue-400" /></div>
                     <button onClick={handleSave} disabled={isSaving} className="w-full py-3 mt-2 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50">{isSaving ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} {t.saveDetails}</button>
                   </>
                 )}
               </div>
             </div>

             <div className="space-y-6">
               <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-sm">
                 <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Dömda matcher i år</h3>
                 <div className="flex items-end gap-3"><span className="text-5xl font-black">{currentSeasonGames}</span><span className="text-sm font-bold text-blue-200 pb-1">{t.assignedMatchesCount}</span></div>
               </div>

               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> {t.historicalStats}</h3>
                 <div className="space-y-4">
                   {isAdmin && (
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.level}</label>
                       <select value={editData.level} onChange={e => setEditData({...editData, level: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-blue-600 outline-none mt-1">
                         <option value="">-- {t.level} --</option><option value="Internationell">Internationell</option><option value="Elit">Elit</option><option value="Nationell">Nationell</option><option value="Region">Region</option><option value="Förening">Förening</option><option value={t.nonUmpire}>{t.nonUmpire}</option>
                       </select>
                     </div>
                   )}
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.historicalGames}</label>
                     {isAdmin ? <input type="number" value={editData.historicGames} onChange={e => setEditData({...editData, historicGames: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-blue-600 mt-1" /> : <p className="p-3 bg-white border border-slate-200 rounded-xl text-xl font-black text-slate-700 mt-1">{editData.historicGames} st</p>}
                   </div>
                   <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">{t.historicalNote}</p>
                   {isAdmin && <button onClick={handleSave} disabled={isSaving} className="w-full py-2 bg-slate-200 text-slate-700 font-black rounded-xl text-[10px] uppercase hover:bg-slate-300 disabled:opacity-50">{t.saveChanges}</button>}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Critical React Crash:", error, errorInfo); this.setState({ errorInfo }); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full text-center border border-red-100">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ett fel uppstod</h2>
            <pre className="text-red-700 text-xs font-mono whitespace-pre-wrap bg-red-50 p-4 rounded-xl text-left overflow-auto max-h-60 border border-red-200">
              {this.state.error?.toString()}{'\n'}{this.state.errorInfo?.componentStack}
            </pre>
            <button onClick={() => window.location.reload()} className="mt-8 bg-slate-800 text-white px-8 py-4 rounded-xl font-black uppercase text-xs hover:bg-black">Ladda om</button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

function TravelInvoiceView({ db, appId, locationsData, user, userName, t, myAssignedGames, myUmpireData, allInvoices }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentTarget, setSentTarget] = useState('');
  const [calculatingIndex, setCalculatingIndex] = useState(null);

  const [personalInfo, setPersonalInfo] = useState({ name: '', pnr: '', address: '', zipCity: '', bank: '', email: '' });
  const [trips, setTrips] = useState([{ id: Date.now(), date: '', assignment: '', from: '', to: '', distance: '', roundTrip: true, isDriver: true }]);
  const [expenses, setExpenses] = useState([{ id: Date.now(), description: '', amount: '' }]);
  const [advance, setAdvance] = useState('');
  const [overnightCount, setOvernightCount] = useState('');
  const [invoiceComment, setInvoiceComment] = useState('');

  const pastInvoices = useMemo(() => {
     if(!user || !user.uid) return [];
     return allInvoices.filter(i => i.userId === user.uid);
  }, [allInvoices, user]);

  useEffect(() => {
    if (user && user.uid) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'invoiceData');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPersonalInfo(prev => ({ ...prev, ...docSnap.data(), address: docSnap.data().address || myUmpireData?.address || '', zipCity: docSnap.data().zipCity || myUmpireData?.city || '', email: user?.email || docSnap.data().email || prev.email || '' }));
          } else {
            setPersonalInfo(prev => ({ ...prev, name: userName || myUmpireData?.name || '', email: user?.email || '', address: myUmpireData?.address || '', zipCity: myUmpireData?.city || '' }));
          }
        } catch(e) {}
      };
      fetchProfile();
    } else if (userName) {
       setPersonalInfo(prev => ({ ...prev, name: userName, email: user?.email || '', address: myUmpireData?.address || '', zipCity: myUmpireData?.city || '' }));
    }
  }, [user, appId, userName, db, myUmpireData]);

  const handlePersonalInfoChange = (e) => { setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value }); };
  const handleTripChange = (id, field, value) => setTrips(trips.map(trip => trip.id === id ? { ...trip, [field]: value } : trip));
  const addTrip = () => setTrips([...trips, { id: Date.now(), date: '', assignment: '', from: '', to: '', distance: '', roundTrip: true, isDriver: true }]);
  const removeTrip = (id) => { if (trips.length > 1) setTrips(trips.filter(trip => trip.id !== id)); };
  
  const handleExpenseChange = (id, field, value) => setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  const addExpense = () => setExpenses([...expenses, { id: Date.now(), description: '', amount: '' }]);
  const removeExpense = (id) => setExpenses(expenses.filter(exp => exp.id !== id));

  const calculateDistance = async (tripId, overrideFrom, overrideTo, overrideRoundTrip) => {
    const currentTrip = trips.find(t => t.id === tripId) || {};
    const fromVal = overrideFrom !== undefined ? overrideFrom : currentTrip.from;
    const toVal = overrideTo !== undefined ? overrideTo : currentTrip.to;
    const isRoundTrip = overrideRoundTrip !== undefined ? overrideRoundTrip : currentTrip.roundTrip;

    if (!fromVal || !toVal) { alert(t.fillFromTo); return; }
    setCalculatingIndex(tripId);
    try {
      const resolveAddress = (input) => {
        if (['hem', 'home', t.homeLocation.toLowerCase()].includes(input.toLowerCase())) return `${personalInfo.address}, ${personalInfo.zipCity}`;
        const found = locationsData.find(l => l.id.toLowerCase() === input.toLowerCase());
        return found && found.address ? found.address : input;
      };

      const fromAddress = resolveAddress(fromVal);
      const toAddress = resolveAddress(toVal);
      if(!fromAddress || !toAddress || fromAddress === ', ' || toAddress === ', ') throw new Error(t.addressMissing);

      const fromRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fromAddress + ', Sweden')}`);
      const fromData = await fromRes.json();
      const toRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(toAddress + ', Sweden')}`);
      const toData = await toRes.json();

      if (fromData.length === 0 || toData.length === 0) throw new Error(t.coordsMissing);
      
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromData[0].lon},${fromData[0].lat};${toData[0].lon},${toData[0].lat}?overview=false`);
      const routeData = await routeRes.json();

      if (routeData.routes && routeData.routes.length > 0) {
        let mil = routeData.routes[0].distance / 10000; 
        if (isRoundTrip) mil *= 2;
        setTrips(prev => prev.map(tr => tr.id === tripId ? { ...tr, distance: mil.toFixed(1) } : tr));
      } else { throw new Error(t.routeMissing); }
    } catch (err) { alert(t.autoCalcFailed); } finally { setCalculatingIndex(null); }
  };

  const calculated = useMemo(() => {
    let totalMilage = 0, travelBonus = 0, totalExpenses = 0;
    trips.forEach(trip => {
      const dist = parseFloat(trip.distance) || 0;
      if (trip.isDriver) totalMilage += dist;
      if (dist >= 20) travelBonus += 200; else if (dist >= 10) travelBonus += 100;
    });
    const milageCost = totalMilage * 25; 
    const overnightCost = (parseInt(overnightCount) || 0) * 300;
    expenses.forEach(exp => { totalExpenses += (parseFloat(exp.amount) || 0); });
    const advanceNum = parseFloat(advance) || 0;
    const total = (milageCost + travelBonus + overnightCost + totalExpenses) - advanceNum;

    return { totalMilage: Number(totalMilage.toFixed(1)), milageCost: Number(milageCost.toFixed(2)), travelBonus, overnightCost, totalExpenses: Number(totalExpenses.toFixed(2)), advance: advanceNum, total: Number(total.toFixed(2)) };
  }, [trips, expenses, overnightCount, advance]);

  const invoiceDataObj = { personalInfo, trips, expenses, overnightCount, advance, calculated, invoiceComment };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm("Vill du verkligen ta bort denna reseräkning från historiken?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'all_invoices', invoiceId));
        if (user && user.uid) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'invoices', invoiceId)).catch(()=>{});
      } catch (e) {}
    }
  };

  const handleReopenInvoice = (inv) => {
    if (inv.personalInfo) setPersonalInfo(inv.personalInfo);
    if (inv.trips && inv.trips.length > 0) setTrips(inv.trips);
    if (inv.expenses && inv.expenses.length > 0) setExpenses(inv.expenses);
    setAdvance(inv.advance || ''); setOvernightCount(inv.overnightCount || ''); setInvoiceComment(inv.invoiceComment || '');
    if (typeof window !== 'undefined') window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDownloadPDF = () => {
    const form = document.getElementById('invoice-form');
    if (!form.checkValidity()) return form.reportValidity();
    setIsSubmitting(true);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const element = document.getElementById('print-invoice-view');
      element.classList.remove('hidden'); element.classList.remove('print:block');
      const opt = { margin: 10, filename: `Reserakning_${personalInfo.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('sv-SE')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      window.html2pdf().set(opt).from(element).save().then(async () => {
        element.classList.add('hidden'); element.classList.add('print:block'); setIsSubmitting(false);
        if (user && user.uid) {
           try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_invoices'), { ...invoiceDataObj, createdAt: Date.now(), userId: user.uid, userName: personalInfo.name, total: calculated.total, status: "Nedladdad (PDF)" }); } catch(e) {}
        }
      });
    };
    document.body.appendChild(script);
  };

  const handleSubmit = async (e, target) => {
    e.preventDefault(); setIsSubmitting(true); setSentTarget(target);
    try {
      if (user && user.uid) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'invoiceData'), personalInfo, { merge: true }).catch(()=>{});

      const tripsText = trips.map(t => `- ${t.date}: ${t.from} till ${t.to} (${t.roundTrip ? 'T&R' : 'Enkel'}), ${t.distance} mil. Ändamål: ${t.assignment}`).join('\n');
      const expensesText = expenses.filter(e => e.description && e.amount).map(e => `- ${e.description}: ${e.amount} kr`).join('\n') || 'Inga övriga utlägg';
      const emailHtml = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">Reseräkning - ${personalInfo.name}</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Namn</strong></td><td>${personalInfo.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Bankkonto</strong></td><td>${personalInfo.bank}</td></tr>
          </table>
          <h3 style="color: #475569;">Resor</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            ${trips.map(tr => `<tr><td>${tr.date}<br>${tr.assignment}</td><td>${tr.from} → ${tr.to}</td><td>${tr.distance} mil</td></tr>`).join('')}
          </table>
          <h3 style="color: #475569;">Sammanställning</h3>
          <p>Total att utbetala: <strong>${calculated.total} kr</strong></p>
        </div>`;

      const toEmail = target === 'federation' ? 'info@sbslf.se' : personalInfo.email;
      const emailSubject = target === 'federation' ? `Reseräkning: ${personalInfo.name} (${calculated.total} kr)` : `TEST: Reseräkning ${personalInfo.name}`;

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), { to: toEmail, replyTo: personalInfo.email, message: { subject: emailSubject, text: "Ny reseräkning inskickad.", html: emailHtml }, createdAt: Date.now() });

      if (user && user.uid && target === 'federation') {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_invoices'), { ...invoiceDataObj, createdAt: Date.now(), userId: user.uid, userName: personalInfo.name, total: calculated.total, status: "Ej betald" });
      }
      setSuccess(true);
    } catch (err) { alert(t.errorOccurred); }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">{t.sentSuccess}</h2>
          <p className="text-slate-600 mb-8 font-medium">{sentTarget === 'federation' ? t.sentSuccessFed : t.sentSuccessSelf}</p>
          <button onClick={() => setSuccess(false)} className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-black uppercase text-xs hover:bg-slate-200">Skapa ny</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-8 print:hidden pt-20 sm:pt-8">
        <div className="text-center space-y-2 mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><FileText className="w-8 h-8 text-white" /></div>
          <h1 className="text-3xl font-black text-slate-800">{t.invoiceTitle}</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t.digitalSubmission}</p>
        </div>

        {pastInvoices.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HistoryIcon className="w-4 h-4" /> {t.pastInvoices}</h3>
             <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {pastInvoices.map(inv => (
                 <div key={inv.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <div className="flex-1">
                     <span className="text-xs font-bold text-slate-700">{new Date(inv.createdAt).toLocaleDateString('sv-SE')}</span>
                     <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">{inv.trips?.map(tr => tr.assignment).join(', ')}</p>
                   </div>
                   <div className="text-right mr-3">
                     <span className="text-sm font-black text-blue-600">{inv.total} kr</span>
                     <p className="text-[9px] font-black uppercase text-slate-500 mt-0.5">{inv.status}</p>
                   </div>
                   <div className="flex items-center gap-1">
                     <button onClick={() => handleReopenInvoice(inv)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase hover:bg-blue-200">{t.open}</button>
                     <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><User className="w-4 h-4" /> {t.personalInfo}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.name}</label><input required type="text" name="name" value={personalInfo.name} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">E-postadress</label><input required type="email" name="email" value={personalInfo.email} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.pnr}</label><input required type="text" name="pnr" value={personalInfo.pnr} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.streetAddressHidden}</label><input required type="text" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.zipCity}</label><input required type="text" name="zipCity" value={personalInfo.zipCity} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.bankAccount}</label><input required type="text" name="bank" value={personalInfo.bank} onChange={handlePersonalInfoChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Car className="w-4 h-4" /> {t.tripsAllowance}</h2>
            <div className="space-y-6">
              {trips.map((trip, index) => {
                return (
                  <div key={trip.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                    {trips.length > 1 && <button type="button" onClick={() => removeTrip(trip.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {myAssignedGames.length > 0 && (
                        <div className="sm:col-span-12 bg-blue-100 p-2 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-blue-800 uppercase shrink-0">{t.foundAssignments}</span>
                          <select className="w-full sm:flex-1 text-xs p-1.5 rounded-md border border-blue-200 bg-white outline-none" onChange={(e) => { const g = myAssignedGames.find(x => x.id === e.target.value); if(g) { const fromVal = t.homeLocation; const toVal = g.location; setTrips(currentTrips => currentTrips.map(tr => tr.id === trip.id ? { ...tr, date: g.date, assignment: `${g.away} @ ${g.home}`, to: toVal, from: fromVal } : tr)); calculateDistance(trip.id, fromVal, toVal, trip.roundTrip); } }}>
                             <option value="">{t.selectGame}</option>
                             {myAssignedGames.map(g => <option key={g.id} value={g.id}>{g.date} | {g.away} @ {g.home}</option>)}
                          </select>
                        </div>
                      )}
                      <div className="sm:col-span-3 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.date}</label><input required type="date" value={trip.date} onChange={(e) => handleTripChange(trip.id, 'date', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                      <div className="sm:col-span-9 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.assignmentDetails}</label><input required type="text" value={trip.assignment} onChange={(e) => handleTripChange(trip.id, 'assignment', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                      <div className="sm:col-span-4 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelFrom}</label><input required type="text" list="location-list" value={trip.from} onChange={(e) => handleTripChange(trip.id, 'from', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                      <div className="sm:col-span-4 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.travelTo}</label><input required type="text" list="location-list" value={trip.to} onChange={(e) => handleTripChange(trip.id, 'to', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                      <div className="sm:col-span-4 space-y-1 flex flex-col justify-end"><label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-lg h-[42px]"><input type="checkbox" checked={trip.roundTrip} onChange={(e) => handleTripChange(trip.id, 'roundTrip', e.target.checked)} className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-black uppercase text-slate-600">{t.roundTrip}</span></label></div>
                      <div className="sm:col-span-8 space-y-1 flex flex-col justify-end"><label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-slate-200 rounded-lg h-[42px]"><input type="checkbox" checked={trip.isDriver} onChange={(e) => handleTripChange(trip.id, 'isDriver', e.target.checked)} className="w-4 h-4 text-blue-600" /><span className="text-[10px] font-black uppercase text-slate-600 truncate">{trip.isDriver ? t.droveCar : t.carpooling}</span></label></div>
                      <div className="sm:col-span-4 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.distanceMil}</label><input required type="number" step="0.1" value={trip.distance} onChange={(e) => handleTripChange(trip.id, 'distance', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-blue-600" /></div>
                    </div>
                    <div className="mt-3 flex justify-end"><button type="button" onClick={() => calculateDistance(trip.id)} disabled={calculatingIndex === trip.id} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">{calculatingIndex === trip.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}{calculatingIndex === trip.id ? t.calculating : t.calcAuto}</button></div>
                  </div>
                );
              })}
              <button type="button" onClick={addTrip} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-black uppercase text-xs hover:text-blue-600 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> {t.addTrip}</button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> {t.expensesAllowance}</h2>
            <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-xs font-medium mb-4 flex items-start gap-2"><Info className="w-4 h-4 shrink-0 mt-0.5" /><p>{t.receiptsReminder}</p></div>
            <div className="space-y-4 mb-6">
              {expenses.map((exp) => (
                <div key={exp.id} className="flex items-center gap-4">
                  <input type="text" placeholder={t.description} value={exp.description} onChange={(e) => handleExpenseChange(exp.id, 'description', e.target.value)} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  <input type="number" placeholder={t.amount} value={exp.amount} onChange={(e) => handleExpenseChange(exp.id, 'amount', e.target.value)} className="w-32 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  {expenses.length > 1 && <button type="button" onClick={() => removeExpense(exp.id)} className="text-slate-300 hover:text-red-500"><X className="w-5 h-5"/></button>}
                </div>
              ))}
              <button type="button" onClick={addExpense} className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> {t.addExpense}</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.overnightNights}</label><div className="relative"><input type="number" min="0" value={overnightCount} onChange={(e) => setOvernightCount(e.target.value)} placeholder="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">á 300 kr</span></div></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.advanceDeduction}</label><input type="number" value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
             <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {t.invoiceCommentLabel}</h2>
             <textarea value={invoiceComment} onChange={(e) => setInvoiceComment(e.target.value)} placeholder={t.invoiceCommentPlaceholder} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[100px]" />
          </div>

          <div className="bg-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Calculator className="w-4 h-4" /> {t.summary}</h2>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2"><span className="text-slate-300">{t.mileageComp} ({calculated.totalMilage} mil á 25 kr)</span><span>{calculated.milageCost} kr</span></div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2"><span className="text-slate-300">{t.travelTimeComp}</span><span>{calculated.travelBonus} kr</span></div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2"><span className="text-slate-300">{t.overnightComp} ({overnightCount || 0} st á 300kr)</span><span>{calculated.overnightCost} kr</span></div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2"><span className="text-slate-300">{t.otherExpenses}</span><span>{calculated.totalExpenses} kr</span></div>
              {calculated.advance > 0 && <div className="flex justify-between items-center border-b border-slate-700 pb-2 text-red-400"><span>{t.advanceDeduction}</span><span>-{calculated.advance} kr</span></div>}
            </div>
            <div className="mt-6 pt-4 flex justify-between items-end"><span className="text-xs font-black uppercase tracking-widest text-slate-400">{t.totalToReceive}</span><span className="text-4xl font-black text-green-400">{calculated.total} <span className="text-xl">kr</span></span></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
            <button type="button" onClick={handleDownloadPDF} disabled={isSubmitting} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-2xl uppercase text-[10px] flex items-center justify-center gap-2">{isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {t.downloadPDF}</button>
            <button type="button" onClick={(e) => { const form = document.getElementById('invoice-form'); if (form.checkValidity()) handleSubmit(e, 'self'); else form.reportValidity(); }} disabled={isSubmitting} className="flex-1 py-4 bg-blue-100 text-blue-700 font-black rounded-2xl uppercase text-[10px] flex items-center justify-center gap-2"><Mail className="w-4 h-4" /> {t.sendToSelf}</button>
            <button type="button" onClick={(e) => { const form = document.getElementById('invoice-form'); if (form.checkValidity()) handleSubmit(e, 'federation'); else form.reportValidity(); }} disabled={isSubmitting} className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-2xl uppercase text-[10px] flex items-center justify-center gap-2">{isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {t.sendToFed}</button>
          </div>
        </form>
        <PrintableInvoice data={invoiceDataObj} t={t} containerId="print-invoice-view" />
      </div>
    </div>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [umpireId, setUmpireId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUmpireIds, setAdminUmpireIds] = useState([]);
  const [fedAdminEmails, setFedAdminEmails] = useState([]);
  
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
  const federations = [{ id: 'swe', name: '🇸🇪 Sweden', defaultLang: 'sv' }, { id: 'int', name: '🇬🇧 English', defaultLang: 'en' }];
  const [lang, setLang] = useState('sv');
  
  const getTranslation = (languageCode) => translations[languageCode] || translations['sv'];
  const t = getTranslation(lang);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [globalNote, setGlobalNote] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [features, setFeatures] = useState({ marketplace: true, evaluations: true, reminders: true });
  
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [masterUmpires, setMasterUmpires] = useState([]);
  const [registeredEmails, setRegisteredEmails] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [mailQueue, setMailQueue] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
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
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [evalGrade, setEvalGrade] = useState(0);
  const [evalComment, setEvalComment] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [bulkInput, setBulkInput] = useState('');
  const [showImportTool, setShowImportTool] = useState(false);
  const [showStaffed, setShowStaffed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [tempEditName, setTempEditName] = useState('');
  const [tempFedAdmins, setTempFedAdmins] = useState('');
  const [editNoteText, setEditNoteText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingGameData, setEditingGameData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'games', direction: 'desc' });
  const [umpireSort, setUmpireSort] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeague, setFilterLeague] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const isFederationAdmin = user?.email && fedAdminEmails.includes(user.email.toLowerCase());

  useEffect(() => {
     if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'schema.domarweb.se') { setIsDemoEnv(false); setFederation('swe'); setLang('sv'); } else { setIsDemoEnv(true); }
     }
  }, []);

  const appId = useMemo(() => {
    const base = typeof window !== 'undefined' && window.__app_id ? String(window.__app_id).replace(/[\\/]/g, '-') : 'baseball-umpire-scheduler';
    return isDemoEnv ? `${base}-sandbox-${selectedYear}` : `${base}-${selectedYear}`;
  }, [selectedYear, isDemoEnv]);

  const calendarWeeks = useMemo(() => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
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
    const map = {};
    assignments.forEach(asg => { if (!map[asg.gameId]) map[asg.gameId] = []; map[asg.gameId].push(asg); });
    return map;
  }, [assignments]);

  const sortedStatistics = useMemo(() => {
    const stats = {};
    masterUmpires.forEach(u => { stats[u.id] = { userId: u.id, name: u.name || 'Unknown', games: 0, interest: 0 }; });
    assignments.forEach(asg => { if (asg.userId) { if (!stats[asg.userId]) stats[asg.userId] = { userId: asg.userId, name: asg.userName || 'Unknown', games: 0, interest: 0 }; stats[asg.userId].games += 1; } });
    applications.forEach(app => { if (app.userId) { if (!stats[app.userId]) stats[app.userId] = { userId: app.userId, name: app.userName || 'Unknown', games: 0, interest: 0 }; stats[app.userId].interest += 1; } });
    return Object.values(stats).map(s => ({ ...s, rate: s.interest > 0 ? Math.round((s.games / s.interest) * 100) : (s.games > 0 ? 100 : 0) })).sort((a, b) => {
      let valA = a[sortConfig.key], valB = b[sortConfig.key];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      return valA < valB ? (sortConfig.direction === 'asc' ? -1 : 1) : (sortConfig.direction === 'asc' ? 1 : -1);
    });
  }, [assignments, applications, masterUmpires, sortConfig]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = (game.home || '').toLowerCase().includes(searchQuery.toLowerCase()) || (game.away || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLeague = !filterLeague || game.league === filterLeague;
      const matchesLocation = !filterLocation || game.location === filterLocation;
      const isHistorical = (game.date || '') < today;
      return showHistory ? (isHistorical && matchesSearch && matchesLeague && matchesLocation) : (!isHistorical && matchesSearch && matchesLeague && matchesLocation);
    });
  }, [games, searchQuery, filterLeague, filterLocation, showHistory, today]);

  const leagues = useMemo(() => [...new Set(games.map(g => g.league || 'Unknown'))].sort(), [games]);
  const allLocationNames = useMemo(() => [...new Set([...games.map(g => g.location), ...locationsData.map(l => l.id)])].filter(Boolean).sort(), [games, locationsData]);
  const locations = useMemo(() => [...new Set(games.map(g => g.location || 'Unknown'))].sort(), [games]);
  
  const sortedUmpireList = useMemo(() => {
    const levelOrder = { 'internationell': 1, 'elit': 2, 'nationell': 3, 'region': 4, 'förening': 5 };
    let umps = masterUmpires.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (umpireSort === 'level') {
      umps.sort((a, b) => (levelOrder[(a.level || '').toLowerCase()] || 99) - (levelOrder[(b.level || '').toLowerCase()] || 99));
    } else { umps.sort((a, b) => (a.name || '').localeCompare(b.name || '')); }
    return umps;
  }, [masterUmpires, searchQuery, umpireSort]);

  const filteredMasterUmpires = useMemo(() => masterUmpires.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())), [masterUmpires, searchQuery]);
  const allMyAssignedGames = useMemo(() => umpireId ? games.filter(game => groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)) : [], [games, groupedAssignments, umpireId]);
  const myAssignedGames = useMemo(() => allMyAssignedGames.filter(game => showHistory ? (game.date || '') < today : (game.date || '') >= today), [allMyAssignedGames, showHistory, today]);
  const invoiceEligibleGames = useMemo(() => [...allMyAssignedGames].filter(g => (g.date || '') <= today).sort((a, b) => (b.date || '').localeCompare(a.date || '')), [allMyAssignedGames, today]);
  const myInterestedGames = useMemo(() => umpireId ? games.filter(game => applications.some(app => app.gameId === game.id && app.userId === umpireId) && !groupedAssignments[game.id]?.some(asg => asg.userId === umpireId)) : [], [games, applications, groupedAssignments, umpireId]);

  useEffect(() => {
    const handleDbError = (err) => { if (err.code === 'permission-denied') setFirebaseError('permission-denied'); };
    const unsubscribeGames = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'games'), (snapshot) => setGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.date || '').localeCompare(b.date || ''))), handleDbError);
    const unsubscribeApps = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), (snapshot) => setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubscribeAssign = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'assignments'), (snapshot) => setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubscribeUmpires = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), (snapshot) => setMasterUmpires(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))), handleDbError);
    const unsubscribeRegUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'registered_users'), (snapshot) => setRegisteredEmails([...new Set(snapshot.docs.map(doc => doc.data().email).filter(Boolean))]), handleDbError);
    const unsubscribeEvals = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'evaluations'), (snapshot) => setEvaluations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubscribeLocations = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'locations'), (snapshot) => setLocationsData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubscribeQueue = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'mail_queue'), (snapshot) => setMailQueue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))), handleDbError);
    const unsubscribeInvoices = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'all_invoices'), (snapshot) => setAllInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b) => b.createdAt - a.createdAt)), handleDbError);
    const unsubscribeSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data(); setAdminUmpireIds(data.adminUmpireIds || []); setGlobalNote(data.globalNote || '');
        if (data.features) setFeatures(prev => ({ ...prev, ...data.features }));
        if (data.fedAdminEmails) setFedAdminEmails(data.fedAdminEmails);
      }
    }, handleDbError);

    return () => { unsubscribeGames(); unsubscribeApps(); unsubscribeAssign(); unsubscribeUmpires(); unsubscribeRegUsers(); unsubscribeEvals(); unsubscribeLocations(); unsubscribeQueue(); unsubscribeInvoices(); unsubscribeSettings(); };
  }, [appId]);

  useEffect(() => {
    let unsubscribeProfile = () => {};
    if (user && user.email) {
      const isMaster = user.email.toLowerCase() === 'suecio@tryempire.com'; setIsSuperAdmin(isMaster);
      setDoc(doc(db, 'artifacts', appId, 'registered_users', user.uid), { email: user.email.toLowerCase(), lastSeen: Date.now() }, { merge: true }).catch(()=>{});
      unsubscribeProfile = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), (snapshot) => {
        if (snapshot.exists() && snapshot.data().umpireId) {
          const data = snapshot.data(); setUserName(data.name || ''); setUmpireId(data.umpireId || '');
          setIsAdmin(isMaster || (Array.isArray(adminUmpireIds) && adminUmpireIds.includes(data.umpireId)));
        } else {
          const preLinked = masterUmpires.find(u => u.linkedEmail && u.linkedEmail.toLowerCase() === user.email.toLowerCase());
          if (preLinked) setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), { name: preLinked.name, umpireId: preLinked.id }, { merge: true });
          else { setUserName(''); setUmpireId(''); setIsAdmin(isMaster); }
        }
      });
    } else { setIsAdmin(false); setIsSuperAdmin(false); setUserName(''); setUmpireId(''); }
    return () => unsubscribeProfile();
  }, [user, appId, adminUmpireIds, masterUmpires]);

  useEffect(() => {
    if (user && user.email && umpireId && masterUmpires.length > 0) {
      const myUmpire = masterUmpires.find(u => u.id === umpireId);
      if (myUmpire && myUmpire.linkedEmail !== user.email) {
        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', umpireId), {
          linkedUserId: user.uid, linkedEmail: user.email
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
              const emailBody = t.emailMatchMovedBody ? t.emailMatchMovedBody.replace(/\{name\}/g, queueItem.userName).replace(/\{changesListSv\}/g, changesTextSv).replace(/\{changesListEn\}/g, changesTextEn) : changesTextSv;
              try {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), {
                   to: queueItem.email,
                   message: { subject: "Match flyttad / Game Rescheduled", text: emailBody },
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
    if (!isAdmin || assignments.length === 0) return;
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const expiredAssignments = assignments.filter(asg => asg.pendingChange && asg.pendingChangeTimestamp && (now - asg.pendingChangeTimestamp > ONE_WEEK));
    expiredAssignments.forEach(asg => { deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asg.id)).catch(() => {}); });
  }, [isAdmin, assignments, appId, db]);

  useEffect(() => {
    if (analytics) logEvent(analytics, 'screen_view', { firebase_screen: view, year: selectedYear, lang: lang });
    const handleScroll = () => { if(typeof window !== 'undefined') setShowBackToTop(window.scrollY > 300); };
    if (typeof window !== 'undefined') { window.addEventListener('scroll', handleScroll); return () => window.removeEventListener('scroll', handleScroll); }
  }, [view, selectedYear, lang]);

  const confirmScheduleChange = async (asgId) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { pendingChange: false }); } catch(e){} };
  const assignOfficial = async (gameId, role, value) => {
    if (!isAdmin) return; const updateObj = {};
    if (role === 'supervisor') { updateObj.supervisorId = value; updateObj.supervisorName = value ? masterUmpires.find(u => u.id === value)?.name : ''; }
    else { updateObj.tcName = value; }
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), updateObj); if (selectedGameDetails?.id === gameId) setSelectedGameDetails(prev => ({ ...prev, ...updateObj })); } catch(e){}
  };

  const submitEvaluation = async (gameId, targetUmpireId, grade, comment) => {
    if (!isAdmin && selectedGameDetails?.supervisorId !== umpireId) return;
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evaluations', `${gameId}_${targetUmpireId}`), { gameId, umpireId: targetUmpireId, evaluatorId: umpireId, grade, comment, timestamp: Date.now() }); alert(t.evalSaved); } catch(e){}
  };

  const saveGlobalNote = async () => { if (isAdmin) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { globalNote: editNoteText }, { merge: true }); };
  const clearGlobalNote = async () => { if (isAdmin) { setEditNoteText(''); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { globalNote: '' }, { merge: true }); } };
  const toggleSystemFeature = async (featureKey) => { if (isSuperAdmin) { const nf = { ...features, [featureKey]: !features[featureKey] }; setFeatures(nf); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { features: nf }, { merge: true }); } };
  const saveFedAdmins = async () => { if (isSuperAdmin) { const emails = tempFedAdmins.split(',').map(s => s.trim().toLowerCase()).filter(Boolean); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { fedAdminEmails: emails }, { merge: true }); if(typeof window !== 'undefined') alert(t.savedSuccess); } };
  const toggleUmpireReminderPref = async (uId, currentStatus) => { if (uId === umpireId || isAdmin) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'umpires', uId), { remindersEnabled: !currentStatus }, { merge: true }); };
  const forceRunRemindersNow = async () => { if (isSuperAdmin) { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'cron'), { lastReminderSentDate: 'FORCED' }, { merge: true }); if(typeof window !== 'undefined') alert("Reminders Queued!"); } };

  const addMasterUmpire = async (name, level = "") => {
    if (!name.trim()) return ""; const exists = masterUmpires.find(u => (u.name || '').toLowerCase() === name.toLowerCase()); if (exists) return exists.id;
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'umpires'), { name, level, remindersEnabled: true }); return docRef.id;
  };

  const toggleApplication = async (gameId) => {
    if (!user || !user.email) return setShowAuthModal(true); if (!umpireId) return setShowNamePrompt(true);
    const appIdStr = `${gameId}_${umpireId}`;
    if (applications.some(a => a.id === appIdStr)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr));
    else {
      const g = games.find(x => x.id === gameId);
      if (g && assignments.some(a => a.userId === umpireId && games.find(x => x.id === a.gameId)?.date === g.date && games.find(x => x.id === a.gameId)?.location !== g.location)) {
         return alert(t.conflictApply.replace('{location}', games.find(x => x.id === assignments.find(a => a.userId === umpireId && games.find(x => x.id === a.gameId)?.date === g.date).gameId).location));
      }
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', appIdStr), { gameId, userId: umpireId, userName, timestamp: Date.now() });
    }
  };

  const assignUmpire = async (gameId, uId, name) => {
    if (!isAdmin) return; const g = games.find(x => x.id === gameId);
    if (g && assignments.some(a => a.userId === uId && games.find(x => x.id === a.gameId)?.date === g.date && games.find(x => x.id === a.gameId)?.location !== g.location)) {
       return alert(t.conflictAssign.replace('{name}', name).replace('{location}', games.find(x => x.id === assignments.find(a => a.userId === uId && games.find(x => x.id === a.gameId)?.date === g.date).gameId).location));
    }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${gameId}_${uId}`), { gameId, userId: uId, userName: name, assignedAt: Date.now() });
  };

  const removeAssignment = async (gameId, uId) => { if (isAdmin || uId === umpireId) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${gameId}_${uId}`)); };
  const handleDeleteGame = async (gameId) => { if (isAdmin && window.confirm(t.deleteConfirm)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId)); };
  const toggleTradeStatus = async (asgId, status) => { if (umpireId || isAdmin) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asgId), { forTrade: status }); };

  const takeTrade = async (oldAsg, game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    if (oldAsg.userId === umpireId) return; 
    const umpireAssignedGamesToday = assignments.filter(asg => asg.userId === umpireId).map(asg => games.find(g => g.id === asg.gameId)).filter(g => g && g.date === game.date && g.id !== game.id);
    const conflictGame = umpireAssignedGamesToday.find(g => (g.location || '').toLowerCase().trim() !== (game.location || '').toLowerCase().trim());
    if (conflictGame) return alert(`${t.bookedIn} ${conflictGame.location}.`);
    if (typeof window !== 'undefined' && !window.confirm(t.tradeConfirm)) return;
    
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', oldAsg.id));
      batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', `${game.id}_${umpireId}`), { gameId: game.id, userId: umpireId, userName: userName, assignedAt: Date.now(), forTrade: false });
      await batch.commit(); alert(t.tradeSuccess);
    } catch (e) { } finally { setSyncing(false); }
  };

  const expressInterestMarketplace = async (game) => {
    if (!user || !user.email) { setShowAuthModal(true); return; }
    if (!umpireId) { setShowNamePrompt(true); return; }
    const gameCheck = games.find(g => g.id === game.id);
    if (gameCheck) {
      const umpireAssignedGamesToday = assignments.filter(asg => asg.userId === umpireId).map(asg => games.find(g => g.id === asg.gameId)).filter(g => g && g.date === gameCheck.date && g.id !== gameCheck.id);
      const conflictGame = umpireAssignedGamesToday.find(g => (g.location || '').toLowerCase().trim() !== (gameCheck.location || '').toLowerCase().trim());
      if (conflictGame) return alert(t.conflictApply.replace('{location}', conflictGame.location));
    }
    await toggleApplication(game.id); alert(t.interestRegistered);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'mail'), { to: 'suecio@tryempire.com', message: { subject: `Ny intresseanmälan från Marknaden: ${userName}`, text: `${userName} har anmält intresse för matchen ${game.away} @ ${game.home} den ${game.date}.` }, createdAt: Date.now() });
  };

  const handleBulkImport = async () => {
    if (!isAdmin || !bulkInput.trim()) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db); const rows = bulkInput.trim().split('\n');
      rows.forEach((row) => {
        const columns = row.split(/\t|,/);
        if (columns.length >= 5) {
          const gameData = { date: columns[0].trim(), time: columns[1].trim(), league: columns[2].trim(), away: columns[3].trim(), home: columns[4].trim(), location: (columns[5] || 'Unknown').trim(), requiredUmpires: 2 };
          const gameId = `m-${gameData.date}-${gameData.time}-${gameData.away}-${gameData.home}`.replace(/\s+/g, '').replace(/:/g, '').toLowerCase();
          batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'games', gameId), gameData);
        }
      });
      await batch.commit(); setBulkInput(''); setShowImportTool(false); alert(t.importSuccess);
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
        assignments.filter(a => a.gameId === editingGameData.id).forEach((asg) => batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'assignments', asg.id), { pendingChange: true, pendingChangeTimestamp: Date.now() }));
        applications.filter(a => a.gameId === editingGameData.id).forEach((app) => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'applications', app.id)));
      }
      await batch.commit();

      if (isTimeChanged) {
        for (const asg of assignments.filter(a => a.gameId === editingGameData.id)) {
          const ump = masterUmpires.find(u => u.id === asg.userId);
          if (ump && ump.linkedEmail) {
             const existingQueue = mailQueue.find(q => q.id === asg.userId);
             const gameChangeInfo = { gameId: editingGameData.id, away: editingGameData.away, home: editingGameData.home, oldDate: originalGame.date, oldTime: originalGame.time, newDate: editingGameData.date, newTime: editingGameData.time };
             await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mail_queue', asg.userId), { userId: asg.userId, email: ump.linkedEmail, userName: asg.userName, changes: [...(existingQueue ? existingQueue.changes : []).filter(c => c.gameId !== editingGameData.id), gameChangeInfo], processAfter: Date.now() + 15 * 60 * 1000 });
          }
        }
      }
      if (selectedGameDetails && selectedGameDetails.id === editingGameData.id) setSelectedGameDetails({ ...selectedGameDetails, ...editingGameData, requiredUmpires: parseInt(editingGameData.requiredUmpires) || 2 });
      setEditingGameData(null);
    } catch (e) { } finally { setSyncing(false); }
  };

  const updateInvoiceStatus = async (id, newStatus) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'all_invoices', id), { status: newStatus }); } catch(e) {} };

  const exportEconomyCSV = (invoicesToExport) => {
    if (invoicesToExport.length === 0 || typeof window === 'undefined') return;
    let csv = "Datum,Domare,Personnummer,E-post,Belopp (kr),Status,Resor,Ovriga Utlagg,Milersattning,Övernattning\n";
    invoicesToExport.forEach(inv => {
      const date = new Date(inv.createdAt).toLocaleDateString('sv-SE');
      const tripsStr = (inv.trips || []).map(t => `${t.from}-${t.to} (${t.distance} mil)`).join(' | ');
      const expensesStr = (inv.expenses || []).map(e => `${e.description} (${e.amount}kr)`).join(' | ');
      csv += `"${date}","${inv.personalInfo?.name || ''}","${inv.personalInfo?.pnr || ''}","${inv.personalInfo?.email || ''}",${inv.total || 0},"${inv.status || ''}","${tripsStr}","${expensesStr}","${inv.calculated?.totalMilage || 0} mil (${inv.calculated?.milageCost || 0} kr)","${inv.overnightCount || 0} nätter"\n`;
    });
    const link = document.createElement('a'); link.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); link.setAttribute('download', `reserakningar-${selectedYear}.csv`); link.click();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) { setUser(u); setLoading(false); } else {
        try { 
          if (typeof window !== 'undefined' && window.__initial_auth_token) {
            try { await signInWithCustomToken(auth, window.__initial_auth_token); } catch (e) { await signInAnonymously(auth); }
          } else { await signInAnonymously(auth); }
        } catch (err) { setLoading(false); }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="animate-spin w-8 h-8 text-blue-600" /></div>;

  if (view === 'invoice') {
    return (
      <div className="relative bg-slate-100 min-h-screen">
        {isDemoEnv && <div className="bg-purple-600 text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest print:hidden"><Code className="w-4 h-4 inline" /> {t.sandboxWarning}</div>}
        <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-10 print:hidden"><button onClick={() => setView('schedule')} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-black text-slate-600 uppercase hover:text-blue-600 hover:border-blue-200"><ArrowLeft className="w-4 h-4" /> {t.back}</button></div>
        <TravelInvoiceView db={db} appId={appId} locationsData={locationsData} user={user} userName={userName} t={t} myAssignedGames={invoiceEligibleGames} myUmpireData={myUmpireData} allInvoices={allInvoices} />
      </div>
    );
  }

  const tabs = [
    { id: 'schedule', label: t.schedule, icon: CalendarIcon },
    { id: 'locations', label: t.locations, icon: MapPin },
    { id: 'umpire-list', label: t.umpireList, icon: Users2 },
    ...(user?.email ? [...(features.marketplace ? [{ id: 'marketplace', label: t.marketplace, icon: ArrowRightLeft }] : []), { id: 'my-apps', label: t.myGames, icon: CheckCircle }] : []),
    ...(isAdmin ? [{ id: 'admin', label: t.staffing, icon: Shield }, { id: 'stats', label: t.analytics, icon: BarChart3 }] : []),
    ...(isAdmin || isFederationAdmin ? [{ id: 'economy', label: t.economy, icon: CreditCard }] : []),
    { id: 'invoice', label: t.invoiceTitle, icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 relative">
      {isDemoEnv && <div className="bg-purple-600 text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest print:hidden"><Code className="w-4 h-4 inline" /> {t.sandboxWarning}</div>}
      <header className="bg-blue-900 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 overflow-hidden cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Trophy className="w-6 h-6 shrink-0" /><div className="truncate"><h1 className="text-sm sm:text-xl font-bold truncate">{t.appTitle}</h1><p className="text-[8px] sm:text-[10px] uppercase text-blue-300">{t.season} {selectedYear}</p></div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isDemoEnv && <select value={federation} onChange={(e) => { setFederation(e.target.value); setLang(e.target.value === 'swe' ? 'sv' : 'en'); }} className="bg-blue-800 text-[10px] rounded px-2 py-1 text-white hidden sm:block"><option value="swe">🇸🇪 SV</option><option value="int">🇬🇧 EN</option></select>}
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-blue-800 text-[10px] rounded px-2 py-1 text-white hidden sm:block"><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option></select>
            <div className="flex bg-blue-800 rounded p-0.5 hidden sm:flex"><button onClick={() => setLang('sv')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'sv' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>🇸🇪</button><button onClick={() => setLang('en')} className={`px-1.5 py-0.5 text-[10px] rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>🇬🇧</button></div>
            {user?.email ? (
              <><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProfileId(umpireId); }} className="w-8 h-8 rounded-full bg-white text-blue-900 border-2 border-blue-400 flex items-center justify-center overflow-hidden font-black text-xs hover:scale-105">{myUmpireData?.avatarUrl ? <img src={myUmpireData.avatarUrl} className="w-full h-full object-cover" /> : (userName || '?').charAt(0)}</button><button onClick={() => setShowAdminModal(true)} className="p-1.5 hover:bg-blue-800 rounded-full text-white"><Settings className="w-5 h-5" /></button></>
            ) : <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase bg-blue-600 px-4 py-2 rounded-xl text-white hover:bg-blue-700">{t.login}</button>}
          </div>
        </div>
      </header>

      {globalNote && view !== 'help' && <div className="bg-blue-50 border-b border-blue-100 p-3 sm:p-4"><div className="max-w-5xl mx-auto flex items-start gap-3"><Megaphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" /><p className="text-sm font-medium text-blue-900">{globalNote}</p></div></div>}

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="hidden md:flex flex-wrap bg-white p-1 rounded-2xl shadow-sm border border-slate-200 gap-1 sticky top-[68px] z-20">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setView(tab.id); setSelectedProfileId(null); }} className={`flex-1 min-w-[120px] max-w-[200px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === tab.id ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><tab.icon className="w-4 h-4" /><span>{tab.label}</span></button>
          ))}
        </div>

        <div className="md:hidden sticky top-[68px] z-20">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-full bg-blue-900 text-white p-3.5 rounded-2xl shadow-md flex justify-between items-center font-black uppercase text-xs"><div className="flex items-center gap-2"><List className="w-5 h-5" /><span>{tabs.find(t => t.id === view)?.label || 'Meny'}</span></div>{isMobileMenuOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}</button>
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border p-2 flex flex-col gap-1 z-30 max-h-[60vh] overflow-y-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => { setView(tab.id); setSelectedProfileId(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase text-left ${view === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}><tab.icon className="w-5 h-5" />{tab.label}</button>
              ))}
            </div>
          )}
        </div>

        {view === 'schedule' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
              <h2 className="text-lg font-black uppercase text-slate-800">{showHistory ? t.archived : t.activeSchedule}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => generateCSV(filteredGames, selectedYear)} className="text-[10px] font-black uppercase px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm"><Download className="w-3.5 h-3.5" /> {t.downloadICS}</button>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setScheduleViewMode('list')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${scheduleViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List className="w-3.5 h-3.5"/> {t.listView}</button>
                  <button onClick={() => setScheduleViewMode('calendar')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${scheduleViewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><CalendarIcon className="w-3.5 h-3.5"/> {t.calendarView}</button>
                </div>
                <button onClick={() => setShowHistory(!showHistory)} className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 ${showHistory ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}><HistoryIcon className="w-3.5 h-3.5" /> {showHistory ? t.upcoming : t.history}</button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none" /></div>
              <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)} className="p-2 bg-slate-50 border rounded-xl text-sm font-bold text-slate-700 outline-none"><option value="">{t.allSeries}</option>{leagues.map(l => <option key={l} value={l}>{l}</option>)}</select>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="p-2 bg-slate-50 border rounded-xl text-sm font-bold text-slate-700 outline-none"><option value="">{t.allLocations}</option>{locations.map(l => <option key={l} value={l}>{l}</option>)}</select>
            </div>
            {filteredGames.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200"><Info className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-500 font-medium">{t.noGames}</p></div>
            ) : scheduleViewMode === 'calendar' ? renderCalendar(filteredGames) : (
              filteredGames.map(game => {
                const gameAssignments = groupedAssignments[game.id] || []; const gameApplications = applications.filter(a => a.gameId === game.id);
                const required = game.requiredUmpires || 2;
                return (
                  <div key={game.id} onClick={() => setSelectedGameDetails(game)} className={`bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:border-blue-300 group transition-all ${showHistory ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[75px] border group-hover:bg-blue-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase">{safeDateDay(game.date)}</p><p className="text-2xl font-black text-slate-800 leading-none">{safeDateNum(game.date)}</p><p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{safeDateMonth(game.date)}</p>
                        </div>
                        <div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="font-bold text-slate-900 mt-1 text-base group-hover:text-blue-700">{game.away} @ {game.home}</h3>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-semibold"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {game.time}</span><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {game.location}</span></div>
                          {renderOfficialsRow(game, gameAssignments, masterUmpires)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0">
                        {!showHistory && (
                          <><div className="flex flex-col items-end">{isAdmin ? (gameApplications.length > 0 ? <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">{gameApplications.map(app => <span key={app.userId} className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-bold uppercase">{(app.userName || '').split(' ')[0]}</span>)}</div> : <span className="text-[10px] font-black text-slate-400 uppercase">0 {t.applied}</span>) : <span className="text-[10px] font-black text-slate-400 uppercase">{gameApplications.length} {t.applied}</span>}{gameAssignments.length > 0 && (<span className="text-[10px] font-black text-green-600 uppercase mt-1">{gameAssignments.length}/{required} {t.staffed}</span>)}</div>{gameAssignments.some(asg => asg.userId === umpireId) ? <div className="px-6 py-2 rounded-xl text-xs font-black uppercase bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {t.yourGame}</div> : <button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className={`px-6 py-2 rounded-xl text-xs font-black uppercase text-white ${applications.some(a => a.id === `${game.id}_${umpireId}`) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{applications.some(a => a.id === `${game.id}_${umpireId}`) ? t.withdraw : t.interested}</button>}</>
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
            <div className="bg-white p-4 rounded-2xl shadow-sm border relative"><Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {allLocationNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).map(locName => {
                  const locData = locationsData.find(l => l.id === locName) || { id: locName, address: '', facilities: [] };
                  return (
                    <div key={locName} onClick={() => setSelectedLocation(locName)} className="bg-white p-6 rounded-2xl border cursor-pointer hover:shadow-md hover:border-blue-300 group"><h3 className="font-black text-lg text-slate-800 group-hover:text-blue-600">{locName}</h3>{locData.address && <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1"><MapPin className="w-3 h-3"/>{locData.address}</p>}<div className="mt-4"><span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border px-3 py-1.5 rounded-lg">{(locData.facilities || []).length} {t.facilities}</span></div></div>
                  );
               })}
            </div>
          </div>
        )}

        {view === 'umpire-list' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex gap-4 mb-4"><div className="flex-1 relative bg-white rounded-2xl shadow-sm border"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-9 pr-3 py-3 text-sm outline-none bg-transparent" /></div><select value={umpireSort} onChange={(e) => setUmpireSort(e.target.value)} className="px-4 py-3 bg-white border rounded-2xl text-xs font-black uppercase outline-none shadow-sm"><option value="name">{t.name}</option><option value="level">{t.level}</option></select></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedUmpireList.map(u => (
                <div key={u.id} onClick={() => setSelectedProfileId(u.id)} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-400 group"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border overflow-hidden">{u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-sm font-black text-slate-500 group-hover:text-blue-600">{(u.name || '?').charAt(0)}</span>}</div><div><span className="font-bold text-slate-800 text-sm block group-hover:text-blue-700">{u.name}</span>{u.level && <span className={`text-[8px] font-black mt-1 inline-block uppercase px-1.5 py-0.5 rounded border ${getLevelStyles(u.level)}`}>{u.level}</span>}</div></div><ChevronRight className="w-4 h-4 text-slate-300" /></div>
              ))}
            </div>
          </div>
        )}

        {view === 'marketplace' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="text-center bg-white p-8 rounded-3xl border shadow-sm"><ArrowRightLeft className="w-12 h-12 text-blue-600 mx-auto mb-4" /><h2 className="text-2xl font-black text-slate-800 uppercase">{t.marketplace}</h2><p className="text-slate-500 font-medium mt-2">{t.marketplaceDesc}</p></div>
             <div>
                <h3 className="text-sm font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {t.gamesForTrade}</h3>
                {games.filter(g => (g.date || '') >= today && assignments.some(a => a.gameId === g.id && a.forTrade)).length === 0 ? <p className="text-slate-400 text-sm italic">{t.noMarketplaceGames}</p> : (
                  <div className="grid gap-4">{games.filter(g => (g.date || '') >= today && assignments.some(a => a.gameId === g.id && a.forTrade)).map(game => (
                    <div key={game.id} className="bg-white p-5 rounded-2xl shadow-sm border border-yellow-200 flex flex-col sm:flex-row justify-between gap-4"><div><span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3><p className="text-sm text-slate-500">{game.date} kl {game.time} • {game.location}</p></div><div className="flex flex-col justify-center gap-2">{assignments.filter(a => a.gameId === game.id && a.forTrade).map(asg => <button key={asg.id} onClick={() => takeTrade(asg, game)} className="bg-yellow-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2">{t.takeOverFrom} {asg.userName}</button>)}</div></div>
                  ))}</div>
                )}
             </div>
             <div>
                <h3 className="text-sm font-black uppercase text-slate-500 mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4" /> {t.missingUmpires}</h3>
                {games.filter(g => (g.date || '') >= today && (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).length === 0 ? <p className="text-slate-400 text-sm italic">{t.noMarketplaceGames}</p> : (
                  <div className="grid gap-4">{games.filter(g => (g.date || '') >= today && (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => (
                    <div key={game.id} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex flex-col sm:flex-row justify-between gap-4"><div><span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3><p className="text-sm text-slate-500">{game.date} kl {game.time} • {game.location}</p><p className="text-xs font-black text-red-500 mt-2 uppercase">{Math.max(0, (game.requiredUmpires || 2) - (groupedAssignments[game.id]?.length || 0))} {t.spotsAvailable}</p></div><div className="flex flex-col justify-center"><button onClick={() => applications.some(a => a.id === `${game.id}_${umpireId}`) ? toggleApplication(game.id) : expressInterestMarketplace(game)} className={`px-6 py-3 rounded-xl text-xs font-black uppercase text-white ${applications.some(a => a.id === `${game.id}_${umpireId}`) ? 'bg-red-600' : 'bg-blue-600'}`}>{applications.some(a => a.id === `${game.id}_${umpireId}`) ? t.withdraw : t.expressInterest}</button></div></div>
                  ))}</div>
                )}
             </div>
          </div>
        )}

        {view === 'economy' && (isAdmin || isFederationAdmin) && (
           <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm"><div className="text-center sm:text-left"><h2 className="text-xl font-black uppercase">{t.economy}</h2><p className="text-sm text-slate-500">{t.economyDesc}</p></div><button onClick={() => exportEconomyCSV(allInvoices)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2"><Download className="w-4 h-4"/> {t.exportSummary}</button></div>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm overflow-x-auto">
                 <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 border-b"><tr><th className="px-6 py-4 text-[10px] font-black uppercase">{t.date}</th><th className="px-6 py-4 text-[10px] font-black uppercase">{t.umpire}</th><th className="px-6 py-4 text-[10px] font-black uppercase">Belopp</th><th className="px-6 py-4 text-[10px] font-black uppercase">Status</th><th className="px-6 py-4 text-[10px] font-black uppercase">Åtgärd</th></tr></thead>
                    <tbody>{allInvoices.map(inv => (
                          <tr key={inv.id} className="border-b hover:bg-slate-50"><td className="px-6 py-4 text-xs font-bold text-slate-700">{new Date(inv.createdAt).toLocaleDateString('sv-SE')}</td><td className="px-6 py-4 text-xs font-bold text-slate-800">{inv.userName}</td><td className="px-6 py-4 text-xs font-black text-blue-600">{inv.total} kr</td><td className="px-6 py-4"><select value={inv.status} onChange={(e) => updateInvoiceStatus(inv.id, e.target.value)} className={`text-xs font-bold px-2 py-1 rounded-lg outline-none ${inv.status === 'Ej betald' ? 'bg-red-100 text-red-700' : inv.status === 'Utbetald' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}><option value="Ej betald">{t.statusNotPaid}</option><option value="Utbetald">{t.statusPaid}</option><option value="Makulerad">{t.statusVoid}</option><option value="Nedladdad (PDF)">Nedladdad (PDF)</option><option value="Inskickad">Inskickad</option></select></td><td className="px-6 py-4"><button onClick={() => setSelectedInvoice(inv)} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">Granska</button></td></tr>
                       ))}</tbody>
                 </table>
                 {allInvoices.length === 0 && <div className="p-8 text-center text-slate-400 font-medium italic">Inga reseräkningar inskickade ännu.</div>}
              </div>
           </div>
        )}

        {view === 'my-apps' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex items-start gap-4"><Megaphone className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" /><div className="text-sm text-amber-800 font-medium leading-relaxed"><p className="font-bold mb-2 text-amber-900">{t.availabilityWarningTitle}</p><p>{t.availabilityWarningDesc1}</p><p className="mt-2 text-amber-900 font-bold">{t.availabilityWarningDesc2}</p></div></div>
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm flex items-start gap-4"><Info className="w-6 h-6 text-blue-600 shrink-0" /><p className="text-sm text-blue-800 font-medium leading-relaxed">{t.myGamesReminder}</p></div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-black uppercase text-slate-800">{t.mySchedule}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => generateCSV(myAssignedGames, selectedYear)} className="text-[10px] font-black uppercase px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm"><Download className="w-3.5 h-3.5" /> {t.downloadICS}</button>
                <div className="flex bg-slate-100 rounded-xl p-1"><button onClick={() => setMyGamesViewMode('list')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${myGamesViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List className="w-3.5 h-3.5"/> {t.listView}</button><button onClick={() => setMyGamesViewMode('calendar')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${myGamesViewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><CalendarIcon className="w-3.5 h-3.5"/> {t.calendarView}</button></div>
                <button onClick={() => setShowHistory(!showHistory)} className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center gap-2 ${showHistory ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}><HistoryIcon className="w-3.5 h-3.5" /> {showHistory ? t.upcoming : t.history}</button>
              </div>
            </div>
            {myAssignedGames.filter(g => groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange).length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-200"><h3 className="text-xs font-black text-yellow-700 uppercase mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {t.actionRequired}</h3>{myAssignedGames.filter(g => groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange).map(game => (<div key={game.id} className="bg-white p-4 rounded-2xl border border-yellow-400 mb-3 shadow-sm"><p className="font-bold">{game.away} @ {game.home}</p><p className="text-xs text-slate-500 mb-3">{game.date} @ {game.time}</p><div className="flex gap-2"><button onClick={() => confirmScheduleChange(groupedAssignments[game.id].find(a => a.userId === umpireId).id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Acceptera</button><button onClick={() => removeAssignment(game.id, umpireId)} className="bg-slate-100 text-red-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase">Neka</button></div></div>))}</div>
            )}
            <div className="space-y-4">
              <div className="border-b pb-2"><h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.confirmedGames}</h2></div>
              {myAssignedGames.length === 0 && <div className="text-center text-slate-400 p-8 bg-white rounded-3xl border">{t.noAssignedMatches}</div>}
              {myGamesViewMode === 'calendar' ? renderCalendar(myAssignedGames) : myAssignedGames.filter(g => !groupedAssignments[g.id]?.find(a => a.userId === umpireId)?.pendingChange).map(game => (
                    <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-5 rounded-2xl border border-green-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:border-green-400 transition-colors"><div><span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3><p className="text-sm text-slate-500 flex items-center gap-2 mt-1"><Clock className="w-3 h-3"/> {game.date} @ {game.time} • {game.location}</p><div className="mt-3 flex gap-2 items-center flex-wrap"><span className="text-[10px] font-black text-slate-400 uppercase">{t.coUmpires}</span>{groupedAssignments[game.id].filter(a => a.userId !== umpireId).length > 0 ? groupedAssignments[game.id].filter(a => a.userId !== umpireId).map(a => <span key={a.userId} className="text-[10px] bg-slate-50 border text-slate-700 px-2 py-1 rounded-lg font-bold">{a.userName}</span>) : <span className="text-[10px] text-slate-400 italic">{t.noCoUmpires}</span>}</div></div><div className="flex flex-col sm:items-end gap-2 pt-3 sm:pt-0"><span className="bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-center">{t.confirmed}</span>{game.date >= today && features.marketplace && <button onClick={(e) => { e.stopPropagation(); toggleTradeStatus(groupedAssignments[game.id].find(a => a.userId === umpireId).id, !groupedAssignments[game.id].find(a => a.userId === umpireId).forTrade); }} className="text-[10px] font-black uppercase px-4 py-2 rounded-xl bg-slate-100 text-slate-600">{groupedAssignments[game.id].find(a => a.userId === umpireId).forTrade ? t.cancelTrade : t.tradeGame}</button>}</div></div>
              ))}
            </div>
            {!showHistory && (
              <div className="space-y-4 pt-4"><div className="border-b pb-2"><h2 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.interestedGames}</h2></div>{myInterestedGames.length === 0 && <div className="text-center text-slate-400 p-8 bg-white rounded-3xl border">{t.noPendingInterest}</div>}{myInterestedGames.map(game => <div key={game.id} onClick={() => setSelectedGameDetails(game)} className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:border-blue-300"><div><span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="font-bold text-lg mt-1">{game.away} @ {game.home}</h3><p className="text-sm text-slate-500 mt-1">{game.date} @ {game.time} • {game.location}</p></div><button onClick={(e) => { e.stopPropagation(); toggleApplication(game.id); }} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase border border-red-100">Dra tillbaka</button></div>)}</div>
            )}
          </div>
        )}

        {view === 'stats' && isAdmin && (
          <div className="space-y-6 animate-in fade-in">
             <h2 className="text-xl font-black uppercase">{t.analytics}</h2>
             <div className="bg-white rounded-3xl border overflow-hidden shadow-sm overflow-x-auto">
               <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-slate-50 border-b"><tr><th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black uppercase cursor-pointer">{t.umpire}</th><th onClick={() => handleSort('interest')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.interests}</th><th onClick={() => handleSort('games')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.gamesAssigned}</th><th onClick={() => handleSort('rate')} className="px-6 py-4 text-center text-[10px] font-black uppercase cursor-pointer">{t.assignmentRate}</th></tr></thead>
                 <tbody>{sortedStatistics.map(stat => (
                     <tr key={stat.userId} className="border-b hover:bg-slate-50"><td className="px-6 py-4 font-bold text-slate-800"><button onClick={() => setSelectedProfileId(stat.userId)} className="hover:underline">{stat.name}</button></td><td className="px-6 py-4 text-center text-slate-600">{stat.interest}</td><td className="px-6 py-4 text-center text-blue-600 font-black">{stat.games}</td><td className="px-6 py-4 text-center font-bold"><span className={`px-3 py-1 rounded-lg text-[10px] ${stat.rate >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{stat.rate}%</span></td></tr>
                   ))}</tbody>
               </table>
            </div>
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <div className="space-y-6 animate-in fade-in">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4"><div><h2 className="text-xl font-black text-slate-800">{t.staffingControl}</h2><p className="text-xs text-slate-500">{selectedYear} Season</p></div><div className="flex flex-wrap items-center gap-2"><button onClick={handleDownloadBackup} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase flex items-center gap-2"><Download className="w-4 h-4" /> Backup</button><button onClick={() => setShowImportTool(!showImportTool)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold text-xs uppercase flex items-center gap-2"><Plus className="w-4 h-4" /> {t.bulkImport}</button></div></div>
             {showImportTool && (
               <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200"><h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> {t.pasteSheet}</h3><textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder={t.pasteSchedulePlaceholder} className="w-full h-40 p-4 bg-white border border-blue-200 rounded-xl font-mono text-xs mb-4 outline-none" /><div className="flex gap-3"><button onClick={handleBulkImport} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black uppercase text-xs">Lägg till matcher</button><button onClick={() => setShowImportTool(false)} className="px-6 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-black uppercase text-xs">Avbryt</button></div></div>
             )}
             <div className="bg-white p-6 rounded-3xl border"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4" /> {t.globalAnnouncement}</h3><textarea value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} placeholder={t.announcementPlaceholder} className="w-full p-3 bg-slate-50 border rounded-xl text-sm min-h-[80px] outline-none" /><div className="flex gap-2 mt-3"><button onClick={saveGlobalNote} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase">{t.saveAnnouncement}</button><button onClick={clearGlobalNote} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase">Rensa</button></div></div>
             <div className="flex justify-between items-center bg-white p-4 rounded-3xl border"><h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-600" /> Bemanningsöversikt</h3><div className="flex gap-2"><button onClick={() => setShowHistory(!showHistory)} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-2 ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}><HistoryIcon className="w-3.5 h-3.5" />{showHistory ? t.upcoming : t.history}</button><button onClick={() => setShowStaffed(!showStaffed)} className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl flex items-center gap-2 ${showStaffed ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'}`}><CheckCircle className="w-3.5 h-3.5" />{showStaffed ? t.hideStaffed : t.showAll}</button></div></div>
             
             {filteredGames.filter(g => showStaffed ? true : (groupedAssignments[g.id]?.length || 0) < (g.requiredUmpires || 2)).map(game => {
               const gameAssignments = groupedAssignments[game.id] || []; const gameApplications = applications.filter(a => a.gameId === game.id);
               return (
                 <div key={game.id} className="bg-white rounded-2xl shadow-sm border mb-4 p-5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 mb-4 gap-3">
                       <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => setSelectedGameDetails(game)}><span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="font-bold text-lg">{game.away} @ {game.home}</h3><span className="text-xs font-bold text-slate-500">| {game.date} @ {game.time}</span></div>
                       <div className="flex items-center gap-4 justify-between"><span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase ${getAssignmentStatusStyles(gameAssignments.length, game.requiredUmpires || 2)}`}>{gameAssignments.length} / {game.requiredUmpires || 2} {t.assigned}</span><button onClick={() => handleDeleteGame(game.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase">{t.applied}</h4>
                          {gameApplications.length > 0 ? (
                             <div className="flex flex-col gap-2">{gameApplications.map(app => (
                                <div key={app.userId} className="flex justify-between items-center bg-blue-50 p-2.5 rounded-xl border border-blue-100"><span className="text-xs font-bold text-blue-900">{app.userName}</span><button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="text-[9px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-lg">{t.assignBtn}</button></div>
                             ))}</div>
                          ) : <p className="text-xs text-slate-400 italic">{t.noInterestsYet}</p>}
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase">{t.currentCrew}</h4>
                          {gameAssignments.length > 0 ? (
                             <div className="flex flex-col gap-2 mb-3">{gameAssignments.map(asg => (
                                   <div key={asg.userId} className="flex justify-between items-center bg-green-50 p-2.5 rounded-xl border border-green-200"><span className="text-xs font-bold text-green-900 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-600"/> {asg.userName}</span><button onClick={() => removeAssignment(game.id, asg.userId)} className="text-[9px] font-black uppercase text-red-600 px-3 py-1.5 rounded-lg">Ta bort</button></div>
                                ))}</div>
                          ) : <p className="text-xs text-slate-400 italic mb-3">{t.noUmpiresAssigned}</p>}
                          {gameAssignments.length < (game.requiredUmpires || 2) && (
                             <div className="pt-2 border-t"><select value="" onChange={(e) => { if(e.target.value) assignUmpire(game.id, e.target.value, (masterUmpires.find(u=>u.id===e.target.value)?.name || t.unknown)); }} className="w-full text-xs p-3 bg-slate-50 border rounded-xl font-bold"><option value="">{t.manualAssign}</option>{masterUmpires.map(u => <option key={u.id} value={u.id}>{u.name} ({u.level})</option>)}</select></div>
                          )}
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </main>

      {showBackToTop && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 p-3 bg-slate-800 text-white rounded-full shadow-2xl"><ArrowUp className="w-5 h-5" /></button>}
      {!!selectedProfileId && <UmpireProfileModal selectedProfileId={selectedProfileId} setSelectedProfileId={setSelectedProfileId} masterUmpires={masterUmpires} assignments={assignments} umpireId={umpireId} isAdmin={isAdmin} t={t} getLevelStyles={getLevelStyles} db={db} appId={appId} />}
      {!!selectedInvoice && <InvoiceReviewModal invoice={selectedInvoice} setInvoice={setSelectedInvoice} t={t} />}

      {selectedGameDetails && (() => {
        const game = selectedGameDetails; const gameAssignments = groupedAssignments[game.id] || []; const gameApplications = applications.filter(a => a.gameId === game.id);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setSelectedGameDetails(null)} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
              {isAdmin && !editingGameData && <button onClick={() => setEditingGameData({...game})} className="absolute top-4 right-14 p-2 bg-blue-50 text-blue-600 rounded-full"><Edit2 className="w-5 h-5" /></button>}

              {editingGameData && editingGameData.id === game.id ? (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-black text-slate-800">{t.editMatch}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.date}</label><input type="date" value={editingGameData.date} onChange={e => setEditingGameData({...editingGameData, date: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.time}</label><input type="time" value={editingGameData.time} onChange={e => setEditingGameData({...editingGameData, time: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.league}</label><input type="text" value={editingGameData.league} onChange={e => setEditingGameData({...editingGameData, league: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.requiredUmpires}</label><input type="number" min="1" max="4" value={editingGameData.requiredUmpires || 2} onChange={e => setEditingGameData({...editingGameData, requiredUmpires: parseInt(e.target.value)})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.away}</label><input type="text" value={editingGameData.away} onChange={e => setEditingGameData({...editingGameData, away: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.home}</label><input type="text" value={editingGameData.home} onChange={e => setEditingGameData({...editingGameData, home: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                    <div className="space-y-1 col-span-2"><label className="text-[10px] font-black uppercase text-slate-400 pl-1">{t.location}</label><input type="text" value={editingGameData.location} onChange={e => setEditingGameData({...editingGameData, location: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-lg text-sm" /></div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t"><button onClick={saveEditedGame} disabled={syncing} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black text-white uppercase">{t.saveChanges}</button><button onClick={() => setEditingGameData(null)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-black uppercase">Avbryt</button></div>
                </div>
              ) : (
                <div className="space-y-6 pt-4">
                  <div><span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${getLeagueStyles(game.league)}`}>{game.league}</span><h3 className="text-2xl font-black mt-3">{game.away} @ {game.home}</h3><p className="text-sm text-slate-500 font-bold uppercase mt-1">{game.date} @ {game.time}</p></div>
                  <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center border border-blue-100"><div><p className="text-[10px] font-black uppercase text-blue-800">{t.location}</p><p className="font-bold text-blue-900 text-sm mt-0.5">{game.location}</p></div><a href={`https://maps.google.com/?q=${encodeURIComponent(game.location)}`} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2 border border-blue-200"><Map className="w-4 h-4"/> {t.mapDirections}</a></div>
                  <div className="space-y-4 mt-6">
                    <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">{t.crew}</h4>
                      {gameAssignments.length > 0 ? (
                        <div className="grid gap-3">{gameAssignments.map(asg => {
                            const m = masterUmpires.find(mu => mu.id === asg.userId); const existingEval = evaluations.find(e => e.gameId === game.id && e.umpireId === asg.userId);
                            return (
                              <div key={asg.userId} className="p-4 bg-slate-50 rounded-2xl border shadow-sm flex flex-col gap-2">
                                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-white border text-slate-500 rounded-full flex items-center justify-center font-black text-xs overflow-hidden">{m?.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full object-cover" /> : (asg.userName || '?').charAt(0)}</div><div><span className="font-bold text-sm text-slate-800 block hover:text-blue-600 cursor-pointer" onClick={() => setSelectedProfileId(asg.userId)}>{asg.userName}</span>{m?.level && <span className={`text-[8px] font-black inline-block mt-0.5 uppercase px-1.5 py-0.5 rounded border ${getLevelStyles(m.level)}`}>{m.level}</span>}</div></div></div>
                                {features.evaluations && umpireId && (isAdmin || game.supervisorId === umpireId) && !existingEval && (
                                  <div className="mt-3 pt-3 border-t"><p className="text-[10px] font-black uppercase text-purple-600 mb-2">{t.evaluate}</p><div className="flex flex-col gap-2"><select onChange={(e) => setEvalGrade(parseInt(e.target.value))} className="p-2.5 bg-white border rounded-xl text-xs font-bold outline-none"><option value="0">{t.grade}...</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select><textarea placeholder={t.feedback} onChange={(e) => setEvalComment(e.target.value)} className="p-3 bg-white border rounded-xl text-xs outline-none min-h-[80px]" /><button onClick={() => { if(evalGrade > 0) submitEvaluation(game.id, asg.userId, evalGrade, evalComment); }} className="bg-purple-600 text-white py-3 rounded-xl text-[10px] font-black uppercase text-white shadow-sm mt-1">Spara</button></div></div>
                                )}
                                {existingEval && (isAdmin || game.supervisorId === umpireId || asg.userId === umpireId) && (
                                  <div className="mt-3 pt-3 border-t bg-purple-50 p-3 rounded-xl flex flex-col gap-2"><p className="text-[10px] font-black uppercase text-purple-600">{t.yourEval}</p><div className="flex items-start gap-3"><span className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-black">{existingEval.grade}</span><span className="text-xs text-purple-900 font-medium italic">"{existingEval.comment}"</span></div></div>
                                )}
                              </div>
                            )
                          })}</div>
                      ) : <p className="text-xs italic text-slate-400 font-medium bg-slate-50 p-4 rounded-xl border">{t.notAssigned}</p>}
                    </div>
                    {isAdmin && (
                      <><div className="pt-2">
                          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{t.interests} ({gameApplications.length})</h4>
                          {gameApplications.length > 0 ? <div className="flex flex-wrap gap-2">{gameApplications.map(app => <div key={app.userId} className="px-3 py-2 bg-blue-50 border rounded-xl flex items-center gap-3"><span className="text-xs font-bold text-blue-800">{app.userName}</span>{masterUmpires.find(mu => mu.id === app.userId)?.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(masterUmpires.find(mu => mu.id === app.userId)?.level)}`}>{masterUmpires.find(mu => mu.id === app.userId)?.level}</span>}<button onClick={() => assignUmpire(game.id, app.userId, app.userName)} className="text-white bg-blue-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Tillsätt</button></div>)}</div> : <p className="text-xs italic text-slate-400 font-medium">{t.noInterests}</p>}
                        </div>
                        <div className="pt-4 border-t space-y-3 bg-slate-50 p-4 rounded-2xl border mt-4">
                          <h4 className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Officials (Admin)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-bold text-slate-500 pl-1">{t.supervisor}</label><select value={game.supervisorId || ''} onChange={(e) => assignOfficial(game.id, 'supervisor', e.target.value)} className="w-full mt-1.5 p-3 bg-white border rounded-xl text-xs font-bold"><option value="">Välj...</option>{masterUmpires.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                            <div><label className="text-[10px] font-bold text-slate-500 pl-1">{t.techComm}</label><input type="text" value={game.tcName || ''} onChange={(e) => assignOfficial(game.id, 'tc', e.target.value)} placeholder="Namn på TC..." className="w-full mt-1.5 p-3 bg-white border rounded-xl text-xs font-bold" /></div>
                          </div>
                        </div></>
                    )}
                  </div>
                  <button onClick={() => setSelectedGameDetails(null)} className="w-full py-4 mt-6 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px]">{t.close}</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full"><X className="w-5 h-5"/></button>
            <div className="text-center"><Shield className="w-12 h-12 text-blue-600 mx-auto mb-4"/><h3 className="text-2xl font-black">{t.login}</h3><p className="text-xs text-slate-400 mt-1">{t.loginToContinue}</p></div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm" placeholder={t.email}/>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-sm" placeholder={t.password}/>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] shadow-lg text-white">{isLoginMode ? t.login : t.register}</button>
            </form>
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full text-xs font-bold text-slate-500">{isLoginMode ? t.noAccount : t.hasAccount}</button>
          </div>
        </div>
      )}

      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 max-w-sm w-full shadow-2xl border">
            <div className="text-center space-y-2"><div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><UserCheck className="w-8 h-8 text-blue-600" /></div><h3 className="text-2xl font-black text-slate-800">{t.nameRequiredTitle}</h3><p className="text-xs text-slate-400 font-medium">{t.nameRequiredDesc}</p></div>
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.masterList}</label><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" /><input type="text" value={searchQuery} placeholder={t.namePlaceholder} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-4 pl-11 bg-slate-50 border rounded-2xl font-bold text-sm" /></div>
                <div className="mt-2 bg-slate-50 border rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {filteredMasterUmpires.length > 0 ? filteredMasterUmpires.map(u => (
                      <button key={u.id} onClick={async () => { setUserName(u.name); setUmpireId(u.id); await updateProfile(u.name, u.id); setShowNamePrompt(false); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">{u.name}</span>{u.level && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getLevelStyles(u.level)}`}>{u.level}</span>}</div><ChevronRight className="w-4 h-4 text-slate-300" /></button>
                    )) : <div className="p-4 text-center text-xs text-slate-400 italic">{t.noGames}</div>}
                </div>
              </div>
              <div className="pt-4 border-t space-y-3">
                <button onClick={() => setIsAddingNew(!isAddingNew)} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase hover:underline"><Plus className="w-3 h-3" /> {t.addNewName}</button>
                {isAddingNew && (
                  <div className="space-y-2 animate-in duration-200"><input type="text" autoFocus value={tempEditName} onChange={(e) => setTempEditName(e.target.value)} placeholder="För- och efternamn" className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-sm outline-none" /><button onClick={async () => { if (tempEditName.trim()) { const newId = await addMasterUmpire(tempEditName, t.nonUmpire); setUserName(tempEditName); setUmpireId(newId); await updateProfile(tempEditName, newId); setTempEditName(''); setIsAddingNew(false); setShowNamePrompt(false); } }} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase text-white shadow-lg shadow-blue-200">{t.createUmpire}</button></div>
                )}
              </div>
            </div>
            <button onClick={() => setShowNamePrompt(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px]">{t.cancel}</button>
          </div>
        </div>
      )}

      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-8 max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div><h3 className="text-2xl font-black text-slate-800 mb-1">{t.userSettings}</h3><p className="text-xs text-slate-400 font-medium tracking-wider uppercase">{user?.email}</p></div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"><div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t.displayName}</p><p className="text-sm font-bold text-slate-800">{userName || t.setProfile}</p></div><button onClick={logoutUmpire} className="p-2 text-red-500 rounded-xl flex items-center gap-1 font-black text-[10px] uppercase"><LogOut className="w-4 h-4" /> {t.logout}</button></div>
              {features.reminders && umpireId && (
                <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between"><div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t.reminderPreferences}</p><p className="text-xs font-bold text-slate-700">{t.receiveReminders}</p></div><button onClick={() => toggleUmpireReminderPref(umpireId, !!myUmpireData?.remindersEnabled)} className={`p-2 rounded-xl ${myUmpireData?.remindersEnabled !== false ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>{myUmpireData?.remindersEnabled !== false ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}</button></div>
              )}
              {isAdmin && <div className="p-4 bg-blue-50 border rounded-2xl border-blue-100 flex items-center gap-3"><Shield className="w-5 h-5 text-blue-600" /><div><p className="text-xs font-black text-blue-800 uppercase">Admin</p><p className="text-[10px] text-blue-600 font-medium">Behörighet via e-post</p></div></div>}
              {isSuperAdmin && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-4"><Sliders className="w-4 h-4" /> {t.superAdminSettings}</h4>
                  <button onClick={() => toggleSystemFeature('marketplace')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-xs font-bold text-purple-900">{t.featureMarketplace}</span><div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.marketplace ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.marketplace ? 'translate-x-5' : 'translate-x-0'}`} /></div></button>
                  <button onClick={() => toggleSystemFeature('evaluations')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-xs font-bold text-purple-900">{t.featureEvaluations}</span><div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.evaluations ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.evaluations ? 'translate-x-5' : 'translate-x-0'}`} /></div></button>
                  <button onClick={() => toggleSystemFeature('reminders')} className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"><span className="text-xs font-bold text-purple-900">{t.featureReminders}</span><div className={`w-10 h-5 rounded-full p-1 transition-colors ${features.reminders ? 'bg-purple-600' : 'bg-slate-300'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${features.reminders ? 'translate-x-5' : 'translate-x-0'}`} /></div></button>
                  <div className="space-y-1 mt-2"><label className="text-[10px] font-black uppercase text-purple-600 pl-1">{t.fedAdminSettings}</label><input type="text" defaultValue={fedAdminEmails.join(', ')} onChange={(e) => setTempFedAdmins(e.target.value)} className="w-full p-3 bg-white border border-purple-200 rounded-xl text-xs outline-none" /><button onClick={saveFedAdmins} className="w-full mt-1 py-2 bg-purple-100 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.saveChanges}</button></div>
                  {features.reminders && <button onClick={forceRunRemindersNow} className="w-full mt-2 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Run Cron</button>}
                </div>
              )}
            </div>
            <button onClick={() => setShowAdminModal(false)} className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px]">{t.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return ( <ErrorBoundary><MainApp /></ErrorBoundary> ); }
"""

import base64
encoded_bytes = base64.b64encode(app_code.encode("utf-8"))

decode_code = f"""import base64
with open("App.jsx", "wb") as f:
    f.write(base64.b64decode({encoded_bytes}))
"""

with open("generate_app.py", "w") as f:
    f.write(decode_code)

import os
os.system("python3 generate_app.py")
print("App.jsx generated successfully via base64 decoding.")}}
