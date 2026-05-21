const { GoogleGenerativeAI } = require('@google/generative-ai');

const SERVICE_KEYWORDS = {
  plumber: ['plumber', 'nalka', 'pipe', 'leakage', 'pani', 'plumbing', 'nalka wala', 'pipe wala', 'tap', 'drain'],
  electrician: ['electrician', 'bijli', 'light', 'wiring', 'current', 'bijli wala', 'light wala', 'switch', 'socket', 'electric'],
  ac_technician: ['ac', 'air condition', 'thanda', 'cooling', 'aircon', 'ac wala', 'ac mechanic', 'air conditioner', 'ac repair'],
  tutor: ['tutor', 'teacher', 'ustad', 'padhai', 'coaching', 'tuition', 'parhana', 'parhao', 'study'],
  beautician: ['beauty', 'parlor', 'makeup', 'salon', 'mehndi', 'beauty wala', 'parlor wala', 'facial', 'bridal']
};

const LOCATION_PATTERNS = [
  'G-9', 'G-10', 'G-11', 'G-13',
  'F-7', 'F-8', 'F-10',
  'I-8', 'I-9',
  'Bahria Town', 'Bahria'
];

const TIME_MAP = {
  'kal': 'tomorrow',
  'tomorrow': 'tomorrow',
  'aaj': 'today',
  'today': 'today',
  'abhi': 'today',
  'now': 'today',
  'subah': 'morning',
  'morning': 'morning',
  'dopahar': 'afternoon',
  'afternoon': 'afternoon',
  'sham': 'evening',
  'evening': 'evening',
  'raat': 'night',
  'night': 'night'
};

function detectLanguage(input) {
  const urduPattern = /[\u0600-\u06FF]/;
  if (urduPattern.test(input)) return 'urdu';
  const romanUrduWords = ['mujhe', 'chahiye', 'wala', 'kal', 'aaj', 'abhi', 'mein', 'hai', 'ka', 'ki', 'ke', 'ko', 'se', 'karo', 'subah', 'dopahar', 'sham'];
  const lowerInput = input.toLowerCase();
  const matchCount = romanUrduWords.filter(w => lowerInput.includes(w)).length;
  if (matchCount >= 2) return 'roman_urdu';
  return 'english';
}

function fallbackParse(userInput) {
  const lower = userInput.toLowerCase();
  let detectedService = null;
  let maxMatches = 0;

  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    const matches = keywords.filter(kw => lower.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedService = service;
    }
  }

  let detectedLocation = null;
  for (const loc of LOCATION_PATTERNS) {
    if (lower.includes(loc.toLowerCase())) {
      detectedLocation = loc;
      break;
    }
  }

  let detectedTime = null;
  for (const [keyword, normalized] of Object.entries(TIME_MAP)) {
    if (lower.includes(keyword)) {
      detectedTime = normalized;
      break;
    }
  }

  const language = detectLanguage(userInput);

  return {
    service: detectedService || 'unknown',
    location: detectedLocation || 'unknown',
    time: detectedTime || 'today',
    rawInput: userInput,
    language,
    confidence: detectedService ? 0.7 : 0.3
  };
}

const intentAgent = {
  name: 'IntentAgent',

  async parse(userInput) {
    const startTime = Date.now();
    const agentTrace = {
      agent: 'IntentAgent',
      input: userInput,
      startTime: new Date().toISOString(),
      method: 'fallback'
    };

    let result;

    // Try Gemini API first
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a multilingual intent parser for a Pakistani home services app called "Kaam Karao".
Extract service request details from the user's message.
The user may write in Urdu, Roman Urdu (Urdu written in English letters), or English.

Common Roman Urdu service words:
- plumber = nalka wala, pipe wala, plumber
- electrician = bijli wala, electrician, light wala
- AC technician = AC wala, AC mechanic, thanda
- tutor = tutor, teacher, ustad
- beautician = beauty wala, parlor wala, makeup

Service types MUST be one of: plumber, electrician, ac_technician, tutor, beautician

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{"service": "<normalized service type>", "location": "<sector/area>", "time": "<today|tomorrow|morning|afternoon|evening>", "rawInput": "<original message>", "language": "<urdu|roman_urdu|english>", "confidence": <0.0-1.0>}

User message: "${userInput}"`;

        const genResult = await model.generateContent(prompt);
        const response = await genResult.response;
        const text = response.text().trim();

        // Try to parse JSON from response
        let jsonStr = text;
        if (text.includes('{')) {
          jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        }

        result = JSON.parse(jsonStr);
        result.rawInput = userInput;
        agentTrace.method = 'gemini';
        agentTrace.geminiResponse = text;
      } catch (err) {
        agentTrace.geminiError = err.message;
        agentTrace.method = 'fallback';
        result = fallbackParse(userInput);
      }
    } else {
      agentTrace.method = 'fallback';
      agentTrace.note = 'No GEMINI_API_KEY set, using keyword matching';
      result = fallbackParse(userInput);
    }

    const duration = Date.now() - startTime;
    agentTrace.duration = `${duration}ms`;
    agentTrace.output = result;
    agentTrace.endTime = new Date().toISOString();

    return {
      ...result,
      agentTrace
    };
  }
};

module.exports = intentAgent;
