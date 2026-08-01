# Implementation Plan - TEDxpedition Premium Frontend Design

We will design a cohesive, stunning, and highly interactive frontend for **TEDxpedition**, inspired by the TEDx theme (Black background `#000000`, TEDx Red `#e10600`, clean typography, card layouts, and subtle neon glows/glassmorphism).

---

## User Review Required

> [!IMPORTANT]
> - We will create separate, modular components for the **QR Scanner**, **Timer**, and **Hint Dialog** inside `src/components`.
> - The **Timer** starts *only* after the correct stall QR is scanned and recorded in the database.
> - We will create a beautiful, interactive **Blockly Coding simulation** (Stall 1) and **TED Talk QR Puzzle** (Stall 2) that can run directly on the web frontend.
> - We will style the existing `SignIn.jsx` page with the premium theme while preserving its Google login logic exactly.

---

## Proposed Changes

### 1. Foundation & Global Styles

#### [MODIFY] [index.css](file:///d:/TedxPedition/src/index.css)
- Implement global CSS variables for colors, transitions, and layout resets.
- Import the modern sans-serif font `Outfit` or `Inter` from Google Fonts.
- Define cards, gradients, input fields, buttons, and responsive scrollbars.

---

### 2. Common Reusable Components

#### [NEW] [QRScanner.jsx](file:///d:/TedxPedition/src/components/QRScanner/QRScanner.jsx) and `QRScanner.css`
- A reusable modal/overlay scanner component.
- Features a glowing scanner line anim, camera permissions handling, and manual code input fallback for robust testing.

#### [NEW] [Timer.jsx](file:///d:/TedxPedition/src/components/Timer/Timer.jsx) and `Timer.css`
- A stopwatch component that handles active count-up time based on a start time (`startedAt`).
- Starts running only after the correct stall QR has been successfully scanned.
- Periodically updates the screen to show minutes and seconds.

#### [NEW] [HintDialog.jsx](file:///d:/TedxPedition/src/components/HintDialog/HintDialog.jsx) and `HintDialog.css`
- A confirmation dialog modal prompting teams to spend 1 coin (out of 3) to view a hint.
- Performs verification and triggers the database coin deduction.

---

### 3. Participant Workspace

#### [MODIFY] [ParticipantDashboard.jsx](file:///d:/TedxPedition/src/pages/ParticipantDashboard.jsx)
- Displays current progress: Active Stall, Current Clue, Team Members, and remaining Hint Coins.
- Uses the new `Timer` component to track stall duration and `HintDialog` component for hints.

#### [NEW] [ChallengePage.jsx](file:///d:/TedxPedition/src/pages/ChallengePage.jsx)
- Renders the interactive challenge page based on the current stall type:
  - **Stall 1 (Blockly Logo Recreator)**: Drag-and-drop or ordered-block puzzle where players place Blockly blocks to draw the TEDx logo.
  - **Stall 2 (TED Talk QR Words)**: Collects 6 words from QR codes, lets users arrange them into a sentence, and validates it. Uses `QRScanner` component.
  - **Stall 3 to 6 (Offline challenges)**: Counts up active time using `Timer`, shows game requirements, and lets teams click "Finish Game" to wait for admin verification.

#### [NEW] [WaitingForVerificationPage.jsx](file:///d:/TedxPedition/src/pages/WaitingForVerificationPage.jsx)
- Displayed when a participant finishes a stall and is waiting for the admin to enter scores and verify.
- Live loader showing status.

#### [NEW] [FinalLocation.jsx](file:///d:/TedxPedition/src/pages/FinalLocation.jsx)
- Active at Stall 7. Displays a final input screen where participants enter the location coordinates or name.
- Asks user to enter the final location: "Jasubhai Auditorium" (or whatever final location is set).
- Validates location, stops overall time, and updates final scores.

#### [NEW] [FinishPage.jsx](file:///d:/TedxPedition/src/pages/FinishPage.jsx)
- Congratulations screen showing final metrics: Total score, time bonus, coins left, and ranking button.

---

### 4. Admin Dashboard & Scoring

#### [MODIFY] [AdminDashboard.jsx](file:///d:/TedxPedition/src/pages/AdminDashboard.jsx)
- A control station for stall admins.
- Allows the admin to select their assigned stall (1 to 6).
- Prompts to scan Team QR or search/select from a list of active teams. Uses `QRScanner` component.

#### [NEW] [AdminScorePage.jsx](file:///d:/TedxPedition/src/pages/AdminScorePage.jsx)
- Accessible by admins after scanning/selecting a team.
- Shows team stats: current timer, coins left, current stall progress.
- Input fields: Game Score (0-50/100), Bonus points, Remarks.
- Submits and triggers next stall unlock, and updates realtime leaderboard database.

---

### 5. Live Leaderboard

#### [NEW] [Leaderboard.jsx](file:///d:/TedxPedition/src/pages/Leaderboard.jsx)
- Real-time Leaderboard table reading directly from Firebase Realtime Database.
- Highlights top 3 teams in gold, silver, and bronze.
- Displays Rank, Team Name, Total Score, Coins Left, and Total Time taken.

---

## Verification Plan

### Automated Tests
- Build verification using `npm run build`.
- Local development testing using `npm run dev`.

### Manual Verification
- Simulate complete flow: log in as participant -> reach stall 1 -> scan stall 1 QR -> play blockly puzzle -> finish -> verify as admin -> go to stall 2 -> collect words -> verify sentence -> verify offline stalls -> solve final puzzle at Stall 7 -> check finished status on live leaderboard.

#### Edge-Case Scenarios to Verify:
1. **Out-of-Order QR Scans**: A team attempts to scan the Stall 3 QR code while currently assigned to Stall 2. Ensure they receive an error alert and cannot start Stall 3.
2. **Page Refresh Resilience**: Refresh the page while a stall timer is active. Ensure the timer resumes seamlessly using the `startedAt` timestamp from the database rather than resetting to zero.
3. **Zero Coin Hint Attempts**: Attempt to click the "Hint" button when `coins` is `0`. Confirm the button is disabled or alerts the user that they have no coins left.
4. **Invalid QR Scans**: Scan arbitrary/non-game QR codes. Confirm the scanner alerts the user with an "Invalid QR Code" error without crashing.
5. **Simultaneous Submissions**: Simulate rapid double-clicks on submit/scoring forms. Ensure only one transaction completes.
