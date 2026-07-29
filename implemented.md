# TEDxPedition – Implementation Status

**Last Updated:** July 2026

---

# Project Overview

TEDxPedition is a web application built for the TEDx IIT Gandhinagar hybrid treasure hunt event. The application manages the complete participant journey, including authentication, clue progression, QR-based gameplay, stall verification, scoring, admin verification, and the live leaderboard.

At the current stage, the backend architecture is mostly designed and implemented, while the frontend is partially completed. The remaining work primarily depends on clarifying the event workflow with the organizers.

---

# Current Implementation Status

## 1. Firebase Setup ✅

The project is connected with Firebase.

### Firebase Services Used

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database

---

## 2. Authentication System ✅

Authentication has been implemented using Google Sign-In.

### Current Authentication Rules

Only **IIT Gandhinagar Google accounts** are allowed to access the application.

Allowed email format:

```
*@iitgn.ac.in
```

Any other Google account is rejected during login.

---

## 3. Participant Authentication (Current Approach)

Initially there was confusion regarding participant authentication.

After discussion, the current implementation introduces the concept of a **Team Leader**.

### Current Flow

- Every registered team has one Team Leader.
- Only the Team Leader logs into the application.
- Login is done using the Team Leader's IIT Gandhinagar Google account.
- After successful login, the application identifies the team associated with that leader.
- The Team Leader represents the complete team during the event.

Current implementation therefore assumes:

```
One Team
        ↓
One Team Leader
        ↓
One Google Login
        ↓
Entire Team Dashboard
```

---

## 4. Admin Authentication ✅

Admin login is completely separated from participant login.

Current authentication flow:

```
Google Login
        │
        ▼
Check admin_users Collection
        │
        ├──────── Yes
        │
        ▼
Admin Dashboard
        │
        └──────── No
                  │
                  ▼
Check Team Leader
                  │
                  ▼
Participant Dashboard
```

Current differentiation is based on Firestore.

### Admin

If the logged-in user's UID exists inside

```
admin_users
```

the application opens the Admin Dashboard.

### Participant

If the user is not an admin but is the registered Team Leader of a team, the Participant Dashboard is opened.

---

# Firestore Collections Implemented

Current collections:

```
admin_users
teams
team_progress
stalls
hints
qr_words
```

Realtime Database:

```
leaderboard
activeTeams
eventStatus
```

---

# CRUD Operations ✅

CRUD operations have been written and tested individually.

The following modules have been implemented and tested:

- Teams
- Admin
- Stalls
- QR
- Hints
- Progress

Dedicated test files were written to verify Firestore operations before integrating them into the application.

---

# Frontend Progress

Several frontend pages have already been designed.

Current pages include:

- Landing Page
- Login Page
- Participant Dashboard
- Admin Dashboard
- QR Scanner
- Hero Section
- Navbar
- Timer Component

The frontend architecture has been planned, but development is currently paused because some parts of the actual event workflow are still unclear.

---

# Current Backend Improvements

The backend structure has been redesigned several times.

Major improvements include:

- Team collection
- Team Progress collection
- Admin separation
- QR architecture
- Realtime leaderboard structure
- Active Teams management

---

# Current Development

## Team Progress Redesign

The old structure was considered insufficient.

A new structure is being introduced where every stall stores its own progress.

Example:

```
TEAM001

↓

STALL01

↓

status

startedAt

endedAt

timeTaken

hintsConsumed

baseScore

timeBonus

hintDeduction

manualBonus

rulePenalty

finalScore
```

This redesign allows automatic score calculation after every stall.

---

# Seed Scripts (In Progress)

To avoid manually creating Firestore documents, seed scripts are being developed.

Current scripts:

```
seedTeams.js

seedStalls.js

seedProgress.js
```

Purpose:

- Automatically create Teams
- Automatically create Stalls
- Automatically create Team Progress documents

Current issue:

The scripts are still under development.

The current challenge involves correctly initializing Firestore documents from Node.js while handling Firebase configuration and timestamps.

---

# Current Problems / Open Questions

Although most of the architecture has been planned, several important workflow questions still remain unanswered.

---

## 1. Team QR Workflow ❓

This is currently the biggest unresolved part of the project.

Questions that still need clarification:

- When is the Team QR generated?
- Who receives the Team QR?
- Is the Team QR sent only to the Team Leader?
- Does the Team Leader download it?
- Is the Team QR displayed inside the Participant Dashboard?
- Is the Team QR used during login?
- Is Google Login sufficient, making the Team QR only useful during gameplay?
- Should the Team QR become visible only after successful login?

Current understanding:

The Team QR will most likely be used **only for admin verification after completing a challenge**, but this needs confirmation from the organizers.

---

## 2. Participant Login Workflow ❓

Current implementation:

```
Team Leader

↓

Google Login

↓

Participant Dashboard
```

Still unclear:

Should participants additionally scan the Team QR before starting the event, or is Google Login alone sufficient?

---

## 3. Team QR Distribution ❓

Still undecided:

Possible approaches include:

- Email the Team QR to the Team Leader
- Download after registration
- Display permanently inside the dashboard
- Display only during the event

This decision affects both backend and frontend implementation.

---

## 4. Scoring Rules ❓

The scoring architecture has been designed, but the actual scoring rules are still incomplete.

Current automatic calculations:

- Base Score
- Time Bonus
- Hint Deduction
- Penalty?

Still unclear:

### Penalty Rule

Questions:

- What exactly counts as a penalty?
- Who decides penalties?
- Are penalties used at all?
- Will admins manually assign penalties?
- Are penalties predefined by organizers?

Without this clarification, the final score calculation cannot be completed.

---

## 5. Realtime Score Calculation ❓

The live leaderboard depends on the final scoring algorithm.

The backend architecture is ready for realtime updates, but the actual formula cannot be finalized until the scoring rules are confirmed.

---
## 5. Final ending
According to the event design document, after successfully completing all six stalls, the team will have collected six cards. These cards together reveal a map that points to the final destination, Jasubhai Auditorium.

The expected event flow is:

```
Complete Stall 1
      ↓
Complete Stall 2
      ↓
...
      ↓
Complete Stall 6
      ↓
Collect 6 Cards
      ↓
Cards Form a Map
      ↓
Reach Jasubhai Auditorium
      ↓
Enter Final Location
      ↓
Correct Location Verified
      ↓
Finish Time Recorded
      ↓
Final Leaderboard Updated
```

### Pending Clarifications

Although the overall ending is defined, some implementation details still need confirmation from the organizers.

- How are the six cards distributed (physical or digital)?
- Will the website display the collected cards or are they handled physically?
- What does "Enter Final Location" mean? (Text input, QR scan, or admin verification)
- Is the Final Treasure Hunt considered a separate Stall 7 or simply the concluding stage after Stall 6?
- Is another Team QR scan required at the final location?
- Is there an admin verification at the final location?
- Should the participant dashboard display a final completion page with score, rank, and completion time after finishing the event?
# Remaining Technical Tasks

## Backend

- Finish Firestore seed scripts
- Complete Team Progress redesign
- Complete automatic scoring module
- Integrate realtime leaderboard updates
- Finalize Team QR workflow
- Finalize participant login workflow

---

## Frontend

Once the workflow is finalized:

- Display Team QR appropriately
- Integrate complete gameplay flow
- Connect Participant Dashboard with backend
- Connect Admin Dashboard with backend
- Complete Challenge Pages
- Complete Final Location Page
- Complete Finish Page

---

# UI Improvements

After all functionality is complete, the remaining work will focus on UI/UX improvements.

Planned improvements include:

- Better TEDx branding
- Better dashboard layout
- Responsive design improvements
- Improved participant experience
- Improved admin workflow
- Better animations
- Loading states
- Success/Error feedback
- Final polishing

---

# Current Project Status

## Completed

- Firebase setup
- Authentication
- Admin authentication
- Team Leader authentication
- Firestore structure
- Realtime Database setup
- CRUD implementation
- Backend architecture planning
- Major frontend design
- QR architecture planning

---

## In Progress

- Firestore seed scripts
- Team Progress redesign
- Score calculation architecture

---

## Waiting for Clarification

- Team QR workflow
- Participant login workflow
- Penalty rules
- Final scoring formula
- Realtime leaderboard calculation

---

# Expected Final Development Order

1. Finish seed scripts
2. Finalize Team QR workflow
3. Finalize scoring rules
4. Complete backend integration
5. Complete frontend functionality
6. Integrate realtime leaderboard
7. Perform UI/UX enhancement
8. Testing
9. Production deployment