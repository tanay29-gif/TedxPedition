# TEDxPedition – System & Feature Implementation Report

**Last Updated:** August 2026  
**Status:** Core Framework Complete | Live Database Integration Active | Awaiting Real Game Content  

---

## 1. Core Architecture & Technology Stack

TEDxPedition is a modern, high-fidelity web application built to manage a hybrid treasure hunt event for **TEDx IIT Gandhinagar**. The application coordinates authentication, progress tracking, live scoring, stall verification, and leaderboard rankings.

### Tech Stack Details:
- **Frontend Core:** React (Vite-powered SPA), structured with components, hooks, context, and CSS.
- **Styling:** Vanilla CSS following a premium **TEDx Dark Theme** (high-contrast black/grey backgrounds, signature red glows `#e62b1e`, and glassmorphism cards).
- **Backend-as-a-Service (BaaS):** Firebase.
  - **Firebase Authentication:** Google Sign-In with strict domain restrictions.
  - **Cloud Firestore:** Relational-like transactional document storage for persistent data (profiles, progress metrics, admin configuration).
  - **Firebase Realtime Database (RTDB):** Ultra-low latency database for real-time tracking (live leaderboard, active team dashboards, admin control channels).
- **Routing:** React Router v6 with custom Route Guards (Protected Routes) to handle role-based navigation.

### 1.1. Environment Configuration (`.env`)
The project relies on environment variables for database connections and security flags.
- **Setup:** A `.env` file must be created in the **project root directory** by copying the keys from `.env.sample` and inserting the active credentials.
- **Super Admin Initialization:** The primary Super Admin is not hardcoded in the database. Instead, setting the **`VITE_SUPER_ADMIN_EMAIL`** variable in `.env` establishes the master administrator. Any Google authenticated user whose email matches this value is automatically recognized as a Super Admin, granting them access to the `/super-admin` control portal to manage other staff members and event statuses.

---

## 2. Database Schema & Data Models

To optimize performance and minimize Firebase reads/costs, the system uses a **hybrid database model** combining Firestore (for persistent transactional records) and Realtime Database (for low-latency streams).

### 2.1. Cloud Firestore Collections

#### `admin_users`
Stores configuration details and credentials for admins. The document ID is the admin's email address.
```json
super_admin
{
  "name": "Jane Doe",
  "email": "janedoe@iitgn.ac.in",
  "role": "stall_admin", // "stall_admin" | "Super Admin"
  "stallAssigned": "STALL03", // "STALL01" to "STALL07", or "All" for Super Admins
  "active": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

#### `teams`
Stores overall team profiles, current location, and overall metrics. Document ID is the Team ID (e.g., `TEAM001`).
```json
{
  "teamId": "TEAM001",
  "teamName": "Red Shifters",
  "leaderEmail": "leader@iitgn.ac.in",
  "coins": 3, // Remaining Hint Coins (starts at 3, decrements on hint use)
  "currentStall": "STALL01", // "STALL01" to "STALL07"
  "totalScore": 0,
  "stallSequence":[
        "STALL03",
        "STALL01",
        "STALL06",
        "STALL05",
        "STALL07",
        "STALL04",
        "STALL02"
    ],

  "totalTime": 0, // Total seconds taken across completed stalls
  "members": ["Member 1", "Member 2", "Member 3"],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

#### `team_progress`
Stores detailed stall-by-stall tracking for each team. The document ID matches the Team ID. Each stall key holds its state, timeline, and scores.
```json
{
  "STALL01": {
    "status": "COMPLETED", // "READY" | "PLAYING" | "COMPLETED"
    "startedAt": "Timestamp",
    "endedAt": "Timestamp",
    "timeTaken": 142, // seconds
    "hintUsed": false,
    "baseScore": 100,
    "bonus": 40, // Calculated from timeTaken
    "penalty": 0, // Deducted by Stall Admin
    "finalScore": 140, // baseScore + bonus - penalty
    "remarks": "Clean solve",
    "verifiedBy": "janedoe@iitgn.ac.in",
    "verifiedAt": "Timestamp"
  },
  "STALL02": { "status": "READY" },
  "STALL03": { "status": "READY" },
  "STALL04": { "status": "READY" },
  "STALL05": { "status": "READY" },
  "STALL06": { "status": "READY" },
  "STALL07": { "status": "READY" } // Final destination auditorium stage
}
```

#### `event_status`
Global document (ID `current`) controlling the state of the game.
```json
{
  "status": "RUNNING", // "READY" (waiting to start) | "RUNNING" (in progress) | "ENDED" (concluded)
  "startedAt": "Timestamp",
  "endedAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

#### `stalls`
Metadata for each mission station. Document ID is `STALL01` to `STALL07`.
```json
{
  "stallId": "STALL01",
  "name": "Logical Sorter",
  "description": "Solve the logic grid to obtain the passcode.",
  "location": "LHC Foyer",
  "order": 1
}
```

#### `hints`
Contains the solutions/hints unlocked when teams spend a coin. Document ID matches the Stall ID.
```json
{
  "stallId": "STALL01",
  "hintText": "Look under the red container near the left entrance."
}
```


---

### 2.2. Realtime Database (RTDB) Schema

#### `leaderboard`
Used by the public Leaderboard page to subscribe to live rank changes instantly.
```json
"leaderboard": {
  "TEAM001": {
    "teamName": "Red Shifters",
    "totalScore": 140,
    "totalTime": 142,
    "currentStall": "STALL02"
  }
}
```

#### `activeTeams`
Used by Stall Admins to see real-time queues at their station.
```json
"activeTeams": {
  "TEAM001": {
    "currentStall": "STALL02",
    "status": "PLAYING", // "READY" | "PLAYING" | "VERIFYING" | "FINISHED"
    "updatedAt": 1793798210392
  }
}
```

#### `qr_words`
Stores correct words associated with QR Codes scanned during the Stall 2 Slogan Hunt. Document ID is `QR001` to `QR006`.
```json
{
  "qrId": "QR001",
  "talkId": "TALK1",
  "word": "Ideas"
}
```
---

## 3. Authentication & Access Control Flow

The authentication system is implemented via **Google Sign-in** and strictly restricted to the **IIT Gandhinagar** institutional domain.

```
                  Google Login Redirect
                           │
                           ▼
             Is Email domain @iitgn.ac.in?
                           │
             ┌─────────────┴─────────────┐
            No                           Yes
             │                            │
             ▼                            ▼
      Access Rejected             Check Firestore `admin_users`
                                          │
                    ┌─────────────────────┴─────────────────────┐
                   Yes                                         No
                    │                                           │
                    ▼                                           ▼
          Check Admin Role                     Check Firestore `teams` for Leader Email
                    │                                           │
          ┌─────────┴─────────┐                       ┌─────────┴─────────┐
      super_admin        stall_admin                 Yes                  No
          │                   │                       │                    │
          ▼                   ▼                       ▼                    ▼
     Super Admin         Stall Admin             Participant           Redirected to
      Dashboard           Dashboard               Dashboard             `/no-team`
```

### Route Protection & Event State Filtering:
All sensitive paths are locked behind `<ProtectedRoute>` checks. Additionally, the event state directly influences routing and view visibility:
- **Admin Access:** If an authenticated user is determined to be an admin (either listed in `admin_users` or designated as a default Super Admin), they are routed to their respective dashboards (`/super-admin` or `/admin`). Admins are **never** blocked by the event state.
- **Participant Access & Gating:** If a logged-in user is a registered Team Leader, they are directed to the Participant Dashboard (`/participant`). However, their access is gated by the event status:
  - If the status is **`READY`**, the Team Leader's dashboard is locked behind a fullscreen overlay showing a high-fidelity "Waiting for Event Start" screen. No gameplay controls, timers, or QR scanners are rendered, preventing early play.
  - Only when the status transitions to **`RUNNING`** does the participant dashboard unlock, dynamically revealing the active clue, timer, progress tracker, and scanner interface.
  - If the status transitions to **`ENDED`**, participant interaction is immediately halted, and they are redirected to a final "Event Finished" screen.
- **No-Team Redirect:** If a logged-in user does not belong to any team and is not registered as an admin, they are blocked on the `/no-team` screen prompting them to contact the physical registration desk.

---

## 4. Detailed Feature Breakdown & Flow

### 4.1. Event Lifecycle Control & Staffing (Super Admin)
Super Admins hold absolute control over the platform via the `/super-admin` master portal. Their core responsibilities and features include:

- **Admin Creation & Role Management:**
  - Super Admins can add new system administrators dynamically by entering their name and email (enforcing the institutional `@iitgn.ac.in` domain restriction).
  - They assign the admin's role: **Super Admin** (grants full system access) or **Stall Admin** (assigned to a specific mission, e.g., Stall 1 through 7).
  - They can edit admin attributes or soft-delete them by toggling their `active` status to `inactive` on-the-fly, instantly terminating their access.

- **Master Event Control Engine:**
  - The Super Admin initiates and concludes the event, controlling the state machine (`READY` -> `RUNNING` -> `ENDED`) stored in Firestore (`event_status/current`) which is real-time synchronized to all connected clients.
  - **Transitioning from `READY` to `RUNNING`:** 
    1. During the prep phase, the state is set to `READY`. Team Leaders can sign in, but they are blocked on the "Waiting for Event Start" loader.
    2. Once the briefing is complete, the Super Admin clicks **Start Event** in the portal.
    3. The global state changes to `RUNNING`.
    4. The real-time listener on all active participant devices triggers instantly, removing the waiting overlay and launching the gameplay interface.
  - **Transitioning from `RUNNING` to `ENDED`:**
    1. At the end of the duration, the Super Admin clicks **End Event** (confirming via a modal).
    2. The state changes to `ENDED`.
    3. All active participant dashboards freeze their game timers, disable scanner inputs, and display the final leaderboard links, bringing the treasure hunt to an orderly close.

### 4.2. Team Registration & Management
- A team is registered in Firestore containing a designated **Team Leader** (using their IITGN email).
- Members of the team are listed inside the document.
- Only the Team Leader logs in to represent the team. This ensures single-device progression per team, eliminating duplicate logs or split-run cheats.

### 4.3. Live Leaderboard System
- Accessible publicly at `/leaderboard`.
- **Podium Visuals:** Displays the top 3 teams on a visual 1st, 2nd, and 3rd rank podium using high-fidelity cards.
- **Standings Table:** Lists all teams. Standings are computed dynamically using the following tie-breaker hierarchy:
  1. **Total Score (Descending):** Highest points first.
  2. **Total Time (Ascending):** If scores tie, the team that took less active playing time ranks higher.
  3. **Current Stall (Descending):** If scores and times tie, the team that has progressed further in the stalls ranks higher.

### 4.4. Active Team Location Tracking
- As soon as a team unlocks a stall, their state is written to the RTDB `/activeTeams` channel.
- This allows Stall Admins to see in real-time which teams are currently "PLAYING" at their station and which teams are waiting for grading ("VERIFYING").

### 4.5. Participant Journey & Gameplay States
For any given stall, a participant team cycles through four distinct states. 

```
┌──────────────┐   Scan Stall QR   ┌──────────────┐   Solve Game   ┌──────────────┐
│    READY     │ ────────────────> │   PLAYING    │ -------------> │  VERIFYING   │
└──────────────┘                   └──────────────┘                └──────────────┘
       ▲                                                                  │
       │                        Unlock Next Stall                         │
       └──────────────────────────────────────────────────────────────────┘
                                 (Stall Admin Grades)
```

1. **READY State:**
   - The team is looking at their dashboard.
   - They see their current Hint Coin balance, a textual clue to find the physical station, and a scanner button.
   - **QR Scanner:** To start the mission, they must scan the physical QR code posted at the stall. The app validates the scanned code against `team.currentStall`. If wrong, it alerts the team; if correct, it transitions the state to `PLAYING` and logs the `startedAt` timestamp.
2. **PLAYING State:**
   - A live game timer starts counting up on the dashboard.
   - The team performs the challenge (either a digital game on the screen or a physical task on-site).
   - **Hint System:** If stuck, they can spend a Hint Coin. This deducts 1 coin from their profile, flags `hintUsed: true` in the stall progress, and reveals the station's hint.
   - Upon solving, the team submits their completion, which records the `endedAt` timestamp, calculates the `timeTaken` (seconds), and changes their status to `VERIFYING`.
3. **VERIFYING State:**
   - The team's dashboard turns into a waiting screen ("Waiting for Admin Verification").
   - The team displays their **Team QR Code** on their screen.
   - They cannot progress until a physical Stall Admin scans their Team QR and enters their score.
4. **COMPLETED State (and Next Stall Unlock):**
   - The Stall Admin submits their score.
   - The system calculates the team's final scores, updates their totals, publishes them to the leaderboard, and pushes their `currentStall` to the next level (returning them to the `READY` state for the next stall).

#### The Final Stage (Stall 7 - Final Location):
- Once Stall 6 is verified, the team unlocks Stall 7.
- Their dashboard tells them they have successfully completed all 6 stalls and collected 6 cards.
- The cards form a physical/digital map.
- The team clicks "Start Final Hunt" (starting the final stage timer).
- They must run to the final location indicated by the map (**Jasubhai Auditorium**) and enter the location name in the input box.
- Once they enter "jasubhai auditorium", the system completes Stall 7, records their total finish time, recalculates their final leaderboard scores, and displays the **Finish Page** showing their detailed performance table and trophy.

---

### 4.6. Stall Verification & Scoring Engine
When a Stall Admin grades a team, the scoring engine calculates the final stall score as:
$$\text{Final Score} = \text{Base Score} + \text{Time Bonus} - \text{Penalty}$$

- **Base Score:** Up to 100 points, inputted manually by the Admin based on performance.
- **Time Bonus (Auto-computed):** Reward for speed, encouraging fast execution:
  - $\le 1 \text{ minute} \implies +50 \text{ points}$
  - $\le 2 \text{ minutes} \implies +40 \text{ points}$
  - $\le 3 \text{ minutes} \implies +30 \text{ points}$
  - $\le 4 \text{ minutes} \implies +20 \text{ points}$
  - $\le 5 \text{ minutes} \implies +10 \text{ points}$
  - $> 5 \text{ minutes} \implies +0 \text{ points}$
- **Penalty:** Manually inputted deduction (e.g. for rule-breaking or behavior).
- **Remaining Coins Bonus:** At the very end of the event, each remaining Hint Coin is converted into points:
  $$\text{Coin Bonus} = \text{Remaining Coins} \times 10 \text{ points}$$

---

## 5. Mock Games vs. Real Game Workflows (What is Pending)

While the full architectural, database, routing, and verification systems are fully implemented and functional, **the actual gameplay content is currently mock content.** We are waiting for the final specifications from the event coordinators.

### Current Implementation (Placeholders):
- **Stall 1 (Blockly Logo Recreator):** A drag-and-drop programming challenge where teams arrange blocks to recreate the "TEDx" logo. (TED = white color, x = red color).
- **Stall 2 (Slogan Word Arranger):** A campus hunt where teams scan 6 banners to retrieve words and arrange them to spell *"ideas worth spreading can change lives"*.
- **Stalls 3-6 (Physical Activity Placeholder):** Standard placeholders showing instructions to perform on-site tasks, then clicking "Finish" to call the admin.
- **Stall 7 (Final Destination Solver):** Text box checking for "jasubhai auditorium".

### Production Customization Requirements (What must be updated for the Real Game):
1. **Real Game Configurations:** Replacing mock games with the actual games designed by the TEDx team.
2. **Real Clues and Hints:** Updating the `stalls` and `hints` Firestore collections with the final clues and hints designed for the event.
3. **Physical QR Code Mapping:** Generating and printing QR codes matching the exact database entries (e.g. `STALL01`, `STALL02`, `QR001`, `QR002`) to post at physical booths and banners.
4. **Final Destination:** Confirming the final destination coordinates or text validation (e.g., whether to use GPS location, admin verification at the auditorium, or a final QR code scan).

---

## 6. Developer Utilities & Database Seeding Scripts

To rapidly bootstrap, reset, or test the environment, a set of administrative Node.js scripts is located under the `/scripts` directory.

> [!WARNING]
> **Execution Context Warning:** All seeding scripts must be executed **from the project root directory** (e.g. running `node scripts/createTeams.js` from the main project folder). The configuration module (`firebaseNode.js`) loads variables using `dotenv.config()`, which searches for the `.env` file in the current working directory. If you change directory into `/scripts` and attempt to run the scripts from there, the database connection credentials will fail to load, causing execution crashes.

- **`firebaseNode.js`:** Initializes the Firebase Admin SDK in Node.js, reading secrets from environment variables.
- **`createAdmins.js`:** Seeds initial Super Admin and Stall Admin accounts into the `admin_users` collection.
- **`createTeams.js`:** Creates standard test teams (TEAM001 to TEAM010) with member lists and leader emails.
- **`createStalls.js`:** Seeds metadata for Stalls 1-7 (names, descriptions, locations).
- **`createHints.js`:** Populates the `hints` collection with hints corresponding to each stall.
- **`createQRWords.js`:** Registers the words and talk banners associated with Stall 2.
- **`createTeamProgress.js`:** Initializes empty progress templates for all teams to ensure they can begin playing immediately.

---

## 7. Production Operations Guide

### 7.1. Database Reset / Initialization
Before the event starts:
1. Clear the Firestore collections (`teams`, `team_progress`, `admin_users`, `stalls`, `hints`, `qr_words`) and the Realtime Database nodes (`leaderboard`, `activeTeams`).
2. Run the seeding scripts to initialize the data structures (**ensure you run them from the project root folder**):
   ```bash
   node scripts/createStalls.js
   node scripts/createHints.js
   node scripts/createQRWords.js
   node scripts/createAdmins.js
   node scripts/createTeams.js
   node scripts/createTeamProgress.js
   ```
3. Set the global event status in Firestore `event_status/current` to `READY`.

### 7.2. During the Event
1. Log in to the Super Admin panel (`/super-admin`) and click **Start Event**. This sets the state to `RUNNING` in Firestore.
2. Participant dashboards will automatically refresh and unlock.
3. Stall Admins log in, navigate to their assigned stall dashboards, and monitor the live queue of teams.
4. When a team finishes a stall:
   - The team displays their Team QR.
   - The Stall Admin clicks **Scan Team QR** (or selects the team from the queue), reviews their active time, inputs the score & penalty, and hits **Submit**.
   - The team is automatically unlocked and routed to the next stall.
5. In case of user login issues, Super Admins can manually register teams or reset team progression.

### 7.3. Concluding the Event
1. Once the top teams reach the final destination and log their times, go to `/super-admin` and click **End Event**.
2. This locks the game state to `ENDED`, shutting down scanner interfaces and displaying the final standings.

---

## 8. Current Project Status & Action Items

| Component | Status | Description / Next Steps |
| :--- | :--- | :--- |
| **Auth System** | **Complete** ✅ | Restricted to `@iitgn.ac.in` domain. Role routing active. |
| **Super Admin Portal** | **Complete** ✅ | Handles admin creation, role assignments, and global event controls. |
| **Admin Scoring Portal** | **Complete** ✅ | Queue tables, QR verification scanners, and scoring calculations. |
| **Live Leaderboard** | **Complete** ✅ | RTDB integrations, podium views, and three-stage sorting algorithms. |
| **Progress Tracker** | **Complete** ✅ | Automated transitions between READY, PLAYING, VERIFYING, and COMPLETED. |
| **Scoring Logic** | **Complete** ✅ | Decaying time-based bonuses, coin scoring, and manual grading interfaces. |
| **Seed Scripts** | **Complete** ✅ | Automated setup scripts for all Firestore documents. |
| **Gameplay Content** | **Pending** ⏳ | **Awaiting final rules, clues, hints, and games from organizers.** |
| **Physical Collateral** | **Pending** ⏳ | **Generating and printing QR codes/banners for setup.** |