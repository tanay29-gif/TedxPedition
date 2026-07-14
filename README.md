# TEDxPedition

A React-based web application built for **TEDxIIT Gandhinagar's TEDxpedition**, a hybrid treasure hunt event combining online and offline challenges. The platform manages team progression, QR-based gameplay, timers, scoring, hint coins, admin verification, and a live leaderboard.

---

# Features

## 🔐 Authentication

- Team Login
- Admin Login
- Role-based access (Participant & Admin)

---

## 🎯 Event Flow

- QR-based event entry
- Team progress tracking
- Stall-wise challenge progression
- Automatic timer management
- Admin verification after every stall
- Final location submission
- Live leaderboard

---

## 🎮 Games

### Online

- Blockly Coding Challenge
- TED Talk QR Puzzle

### Offline

- Pictureka Challenge
- Crossword
- Comic Story
- Final Treasure Hunt

---

## ⏱ Timer & Scoring

- Automatic timer for every stall
- Admin score submission
- Time tracking
- Hint coin deduction
- Final score calculation
- Live ranking

---

## 👨‍💼 Admin Features

- Admin Login
- Scan Team QR
- Verify Stall Completion
- Submit Scores
- Deduct Hint Coins
- Unlock Next Stall
- Monitor Team Progress

---

## 🏆 Live Leaderboard

- Real-time score updates
- Current stall tracking
- Total time tracking
- Live rankings

---

# Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Realtime Updates:** Firebase Realtime Database
- **Routing:** React Router
- **QR Scanner:** html5-qrcode / qr-scanner
- **Blockly:** Google Blockly

---

# Project Structure

```text
src/
├── assets/
│
├── components/
│
├── pages/
│   ├── Login/
│   ├── Participant/
│   ├── Admin/
│   ├── Leaderboard/
│   ├── BlocklyGame/
│   ├── QRPuzzle/
│   └── FinalSubmission/
│
├── services/
│   ├── firebase.js
│   ├── firestore.js
│   ├── realtimeDB.js
│   └── auth.js
│
├── hooks/
│
├── context/
│
├── utils/
│
├── App.jsx
└── main.jsx
```

---

# Setup

## Prerequisites

- Node.js (v18 or higher)
- npm
- Firebase Project

---

## Installation

```bash
git clone <repository-url>

cd tedxpedition

npm install

npm run dev
```

---

# Firebase Configuration

Create a Firebase project and enable:

- Authentication
- Cloud Firestore
- Realtime Database

Create a `.env` file

```env
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=
```

---

# Firestore Structure

## teams

```text
teams
└── {teamId}
    ├── teamId
    ├── teamName
    ├── members
    ├── coins
    ├── currentStall
    ├── status
    ├── startTime
    ├── finishTime
    ├── totalScore
    ├── totalTime
    ├── updatedAt
    └── createdAt
```

---

## team_progress

```text
team_progress
└── {teamId}
    ├── stall1
    ├── stall2
    ├── stall3
    ├── stall4
    ├── stall5
    └── stall6
```

Each Stall

```text
startedAt
endedAt
timeTaken
score
completed
hintUsed
verifiedBy
```

---

## stalls

```text
stalls
└── {stallId}
    ├── stallId
    ├── name
    ├── type
    ├── maxScore
    ├── order
    └── location
```

---

## hints

```text
hints
└── {stallId}
    ├── stallId
    ├── hintText
    └── coinCost
```

---

## admin_users

```text
admin_users
└── {uid}
    ├── uid
    ├── name
    ├── stallAssigned
    └── role
```

---

## qr_words

```text
qr_words
└── {qrId}
    ├── qrId
    ├── word
    ├── talkUrl
    ├── timestamp
    └── order
```

---

# Realtime Database

## leaderboard

```text
leaderboard
    └── TEAM001
          ├── teamName
          ├── totalScore
          ├── totalTime
          └── currentStall
```

---

## activeTeams

```text
activeTeams
    └── TEAM001
          ├── currentStall
          ├── status
          └── updatedAt
```

---

## eventStatus

```text
eventStatus
    ├── status
    └── message
```

---

# Event Workflow

### Participant

```
Login

↓

Receive First Clue

↓

Reach Stall

↓

Scan Stall QR

↓

Timer Starts

↓

Complete Challenge

↓

Admin Verification

↓

Score Added

↓

Next Stall Unlocked

↓

Repeat

↓

Submit Final Location

↓

Event Completed
```

---

### Admin

```
Login

↓

Scan Team QR

↓

View Team Details

↓

Verify Completion

↓

Enter Score

↓

Deduct Hint Coin (if used)

↓

Submit

↓

Leaderboard Updated
```

---

# Scoring

Final Score consists of:

- Game Score
- Time Bonus
- Remaining Coin Bonus

Leaderboard ranking is based on:

1. Total Score
2. Total Time (Tie Breaker)

---

# Static Assets

All images, logos, comics, clues, and Blockly assets are stored locally.

```text
public/
└── assets/
    ├── logos/
    ├── clues/
    ├── games/
    ├── comics/
    └── images/
```

No Firebase Storage is used.

---

# Future Improvements

- Cloud Functions for automatic score calculation
- Admin activity logs
- Push notifications for announcements
- Export results to Excel/PDF
- Team analytics dashboard

---

# Developed For

**TEDxIIT Gandhinagar**

**TEDxpedition 2026**

A hybrid treasure hunt experience combining technology, teamwork, creativity, and problem-solving.