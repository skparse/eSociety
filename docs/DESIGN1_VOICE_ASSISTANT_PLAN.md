# Design 1: Voice-First Society Assistant
## Complete Implementation Plan

---

## 1. Overview

A conversational AI assistant enabling residents and admins to interact with the society management system using natural speech in multiple languages.

### Key Capabilities
- Voice commands for bill inquiries, payments, complaints
- Multilingual support (English, Hindi, Marathi, Tamil, etc.)
- Works on web, mobile, and smart speakers
- Elderly-friendly - no typing required

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Web App  │  │  Mobile   │  │  Alexa    │  │  Google   │    │
│  │  (PWA)    │  │  App      │  │  Skill    │  │  Action   │    │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
│        │              │              │              │           │
│        └──────────────┴──────────────┴──────────────┘           │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                      VOICE PROCESSING LAYER                      │
├──────────────────────────────┼───────────────────────────────────┤
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  SPEECH-TO-TEXT                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │ Web Speech  │  │  Whisper    │  │  Google     │      │    │
│  │  │ API (Free)  │  │  API        │  │  Speech API │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  AI PROCESSING                           │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  LLM (Claude API / GPT-4)                       │    │    │
│  │  │  - Intent Classification                        │    │    │
│  │  │  - Entity Extraction (flat no, amount, date)    │    │    │
│  │  │  - Context Management                           │    │    │
│  │  │  - Response Generation                          │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  TEXT-TO-SPEECH                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │ Web Speech  │  │  ElevenLabs │  │  Google     │      │    │
│  │  │ Synthesis   │  │  (Natural)  │  │  TTS        │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                      ACTION LAYER                                │
├──────────────────────────────┼───────────────────────────────────┤
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  ACTION EXECUTOR                         │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐  │    │
│  │  │ Bill      │ │ Payment   │ │ Complaint │ │ Booking │  │    │
│  │  │ Actions   │ │ Actions   │ │ Actions   │ │ Actions │  │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └─────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
├──────────────────────────────┼───────────────────────────────────┤
│                      DATA LAYER                                  │
├──────────────────────────────┼───────────────────────────────────┤
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           EXISTING GOOGLE APPS SCRIPT BACKEND            │    │
│  │                    + GOOGLE SHEETS                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Component | Primary Choice | Alternative | Cost |
|-----------|---------------|-------------|------|
| Speech-to-Text | Web Speech API | Whisper API | Free / $0.006/min |
| LLM | Claude 3.5 Sonnet | GPT-4o-mini | $3/$15 per 1M tokens |
| Text-to-Speech | Web Speech Synthesis | ElevenLabs | Free / $0.30/1K chars |
| Smart Speaker | Alexa Skills Kit | Google Actions | Free |
| Backend | Google Apps Script | - | Free |

### Estimated Monthly Cost (500 flats, 1000 voice interactions)
- LLM API: ~$5-15/month
- Speech APIs: Free (browser) or ~$10/month (cloud)
- **Total: $5-25/month**

---

## 4. File Structure

```
js/
├── voice/
│   ├── voice-assistant.js       # Main voice assistant controller
│   ├── speech-recognition.js    # STT handling
│   ├── speech-synthesis.js      # TTS handling
│   ├── intent-processor.js      # LLM integration for intent parsing
│   ├── action-executor.js       # Execute parsed intents
│   ├── conversation-context.js  # Manage conversation state
│   └── languages/
│       ├── en.js                # English responses
│       ├── hi.js                # Hindi responses
│       └── mr.js                # Marathi responses
├── config/
│   └── voice-config.js          # API keys, settings
└── components/
    └── voice-button.js          # UI component

css/
└── voice-assistant.css          # Voice UI styles

api/
└── voice-backend.gs             # Google Apps Script additions
```

---

## 5. Database Schema Additions

### New Sheet: VoiceInteractions
```javascript
{
  id: "uuid",
  sessionId: "uuid",
  flatId: "uuid",
  userId: "uuid",
  timestamp: "ISO_date",
  inputType: "voice|text",
  inputLanguage: "en|hi|mr|ta",
  rawInput: "what is my bill",
  processedIntent: {
    action: "GET_BILL",
    entities: {
      month: "current",
      flatId: "extracted_or_user"
    },
    confidence: 0.95
  },
  response: "Your current bill is ₹2,450",
  actionTaken: "BILL_QUERY",
  success: true,
  errorMessage: null,
  processingTimeMs: 1250
}
```

### New Sheet: VoiceSettings
```javascript
{
  societyId: "uuid",
  enabledLanguages: ["en", "hi", "mr"],
  defaultLanguage: "en",
  voiceGender: "female",
  enableSmartSpeakers: true,
  llmProvider: "claude",
  maxConversationTurns: 10,
  enableVoicePayments: false,
  customWakeWord: "Hey Society"
}
```

---

## 6. Supported Intents & Actions

### Intent Catalog

| Intent | Example Phrases | Action | Auth Required |
|--------|----------------|--------|---------------|
| `GET_BILL` | "What's my bill?", "मेरा बिल कितना है?" | Fetch current bill | Yes |
| `GET_BILL_HISTORY` | "Show last 6 months bills" | Fetch bill history | Yes |
| `GET_PAYMENT_STATUS` | "Am I up to date?" | Check pending dues | Yes |
| `MAKE_PAYMENT` | "Pay my bill using UPI" | Generate payment link | Yes |
| `SET_REMINDER` | "Remind me on 5th" | Create payment reminder | Yes |
| `FILE_COMPLAINT` | "Water leakage in parking" | Create complaint ticket | Yes |
| `BOOK_AMENITY` | "Book clubhouse Saturday" | Check availability & book | Yes |
| `GET_NOTICES` | "Any new notices?" | Fetch recent notices | Yes |
| `VISITOR_APPROVAL` | "Expecting guest tomorrow" | Pre-approve visitor | Yes |
| `HELP` | "What can you do?" | List capabilities | No |
| `GREETING` | "Hello", "Good morning" | Greet back | No |

---

## 7. Implementation Phases

### Phase 1: Core Voice Infrastructure (Week 1-2)

#### 7.1.1 Speech Recognition Module

```javascript
// js/voice/speech-recognition.js

class SpeechRecognitionService {
  constructor(config = {}) {
    this.recognition = null;
    this.isListening = false;
    this.language = config.language || 'en-IN';
    this.continuous = config.continuous || false;
    this.interimResults = config.interimResults || true;

    this.onResult = config.onResult || (() => {});
    this.onError = config.onError || (() => {});
    this.onStart = config.onStart || (() => {});
    this.onEnd = config.onEnd || (() => {});

    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition ||
                               window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported');
      this.useWhisperFallback = true;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.language;
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results
        .map(result => result[0].transcript)
        .join('');

      const isFinal = results.some(result => result.isFinal);
      const confidence = results[0]?.[0]?.confidence || 0;

      this.onResult({
        transcript,
        isFinal,
        confidence,
        language: this.language
      });
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.onError({
        error: event.error,
        message: this.getErrorMessage(event.error)
      });
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd();
    };
  }

  start() {
    if (this.useWhisperFallback) {
      return this.startWhisperRecording();
    }

    if (this.isListening) return;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  }

  stop() {
    if (this.useWhisperFallback) {
      return this.stopWhisperRecording();
    }

    if (!this.isListening) return;
    this.recognition.stop();
  }

  setLanguage(langCode) {
    // Language codes: en-IN, hi-IN, mr-IN, ta-IN, te-IN
    this.language = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  getErrorMessage(error) {
    const errorMessages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone not available.',
      'not-allowed': 'Microphone permission denied.',
      'network': 'Network error. Check your connection.',
      'aborted': 'Speech recognition aborted.',
      'language-not-supported': 'Language not supported.'
    };
    return errorMessages[error] || 'Unknown error occurred.';
  }

  // Whisper API fallback for unsupported browsers
  async startWhisperRecording() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.transcribeWithWhisper(audioBlob);
      };

      this.mediaRecorder.start();
      this.isListening = true;
      this.onStart();
    } catch (error) {
      this.onError({ error: 'audio-capture', message: error.message });
    }
  }

  stopWhisperRecording() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.isListening = false;
      this.onEnd();
    }
  }

  async transcribeWithWhisper(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', this.language.split('-')[0]);

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VOICE_CONFIG.whisperApiKey}`
        },
        body: formData
      });

      const data = await response.json();
      this.onResult({
        transcript: data.text,
        isFinal: true,
        confidence: 0.9,
        language: this.language
      });
    } catch (error) {
      this.onError({ error: 'network', message: 'Transcription failed' });
    }
  }
}

// Export
window.SpeechRecognitionService = SpeechRecognitionService;
```

#### 7.1.2 Speech Synthesis Module

```javascript
// js/voice/speech-synthesis.js

class SpeechSynthesisService {
  constructor(config = {}) {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.language = config.language || 'en-IN';
    this.rate = config.rate || 1.0;
    this.pitch = config.pitch || 1.0;
    this.volume = config.volume || 1.0;
    this.preferFemale = config.preferFemale !== false;

    this.voicesLoaded = false;
    this.pendingSpeak = null;

    this.init();
  }

  init() {
    if (!this.synth) {
      console.error('Speech Synthesis not supported');
      return;
    }

    // Voices load asynchronously
    if (this.synth.getVoices().length > 0) {
      this.loadVoices();
    } else {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    const voices = this.synth.getVoices();
    this.voices = voices;
    this.voicesLoaded = true;
    this.selectBestVoice();

    // Process pending speak request
    if (this.pendingSpeak) {
      this.speak(this.pendingSpeak);
      this.pendingSpeak = null;
    }
  }

  selectBestVoice() {
    const voices = this.synth.getVoices();

    // Priority: 1. Exact language match 2. Language family 3. Default
    const langCode = this.language.split('-')[0];

    // Find voices for the language
    let candidates = voices.filter(v =>
      v.lang.startsWith(langCode) || v.lang.startsWith(this.language)
    );

    if (candidates.length === 0) {
      candidates = voices.filter(v => v.lang.startsWith('en'));
    }

    // Prefer female voice if configured
    if (this.preferFemale) {
      const femaleVoice = candidates.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('google') && v.name.includes('Female')
      );
      if (femaleVoice) {
        this.voice = femaleVoice;
        return;
      }
    }

    // Use first candidate or default
    this.voice = candidates[0] || voices[0];
  }

  speak(text, options = {}) {
    if (!this.synth) {
      console.error('Speech synthesis not available');
      return Promise.reject('Not supported');
    }

    // Wait for voices to load
    if (!this.voicesLoaded) {
      this.pendingSpeak = text;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = options.voice || this.voice;
      utterance.lang = options.language || this.language;
      utterance.rate = options.rate || this.rate;
      utterance.pitch = options.pitch || this.pitch;
      utterance.volume = options.volume || this.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }

  setLanguage(langCode) {
    this.language = langCode;
    this.selectBestVoice();
  }

  getAvailableVoices() {
    return this.voices || [];
  }

  // For premium TTS (ElevenLabs)
  async speakWithElevenLabs(text, voiceId = 'default') {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': VOICE_CONFIG.elevenLabsApiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.error('ElevenLabs TTS failed, falling back to browser TTS');
      return this.speak(text);
    }
  }
}

// Export
window.SpeechSynthesisService = SpeechSynthesisService;
```

### Phase 2: AI Intent Processing (Week 2-3)

#### 7.2.1 Intent Processor with LLM

```javascript
// js/voice/intent-processor.js

class IntentProcessor {
  constructor(config = {}) {
    this.apiKey = config.apiKey || VOICE_CONFIG.claudeApiKey;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.conversationHistory = [];
    this.maxHistoryTurns = 10;
    this.userContext = null;
  }

  setUserContext(context) {
    // Context includes: flatId, flatNo, ownerName, societyId
    this.userContext = context;
  }

  async processInput(userInput, language = 'en') {
    const systemPrompt = this.buildSystemPrompt(language);

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userInput
    });

    // Keep history manageable
    if (this.conversationHistory.length > this.maxHistoryTurns * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryTurns * 2);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: systemPrompt,
          messages: this.conversationHistory
        })
      });

      const data = await response.json();
      const assistantMessage = data.content[0].text;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Parse the structured response
      return this.parseResponse(assistantMessage);

    } catch (error) {
      console.error('Intent processing failed:', error);
      return {
        intent: 'ERROR',
        response: 'Sorry, I encountered an error. Please try again.',
        action: null,
        confidence: 0
      };
    }
  }

  buildSystemPrompt(language) {
    const userInfo = this.userContext ? `
User Context:
- Flat Number: ${this.userContext.flatNo}
- Owner Name: ${this.userContext.ownerName}
- Flat ID: ${this.userContext.flatId}
- Society: ${this.userContext.societyName}
` : 'User not logged in.';

    return `You are a helpful voice assistant for a residential society management app called eSociety.
You help residents with billing inquiries, payments, complaints, and amenity bookings.

${userInfo}

IMPORTANT INSTRUCTIONS:
1. Always respond in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}
2. Keep responses concise and conversational (suitable for voice)
3. Always include a JSON action block at the end of your response

Available intents and their actions:
- GET_BILL: Fetch current or specific month's bill
- GET_BILL_HISTORY: Fetch bill history
- GET_PAYMENT_STATUS: Check if user has pending dues
- MAKE_PAYMENT: Generate payment link (UPI/Card)
- SET_REMINDER: Set payment reminder
- FILE_COMPLAINT: Register a complaint
- BOOK_AMENITY: Book society amenity
- GET_NOTICES: Fetch recent notices
- VISITOR_APPROVAL: Pre-approve a visitor
- HELP: List what assistant can do
- GREETING: Respond to greeting
- CLARIFICATION: Ask for more details
- UNKNOWN: Cannot understand request

Response format:
[Your conversational response here]

---ACTION---
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "entities": {
    "month": "january",
    "year": 2024,
    "amount": 2450,
    "complaintType": "water",
    "amenity": "clubhouse",
    "date": "2024-01-20"
  },
  "requiresConfirmation": false,
  "followUpQuestion": null
}

Examples:

User: "What is my current bill?"
Response: Your current bill for January 2024 is ₹2,450. This includes maintenance of ₹2,250 and water charges of ₹200. Would you like to pay now?

---ACTION---
{"intent": "GET_BILL", "confidence": 0.98, "entities": {"month": "current"}, "requiresConfirmation": false}

User: "Pay using Google Pay"
Response: I'll generate a UPI payment link for ₹2,450. You can complete the payment in Google Pay.

---ACTION---
{"intent": "MAKE_PAYMENT", "confidence": 0.95, "entities": {"method": "upi", "app": "gpay"}, "requiresConfirmation": true}`;
  }

  parseResponse(response) {
    try {
      // Split response into text and action parts
      const parts = response.split('---ACTION---');
      const textResponse = parts[0].trim();

      let action = null;
      if (parts[1]) {
        const jsonStr = parts[1].trim();
        action = JSON.parse(jsonStr);
      }

      return {
        response: textResponse,
        intent: action?.intent || 'UNKNOWN',
        confidence: action?.confidence || 0,
        entities: action?.entities || {},
        requiresConfirmation: action?.requiresConfirmation || false,
        followUpQuestion: action?.followUpQuestion || null
      };
    } catch (error) {
      console.error('Failed to parse response:', error);
      return {
        response: response,
        intent: 'UNKNOWN',
        confidence: 0,
        entities: {},
        requiresConfirmation: false
      };
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

// Export
window.IntentProcessor = IntentProcessor;
```

#### 7.2.2 Action Executor

```javascript
// js/voice/action-executor.js

class ActionExecutor {
  constructor(storage) {
    this.storage = storage; // Reference to existing Storage class
    this.pendingAction = null;
  }

  async execute(parsedIntent, userContext) {
    const { intent, entities, requiresConfirmation } = parsedIntent;

    // If confirmation required, store and wait
    if (requiresConfirmation && !entities.confirmed) {
      this.pendingAction = { intent, entities, userContext };
      return {
        success: true,
        needsConfirmation: true,
        data: null
      };
    }

    try {
      switch (intent) {
        case 'GET_BILL':
          return await this.getBill(entities, userContext);

        case 'GET_BILL_HISTORY':
          return await this.getBillHistory(entities, userContext);

        case 'GET_PAYMENT_STATUS':
          return await this.getPaymentStatus(userContext);

        case 'MAKE_PAYMENT':
          return await this.initiatePayment(entities, userContext);

        case 'SET_REMINDER':
          return await this.setReminder(entities, userContext);

        case 'FILE_COMPLAINT':
          return await this.fileComplaint(entities, userContext);

        case 'BOOK_AMENITY':
          return await this.bookAmenity(entities, userContext);

        case 'GET_NOTICES':
          return await this.getNotices(userContext);

        case 'GREETING':
        case 'HELP':
        case 'UNKNOWN':
          return { success: true, data: null };

        default:
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getBill(entities, userContext) {
    const bills = await this.storage.read('Bills');
    const { month, year } = entities;

    // Get current month if not specified
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const bill = bills.find(b =>
      b.flatId === userContext.flatId &&
      b.month === targetMonth &&
      b.year === targetYear
    );

    if (bill) {
      return {
        success: true,
        data: {
          billNo: bill.billNo,
          month: targetMonth,
          year: targetYear,
          lineItems: bill.lineItems,
          totalAmount: bill.totalAmount,
          previousDue: bill.previousDue,
          grandTotal: bill.grandTotal,
          status: bill.status,
          dueDate: bill.dueDate
        }
      };
    }

    return {
      success: true,
      data: null,
      message: 'No bill found for the specified period'
    };
  }

  async getBillHistory(entities, userContext) {
    const bills = await this.storage.read('Bills');
    const count = entities.count || 6;

    const userBills = bills
      .filter(b => b.flatId === userContext.flatId)
      .sort((a, b) => {
        const dateA = new Date(a.year, a.month - 1);
        const dateB = new Date(b.year, b.month - 1);
        return dateB - dateA;
      })
      .slice(0, count);

    return {
      success: true,
      data: userBills.map(b => ({
        month: b.month,
        year: b.year,
        amount: b.grandTotal,
        status: b.status
      }))
    };
  }

  async getPaymentStatus(userContext) {
    const bills = await this.storage.read('Bills');

    const pendingBills = bills.filter(b =>
      b.flatId === userContext.flatId &&
      (b.status === 'pending' || b.status === 'partial')
    );

    const totalPending = pendingBills.reduce((sum, b) =>
      sum + (b.grandTotal - (b.paidAmount || 0)), 0
    );

    return {
      success: true,
      data: {
        hasPending: pendingBills.length > 0,
        pendingCount: pendingBills.length,
        totalPending: totalPending,
        bills: pendingBills.map(b => ({
          billNo: b.billNo,
          month: b.month,
          year: b.year,
          pending: b.grandTotal - (b.paidAmount || 0)
        }))
      }
    };
  }

  async initiatePayment(entities, userContext) {
    const status = await this.getPaymentStatus(userContext);
    const amount = entities.amount || status.data.totalPending;

    // Generate UPI payment link
    const upiLink = this.generateUPILink({
      payeeName: userContext.societyName,
      payeeVPA: userContext.societyUPI || 'society@upi',
      amount: amount,
      transactionNote: `Maintenance - ${userContext.flatNo}`,
      referenceId: `PAY-${Date.now()}`
    });

    return {
      success: true,
      data: {
        amount: amount,
        upiLink: upiLink,
        paymentMethod: entities.method || 'upi'
      }
    };
  }

  generateUPILink({ payeeName, payeeVPA, amount, transactionNote, referenceId }) {
    const params = new URLSearchParams({
      pa: payeeVPA,
      pn: payeeName,
      am: amount.toString(),
      tn: transactionNote,
      tr: referenceId,
      cu: 'INR'
    });

    return `upi://pay?${params.toString()}`;
  }

  async setReminder(entities, userContext) {
    // Store reminder in local storage or backend
    const reminder = {
      id: crypto.randomUUID(),
      flatId: userContext.flatId,
      userId: userContext.userId,
      reminderDate: entities.date || this.getNextPaymentDate(),
      reminderType: 'payment',
      message: 'Time to pay your society maintenance bill',
      created: new Date().toISOString()
    };

    // Store in localStorage for now (could be backend)
    const reminders = JSON.parse(localStorage.getItem('voiceReminders') || '[]');
    reminders.push(reminder);
    localStorage.setItem('voiceReminders', JSON.stringify(reminders));

    // Schedule notification
    this.scheduleNotification(reminder);

    return {
      success: true,
      data: {
        reminderDate: reminder.reminderDate,
        message: 'Reminder set successfully'
      }
    };
  }

  scheduleNotification(reminder) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const reminderTime = new Date(reminder.reminderDate).getTime();
      const now = Date.now();
      const delay = reminderTime - now;

      if (delay > 0) {
        setTimeout(() => {
          new Notification('Society Payment Reminder', {
            body: reminder.message,
            icon: '/icons/icon-192.png'
          });
        }, delay);
      }
    }
  }

  getNextPaymentDate() {
    const now = new Date();
    // Default: 5th of next month (common salary day in India)
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    return next.toISOString().split('T')[0];
  }

  async fileComplaint(entities, userContext) {
    const complaint = {
      id: crypto.randomUUID(),
      flatId: userContext.flatId,
      flatNo: userContext.flatNo,
      category: entities.complaintType || 'general',
      description: entities.description || '',
      location: entities.location || '',
      status: 'open',
      priority: entities.priority || 'medium',
      createdAt: new Date().toISOString(),
      createdBy: userContext.userId
    };

    // Save to backend
    const complaints = await this.storage.read('Complaints') || [];
    complaints.push(complaint);
    await this.storage.write('Complaints', complaints);

    return {
      success: true,
      data: {
        ticketId: complaint.id.slice(0, 8).toUpperCase(),
        category: complaint.category,
        status: 'Registered'
      }
    };
  }

  async bookAmenity(entities, userContext) {
    // Check availability and book
    const bookings = await this.storage.read('AmenityBookings') || [];
    const date = entities.date;
    const amenity = entities.amenity?.toLowerCase();

    // Check if already booked
    const existingBooking = bookings.find(b =>
      b.amenity === amenity &&
      b.date === date &&
      b.status === 'confirmed'
    );

    if (existingBooking) {
      return {
        success: false,
        data: {
          available: false,
          message: `${amenity} is already booked for ${date}`
        }
      };
    }

    // Create booking
    const booking = {
      id: crypto.randomUUID(),
      flatId: userContext.flatId,
      flatNo: userContext.flatNo,
      amenity: amenity,
      date: date,
      timeSlot: entities.timeSlot || 'full-day',
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      bookedBy: userContext.userId
    };

    bookings.push(booking);
    await this.storage.write('AmenityBookings', bookings);

    return {
      success: true,
      data: {
        bookingId: booking.id.slice(0, 8).toUpperCase(),
        amenity: amenity,
        date: date,
        status: 'Confirmed'
      }
    };
  }

  async getNotices(userContext) {
    const notices = await this.storage.read('Notices') || [];

    // Get notices from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentNotices = notices
      .filter(n => new Date(n.createdAt) >= thirtyDaysAgo && n.status === 'active')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      success: true,
      data: {
        count: recentNotices.length,
        notices: recentNotices.map(n => ({
          title: n.title,
          date: n.createdAt,
          priority: n.priority
        }))
      }
    };
  }

  // Confirm pending action
  async confirmPendingAction() {
    if (this.pendingAction) {
      this.pendingAction.entities.confirmed = true;
      const result = await this.execute(
        { intent: this.pendingAction.intent, entities: this.pendingAction.entities },
        this.pendingAction.userContext
      );
      this.pendingAction = null;
      return result;
    }
    return { success: false, error: 'No pending action' };
  }

  cancelPendingAction() {
    this.pendingAction = null;
  }
}

// Export
window.ActionExecutor = ActionExecutor;
```

### Phase 3: Main Voice Assistant Controller (Week 3-4)

```javascript
// js/voice/voice-assistant.js

class VoiceAssistant {
  constructor(config = {}) {
    this.config = {
      language: config.language || 'en-IN',
      autoListen: config.autoListen || false,
      usePremiumTTS: config.usePremiumTTS || false,
      ...config
    };

    this.storage = config.storage; // Existing Storage instance
    this.userContext = null;
    this.isActive = false;
    this.isProcessing = false;

    // Initialize components
    this.initComponents();
    this.initUI();
  }

  initComponents() {
    // Speech Recognition
    this.speechRecognition = new SpeechRecognitionService({
      language: this.config.language,
      onResult: (result) => this.handleSpeechResult(result),
      onError: (error) => this.handleSpeechError(error),
      onStart: () => this.onListeningStart(),
      onEnd: () => this.onListeningEnd()
    });

    // Speech Synthesis
    this.speechSynthesis = new SpeechSynthesisService({
      language: this.config.language,
      preferFemale: true
    });

    // Intent Processor
    this.intentProcessor = new IntentProcessor({
      apiKey: VOICE_CONFIG.claudeApiKey
    });

    // Action Executor
    this.actionExecutor = new ActionExecutor(this.storage);
  }

  initUI() {
    // Create voice button container
    this.container = document.createElement('div');
    this.container.id = 'voice-assistant-container';
    this.container.innerHTML = `
      <div class="voice-assistant-wrapper">
        <button class="voice-button" id="voiceButton" title="Voice Assistant">
          <svg class="mic-icon" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
            <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          <svg class="wave-icon hidden" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z">
              <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
            </path>
          </svg>
        </button>

        <div class="voice-popup hidden" id="voicePopup">
          <div class="voice-popup-header">
            <span class="voice-status">Listening...</span>
            <button class="voice-close" id="voiceClose">&times;</button>
          </div>

          <div class="voice-visualizer">
            <div class="voice-wave"></div>
          </div>

          <div class="voice-transcript" id="voiceTranscript">
            Say something...
          </div>

          <div class="voice-response hidden" id="voiceResponse">
          </div>

          <div class="voice-actions hidden" id="voiceActions">
            <button class="voice-action-btn" id="voiceConfirm">Yes, proceed</button>
            <button class="voice-action-btn secondary" id="voiceCancel">Cancel</button>
          </div>

          <div class="voice-language-select">
            <select id="voiceLanguage">
              <option value="en-IN">English</option>
              <option value="hi-IN">हिंदी</option>
              <option value="mr-IN">मराठी</option>
              <option value="ta-IN">தமிழ்</option>
            </select>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.bindEvents();
  }

  bindEvents() {
    const voiceButton = document.getElementById('voiceButton');
    const voiceClose = document.getElementById('voiceClose');
    const voiceLanguage = document.getElementById('voiceLanguage');
    const voiceConfirm = document.getElementById('voiceConfirm');
    const voiceCancel = document.getElementById('voiceCancel');

    voiceButton.addEventListener('click', () => this.toggle());
    voiceClose.addEventListener('click', () => this.close());

    voiceLanguage.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    voiceConfirm.addEventListener('click', () => this.confirmAction());
    voiceCancel.addEventListener('click', () => this.cancelAction());

    // Keyboard shortcut: Hold spacebar to talk
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'TEXTAREA' && !this.isActive) {
        e.preventDefault();
        this.activate();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && this.isActive) {
        this.deactivate();
      }
    });
  }

  setUserContext(context) {
    this.userContext = context;
    this.intentProcessor.setUserContext(context);
  }

  toggle() {
    const popup = document.getElementById('voicePopup');
    if (popup.classList.contains('hidden')) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    const popup = document.getElementById('voicePopup');
    popup.classList.remove('hidden');
    this.activate();
  }

  close() {
    const popup = document.getElementById('voicePopup');
    popup.classList.add('hidden');
    this.deactivate();
    this.speechSynthesis.stop();
  }

  activate() {
    if (!this.userContext) {
      this.showMessage('Please login to use voice assistant');
      return;
    }

    this.isActive = true;
    this.speechRecognition.start();
    this.updateUI('listening');
  }

  deactivate() {
    this.isActive = false;
    this.speechRecognition.stop();
  }

  async handleSpeechResult(result) {
    if (!result.isFinal) {
      // Show interim results
      document.getElementById('voiceTranscript').textContent = result.transcript;
      return;
    }

    // Final result
    this.isProcessing = true;
    this.updateUI('processing');
    document.getElementById('voiceTranscript').textContent = result.transcript;

    try {
      // Process with AI
      const parsed = await this.intentProcessor.processInput(
        result.transcript,
        this.config.language.split('-')[0]
      );

      // Execute action if needed
      const actionResult = await this.actionExecutor.execute(parsed, this.userContext);

      // Show response
      this.showResponse(parsed.response, actionResult);

      // Speak response
      await this.speak(parsed.response);

      // Show confirmation buttons if needed
      if (actionResult.needsConfirmation) {
        this.showConfirmation();
      }

      // Log interaction
      this.logInteraction(result.transcript, parsed, actionResult);

    } catch (error) {
      console.error('Voice processing error:', error);
      this.showResponse('Sorry, something went wrong. Please try again.');
      await this.speak('Sorry, something went wrong. Please try again.');
    }

    this.isProcessing = false;

    // Continue listening if configured
    if (this.config.autoListen && this.isActive) {
      setTimeout(() => this.activate(), 500);
    } else {
      this.updateUI('idle');
    }
  }

  handleSpeechError(error) {
    console.error('Speech error:', error);
    this.showMessage(error.message);
    this.updateUI('error');
  }

  onListeningStart() {
    this.updateUI('listening');
  }

  onListeningEnd() {
    if (!this.isProcessing) {
      this.updateUI('idle');
    }
  }

  async speak(text) {
    if (this.config.usePremiumTTS) {
      await this.speechSynthesis.speakWithElevenLabs(text);
    } else {
      await this.speechSynthesis.speak(text);
    }
  }

  showResponse(text, actionResult = null) {
    const responseEl = document.getElementById('voiceResponse');
    responseEl.classList.remove('hidden');
    responseEl.innerHTML = `
      <div class="response-text">${text}</div>
      ${actionResult?.data ? `
        <div class="response-data">
          ${this.formatActionData(actionResult.data)}
        </div>
      ` : ''}
    `;
  }

  formatActionData(data) {
    if (!data) return '';

    // Format based on data type
    if (data.grandTotal !== undefined) {
      // Bill data
      return `
        <div class="bill-summary">
          <div class="bill-total">₹${data.grandTotal.toLocaleString()}</div>
          <div class="bill-status ${data.status}">${data.status}</div>
        </div>
      `;
    }

    if (data.upiLink) {
      // Payment data
      return `
        <a href="${data.upiLink}" class="upi-pay-button">
          Pay ₹${data.amount.toLocaleString()} via UPI
        </a>
      `;
    }

    if (data.notices) {
      // Notices
      return `
        <ul class="notice-list">
          ${data.notices.map(n => `<li>${n.title}</li>`).join('')}
        </ul>
      `;
    }

    return '';
  }

  showConfirmation() {
    document.getElementById('voiceActions').classList.remove('hidden');
  }

  hideConfirmation() {
    document.getElementById('voiceActions').classList.add('hidden');
  }

  async confirmAction() {
    this.hideConfirmation();
    this.updateUI('processing');

    const result = await this.actionExecutor.confirmPendingAction();

    if (result.success) {
      this.showResponse('Action completed successfully!', result);
      await this.speak('Done! Your action has been completed.');
    } else {
      this.showResponse('Action failed. Please try again.');
      await this.speak('Sorry, the action failed. Please try again.');
    }

    this.updateUI('idle');
  }

  cancelAction() {
    this.hideConfirmation();
    this.actionExecutor.cancelPendingAction();
    this.showResponse('Action cancelled.');
    this.speak('Cancelled.');
  }

  showMessage(text) {
    document.getElementById('voiceTranscript').textContent = text;
  }

  updateUI(state) {
    const button = document.getElementById('voiceButton');
    const status = document.querySelector('.voice-status');
    const micIcon = button.querySelector('.mic-icon');
    const waveIcon = button.querySelector('.wave-icon');

    button.classList.remove('listening', 'processing', 'error');

    switch (state) {
      case 'listening':
        button.classList.add('listening');
        status.textContent = 'Listening...';
        micIcon.classList.add('hidden');
        waveIcon.classList.remove('hidden');
        break;

      case 'processing':
        button.classList.add('processing');
        status.textContent = 'Processing...';
        break;

      case 'error':
        button.classList.add('error');
        status.textContent = 'Error';
        micIcon.classList.remove('hidden');
        waveIcon.classList.add('hidden');
        break;

      default:
        status.textContent = 'Ready';
        micIcon.classList.remove('hidden');
        waveIcon.classList.add('hidden');
    }
  }

  setLanguage(langCode) {
    this.config.language = langCode;
    this.speechRecognition.setLanguage(langCode);
    this.speechSynthesis.setLanguage(langCode);
  }

  async logInteraction(input, parsed, result) {
    try {
      const interactions = await this.storage.read('VoiceInteractions') || [];
      interactions.push({
        id: crypto.randomUUID(),
        sessionId: this.sessionId || crypto.randomUUID(),
        flatId: this.userContext?.flatId,
        userId: this.userContext?.userId,
        timestamp: new Date().toISOString(),
        inputType: 'voice',
        inputLanguage: this.config.language,
        rawInput: input,
        processedIntent: {
          action: parsed.intent,
          entities: parsed.entities,
          confidence: parsed.confidence
        },
        response: parsed.response,
        actionTaken: parsed.intent,
        success: result.success
      });

      // Keep only last 1000 interactions
      if (interactions.length > 1000) {
        interactions.splice(0, interactions.length - 1000);
      }

      await this.storage.write('VoiceInteractions', interactions);
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }
}

// Export and auto-initialize
window.VoiceAssistant = VoiceAssistant;
```

---

### Phase 4: Voice Assistant Styles (Week 4)

```css
/* css/voice-assistant.css */

#voice-assistant-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.voice-assistant-wrapper {
  position: relative;
}

/* Voice Button */
.voice-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.voice-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.voice-button.listening {
  animation: pulse 1.5s ease-in-out infinite;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.voice-button.processing {
  animation: spin 1s linear infinite;
}

.voice-button.error {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(240, 147, 251, 0.7); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(240, 147, 251, 0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hidden {
  display: none !important;
}

/* Voice Popup */
.voice-popup {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.voice-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.voice-status {
  font-weight: 600;
  font-size: 14px;
}

.voice-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.voice-close:hover {
  opacity: 1;
}

/* Visualizer */
.voice-visualizer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 10px;
}

.voice-wave {
  width: 100%;
  height: 40px;
  background: repeating-linear-gradient(
    90deg,
    #667eea 0px,
    #667eea 3px,
    transparent 3px,
    transparent 8px
  );
  animation: wave 0.5s ease-in-out infinite alternate;
}

@keyframes wave {
  from { height: 20px; }
  to { height: 40px; }
}

/* Transcript */
.voice-transcript {
  padding: 20px;
  font-size: 16px;
  color: #1e293b;
  min-height: 60px;
  border-bottom: 1px solid #e2e8f0;
}

/* Response */
.voice-response {
  padding: 20px;
  background: #f1f5f9;
}

.response-text {
  font-size: 15px;
  color: #334155;
  line-height: 1.5;
  margin-bottom: 12px;
}

.response-data {
  margin-top: 12px;
}

.bill-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.bill-total {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.bill-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.bill-status.pending { background: #fef3c7; color: #92400e; }
.bill-status.paid { background: #d1fae5; color: #065f46; }
.bill-status.partial { background: #dbeafe; color: #1e40af; }

.upi-pay-button {
  display: block;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  text-align: center;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.upi-pay-button:hover {
  background: #059669;
}

/* Action Buttons */
.voice-actions {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
}

.voice-action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.voice-action-btn:not(.secondary) {
  background: #667eea;
  color: white;
}

.voice-action-btn:not(.secondary):hover {
  background: #5a67d8;
}

.voice-action-btn.secondary {
  background: #e2e8f0;
  color: #475569;
}

.voice-action-btn.secondary:hover {
  background: #cbd5e1;
}

/* Language Select */
.voice-language-select {
  padding: 12px 20px;
  border-top: 1px solid #e2e8f0;
}

.voice-language-select select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #475569;
  background: white;
  cursor: pointer;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  #voice-assistant-container {
    bottom: 80px; /* Above mobile navigation */
    right: 16px;
  }

  .voice-popup {
    width: calc(100vw - 32px);
    right: -8px;
  }
}
```

---

## 8. Integration with Existing App

```javascript
// Add to js/app.js or main initialization

// Initialize Voice Assistant after user login
function initVoiceAssistant() {
  const user = getCurrentUser();
  const flat = getCurrentFlat();
  const society = getSocietySettings();

  if (!user || !flat) return;

  window.voiceAssistant = new VoiceAssistant({
    storage: window.storage, // Existing Storage instance
    language: localStorage.getItem('voiceLanguage') || 'en-IN'
  });

  // Set user context
  window.voiceAssistant.setUserContext({
    userId: user.id,
    flatId: flat.id,
    flatNo: flat.flatNo,
    ownerName: flat.ownerName,
    societyId: society.id,
    societyName: society.name,
    societyUPI: society.upiId
  });
}

// Call after successful login
document.addEventListener('userLoggedIn', initVoiceAssistant);
```

---

## 9. Alexa Skill Integration (Optional)

```javascript
// alexa-skill/index.js (AWS Lambda)

const Alexa = require('ask-sdk-core');
const axios = require('axios');

const API_BASE = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Society Assistant. You can ask about your bill, make payments, or file complaints. What would you like to do?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const GetBillIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetBillIntent';
  },
  async handle(handlerInput) {
    // Get linked account
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

    if (!accessToken) {
      return handlerInput.responseBuilder
        .speak('Please link your society account in the Alexa app.')
        .withLinkAccountCard()
        .getResponse();
    }

    try {
      const response = await axios.get(`${API_BASE}?action=getCurrentBill`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const bill = response.data;
      const speakOutput = `Your current bill is ${bill.grandTotal} rupees for ${bill.month}. It includes maintenance of ${bill.maintenance} rupees and water charges of ${bill.water} rupees. Would you like to pay now?`;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Would you like to pay your bill?')
        .getResponse();
    } catch (error) {
      return handlerInput.responseBuilder
        .speak('Sorry, I could not fetch your bill. Please try again.')
        .getResponse();
    }
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetBillIntentHandler
  )
  .lambda();
```

---

## 10. Testing Plan

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-V-001 | Say "What is my bill?" | Returns current month bill amount |
| TC-V-002 | Say "Pay using UPI" | Generates UPI payment link |
| TC-V-003 | Say "मेरा बिल कितना है?" (Hindi) | Returns bill in Hindi |
| TC-V-004 | Background noise | Gracefully handles unclear speech |
| TC-V-005 | No microphone permission | Shows appropriate error |
| TC-V-006 | Network offline | Falls back gracefully |
| TC-V-007 | Long silence | Auto-stops listening |
| TC-V-008 | Ambiguous request | Asks for clarification |

---

## 11. Cost Estimation

| Item | Monthly Cost (500 flats) |
|------|-------------------------|
| Claude API (~2000 queries) | $10-15 |
| Whisper API (fallback only) | $0-5 |
| ElevenLabs (premium TTS) | $0-22 |
| Alexa Skill hosting (Lambda) | $0-5 |
| **Total** | **$10-47/month** |

---

## 12. Security Considerations

1. **API Key Protection**: Store keys in environment variables, not in client code
2. **User Authentication**: Verify user session before processing voice commands
3. **Payment Security**: Only generate payment links, never store payment credentials
4. **Data Privacy**: Log voice interactions with minimal PII
5. **Rate Limiting**: Implement rate limits to prevent abuse
