# 🇵🇰 کام کراؤ — Kaam Karao

### AI-Powered Service Orchestrator for Pakistan's Informal Economy
**Google Antigravity Hackathon | Challenge 2: AI Service Orchestrator**

> *"Millions of Pakistanis find plumbers and electricians through WhatsApp. We built Kaam Karao — type your need in Urdu, get a confirmed booking in 8 seconds."*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    📱 MOBILE APP (Expo React Native)            │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │HomeScreen│  │BookingScreen │  │TraceScreen (Judge Demo)   │ │
│  │Chat UI   │→ │Confirmation  │→ │4-Agent Trace Viewer       │ │
│  └──────────┘  └──────────────┘  └───────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🖥️ BACKEND (Node.js + Express)                 │
│                                                                 │
│  POST /api/request                                              │
│  ┌─────────┐   ┌──────────┐   ┌─────────┐   ┌──────────────┐  │
│  │🧠 Intent│ → │🔍 Match  │ → │📅 Book  │ → │🔔 Follow-up  │  │
│  │  Agent  │   │  Agent   │   │  Agent  │   │    Agent     │  │
│  └─────────┘   └──────────┘   └─────────┘   └──────────────┘  │
│       │              │              │               │           │
│       ▼              ▼              ▼               ▼           │
│  Parse Urdu/   Score & Rank    Create Booking  Schedule 3      │
│  Roman Urdu/   50 Providers    Generate SMS    Reminders       │
│  English       Top 3 Match     Confirm Slot    Push + SMS      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📊 Agent Trace: Every decision logged with timestamps   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              🗄️ DATA LAYER                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │providers.json  │  │In-Memory Store │  │Google Gemini API │   │
│  │50 providers    │  │Bookings Map    │  │Intent Parsing    │   │
│  │5 service types │  │Follow-ups      │  │+ Keyword Fallback│   │
│  └────────────────┘  └────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### 1. Start Backend
```bash
cd backend
npm install
npm start
```
Server runs on `http://localhost:3000`

### 2. Start Mobile App
```bash
cd mobile
npm install
npx expo start
```
Scan QR code with Expo Go app, or press `w` for web.

### 3. (Optional) Set Gemini API Key
```bash
# In backend/.env
GEMINI_API_KEY=your_api_key_here
```
The app works **without** a Gemini API key using keyword-based fallback parsing.

---

## 🤖 The 4-Agent Antigravity Pipeline

| # | Agent | Purpose | Tech |
|---|-------|---------|------|
| 1 | 🧠 **Intent Agent** | Parse multilingual input (Urdu/Roman Urdu/English) into structured service request | Google Gemini API + keyword fallback |
| 2 | 🔍 **Matching Agent** | Score & rank 50 providers using distance (40%) + rating (35%) + availability (25%) | Haversine formula + weighted scoring |
| 3 | 📅 **Booking Agent** | Create confirmed booking, generate SMS confirmation, assign slot | In-memory store + ID generation |
| 4 | 🔔 **Follow-up Agent** | Schedule 3 reminders: confirmation, 1-hour before, completion/rating | Timer scheduling simulation |

Every agent produces a **trace log** with inputs, outputs, reasoning, and millisecond-level timing — visible in the app's Trace Screen.

---

## 🗣️ Multilingual Support

| Language | Example Input |
|----------|--------------|
| Roman Urdu | "Mujhe kal subah G-10 mein plumber chahiye" |
| English | "AC repair F-7 today afternoon" |
| Roman Urdu | "Bijli wala chahiye I-8 abhi" |
| Urdu | "مجھے پلمبر چاہیے G-10" |

The Intent Agent handles all three languages seamlessly via Gemini's multilingual capabilities, with a keyword fallback for Roman Urdu/English that works offline.

---

## 📱 Demo Scenarios (Quick-Tap Buttons)

| Button | Scenario | Expected Output |
|--------|----------|----------------|
| 🔧 Plumber G-10 kal subah | Plumber needed tomorrow morning in G-10 | Ali Plumbing Services, 4.6★, Rs. 500-2000 |
| ❄️ AC repair F-7 today | AC technician needed today in F-7 | Cool Breeze AC Services, 4.7★, Rs. 1500-5000 |
| ⚡ Bijli wala I-8 abhi | Electrician needed now in I-8 | Bright Spark Electricals, 4.5★, Rs. 800-3000 |

All three scenarios have **pre-computed responses** for instant demo (no API latency).

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Mobile App | React Native (Expo) |
| Backend API | Node.js + Express |
| AI/NLP | Google Gemini API |
| Data Store | In-memory (Firebase mock) |
| Provider Data | JSON dataset (50 providers) |
| Navigation | React Navigation |
| Styling | React Native StyleSheet |

---

## 🎯 How Google Antigravity Is Used

**Antigravity = Our 4-Agent Sequential Pipeline**

The `server.js` orchestrator is our Antigravity analog. It coordinates 4 specialized AI agents that work in sequence, each building on the previous agent's output:

1. Raw text → **structured intent** (Gemini AI)
2. Structured intent → **ranked provider matches** (scoring algorithm)
3. Best match → **confirmed booking** (state management)
4. Booking → **scheduled follow-ups** (notification pipeline)

Every decision is **explainable and traceable** — the TraceScreen shows judges exactly how each agent reasoned about the input, what data it considered, and why it made its decision.

---

## 📂 Project Structure

```
kaamkarao/
├── backend/
│   ├── server.js              # Express server + CORS
│   ├── package.json
│   ├── agents/
│   │   ├── intentAgent.js     # 🧠 Gemini-powered NLP parser
│   │   ├── matchingAgent.js   # 🔍 Provider scorer & ranker
│   │   ├── bookingAgent.js    # 📅 Booking creator
│   │   └── followupAgent.js   # 🔔 Reminder scheduler
│   ├── data/
│   │   ├── providers.json     # 50 mock providers
│   │   ├── demoResponse1.json # Pre-computed demo
│   │   ├── demoResponse2.json # Pre-computed demo
│   │   └── demoResponse3.json # Pre-computed demo
│   └── routes/
│       └── api.js             # REST API routes
├── mobile/
│   ├── App.js                 # Navigation root
│   ├── app.json               # Expo config
│   ├── package.json
│   ├── screens/
│   │   ├── HomeScreen.js      # Chat interface
│   │   ├── BookingScreen.js   # Confirmation view
│   │   └── TraceScreen.js     # Agent trace viewer
│   ├── components/
│   │   ├── ChatBubble.js      # Message bubble
│   │   ├── ProviderCard.js    # Provider info card
│   │   └── AgentTraceView.js  # Trace card
│   └── services/
│       └── api.js             # API client
└── README.md
```

---

## 🏆 Scoring Alignment

| Criterion | Weight | Our Implementation |
|-----------|--------|-------------------|
| Google Antigravity Use | 25% | 4-agent orchestrator = Antigravity analog, visible in TraceScreen |
| Agentic Reasoning | 20% | Sequential pipeline with traceable decisions at each step |
| Matching Quality | 20% | Weighted scoring: distance 40% + rating 35% + availability 25% |
| Action Simulation | 15% | Real booking records, SMS confirmation, reminder scheduling |
| Technical Implementation | 10% | Clean architecture, REST API, React Native mobile |
| Innovation & UX | 10% | Multilingual (Urdu/Roman Urdu/English), animated agent progress |

---

## 👥 Team KaamKarao

Built with ❤️ for the Google Antigravity Hackathon

*"From raw Urdu text to confirmed booking with reminders — in under 2 seconds, fully orchestrated by AI agents."*
