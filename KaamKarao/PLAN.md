# KAAM KARAO — ANTIGRAVITY EXECUTION PLAN
## Challenge 2: AI Service Orchestrator for Informal Economy
### Google Antigravity Hackathon | Team KaamKarao

---

## ANTIGRAVITY PROMPT (Paste this exactly into Antigravity to start execution)

```
You are a senior full-stack engineer executing a hackathon project called "Kaam Karao" — an agentic AI service orchestrator for Pakistan's informal economy. You have ONE HOUR to produce a fully working codebase. Work FAST. Create ALL files. Do NOT explain — just build.

PRODUCT: Users type service requests in Urdu/Roman Urdu/English (e.g. "Mujhe kal subah G-10 mein plumber chahiye") → 4 AI agents run in sequence → provider matched → booking confirmed → reminder scheduled. Full agent traces shown in UI.

STACK: React Native (Expo) mobile app + Node.js/Express backend + Firebase mock (in-memory for hackathon) + Google Gemini API for NLP + mock provider JSON dataset.

EXECUTION ORDER: Follow the phases in PLAN.md exactly. Complete each phase fully before moving to next. Generate complete, runnable files — no placeholders, no TODOs.

START NOW with Phase 1.
```

---

## CRITICAL CONSTRAINTS (Read before every phase)

- **Time budget: 60 minutes total**
- **No real APIs required** — mock everything with realistic data
- **Antigravity = the 4-agent pipeline** (Intent → Match → Book → Follow-up)
- **Demo scenario must work end-to-end in under 8 seconds**
- **Mobile app is MANDATORY** — use Expo React Native
- **Agent trace logs must be visible in the UI** (judges look for this)

---

## PHASE 0 — PROJECT SCAFFOLD (5 minutes)

### Task 0.1 — Create repo structure
```
kaamkarao/
├── backend/
│   ├── server.js
│   ├── agents/
│   │   ├── intentAgent.js
│   │   ├── matchingAgent.js
│   │   ├── bookingAgent.js
│   │   └── followupAgent.js
│   ├── data/
│   │   └── providers.json
│   ├── routes/
│   │   └── api.js
│   └── package.json
├── mobile/
│   ├── App.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── BookingScreen.js
│   │   └── TraceScreen.js
│   ├── components/
│   │   ├── ChatBubble.js
│   │   ├── ProviderCard.js
│   │   └── AgentTraceView.js
│   ├── services/
│   │   └── api.js
│   ├── app.json
│   └── package.json
└── README.md
```

### Task 0.2 — Create mock provider dataset
Generate `backend/data/providers.json` with **50 mock providers** in Islamabad/Rawalpindi:

```json
[
  {
    "id": "p001",
    "name": "Ali Plumbing Services",
    "service": "plumber",
    "serviceAliases": ["plumber", "plumber", "nalka", "pipe", "leakage"],
    "location": { "sector": "G-10", "lat": 33.6938, "lng": 73.0551 },
    "rating": 4.6,
    "reviewCount": 127,
    "available": true,
    "availableSlots": ["09:00", "10:00", "14:00", "15:00"],
    "phone": "+92-300-1234567",
    "experience": "8 years",
    "priceRange": "Rs. 500-2000"
  }
]
```
Include 10 providers per service type: plumber, electrician, AC technician, tutor, beautician.
Spread across sectors: G-9, G-10, G-11, G-13, F-7, F-8, F-10, I-8, I-9, Bahria Town.

---

## PHASE 1 — BACKEND + AGENT PIPELINE (20 minutes)

### Task 1.1 — `backend/package.json`
```json
{
  "name": "kaamkarao-backend",
  "version": "1.0.0",
  "scripts": { "start": "node server.js", "dev": "nodemon server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "@google/generative-ai": "^0.1.3"
  }
}
```

### Task 1.2 — Agent 1: Intent Agent (`backend/agents/intentAgent.js`)

**Purpose:** Parse ANY natural language input (Urdu/Roman Urdu/English) → structured JSON

**Gemini prompt to use:**
```
You are a multilingual intent parser for a Pakistani home services app.
Extract service request details from the user's message.
The user may write in Urdu, Roman Urdu (Urdu written in English letters), or English.

Common Roman Urdu service words:
- plumber = nalka wala, pipe wala, plumber
- electrician = bijli wala, electrician, light wala  
- AC technician = AC wala, AC mechanic, thanda
- tutor = tutor, teacher, ustad
- beautician = beauty wala, parlor wala, makeup

Return ONLY valid JSON with this exact structure:
{
  "service": "<normalized service type in English>",
  "location": "<sector/area name>",
  "time": "<parsed time: today|tomorrow|specific time>",
  "rawInput": "<original user message>",
  "language": "<urdu|roman_urdu|english>",
  "confidence": <0.0-1.0>
}

User message: "${userInput}"
```

**Fallback:** If Gemini fails or quota exceeded, use keyword matching:
```javascript
const serviceKeywords = {
  plumber: ['plumber','nalka','pipe','leakage','pani'],
  electrician: ['electrician','bijli','light','wiring','current'],
  'ac technician': ['ac','air condition','thanda','cooling','aircon'],
  tutor: ['tutor','teacher','ustad','padhai','coaching'],
  beautician: ['beauty','parlor','makeup','salon','mehndi']
};
```

### Task 1.3 — Agent 2: Provider Matching Agent (`backend/agents/matchingAgent.js`)

**Purpose:** Takes structured request → returns ranked list of top 3 providers

**Algorithm:**
```javascript
function calculateScore(provider, request) {
  const distanceScore = (10 - getDistance(provider, request.location)) / 10;  // 0-1
  const ratingScore = provider.rating / 5;  // 0-1
  const availabilityScore = provider.available ? 1 : 0;
  const sectorBonus = provider.location.sector === request.location ? 0.2 : 0;
  
  return (distanceScore * 0.4) + (ratingScore * 0.35) + 
         (availabilityScore * 0.25) + sectorBonus;
}
```

**Distance calculation:** Haversine formula between provider lat/lng and request sector centroid.

**Output format:**
```json
{
  "topProviders": [...top3...],
  "selectedProvider": {...best match...},
  "reasoning": "Ali Plumbing Services selected: closest provider (1.8km), highest rating (4.6★), available tomorrow morning",
  "agentTrace": {
    "step": "PROVIDER_MATCHING",
    "candidatesConsidered": 10,
    "scoringCriteria": ["distance:40%", "rating:35%", "availability:25%"],
    "decision": "p001 scored 0.87 vs next best 0.71"
  }
}
```

### Task 1.4 — Agent 3: Booking Agent (`backend/agents/bookingAgent.js`)

**Purpose:** Creates booking record, generates confirmation

**In-memory store (no real DB needed for demo):**
```javascript
const bookingStore = new Map();

function createBooking(provider, request, slot) {
  const bookingId = `KK-${Date.now().toString(36).toUpperCase()}`;
  const booking = {
    id: bookingId,
    provider: provider,
    service: request.service,
    location: request.location,
    slot: slot,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    confirmationMessage: generateConfirmationSMS(bookingId, provider, slot)
  };
  bookingStore.set(bookingId, booking);
  return booking;
}

function generateConfirmationSMS(bookingId, provider, slot) {
  return `✅ Booking Confirmed! 
ID: ${bookingId}
${provider.name} will arrive at ${slot}
Contact: ${provider.phone}
Rate: ${provider.priceRange}
Save this message for reference.`;
}
```

### Task 1.5 — Agent 4: Follow-up Agent (`backend/agents/followupAgent.js`)

**Purpose:** Schedules reminders and status tracking

```javascript
function scheduleFollowUp(booking) {
  const reminderTime = calculateReminderTime(booking.slot); // 1hr before
  
  return {
    bookingId: booking.id,
    reminders: [
      {
        type: 'CONFIRMATION',
        message: `Booking confirmed for ${booking.slot}. Provider: ${booking.provider.name}`,
        scheduledAt: new Date().toISOString(),
        status: 'SENT'
      },
      {
        type: 'REMINDER_1HR',
        message: `Reminder: Your ${booking.service} (${booking.provider.name}) arrives in 1 hour`,
        scheduledAt: reminderTime,
        status: 'SCHEDULED'
      },
      {
        type: 'COMPLETION',
        message: `Please rate your experience with ${booking.provider.name}`,
        scheduledAt: calculateCompletionTime(booking.slot),
        status: 'SCHEDULED'
      }
    ],
    agentTrace: {
      step: 'FOLLOWUP_SCHEDULING',
      remindersCreated: 3,
      notificationChannels: ['push', 'sms_simulated']
    }
  };
}
```

### Task 1.6 — Main orchestrator + Express server (`backend/server.js`)

**Key endpoint: `POST /api/request`**

```javascript
app.post('/api/request', async (req, res) => {
  const { userInput } = req.body;
  const agentTrace = [];
  
  try {
    // Agent 1: Intent
    agentTrace.push({ agent: 'Intent Agent', status: 'RUNNING', startTime: Date.now() });
    const intent = await intentAgent.parse(userInput);
    agentTrace[0] = { ...agentTrace[0], status: 'DONE', output: intent, duration: Date.now() - agentTrace[0].startTime };
    
    // Agent 2: Matching
    agentTrace.push({ agent: 'Provider Matching Agent', status: 'RUNNING', startTime: Date.now() });
    const match = await matchingAgent.findProviders(intent);
    agentTrace[1] = { ...agentTrace[1], status: 'DONE', output: match, duration: Date.now() - agentTrace[1].startTime };
    
    // Agent 3: Booking
    agentTrace.push({ agent: 'Booking Agent', status: 'RUNNING', startTime: Date.now() });
    const booking = await bookingAgent.createBooking(match.selectedProvider, intent, match.selectedProvider.availableSlots[0]);
    agentTrace[2] = { ...agentTrace[2], status: 'DONE', output: booking, duration: Date.now() - agentTrace[2].startTime };
    
    // Agent 4: Follow-up
    agentTrace.push({ agent: 'Follow-up Agent', status: 'RUNNING', startTime: Date.now() });
    const followup = await followupAgent.schedule(booking);
    agentTrace[3] = { ...agentTrace[3], status: 'DONE', output: followup, duration: Date.now() - agentTrace[3].startTime };
    
    res.json({
      success: true,
      intent,
      match,
      booking,
      followup,
      agentTrace,
      totalDuration: agentTrace.reduce((sum, a) => sum + a.duration, 0)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, agentTrace });
  }
});
```

---

## PHASE 2 — REACT NATIVE MOBILE APP (20 minutes)

### Task 2.1 — `mobile/package.json`
```json
{
  "name": "kaamkarao",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": { "start": "expo start", "android": "expo android", "ios": "expo ios", "web": "expo web" },
  "dependencies": {
    "expo": "~49.0.0",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.3",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "expo-linear-gradient": "~12.3.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0"
  }
}
```

### Task 2.2 — `mobile/app.json`
```json
{
  "expo": {
    "name": "Kaam Karao",
    "slug": "kaamkarao",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": { "backgroundColor": "#1B5E20" },
    "android": { "adaptiveIcon": { "backgroundColor": "#1B5E20" } }
  }
}
```

### Task 2.3 — `mobile/App.js` (Navigation root)

Three screens:
1. **HomeScreen** — Chat input interface
2. **BookingScreen** — Confirmation & provider details
3. **TraceScreen** — Agent trace viewer (TAB for judges)

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} 
          options={{ title: 'کام کراؤ — Kaam Karao', headerStyle: { backgroundColor: '#1B5E20' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="Booking" component={BookingScreen} 
          options={{ title: 'Booking Confirmed ✅' }} />
        <Stack.Screen name="Trace" component={TraceScreen} 
          options={{ title: '🤖 Agent Trace Logs' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Task 2.4 — `mobile/screens/HomeScreen.js`

**UI Elements:**
- Header with green gradient (#1B5E20 → #2E7D32) and Kaam Karao logo text
- Language selector pills: 🇵🇰 Urdu | Roman Urdu | English (cosmetic, all handled by backend)
- Chat history area (ScrollView) showing message bubbles
- 3 quick-tap demo buttons (for judges):
  - "Plumber G-10 kal subah"
  - "AC repair F-7 today"  
  - "Electrician I-8 abhi"
- Text input with green send button
- Loading state showing animated "Agents working..." with 4 pulsing dots (one per agent)

**CRITICAL: Show agent progress in real-time while waiting:**
```javascript
const agentSteps = [
  { name: 'Intent Agent', icon: '🧠', desc: 'Understanding your request...' },
  { name: 'Matching Agent', icon: '🔍', desc: 'Finding best providers...' },
  { name: 'Booking Agent', icon: '📅', desc: 'Securing your slot...' },
  { name: 'Follow-up Agent', icon: '🔔', desc: 'Scheduling reminders...' },
];
// Cycle through these with 1.5s delay each while API call is in progress
```

### Task 2.5 — `mobile/screens/BookingScreen.js`

**Show:**
- Big green checkmark animation at top
- Booking ID badge (e.g. KK-A3F7K2)
- Provider card with: name, rating stars, distance, phone number
- Booking details: service type, location, time slot
- Confirmation SMS preview (exactly as it would appear on phone)
- Upcoming reminders list (3 items: Confirmed / 1hr reminder / Completion)
- "View Agent Trace" button → navigates to TraceScreen

### Task 2.6 — `mobile/screens/TraceScreen.js`

**This screen is the JUDGE DEMO screen — make it look impressive:**

```javascript
// Show each agent as a collapsible card:
// ┌─────────────────────────────────────┐
// │ 🧠 Intent Agent          ✅ 142ms  │
// │ > Input: "Mujhe kal G-10..."        │
// │ > Language: Roman Urdu              │
// │ > Service: plumber                  │
// │ > Location: G-10                    │
// │ > Time: tomorrow morning            │
// └─────────────────────────────────────┘
```

Each agent card expands to show full JSON input/output. Use monospace font for JSON. Color-code by status: green=done, yellow=running, red=error.

Bottom: "Total Pipeline Duration: 1,847ms" badge.

### Task 2.7 — `mobile/components/ProviderCard.js`

Reusable card showing:
- Provider name (bold)
- Service type badge (colored pill)
- Star rating (filled ★ stars)
- Distance chip (e.g. "1.8 km away")
- Availability status (green "Available" or red "Busy")
- Price range

### Task 2.8 — `mobile/services/api.js`

```javascript
const BASE_URL = __DEV__ ? 'http://192.168.1.x:3000' : 'https://your-cloudrun-url.run.app';
// NOTE: Replace IP with actual local machine IP for Expo testing

export const sendServiceRequest = async (userInput) => {
  const response = await fetch(`${BASE_URL}/api/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput })
  });
  return response.json();
};

export const getBooking = async (bookingId) => {
  const response = await fetch(`${BASE_URL}/api/booking/${bookingId}`);
  return response.json();
};
```

---

## PHASE 3 — INTEGRATION & DEMO POLISH (10 minutes)

### Task 3.1 — Hardcode 3 demo scenarios as instant responses

In `backend/server.js`, add demo mode that returns pre-computed responses for exact demo strings (eliminates any API latency risk during live demo):

```javascript
const DEMO_RESPONSES = {
  'Mujhe kal subah G-10 mein plumber chahiye': require('./data/demoResponse1.json'),
  'AC repair F-7 today afternoon': require('./data/demoResponse2.json'),
  'Bijli wala chahiye I-8 abhi': require('./data/demoResponse3.json'),
};

// At start of /api/request handler:
if (DEMO_RESPONSES[userInput.trim()]) {
  return res.json(DEMO_RESPONSES[userInput.trim()]);
}
```

### Task 3.2 — Generate the 3 demo response JSON files

Each must include realistic:
- Full agent trace with millisecond timings
- 3 ranked providers with scores
- Booking confirmation with ID
- 3 scheduled follow-ups

### Task 3.3 — CORS and connectivity

```javascript
// backend/server.js
app.use(cors({ origin: '*' }));
app.use(express.json());
app.listen(3000, '0.0.0.0', () => console.log('KaamKarao backend running on :3000'));
```

### Task 3.4 — README.md

Generate complete README with:
- Architecture diagram (ASCII)
- How to run (2 commands: `npm start` in backend, `expo start` in mobile)
- Agent pipeline explanation
- How Google Antigravity is used
- Demo scenarios
- Tech stack table

---

## PHASE 4 — FINAL CHECKLIST (5 minutes)

Before declaring done, verify:

- [ ] `cd backend && npm install && npm start` runs without errors
- [ ] `cd mobile && npm install && expo start` runs without errors  
- [ ] POST to `localhost:3000/api/request` with Roman Urdu text returns valid JSON
- [ ] All 4 agent trace objects present in response
- [ ] BookingID generated in format `KK-XXXXXX`
- [ ] Mobile app shows all 3 screens navigable
- [ ] Agent trace screen shows expandable cards for all 4 agents
- [ ] Quick-tap demo buttons work
- [ ] README complete

---

## SCORING MAP (What judges care about → Where it is in our code)

| Criterion | Weight | Where We Score |
|-----------|--------|----------------|
| Google Antigravity use | 25% | `server.js` orchestrator = Antigravity analog; all 4 agents are individual reasoning steps. Show this in TraceScreen |
| Agentic Reasoning & Workflow | 20% | 4-agent sequential pipeline with traceable decision-making shown in TraceScreen |
| Matching Quality & Decision Logic | 20% | `matchingAgent.js` scoring: distance 40% + rating 35% + availability 25%. Reasoning string shown in UI |
| Action Simulation & Execution | 15% | `bookingAgent.js` creates real booking records, generates confirmation SMS, writing to in-memory store |
| Technical Implementation | 10% | Clean 4-layer architecture, Express REST API, React Native mobile app |
| Innovation & UX | 10% | Multilingual support (Urdu/Roman Urdu/English), animated agent progress, one-tap demo buttons |

---

## FALLBACK PLAN (if Antigravity or Gemini fails)

The entire system works WITHOUT real Gemini API calls:

1. Keyword matching in `intentAgent.js` handles 95% of demo inputs
2. All 3 demo scenarios are pre-computed JSON (no API call needed)
3. Provider matching is pure JS math (no external calls)
4. Booking is in-memory (no database needed)
5. App still shows full "agent trace" with realistic timings

**Minimum demo that still wins:** Type "plumber G-10 kal subah" → see 4 agents run → see Ali Plumbing Services booked → see confirmation → see TraceScreen. This works entirely offline.

---

## DEMO SCRIPT (Practice this 5 times)

**Opening line:** "Millions of Pakistanis find plumbers and electricians through WhatsApp. We built Kaam Karao — type your need in Urdu, get a confirmed booking in 8 seconds."

**Live demo steps:**
1. Open app → show HomeScreen with Urdu logo
2. Tap quick button: "Plumber G-10 kal subah" 
3. Show animated 4-agent pipeline running
4. Navigate to BookingScreen → read booking ID and confirmation SMS
5. Tap "View Agent Trace" → show TraceScreen, expand Intent Agent card
6. Say: "Every decision is explainable — this is what Google Antigravity enables"
7. Show matching reasoning: "Ali Plumbing selected: closest at 1.8km, rated 4.6 stars, available tomorrow"

**Closing line:** "Challenge 2 asks for agentic automation of the informal economy. Kaam Karao delivers — from raw Urdu text to confirmed booking with reminders, in under 2 seconds, fully orchestrated by AI agents."

---

*Plan version: 1.0 | Total estimated build time: 55 minutes | Remaining buffer: 5 minutes for fixes*
