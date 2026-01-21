# Design 3: WhatsApp-Native Society Bot
## Complete Implementation Plan

---

## 1. Overview

A WhatsApp-based bot that allows residents to interact with the society management system through the messaging app they use daily. Supports text commands, voice messages, and rich interactive messages.

### Key Capabilities
- Bill inquiries and PDF download
- Payment link generation
- Voice message support (multilingual)
- Complaint registration with photos
- Visitor pre-approval
- Notice broadcasts
- Payment reminders
- Two-way conversations

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    WHATSAPP USERS                                 │  │
│   │   📱 Residents    📱 Committee Members    📱 Security Guards     │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
├────────────────────────────────────┼─────────────────────────────────────┤
│                          WHATSAPP CLOUD API                              │
├────────────────────────────────────┼─────────────────────────────────────┤
│                                    │                                     │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │              META WHATSAPP BUSINESS PLATFORM                      │  │
│   │   • Message Receiving                                             │  │
│   │   • Message Sending (Text, Media, Interactive)                   │  │
│   │   • Webhooks                                                      │  │
│   │   • Template Messages                                             │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
├────────────────────────────────────┼─────────────────────────────────────┤
│                          WEBHOOK SERVER                                  │
├────────────────────────────────────┼─────────────────────────────────────┤
│                                    ▼                                     │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    NODE.JS SERVER                                 │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│   │   │  Webhook    │  │  Message    │  │  Session                │  │  │
│   │   │  Handler    │──│  Router     │──│  Manager                │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│   │                                                                   │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│   │   │  Voice      │  │  AI Intent  │  │  Action                 │  │  │
│   │   │  Processor  │  │  Parser     │  │  Executor               │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
├────────────────────────────────────┼─────────────────────────────────────┤
│                          INTEGRATION LAYER                               │
├────────────────────────────────────┼─────────────────────────────────────┤
│                                    ▼                                     │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│   │ Google Apps   │  │ Payment       │  │ File Storage              │   │
│   │ Script API    │  │ Gateway       │  │ (Bills PDF)               │   │
│   └───────────────┘  └───────────────┘  └───────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| WhatsApp API | Meta Cloud API | Message handling |
| Webhook Server | Node.js + Express | Process messages |
| Voice Processing | Whisper API | Transcribe voice messages |
| AI Processing | Claude API | Intent parsing |
| Hosting | Railway / Render / Vercel | Webhook hosting |
| Database | Existing Google Sheets | Data storage |
| File Storage | Google Drive / Cloudinary | Bill PDFs |

### WhatsApp Business API Options

| Provider | Cost | Ease of Use | Recommendation |
|----------|------|-------------|----------------|
| Meta Cloud API (Direct) | Pay per message | Medium | Best for control |
| Twilio | $0.005-0.05/msg | Easy | Good docs |
| Gupshup | $0.004-0.04/msg | Easy | India-focused |
| WATI | $49+/month | Very Easy | Best for non-devs |

**Recommended**: Meta Cloud API (direct) for cost control + flexibility

---

## 4. WhatsApp Business Setup

### 4.1 Prerequisites

1. **Facebook Business Account**
2. **Meta Developer Account**
3. **WhatsApp Business Account**
4. **Verified Business** (for template messages)
5. **Phone Number** (dedicated for bot)

### 4.2 Setup Steps

```bash
# 1. Create Meta Developer App
# Go to: https://developers.facebook.com/apps/

# 2. Add WhatsApp Product to App

# 3. Get credentials:
# - App ID
# - App Secret
# - WhatsApp Business Account ID
# - Phone Number ID
# - Access Token (System User Token for production)

# 4. Configure Webhook URL
# https://yourdomain.com/webhook/whatsapp

# 5. Subscribe to webhook fields:
# - messages
# - message_template_status_update
```

---

## 5. File Structure

```
whatsapp-bot/
├── src/
│   ├── index.js                    # Main server entry
│   ├── config/
│   │   ├── index.js                # Configuration
│   │   └── message-templates.js    # WhatsApp templates
│   ├── routes/
│   │   └── webhook.js              # Webhook routes
│   ├── controllers/
│   │   ├── message.controller.js   # Message handling
│   │   └── media.controller.js     # Media handling
│   ├── services/
│   │   ├── whatsapp.service.js     # WhatsApp API calls
│   │   ├── ai.service.js           # AI intent processing
│   │   ├── voice.service.js        # Voice transcription
│   │   ├── society.service.js      # Society data operations
│   │   ├── payment.service.js      # Payment link generation
│   │   └── notification.service.js # Broadcast notifications
│   ├── handlers/
│   │   ├── bill.handler.js         # Bill-related actions
│   │   ├── payment.handler.js      # Payment actions
│   │   ├── complaint.handler.js    # Complaint actions
│   │   ├── visitor.handler.js      # Visitor management
│   │   └── admin.handler.js        # Admin commands
│   ├── utils/
│   │   ├── session.js              # User session management
│   │   ├── validator.js            # Input validation
│   │   └── pdf-generator.js        # Bill PDF generation
│   └── middleware/
│       ├── auth.js                 # Webhook verification
│       └── rate-limiter.js         # Rate limiting
├── package.json
├── .env.example
└── README.md
```

---

## 6. Implementation Phases

### Phase 1: Server Setup & Webhook (Week 1)

#### 6.1.1 Main Server

```javascript
// src/index.js

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const webhookRoutes = require('./routes/webhook');
const config = require('./config');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp Bot server running on port ${PORT}`);
});

module.exports = app;
```

#### 6.1.2 Configuration

```javascript
// src/config/index.js

require('dotenv').config();

module.exports = {
  // WhatsApp API
  whatsapp: {
    apiVersion: 'v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET
  },

  // AI Services
  ai: {
    claudeApiKey: process.env.CLAUDE_API_KEY,
    whisperApiKey: process.env.OPENAI_API_KEY
  },

  // Society Backend
  society: {
    apiUrl: process.env.SOCIETY_API_URL,
    apiKey: process.env.SOCIETY_API_KEY
  },

  // Payment Gateway
  payment: {
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL
  }
};
```

#### 6.1.3 Webhook Routes

```javascript
// src/routes/webhook.js

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const config = require('../config');
const messageController = require('../controllers/message.controller');

// Webhook verification (GET)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook message handler (POST)
router.post('/whatsapp', validateSignature, async (req, res) => {
  try {
    // Acknowledge receipt immediately
    res.sendStatus(200);

    // Process message asynchronously
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            await messageController.handleIncoming(change.value);
          }
        }
      }
    }
  } catch (error) {
    console.error('Webhook error:', error);
    // Already sent 200, just log
  }
});

// Signature validation middleware
function validateSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    return res.sendStatus(401);
  }

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', config.whatsapp.appSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid signature');
    return res.sendStatus(401);
  }

  next();
}

module.exports = router;
```

### Phase 2: Message Controller & WhatsApp Service (Week 1-2)

#### 6.2.1 Message Controller

```javascript
// src/controllers/message.controller.js

const whatsappService = require('../services/whatsapp.service');
const aiService = require('../services/ai.service');
const voiceService = require('../services/voice.service');
const sessionManager = require('../utils/session');

// Handler imports
const billHandler = require('../handlers/bill.handler');
const paymentHandler = require('../handlers/payment.handler');
const complaintHandler = require('../handlers/complaint.handler');
const visitorHandler = require('../handlers/visitor.handler');
const adminHandler = require('../handlers/admin.handler');

class MessageController {
  async handleIncoming(value) {
    const { messages, contacts, metadata } = value;

    if (!messages || messages.length === 0) return;

    for (const message of messages) {
      await this.processMessage(message, contacts, metadata);
    }
  }

  async processMessage(message, contacts, metadata) {
    const from = message.from;
    const phoneNumberId = metadata.phone_number_id;
    const messageType = message.type;
    const messageId = message.id;

    console.log(`Processing ${messageType} message from ${from}`);

    try {
      // Mark message as read
      await whatsappService.markAsRead(messageId);

      // Get or create session
      const session = await sessionManager.getOrCreate(from);

      // Extract message content based on type
      let content;
      let isVoice = false;

      switch (messageType) {
        case 'text':
          content = message.text.body;
          break;

        case 'audio':
          // Transcribe voice message
          isVoice = true;
          content = await this.handleVoiceMessage(message.audio);
          break;

        case 'image':
          content = await this.handleImageMessage(message.image, session);
          break;

        case 'interactive':
          content = this.handleInteractiveMessage(message.interactive);
          break;

        case 'button':
          content = message.button.text;
          break;

        default:
          await whatsappService.sendText(from,
            'Sorry, I can only process text, voice messages, and images.');
          return;
      }

      if (!content) return;

      // Check if user is registered
      if (!session.isRegistered && !this.isRegistrationCommand(content)) {
        await this.promptRegistration(from);
        return;
      }

      // Process with AI to get intent
      const parsed = await aiService.parseIntent(content, session, isVoice);

      // Route to appropriate handler
      await this.routeToHandler(from, parsed, session, message);

      // Update session
      await sessionManager.update(from, {
        lastActivity: new Date(),
        lastIntent: parsed.intent
      });

    } catch (error) {
      console.error('Message processing error:', error);
      await whatsappService.sendText(from,
        'Sorry, something went wrong. Please try again or type "help" for assistance.');
    }
  }

  async handleVoiceMessage(audio) {
    try {
      // Download audio from WhatsApp
      const audioBuffer = await whatsappService.downloadMedia(audio.id);

      // Transcribe with Whisper
      const transcript = await voiceService.transcribe(audioBuffer);

      return transcript;
    } catch (error) {
      console.error('Voice transcription error:', error);
      return null;
    }
  }

  async handleImageMessage(image, session) {
    // Store image reference for complaint handling
    session.pendingImage = {
      id: image.id,
      mimeType: image.mime_type
    };

    return 'IMAGE_UPLOADED';
  }

  handleInteractiveMessage(interactive) {
    if (interactive.type === 'button_reply') {
      return interactive.button_reply.id;
    }
    if (interactive.type === 'list_reply') {
      return interactive.list_reply.id;
    }
    return null;
  }

  isRegistrationCommand(content) {
    const lower = content.toLowerCase();
    return lower.startsWith('register') ||
           lower.startsWith('link') ||
           lower === 'start';
  }

  async promptRegistration(from) {
    await whatsappService.sendInteractiveButtons(from, {
      body: `Welcome to Society Assistant! 🏠

To get started, please link your WhatsApp number with your flat.

Tap the button below to register:`,
      buttons: [
        { id: 'register', title: 'Register Now' }
      ]
    });
  }

  async routeToHandler(from, parsed, session, originalMessage) {
    const { intent, entities, response } = parsed;

    // If AI provided a direct response, send it
    if (response && !intent.startsWith('ACTION_')) {
      await whatsappService.sendText(from, response);
    }

    // Route based on intent
    switch (intent) {
      // Bill related
      case 'GET_BILL':
      case 'GET_BILL_PDF':
      case 'GET_BILL_HISTORY':
        await billHandler.handle(from, intent, entities, session);
        break;

      // Payment related
      case 'MAKE_PAYMENT':
      case 'PAYMENT_STATUS':
      case 'PAYMENT_HISTORY':
        await paymentHandler.handle(from, intent, entities, session);
        break;

      // Complaints
      case 'FILE_COMPLAINT':
      case 'COMPLAINT_STATUS':
        await complaintHandler.handle(from, intent, entities, session, originalMessage);
        break;

      // Visitors
      case 'APPROVE_VISITOR':
      case 'VISITOR_LIST':
        await visitorHandler.handle(from, intent, entities, session);
        break;

      // Admin commands
      case 'BROADCAST':
      case 'COLLECTION_SUMMARY':
      case 'DEFAULTER_LIST':
        await adminHandler.handle(from, intent, entities, session);
        break;

      // Registration
      case 'REGISTER':
        await this.handleRegistration(from, entities, session);
        break;

      // Help
      case 'HELP':
        await this.sendHelpMessage(from, session);
        break;

      // Greeting
      case 'GREETING':
        await this.sendGreeting(from, session);
        break;

      default:
        await whatsappService.sendText(from,
          `I didn't understand that. Type "help" to see what I can do.`);
    }
  }

  async handleRegistration(from, entities, session) {
    const { flatNo, otp } = entities;

    if (!flatNo) {
      await whatsappService.sendText(from,
        `Please provide your flat number to register.

Example: "Register A-101" or "Link flat B-205"`);
      return;
    }

    // TODO: Implement OTP verification flow
    // For now, simple registration
    try {
      const result = await require('../services/society.service')
        .linkPhoneToFlat(from, flatNo);

      if (result.success) {
        session.isRegistered = true;
        session.flatId = result.flatId;
        session.flatNo = flatNo;
        await sessionManager.update(from, session);

        await whatsappService.sendText(from,
          `✅ Successfully registered!

Your WhatsApp is now linked to flat ${flatNo}.

You can now:
• Check your bills - type "bill"
• Make payments - type "pay"
• File complaints - type "complaint"
• And more! Type "help" for all commands.`);
      } else {
        await whatsappService.sendText(from,
          `❌ Registration failed: ${result.error}

Please check your flat number and try again.`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      await whatsappService.sendText(from,
        'Registration failed. Please contact the society office.');
    }
  }

  async sendHelpMessage(from, session) {
    const isAdmin = session.role === 'admin';

    let helpText = `🏠 *Society Assistant - Help*

*Available Commands:*

📋 *Bills*
• "bill" - View current bill
• "bills" - View all pending bills
• "download bill" - Get bill PDF

💳 *Payments*
• "pay" - Pay your bill
• "payment history" - View past payments

📝 *Complaints*
• "complaint" - File a new complaint
• "my complaints" - Check complaint status

👥 *Visitors*
• "approve visitor" - Pre-approve a guest
• "my visitors" - List approved visitors

📢 *Notices*
• "notices" - View recent notices`;

    if (isAdmin) {
      helpText += `

*Admin Commands:*
• "broadcast [message]" - Send notice to all
• "collection summary" - Today's collection
• "defaulters" - List of defaulters
• "pending payments" - All pending bills`;
    }

    helpText += `

_You can also send voice messages in Hindi/English!_`;

    await whatsappService.sendText(from, helpText);
  }

  async sendGreeting(from, session) {
    const name = session.ownerName || 'Resident';
    const hour = new Date().getHours();

    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    await whatsappService.sendInteractiveButtons(from, {
      body: `${greeting}, ${name}! 👋

How can I help you today?`,
      buttons: [
        { id: 'GET_BILL', title: '📋 View Bill' },
        { id: 'MAKE_PAYMENT', title: '💳 Pay Now' },
        { id: 'HELP', title: '❓ Help' }
      ]
    });
  }
}

module.exports = new MessageController();
```

#### 6.2.2 WhatsApp Service

```javascript
// src/services/whatsapp.service.js

const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');

class WhatsAppService {
  constructor() {
    this.baseUrl = `https://graph.facebook.com/${config.whatsapp.apiVersion}`;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async sendMessage(to, messageData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          ...messageData
        },
        { headers: this.getHeaders() }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('Send message error:', error.response?.data || error);
      return { success: false, error: error.message };
    }
  }

  async sendText(to, text) {
    return this.sendMessage(to, {
      type: 'text',
      text: { body: text }
    });
  }

  async sendInteractiveButtons(to, { body, buttons, header, footer }) {
    const buttonObjects = buttons.map(btn => ({
      type: 'reply',
      reply: {
        id: btn.id,
        title: btn.title.substring(0, 20) // Max 20 chars
      }
    }));

    const messageData = {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: { buttons: buttonObjects }
      }
    };

    if (header) {
      messageData.interactive.header = { type: 'text', text: header };
    }

    if (footer) {
      messageData.interactive.footer = { text: footer };
    }

    return this.sendMessage(to, messageData);
  }

  async sendInteractiveList(to, { body, buttonText, sections, header, footer }) {
    const messageData = {
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: body },
        action: {
          button: buttonText,
          sections: sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              id: row.id,
              title: row.title.substring(0, 24),
              description: row.description?.substring(0, 72)
            }))
          }))
        }
      }
    };

    if (header) {
      messageData.interactive.header = { type: 'text', text: header };
    }

    if (footer) {
      messageData.interactive.footer = { text: footer };
    }

    return this.sendMessage(to, messageData);
  }

  async sendDocument(to, { documentUrl, filename, caption }) {
    return this.sendMessage(to, {
      type: 'document',
      document: {
        link: documentUrl,
        filename,
        caption
      }
    });
  }

  async sendImage(to, { imageUrl, caption }) {
    return this.sendMessage(to, {
      type: 'image',
      image: {
        link: imageUrl,
        caption
      }
    });
  }

  async sendTemplate(to, { templateName, languageCode, components }) {
    return this.sendMessage(to, {
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode || 'en' },
        components
      }
    });
  }

  async markAsRead(messageId) {
    try {
      await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }

  async downloadMedia(mediaId) {
    try {
      // Get media URL
      const mediaResponse = await axios.get(
        `${this.baseUrl}/${mediaId}`,
        { headers: this.getHeaders() }
      );

      const mediaUrl = mediaResponse.data.url;

      // Download media
      const downloadResponse = await axios.get(mediaUrl, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        responseType: 'arraybuffer'
      });

      return Buffer.from(downloadResponse.data);
    } catch (error) {
      console.error('Download media error:', error);
      throw error;
    }
  }

  async uploadMedia(buffer, mimeType) {
    try {
      const formData = new FormData();
      formData.append('file', buffer, {
        contentType: mimeType,
        filename: 'upload'
      });
      formData.append('messaging_product', 'whatsapp');

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            ...formData.getHeaders()
          }
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Upload media error:', error);
      throw error;
    }
  }

  // Broadcast message to multiple recipients
  async broadcast(recipients, message, { isTemplate = false, templateName, templateParams } = {}) {
    const results = [];

    for (const recipient of recipients) {
      try {
        let result;

        if (isTemplate) {
          result = await this.sendTemplate(recipient, {
            templateName,
            components: templateParams
          });
        } else {
          result = await this.sendText(recipient, message);
        }

        results.push({ recipient, ...result });

        // Rate limiting - WhatsApp allows ~80 messages/second
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new WhatsAppService();
```

### Phase 3: AI Intent Processing (Week 2)

#### 6.3.1 AI Service

```javascript
// src/services/ai.service.js

const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

class AIService {
  constructor() {
    this.client = new Anthropic({
      apiKey: config.ai.claudeApiKey
    });
  }

  async parseIntent(userInput, session, isVoice = false) {
    const systemPrompt = this.buildSystemPrompt(session, isVoice);

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userInput }]
      });

      const content = response.content[0].text;
      return this.parseResponse(content);

    } catch (error) {
      console.error('AI parsing error:', error);
      return {
        intent: 'UNKNOWN',
        entities: {},
        response: 'I had trouble understanding that. Could you rephrase?',
        confidence: 0
      };
    }
  }

  buildSystemPrompt(session, isVoice) {
    const userContext = session.isRegistered ? `
User is registered:
- Flat Number: ${session.flatNo}
- Owner Name: ${session.ownerName || 'Unknown'}
- Role: ${session.role || 'member'}
- Has pending bills: ${session.hasPendingBills || 'unknown'}` : 'User is NOT registered.';

    return `You are a WhatsApp chatbot for a residential society in India.
Parse user messages and determine intent for billing, payments, and society management.

${userContext}

${isVoice ? 'NOTE: This message was transcribed from voice. Be lenient with spelling/grammar.' : ''}

IMPORTANT: Respond ONLY with valid JSON in this format:
{
  "intent": "INTENT_NAME",
  "entities": {
    "month": "january",
    "amount": 2450,
    "flatNo": "A-101"
  },
  "response": "Optional friendly response text",
  "confidence": 0.95
}

Available intents:
- GREETING: Hello, hi, good morning, etc.
- GET_BILL: Check current/specific month bill
- GET_BILL_PDF: Download bill as PDF
- GET_BILL_HISTORY: View past bills
- MAKE_PAYMENT: Pay bill/dues
- PAYMENT_STATUS: Check if payment is pending
- PAYMENT_HISTORY: View past payments
- FILE_COMPLAINT: Register a complaint
- COMPLAINT_STATUS: Check complaint status
- APPROVE_VISITOR: Pre-approve a visitor
- VISITOR_LIST: List approved visitors
- REGISTER: Link phone to flat (entities: flatNo)
- HELP: List available commands
- BROADCAST: Admin - send notice (entities: message)
- COLLECTION_SUMMARY: Admin - today's collection
- DEFAULTER_LIST: Admin - list defaulters
- UNKNOWN: Cannot determine intent

Extract relevant entities from the message (month, year, amount, flatNo, visitorName, visitorPhone, complaintType, message).

For Hindi messages, translate and parse the intent.
Examples:
- "मेरा बिल कितना है" → GET_BILL
- "payment karna hai" → MAKE_PAYMENT
- "visitor aa raha hai kal" → APPROVE_VISITOR

Keep responses conversational and brief (suitable for WhatsApp).`;
  }

  parseResponse(content) {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      return {
        intent: 'UNKNOWN',
        entities: {},
        response: content,
        confidence: 0.5
      };
    } catch (error) {
      console.error('JSON parse error:', error);
      return {
        intent: 'UNKNOWN',
        entities: {},
        response: 'I had trouble understanding. Please try again.',
        confidence: 0
      };
    }
  }
}

module.exports = new AIService();
```

#### 6.3.2 Voice Service

```javascript
// src/services/voice.service.js

const OpenAI = require('openai');
const config = require('../config');

class VoiceService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.ai.whisperApiKey
    });
  }

  async transcribe(audioBuffer, language = 'hi') {
    try {
      // Create a file-like object from buffer
      const file = new File([audioBuffer], 'audio.ogg', { type: 'audio/ogg' });

      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
        language: language, // 'hi' for Hindi, 'en' for English
        response_format: 'text'
      });

      return response;
    } catch (error) {
      console.error('Transcription error:', error);

      // Retry with language detection
      try {
        const file = new File([audioBuffer], 'audio.ogg', { type: 'audio/ogg' });
        const response = await this.client.audio.transcriptions.create({
          model: 'whisper-1',
          file: file,
          response_format: 'text'
        });
        return response;
      } catch (retryError) {
        console.error('Transcription retry failed:', retryError);
        throw new Error('Could not transcribe voice message');
      }
    }
  }
}

module.exports = new VoiceService();
```

### Phase 4: Business Logic Handlers (Week 2-3)

#### 6.4.1 Bill Handler

```javascript
// src/handlers/bill.handler.js

const whatsappService = require('../services/whatsapp.service');
const societyService = require('../services/society.service');
const pdfGenerator = require('../utils/pdf-generator');

class BillHandler {
  async handle(from, intent, entities, session) {
    switch (intent) {
      case 'GET_BILL':
        await this.getCurrentBill(from, entities, session);
        break;

      case 'GET_BILL_PDF':
        await this.getBillPDF(from, entities, session);
        break;

      case 'GET_BILL_HISTORY':
        await this.getBillHistory(from, session);
        break;
    }
  }

  async getCurrentBill(from, entities, session) {
    try {
      const month = entities.month || 'current';
      const bill = await societyService.getBill(session.flatId, month);

      if (!bill) {
        await whatsappService.sendText(from,
          `No bill found for ${month === 'current' ? 'this month' : month}.`);
        return;
      }

      // Format bill message
      const billMessage = this.formatBillMessage(bill);

      // Send with payment button
      await whatsappService.sendInteractiveButtons(from, {
        header: `📋 Bill: ${bill.billNo}`,
        body: billMessage,
        footer: `Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`,
        buttons: [
          { id: `PAY_${bill.id}`, title: '💳 Pay Now' },
          { id: `PDF_${bill.id}`, title: '📄 Download PDF' }
        ]
      });

    } catch (error) {
      console.error('Get bill error:', error);
      await whatsappService.sendText(from,
        'Sorry, could not fetch your bill. Please try again later.');
    }
  }

  formatBillMessage(bill) {
    let message = `*Flat: ${bill.flatNo}*\n`;
    message += `Month: ${this.getMonthName(bill.month)} ${bill.year}\n\n`;

    message += `*Charges:*\n`;
    for (const item of bill.lineItems) {
      message += `• ${item.description}: ₹${item.amount.toLocaleString()}\n`;
    }

    message += `\n*Current Charges:* ₹${bill.totalAmount.toLocaleString()}`;

    if (bill.previousDue > 0) {
      message += `\n*Previous Due:* ₹${bill.previousDue.toLocaleString()}`;
    }

    message += `\n\n*Total Payable:* ₹${bill.grandTotal.toLocaleString()}`;

    if (bill.status === 'partial') {
      const balance = bill.grandTotal - (bill.paidAmount || 0);
      message += `\n*Paid:* ₹${bill.paidAmount.toLocaleString()}`;
      message += `\n*Balance:* ₹${balance.toLocaleString()}`;
    }

    return message;
  }

  getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
  }

  async getBillPDF(from, entities, session) {
    try {
      const billId = entities.billId;
      const bill = billId
        ? await societyService.getBillById(billId)
        : await societyService.getBill(session.flatId, 'current');

      if (!bill) {
        await whatsappService.sendText(from, 'Bill not found.');
        return;
      }

      // Generate PDF
      const pdfUrl = await pdfGenerator.generateBillPDF(bill);

      // Send document
      await whatsappService.sendDocument(from, {
        documentUrl: pdfUrl,
        filename: `Bill_${bill.billNo}.pdf`,
        caption: `📄 Bill for ${this.getMonthName(bill.month)} ${bill.year}\nFlat: ${bill.flatNo}\nAmount: ₹${bill.grandTotal.toLocaleString()}`
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      await whatsappService.sendText(from,
        'Sorry, could not generate the bill PDF. Please try again.');
    }
  }

  async getBillHistory(from, session) {
    try {
      const bills = await societyService.getBillHistory(session.flatId, 6);

      if (!bills || bills.length === 0) {
        await whatsappService.sendText(from, 'No bill history found.');
        return;
      }

      // Create list message
      const sections = [{
        title: 'Recent Bills',
        rows: bills.map(bill => ({
          id: `BILL_${bill.id}`,
          title: `${this.getMonthName(bill.month)} ${bill.year}`,
          description: `₹${bill.grandTotal.toLocaleString()} - ${bill.status.toUpperCase()}`
        }))
      }];

      await whatsappService.sendInteractiveList(from, {
        body: `📋 *Your Bill History*\n\nTap a bill to view details:`,
        buttonText: 'View Bills',
        sections
      });

    } catch (error) {
      console.error('Bill history error:', error);
      await whatsappService.sendText(from,
        'Could not fetch bill history. Please try again.');
    }
  }
}

module.exports = new BillHandler();
```

#### 6.4.2 Payment Handler

```javascript
// src/handlers/payment.handler.js

const whatsappService = require('../services/whatsapp.service');
const societyService = require('../services/society.service');
const paymentService = require('../services/payment.service');

class PaymentHandler {
  async handle(from, intent, entities, session) {
    switch (intent) {
      case 'MAKE_PAYMENT':
        await this.initiatePayment(from, entities, session);
        break;

      case 'PAYMENT_STATUS':
        await this.checkPaymentStatus(from, session);
        break;

      case 'PAYMENT_HISTORY':
        await this.getPaymentHistory(from, session);
        break;
    }
  }

  async initiatePayment(from, entities, session) {
    try {
      // Get pending amount
      const bills = await societyService.getPendingBills(session.flatId);

      if (!bills || bills.length === 0) {
        await whatsappService.sendText(from,
          '✅ Great news! You have no pending bills.');
        return;
      }

      const totalPending = bills.reduce((sum, b) =>
        sum + (b.grandTotal - (b.paidAmount || 0)), 0
      );

      // Generate payment link
      const paymentLink = await paymentService.generatePaymentLink({
        flatId: session.flatId,
        flatNo: session.flatNo,
        amount: entities.amount || totalPending,
        phone: from,
        bills: bills.map(b => b.id)
      });

      // Send payment options
      await whatsappService.sendInteractiveButtons(from, {
        header: '💳 Pay Society Dues',
        body: `*Flat:* ${session.flatNo}
*Total Pending:* ₹${totalPending.toLocaleString()}

${bills.map(b => `• ${this.getMonthName(b.month)}: ₹${(b.grandTotal - (b.paidAmount || 0)).toLocaleString()}`).join('\n')}

Choose payment method:`,
        buttons: [
          { id: 'PAY_UPI', title: '📱 UPI' },
          { id: 'PAY_CARD', title: '💳 Card/Netbanking' }
        ],
        footer: 'Secure payment via Razorpay'
      });

      // Store payment context in session
      session.pendingPayment = {
        amount: totalPending,
        paymentLink,
        bills: bills.map(b => b.id)
      };

    } catch (error) {
      console.error('Payment initiation error:', error);
      await whatsappService.sendText(from,
        'Could not initiate payment. Please try again or contact the office.');
    }
  }

  async sendUPILink(from, session) {
    const { pendingPayment } = session;

    if (!pendingPayment) {
      await whatsappService.sendText(from,
        'No pending payment found. Type "pay" to start a new payment.');
      return;
    }

    // Generate UPI deep link
    const upiLink = paymentService.generateUPILink({
      payeeName: 'Society Maintenance',
      payeeVPA: process.env.SOCIETY_UPI_ID,
      amount: pendingPayment.amount,
      note: `Maintenance - ${session.flatNo}`,
      reference: `PAY-${Date.now()}`
    });

    await whatsappService.sendText(from,
      `📱 *Pay via UPI*

Amount: ₹${pendingPayment.amount.toLocaleString()}

*Option 1:* Tap the link below to pay:
${upiLink}

*Option 2:* Scan QR code in any UPI app

*Option 3:* Send to UPI ID:
${process.env.SOCIETY_UPI_ID}

After payment, send screenshot or transaction ID for instant confirmation.`);
  }

  async checkPaymentStatus(from, session) {
    try {
      const bills = await societyService.getPendingBills(session.flatId);

      if (!bills || bills.length === 0) {
        await whatsappService.sendText(from,
          `✅ *All Clear!*

You have no pending dues. Thank you for being prompt with payments! 🙏`);
        return;
      }

      const totalPending = bills.reduce((sum, b) =>
        sum + (b.grandTotal - (b.paidAmount || 0)), 0
      );

      const overdueBills = bills.filter(b => new Date(b.dueDate) < new Date());

      let status = `📊 *Payment Status*\n\n`;
      status += `*Flat:* ${session.flatNo}\n`;
      status += `*Total Pending:* ₹${totalPending.toLocaleString()}\n`;
      status += `*Pending Bills:* ${bills.length}\n`;

      if (overdueBills.length > 0) {
        status += `\n⚠️ *${overdueBills.length} bills are overdue!*`;
      }

      await whatsappService.sendInteractiveButtons(from, {
        body: status,
        buttons: [
          { id: 'MAKE_PAYMENT', title: '💳 Pay Now' },
          { id: 'GET_BILL_HISTORY', title: '📋 View Bills' }
        ]
      });

    } catch (error) {
      console.error('Payment status error:', error);
      await whatsappService.sendText(from,
        'Could not fetch payment status. Please try again.');
    }
  }

  async getPaymentHistory(from, session) {
    try {
      const payments = await societyService.getPaymentHistory(session.flatId, 10);

      if (!payments || payments.length === 0) {
        await whatsappService.sendText(from, 'No payment history found.');
        return;
      }

      let history = `📜 *Payment History*\n\n`;

      for (const payment of payments.slice(0, 5)) {
        const date = new Date(payment.paymentDate).toLocaleDateString();
        history += `✅ ₹${payment.amount.toLocaleString()} - ${date}\n`;
        history += `   ${payment.paymentMode.toUpperCase()}`;
        if (payment.referenceNo) {
          history += ` (${payment.referenceNo})`;
        }
        history += `\n\n`;
      }

      if (payments.length > 5) {
        history += `_...and ${payments.length - 5} more payments_`;
      }

      await whatsappService.sendText(from, history);

    } catch (error) {
      console.error('Payment history error:', error);
      await whatsappService.sendText(from,
        'Could not fetch payment history. Please try again.');
    }
  }

  getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
  }
}

module.exports = new PaymentHandler();
```

#### 6.4.3 Complaint Handler

```javascript
// src/handlers/complaint.handler.js

const whatsappService = require('../services/whatsapp.service');
const societyService = require('../services/society.service');

class ComplaintHandler {
  async handle(from, intent, entities, session, originalMessage) {
    switch (intent) {
      case 'FILE_COMPLAINT':
        await this.fileComplaint(from, entities, session, originalMessage);
        break;

      case 'COMPLAINT_STATUS':
        await this.getComplaintStatus(from, session);
        break;
    }
  }

  async fileComplaint(from, entities, session, originalMessage) {
    // Check if this is start of complaint flow or continuation
    if (!entities.complaintType && !session.complaintDraft) {
      // Start complaint flow
      await this.startComplaintFlow(from, session);
      return;
    }

    // If complaint type provided or in draft
    if (entities.complaintType || session.complaintDraft) {
      await this.processComplaint(from, entities, session, originalMessage);
    }
  }

  async startComplaintFlow(from, session) {
    // Ask for complaint category
    await whatsappService.sendInteractiveList(from, {
      body: `📝 *File a Complaint*

Please select the category of your complaint:`,
      buttonText: 'Select Category',
      sections: [{
        title: 'Complaint Categories',
        rows: [
          { id: 'COMPLAINT_water', title: '💧 Water', description: 'Water supply, leakage, plumbing' },
          { id: 'COMPLAINT_electrical', title: '⚡ Electrical', description: 'Power, lights, wiring issues' },
          { id: 'COMPLAINT_lift', title: '🛗 Lift', description: 'Elevator malfunction' },
          { id: 'COMPLAINT_security', title: '🔒 Security', description: 'Security concerns, CCTV' },
          { id: 'COMPLAINT_cleanliness', title: '🧹 Cleanliness', description: 'Cleaning, garbage, hygiene' },
          { id: 'COMPLAINT_parking', title: '🚗 Parking', description: 'Parking issues, violations' },
          { id: 'COMPLAINT_noise', title: '🔊 Noise', description: 'Noise complaints' },
          { id: 'COMPLAINT_other', title: '📋 Other', description: 'Other issues' }
        ]
      }]
    });

    // Set session state
    session.complaintFlow = 'category_selection';
  }

  async processComplaint(from, entities, session, originalMessage) {
    // Initialize draft if needed
    if (!session.complaintDraft) {
      session.complaintDraft = {};
    }

    const draft = session.complaintDraft;

    // Process based on flow state
    if (entities.complaintType) {
      draft.category = entities.complaintType;
      session.complaintFlow = 'description';

      await whatsappService.sendText(from,
        `Got it! You're reporting a *${draft.category}* issue.

Please describe the problem in detail. You can also send a photo.`);
      return;
    }

    // If we have a description
    if (entities.description || originalMessage?.text?.body) {
      draft.description = entities.description || originalMessage?.text?.body;
    }

    // Check for image
    if (session.pendingImage) {
      draft.image = session.pendingImage;
      session.pendingImage = null;
    }

    // If we have category and description, confirm
    if (draft.category && draft.description) {
      await this.confirmComplaint(from, session);
      return;
    }

    // Ask for missing info
    if (!draft.description) {
      await whatsappService.sendText(from,
        'Please describe your complaint. You can also attach a photo.');
    }
  }

  async confirmComplaint(from, session) {
    const draft = session.complaintDraft;

    await whatsappService.sendInteractiveButtons(from, {
      body: `📋 *Confirm Complaint*

*Category:* ${draft.category}
*Description:* ${draft.description.substring(0, 200)}${draft.description.length > 200 ? '...' : ''}
${draft.image ? '*Photo:* Attached ✓' : ''}
*Flat:* ${session.flatNo}

Is this correct?`,
      buttons: [
        { id: 'SUBMIT_COMPLAINT', title: '✅ Submit' },
        { id: 'CANCEL_COMPLAINT', title: '❌ Cancel' }
      ]
    });

    session.complaintFlow = 'confirmation';
  }

  async submitComplaint(from, session) {
    try {
      const draft = session.complaintDraft;

      // Upload image if present
      let imageUrl = null;
      if (draft.image) {
        const imageBuffer = await whatsappService.downloadMedia(draft.image.id);
        imageUrl = await societyService.uploadComplaintImage(imageBuffer);
      }

      // Create complaint
      const complaint = await societyService.createComplaint({
        flatId: session.flatId,
        flatNo: session.flatNo,
        category: draft.category,
        description: draft.description,
        imageUrl,
        reportedBy: from,
        status: 'open'
      });

      // Clear draft
      delete session.complaintDraft;
      delete session.complaintFlow;

      await whatsappService.sendText(from,
        `✅ *Complaint Registered!*

*Ticket ID:* ${complaint.ticketId}
*Category:* ${draft.category}
*Status:* Open

The committee has been notified. You'll receive updates on this chat.

To check status later, type: "complaint status"`);

      // Notify committee/admin
      await this.notifyCommittee(complaint, session);

    } catch (error) {
      console.error('Submit complaint error:', error);
      await whatsappService.sendText(from,
        'Failed to submit complaint. Please try again or contact the office.');
    }
  }

  async notifyCommittee(complaint, session) {
    // Get admin phone numbers
    const admins = await societyService.getAdminPhones();

    for (const adminPhone of admins) {
      await whatsappService.sendText(adminPhone,
        `🔔 *New Complaint*

*Ticket:* ${complaint.ticketId}
*From:* Flat ${session.flatNo}
*Category:* ${complaint.category}
*Description:* ${complaint.description.substring(0, 200)}

Reply with ticket ID to update status.`);
    }
  }

  async getComplaintStatus(from, session) {
    try {
      const complaints = await societyService.getComplaints(session.flatId);

      if (!complaints || complaints.length === 0) {
        await whatsappService.sendText(from,
          'You have no complaints on record.');
        return;
      }

      let status = `📋 *Your Complaints*\n\n`;

      for (const c of complaints.slice(0, 5)) {
        const emoji = c.status === 'resolved' ? '✅' :
                      c.status === 'in_progress' ? '🔄' : '⏳';
        const date = new Date(c.createdAt).toLocaleDateString();

        status += `${emoji} *${c.ticketId}*\n`;
        status += `   ${c.category} - ${c.status.toUpperCase()}\n`;
        status += `   _${date}_\n\n`;
      }

      await whatsappService.sendText(from, status);

    } catch (error) {
      console.error('Get complaints error:', error);
      await whatsappService.sendText(from,
        'Could not fetch complaint status. Please try again.');
    }
  }
}

module.exports = new ComplaintHandler();
```

### Phase 5: Notification Service & Broadcasts (Week 3-4)

#### 6.5.1 Notification Service

```javascript
// src/services/notification.service.js

const whatsappService = require('./whatsapp.service');
const societyService = require('./society.service');

class NotificationService {
  // Bill generated notification
  async sendBillNotification(bill, flatPhone) {
    try {
      await whatsappService.sendTemplate(flatPhone, {
        templateName: 'bill_generated',
        languageCode: 'en',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: bill.flatNo },
              { type: 'text', text: `${this.getMonthName(bill.month)} ${bill.year}` },
              { type: 'text', text: `₹${bill.grandTotal.toLocaleString()}` },
              { type: 'text', text: new Date(bill.dueDate).toLocaleDateString() }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              { type: 'text', text: bill.id }
            ]
          }
        ]
      });

      return { success: true };
    } catch (error) {
      console.error('Bill notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Payment reminder
  async sendPaymentReminder(flat, amount, dueDate, isOverdue = false) {
    const templateName = isOverdue ? 'payment_overdue' : 'payment_reminder';

    try {
      await whatsappService.sendTemplate(flat.ownerPhone, {
        templateName,
        languageCode: 'en',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: flat.ownerName || 'Resident' },
              { type: 'text', text: flat.flatNo },
              { type: 'text', text: `₹${amount.toLocaleString()}` },
              { type: 'text', text: new Date(dueDate).toLocaleDateString() }
            ]
          }
        ]
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Payment received confirmation
  async sendPaymentConfirmation(payment, flat) {
    try {
      await whatsappService.sendText(flat.ownerPhone,
        `✅ *Payment Received!*

*Amount:* ₹${payment.amount.toLocaleString()}
*Receipt No:* ${payment.receiptNo}
*Date:* ${new Date(payment.paymentDate).toLocaleDateString()}
*Flat:* ${flat.flatNo}

Thank you for your payment! 🙏`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Broadcast notice to all residents
  async broadcastNotice(notice, society) {
    try {
      const flats = await societyService.getFlatsWithPhones();

      const results = {
        total: flats.length,
        sent: 0,
        failed: 0
      };

      for (const flat of flats) {
        if (!flat.ownerPhone) continue;

        try {
          await whatsappService.sendText(flat.ownerPhone,
            `📢 *Society Notice*

${notice.title}

${notice.content}

${notice.isUrgent ? '⚠️ *URGENT - Please read immediately*' : ''}

_From: ${society.name} Management_`);

          results.sent++;

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      console.error('Broadcast error:', error);
      throw error;
    }
  }

  // Complaint status update
  async notifyComplaintUpdate(complaint, flat) {
    const statusEmoji = {
      'open': '⏳',
      'in_progress': '🔄',
      'resolved': '✅',
      'closed': '✔️'
    };

    try {
      await whatsappService.sendText(flat.ownerPhone,
        `${statusEmoji[complaint.status] || '📋'} *Complaint Update*

*Ticket:* ${complaint.ticketId}
*Status:* ${complaint.status.toUpperCase()}
${complaint.remarks ? `*Remarks:* ${complaint.remarks}` : ''}

${complaint.status === 'resolved' ? 'Thank you for your patience!' : ''}`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Visitor arrival notification
  async notifyVisitorArrival(visitor, flat) {
    try {
      await whatsappService.sendInteractiveButtons(flat.ownerPhone, {
        body: `🚪 *Visitor at Gate*

*Name:* ${visitor.name}
*Purpose:* ${visitor.purpose || 'Not specified'}
*Time:* ${new Date().toLocaleTimeString()}

Allow entry?`,
        buttons: [
          { id: `ALLOW_${visitor.id}`, title: '✅ Allow' },
          { id: `DENY_${visitor.id}`, title: '❌ Deny' },
          { id: `CALL_${visitor.id}`, title: '📞 Call Me' }
        ]
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || month;
  }
}

module.exports = new NotificationService();
```

---

## 7. WhatsApp Message Templates

Templates must be pre-approved by Meta. Create these in WhatsApp Business Manager:

### 7.1 Bill Generated Template

```
Template Name: bill_generated
Category: UTILITY
Language: English

Header: 📋 Monthly Bill Generated

Body:
Hello {{1}}!

Your maintenance bill for {{2}} has been generated.

Amount: {{3}}
Due Date: {{4}}

Tap below to view and pay:

Footer: Society Management System

Button: [URL] View Bill → https://yourdomain.com/bill/{{5}}
```

### 7.2 Payment Reminder Template

```
Template Name: payment_reminder
Category: UTILITY
Language: English

Body:
Dear {{1}},

This is a friendly reminder that your maintenance payment for flat {{2}} is due.

Amount Due: {{3}}
Due Date: {{4}}

Please pay on time to avoid late fees.

Button: [QUICK_REPLY] Pay Now
Button: [QUICK_REPLY] View Bill
```

### 7.3 Payment Overdue Template

```
Template Name: payment_overdue
Category: UTILITY
Language: English

Body:
⚠️ Dear {{1}},

Your maintenance payment for flat {{2}} is OVERDUE.

Amount Due: {{3}}
Was Due: {{4}}

Please pay immediately to avoid:
- Late fees
- Facility restrictions

Button: [URL] Pay Now → https://yourdomain.com/pay/{{5}}
```

---

## 8. Session Management

```javascript
// src/utils/session.js

const NodeCache = require('node-cache');
const societyService = require('../services/society.service');

class SessionManager {
  constructor() {
    // Cache sessions with 30 minute TTL
    this.cache = new NodeCache({
      stdTTL: 1800,
      checkperiod: 120
    });
  }

  async getOrCreate(phone) {
    // Check cache first
    let session = this.cache.get(phone);

    if (session) {
      return session;
    }

    // Check if phone is registered
    const registration = await societyService.getRegistrationByPhone(phone);

    if (registration) {
      session = {
        phone,
        isRegistered: true,
        flatId: registration.flatId,
        flatNo: registration.flatNo,
        ownerName: registration.ownerName,
        role: registration.role || 'member',
        societyId: registration.societyId,
        lastActivity: new Date()
      };

      // Get pending bill status
      const pending = await societyService.getPendingBills(registration.flatId);
      session.hasPendingBills = pending && pending.length > 0;

    } else {
      session = {
        phone,
        isRegistered: false,
        lastActivity: new Date()
      };
    }

    this.cache.set(phone, session);
    return session;
  }

  async update(phone, updates) {
    const session = this.cache.get(phone) || {};
    const updated = { ...session, ...updates };
    this.cache.set(phone, updated);
    return updated;
  }

  async delete(phone) {
    this.cache.del(phone);
  }

  async clearAll() {
    this.cache.flushAll();
  }
}

module.exports = new SessionManager();
```

---

## 9. Deployment

### 9.1 Environment Variables

```bash
# .env

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_APP_SECRET=your_app_secret

# AI Services
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key

# Society Backend
SOCIETY_API_URL=https://script.google.com/macros/s/xxx/exec
SOCIETY_API_KEY=your_api_key

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
SOCIETY_UPI_ID=society@upi

# Server
PORT=3000
BASE_URL=https://yourdomain.com
NODE_ENV=production
```

### 9.2 Railway Deployment

```bash
# railway.toml

[build]
builder = "nixpacks"

[deploy]
startCommand = "node src/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

---

## 10. Cost Estimation

| Item | Cost | Notes |
|------|------|-------|
| WhatsApp Business API | $0.005-0.08/msg | Varies by country/type |
| Claude API | $3-15/1M tokens | Intent processing |
| Whisper API | $0.006/minute | Voice transcription |
| Railway Hosting | $5-20/month | Webhook server |
| **Monthly (500 flats, 5000 msgs)** | **$50-150/month** | |

---

## 11. Testing Plan

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-WA-001 | Send "hi" from registered user | Greeting with quick actions |
| TC-WA-002 | Send "bill" | Current bill displayed |
| TC-WA-003 | Send voice message "mera bill kitna hai" | Bill info in Hindi context |
| TC-WA-004 | Click "Pay Now" button | Payment link generated |
| TC-WA-005 | Send complaint with image | Complaint registered with photo |
| TC-WA-006 | Unregistered user sends message | Registration prompt |
| TC-WA-007 | Admin sends "broadcast: notice text" | Notice sent to all |
| TC-WA-008 | Webhook signature validation | Invalid signature rejected |
| TC-WA-009 | Rate limiting | Excessive requests blocked |
| TC-WA-010 | Session timeout | Session recreated |

---

## 12. Security Considerations

1. **Webhook Security**: Validate all incoming webhook signatures
2. **Rate Limiting**: Prevent abuse with rate limits
3. **Phone Verification**: Verify phone ownership during registration
4. **Data Privacy**: Don't log sensitive financial data
5. **Access Control**: Verify user role for admin commands
6. **Secure Storage**: Encrypt sensitive session data
7. **API Key Protection**: Use environment variables, never commit keys
