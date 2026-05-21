const express = require('express');
const router = express.Router();

const intentAgent = require('../agents/intentAgent');
const matchingAgent = require('../agents/matchingAgent');
const bookingAgent = require('../agents/bookingAgent');
const followupAgent = require('../agents/followupAgent');

// Load demo responses
const demoResponse1 = require('../data/demoResponse1.json');
const demoResponse2 = require('../data/demoResponse2.json');
const demoResponse3 = require('../data/demoResponse3.json');

const DEMO_INPUTS = {
  'mujhe kal subah g-10 mein plumber chahiye': demoResponse1,
  'plumber g-10 kal subah': demoResponse1,
  'ac repair f-7 today': demoResponse2,
  'ac repair f-7 today afternoon': demoResponse2,
  'bijli wala i-8 abhi': demoResponse3,
  'bijli wala chahiye i-8 abhi': demoResponse3,
  'electrician i-8 abhi': demoResponse3
};

// Strip emojis and extra whitespace for matching
function cleanInput(text) {
  return text
    .replace(/[\u{1F600}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{200D}]|[\u{20E3}]|[\u{FE0F}]|[\u{E0020}-\u{E007F}]|❄️|⚡|🔧/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// POST /api/request - Main orchestrator endpoint
router.post('/request', async (req, res) => {
  const totalStart = Date.now();

  try {
    // Accept both 'userInput' and 'message' field names
    const rawInput = req.body.userInput || req.body.message;

    if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required. Send a service request in English, Urdu, or Roman Urdu.',
        example: 'Mujhe kal subah G-10 mein plumber chahiye'
      });
    }

    const userInput = rawInput.trim();

    // Check for demo inputs (strip emojis, case-insensitive)
    const cleanedInput = cleanInput(userInput);
    for (const [key, response] of Object.entries(DEMO_INPUTS)) {
      if (cleanedInput === key || cleanedInput.includes(key) || key.includes(cleanedInput)) {
        // Add small delay to simulate processing for demo effect
        await new Promise(r => setTimeout(r, 200));
        return res.json(response);
      }
    }

    // === LIVE AGENT PIPELINE ===
    const agentTrace = [];

    // Agent 1: Intent Parsing
    const agent1Start = Date.now();
    agentTrace.push({ agent: 'Intent Agent', icon: '🧠', status: 'RUNNING', startTime: agent1Start });
    const intentResult = await intentAgent.parse(userInput);
    const { agentTrace: intentTrace, ...intent } = intentResult;
    agentTrace[0] = {
      agent: 'Intent Agent',
      icon: '🧠',
      status: 'DONE',
      duration: Date.now() - agent1Start,
      input: { userInput, language: intent.language || 'auto' },
      output: intent
    };

    if (intent.service === 'unknown') {
      return res.status(400).json({
        success: false,
        error: 'Could not understand the service type. Please mention a specific service.',
        supportedServices: ['plumber', 'electrician', 'ac_technician', 'tutor', 'beautician'],
        hint: 'Try: "Mujhe plumber chahiye G-10 mein" or "AC repair in F-7"',
        agentTrace
      });
    }

    // Agent 2: Provider Matching
    const agent2Start = Date.now();
    agentTrace.push({ agent: 'Matching Agent', icon: '🔍', status: 'RUNNING', startTime: agent2Start });
    const matchResult = matchingAgent.findProviders(intent);
    const { agentTrace: matchTrace, ...match } = matchResult;
    agentTrace[1] = {
      agent: 'Matching Agent',
      icon: '🔍',
      status: 'DONE',
      duration: Date.now() - agent2Start,
      input: { service: intent.service, location: intent.location, timePreference: intent.time },
      output: {
        matchedProviders: match.topProviders.length,
        bestMatch: match.selectedProvider?.name,
        score: match.selectedProvider?.scoring?.totalScore,
        distance: match.selectedProvider?.scoring?.distance
      }
    };

    if (!match.selectedProvider) {
      return res.status(404).json({
        success: false,
        error: `No providers found for ${intent.service} in ${intent.location}`,
        intent,
        agentTrace
      });
    }

    // Agent 3: Booking
    const agent3Start = Date.now();
    agentTrace.push({ agent: 'Booking Agent', icon: '📅', status: 'RUNNING', startTime: agent3Start });
    const selectedSlot = match.selectedProvider.availableSlots?.[0] || '10:00';
    const bookingResult = bookingAgent.createBooking(match.selectedProvider, intent, selectedSlot);
    const { agentTrace: bookingTrace, booking } = bookingResult;
    agentTrace[2] = {
      agent: 'Booking Agent',
      icon: '📅',
      status: 'DONE',
      duration: Date.now() - agent3Start,
      input: { providerId: match.selectedProvider.id, slot: selectedSlot, date: intent.time },
      output: { bookingId: booking.id, confirmed: true, estimatedCost: match.selectedProvider.priceRange }
    };

    // Agent 4: Follow-up Scheduling
    const agent4Start = Date.now();
    agentTrace.push({ agent: 'Follow-up Agent', icon: '🔔', status: 'RUNNING', startTime: agent4Start });
    const followupResult = followupAgent.schedule(booking);
    const { agentTrace: followupTrace, reminders } = followupResult;
    agentTrace[3] = {
      agent: 'Follow-up Agent',
      icon: '🔔',
      status: 'DONE',
      duration: Date.now() - agent4Start,
      input: { bookingId: booking.id, phone: match.selectedProvider.phone },
      output: { smsSent: true, reminders: ['1hr before', '15min before'], ratingScheduled: true }
    };

    const totalDuration = Date.now() - totalStart;

    // Build response in format matching what mobile app expects
    const provider = match.selectedProvider;
    const response = {
      success: true,
      // Fields the mobile HomeScreen uses for the bot message
      bookingId: booking.id,
      service: intent.service.charAt(0).toUpperCase() + intent.service.slice(1).replace('_', ' '),
      location: `${intent.location}, Islamabad`,
      timeSlot: `${intent.time === 'tomorrow' ? 'Tomorrow' : 'Today'}, ${booking.slot}`,
      // Provider info for ProviderCard
      provider: {
        name: provider.name,
        service: intent.service,
        rating: provider.rating,
        totalRatings: provider.reviewCount,
        distance: provider.scoring?.distance || '2.0 km',
        available: provider.available,
        phone: provider.phone,
        priceRange: provider.priceRange,
        experience: provider.experience
      },
      // SMS preview
      smsPreview: booking.confirmationMessage,
      // Full data for deep inspection
      intent,
      match: {
        topProviders: match.topProviders,
        selectedProvider: match.selectedProvider,
        reasoning: match.reasoning
      },
      booking,
      followup: { reminders },
      // Agent trace for TraceScreen
      agentTrace,
      totalDuration: `${totalDuration}ms`
    };

    res.json(response);
  } catch (err) {
    console.error('Request error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message,
      totalDuration: `${Date.now() - totalStart}ms`
    });
  }
});

// GET /api/booking/:id - Get booking by ID
router.get('/booking/:id', (req, res) => {
  const booking = bookingAgent.getBooking(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: `Booking ${req.params.id} not found`
    });
  }

  res.json({
    success: true,
    booking
  });
});

// GET /api/bookings - List all bookings
router.get('/bookings', (req, res) => {
  const bookings = bookingAgent.getAllBookings();
  res.json({
    success: true,
    count: bookings.length,
    bookings
  });
});

// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Kaam Karao Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    agents: ['IntentAgent', 'MatchingAgent', 'BookingAgent', 'FollowupAgent'],
    endpoints: {
      request: 'POST /api/request',
      booking: 'GET /api/booking/:id',
      bookings: 'GET /api/bookings',
      health: 'GET /api/health'
    }
  });
});

module.exports = router;
