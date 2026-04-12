⚾ Baseball Umpire Scheduling Portal

A modern, serverless web application designed to manage umpire schedules, assignments, and evaluations. Built originally for baseball umpire federations, this system is highly adaptable and handles everything from bulk importing schedules to real-time marketplace trades between officials.

✨ Key Features

For Umpires

Interactive Schedule: View all upcoming games, filter by league or location, and toggle between List and Calendar views.

Express Interest: Easily apply to games you are available to officiate.

Marketplace (Trade Board): Can't make a game? Put it on the marketplace. Other umpires can instantly claim it, updating the master schedule automatically.

Calendar Sync: Export assigned games to .ICS or .CSV formats, or add them directly to Google/Outlook calendars with one click.

Multi-language Support: Seamlessly toggle between English and Swedish.

For Administrators & Assignors

Staffing Desk: A dedicated dashboard to view games lacking umpires, resolve conflicts, and officially assign crews.

Bulk Import: Quickly create the season schedule by pasting directly from Google Sheets or Excel.

Smart Email Notifications: When a game is rescheduled (time or date change), the system automatically queues and batches email notifications to the assigned umpires, prompting them to confirm or decline the new time.

Supervisor Evaluations: Assign Supervisors or Technical Commissioners to games. Supervisors can privately grade and leave feedback for umpires directly within the match details.

Analytics: Track umpire engagement, games assigned, and interest rates.

Locations Directory: Manage a directory of baseball fields, complete with Google Maps routing and facility tracking.

🚀 Tech Stack

Frontend: React 18, Vite

Styling: Tailwind CSS

Backend / Database: Firebase Firestore (NoSQL)

Authentication: Firebase Auth (Email/Password & Anonymous)

Icons: Lucide React

🛠️ Getting Started (Local Development)

To run this project locally and set up your own database, follow these steps.

Prerequisites

Node.js (v16 or higher)

A Google Account to access Firebase

1. Clone the repository

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name


2. Install Dependencies

npm install


3. Firebase Setup

Since this app is serverless, all data lives in Firebase. You need to create your own Firebase project to run it locally.

Go to the Firebase Console and create a new project.

Enable Firestore Database (start in production or test mode).

Enable Authentication and turn on Anonymous and Email/Password sign-in methods.

Go to Project Settings, create a new "Web App", and copy your firebaseConfig object.

4. Connect the App to Firebase

Open src/App.jsx and locate the firebaseConfig object near the top of the file. Replace the placeholder values with the credentials you copied from your Firebase console:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};


5. Update Firestore Security Rules

To ensure the app can read and write data properly, go to Firestore Database -> Rules in your Firebase Console and paste the following:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/{document=**} {
      allow read: if true; 
      allow write: if request.auth != null; 
    }
  }
}


6. Run the Application

npm run dev


Open http://localhost:5173 in your browser.

👑 Setting up the First Master Admin

When you launch the app for the first time, the database will be empty. To grant yourself Admin access:

Register a new account in the app using the email address: suecio@tryempire.com. (Note: This is hardcoded as the master admin in App.jsx. You can change this email in the useEffect block handling roles).

Once logged in with that email, the system will automatically unlock the Staffing (Admin) tab.

From the Admin tab, you can add umpires to the Master List, link their emails, and promote other users to Admins.

🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Distributed under the MIT License. See LICENSE for more information.
