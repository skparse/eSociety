# Design 6: AI-Powered Data Management
## Replace Manual CRUD with Voice & Conversational AI

---

## 1. Overview

Replace all manual form-based operations (add/edit/delete flats, members, buildings, etc.) with a conversational AI interface that understands natural language commands via voice or text.

### Current Pain Points (Manual Approach)
- Navigate through multiple menus to find the right form
- Fill numerous form fields one by one
- Repetitive data entry for bulk operations
- Error-prone manual input
- Time-consuming for non-tech-savvy committee members

### AI-Powered Solution
- **Voice Commands**: "Add new flat A-405, owner Rajesh Kumar, phone 9876543210"
- **Bulk Operations**: "Mark flats A-101 to A-110 as occupied"
- **Smart Updates**: "Transfer flat B-203 ownership to Priya Sharma"
- **Contextual Actions**: "Add his wife as co-owner" (remembers context)

---

## 2. Supported Operations

### 2.1 Flat Management

| Operation | Voice/Text Command Examples |
|-----------|---------------------------|
| **Add Flat** | "Add new flat A-405, 2BHK, 850 sqft, owner Rajesh Kumar, phone 9876543210" |
| **Update Flat** | "Update flat B-203, change area to 920 sqft" |
| **Delete Flat** | "Remove flat C-501 from the system" |
| **Transfer Ownership** | "Transfer flat A-101 to Sunil Sharma, phone 9988776655" |
| **Bulk Add** | "Add flats D-101 to D-110, all 3BHK, 1200 sqft each" |
| **Change Status** | "Mark flat A-205 as vacant" |
| **Add Vehicle** | "Add 2 cars to flat B-102" |

### 2.2 Member Management

| Operation | Voice/Text Command Examples |
|-----------|---------------------------|
| **Add Member** | "Add new member Priya Patel for flat A-303, phone 9123456789, email priya@email.com" |
| **Add Co-owner** | "Add Sunita as co-owner of flat B-201" |
| **Add Tenant** | "Register tenant Amit Kumar in flat C-102, phone 9876543210" |
| **Update Member** | "Update phone number for Ramesh in A-101 to 9988776655" |
| **Deactivate** | "Deactivate member account for flat B-305" |
| **Reset Password** | "Reset password for flat A-201 owner" |
| **Change Role** | "Make Suresh from B-102 a committee member" |

### 2.3 Building Management

| Operation | Voice/Text Command Examples |
|-----------|---------------------------|
| **Add Building** | "Add new building E with 15 floors, address sector 5" |
| **Update Building** | "Change building A name to Rose Tower" |
| **Add Amenity** | "Add swimming pool to building B" |

### 2.4 Master Data Management

| Operation | Voice/Text Command Examples |
|-----------|---------------------------|
| **Add Flat Type** | "Add new flat type 4BHK with 1800 sqft default area" |
| **Add Charge Type** | "Add new charge 'Sinking Fund' at ₹500 per month" |
| **Update Rates** | "Increase maintenance rate to ₹3.50 per sqft" |
| **Add Parking Slot** | "Add 20 new car parking slots to basement 2" |

### 2.5 Bulk Operations

| Operation | Voice/Text Command Examples |
|-----------|---------------------------|
| **Bulk Import** | "Import flats from the uploaded Excel file" |
| **Bulk Update** | "Increase all 2BHK maintenance by 10%" |
| **Bulk Status** | "Mark all flats in building C as active" |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INPUT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐   │
│   │  🎤 Voice      │  │  ⌨️ Text       │  │  📄 File Upload            │   │
│   │  Command       │  │  Command       │  │  (Excel/CSV)               │   │
│   └───────┬────────┘  └───────┬────────┘  └─────────────┬──────────────┘   │
│           │                   │                         │                   │
│           └───────────────────┼─────────────────────────┘                   │
│                               │                                              │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                      UNDERSTANDING LAYER                                     │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    COMMAND INTERPRETER (LLM)                          │  │
│   │                                                                        │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │  │
│   │   │ Intent      │  │ Entity      │  │ Context                     │  │  │
│   │   │ Detection   │  │ Extraction  │  │ Resolution                  │  │  │
│   │   │             │  │             │  │ (pronouns, references)      │  │  │
│   │   │ ADD_FLAT    │  │ flatNo,     │  │ "his wife" → last           │  │  │
│   │   │ UPDATE_FLAT │  │ ownerName,  │  │ mentioned person's spouse   │  │  │
│   │   │ DELETE_FLAT │  │ phone,      │  │                             │  │  │
│   │   │ ...         │  │ area, etc.  │  │                             │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                      VALIDATION LAYER                                        │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    SMART VALIDATOR                                    │  │
│   │                                                                        │  │
│   │   • Duplicate Detection     • Business Rule Validation                │  │
│   │   • Data Completeness       • Conflict Resolution                     │  │
│   │   • Format Validation       • Permission Check                        │  │
│   │                                                                        │  │
│   │   "Flat A-405 already exists. Did you mean A-406?"                   │  │
│   │   "Phone 9876543210 is already registered to flat B-102"             │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                      CONFIRMATION LAYER                                      │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    CONFIRMATION ENGINE                                │  │
│   │                                                                        │  │
│   │   📋 "I'll add flat A-405 with these details:                        │  │
│   │       - Type: 2BHK                                                    │  │
│   │       - Area: 850 sqft                                                │  │
│   │       - Owner: Rajesh Kumar                                           │  │
│   │       - Phone: 9876543210                                             │  │
│   │                                                                        │  │
│   │       Monthly charges will be ₹2,550                                  │  │
│   │                                                                        │  │
│   │       [✅ Confirm]  [✏️ Edit]  [❌ Cancel]"                           │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                      EXECUTION LAYER                                         │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                               ▼                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    ACTION EXECUTOR                                    │  │
│   │                                                                        │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │  │
│   │   │ CRUD        │  │ Cascade     │  │ Notification                │  │  │
│   │   │ Operations  │  │ Updates     │  │ Sender                      │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────────┘  │  │
│   │                                                                        │  │
│   │   + Audit Logging    + Undo Support    + Webhook Triggers            │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                               │                                              │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                      DATA LAYER                                              │
├───────────────────────────────┼──────────────────────────────────────────────┤
│                               ▼                                              │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐   │
│   │  Flats    │  │  Members  │  │ Buildings │  │  Master Data          │   │
│   └───────────┘  └───────────┘  └───────────┘  └───────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. User Interface Design

### 4.1 Command Center UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 Society Admin                                           👤 Admin Name   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  🎤  "Add flat A-405, 2BHK, owner Rajesh Kumar..."          [Send]   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌─ Quick Actions ─────────────────────────────────────────────────────┐   │
│   │  [➕ Add Flat]  [👤 Add Member]  [🏢 Add Building]  [📋 Bulk Import] │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─ Conversation ──────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │  👤 You: Add flat A-405, 2BHK, owner Rajesh Kumar, phone           │   │
│   │          9876543210                                                  │   │
│   │                                                                      │   │
│   │  🤖 AI: I'll create flat A-405 with these details:                  │   │
│   │                                                                      │   │
│   │         ┌────────────────────────────────────────┐                  │   │
│   │         │ Flat Number:    A-405                  │                  │   │
│   │         │ Type:           2BHK                   │                  │   │
│   │         │ Area:           750 sqft (default)     │                  │   │
│   │         │ Building:       A                      │                  │   │
│   │         │ Owner:          Rajesh Kumar           │                  │   │
│   │         │ Phone:          9876543210             │                  │   │
│   │         │ Status:         Occupied               │                  │   │
│   │         │                                        │                  │   │
│   │         │ Est. Monthly:   ₹2,450                 │                  │   │
│   │         └────────────────────────────────────────┘                  │   │
│   │                                                                      │   │
│   │         [✅ Confirm] [✏️ Change Area] [❌ Cancel]                    │   │
│   │                                                                      │   │
│   │  👤 You: Change area to 850 sqft                                    │   │
│   │                                                                      │   │
│   │  🤖 AI: Updated area to 850 sqft. Monthly charges: ₹2,550          │   │
│   │                                                                      │   │
│   │         [✅ Confirm] [✏️ Edit More] [❌ Cancel]                      │   │
│   │                                                                      │   │
│   │  👤 You: Confirm                                                     │   │
│   │                                                                      │   │
│   │  🤖 AI: ✅ Done! Flat A-405 has been added.                         │   │
│   │                                                                      │   │
│   │         • Owner login credentials sent to 9876543210                │   │
│   │         • First bill will be generated on 1st Feb                   │   │
│   │                                                                      │   │
│   │         Would you like to:                                           │   │
│   │         [Add Another Flat] [Add Family Member] [View Flat]          │   │
│   │                                                                      │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─ Recent Actions ────────────────────────────────────────────────────┐   │
│   │  ✅ Added flat A-405 (Rajesh Kumar) - just now           [Undo]     │   │
│   │  ✅ Updated B-203 ownership - 5 min ago                  [Undo]     │   │
│   │  ✅ Added member to C-101 - 12 min ago                   [Undo]     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Bulk Operations UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📋 Bulk Operations                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  👤 You: Add flats D-101 to D-120, all 3BHK, building D                     │
│                                                                              │
│  🤖 AI: I'll create 20 flats in Building D:                                 │
│                                                                              │
│         ┌─────────────────────────────────────────────────────────────┐     │
│         │ Range:        D-101 to D-120 (20 flats)                     │     │
│         │ Type:         3BHK                                          │     │
│         │ Default Area: 1200 sqft                                     │     │
│         │ Building:     D                                             │     │
│         │ Status:       Vacant (owner details pending)                │     │
│         └─────────────────────────────────────────────────────────────┘     │
│                                                                              │
│         Preview:                                                             │
│         ┌──────────┬────────┬──────────┬──────────┬────────────────┐        │
│         │ Flat No  │ Type   │ Area     │ Building │ Status         │        │
│         ├──────────┼────────┼──────────┼──────────┼────────────────┤        │
│         │ D-101    │ 3BHK   │ 1200     │ D        │ Vacant         │        │
│         │ D-102    │ 3BHK   │ 1200     │ D        │ Vacant         │        │
│         │ D-103    │ 3BHK   │ 1200     │ D        │ Vacant         │        │
│         │ ...      │ ...    │ ...      │ ...      │ ...            │        │
│         │ D-120    │ 3BHK   │ 1200     │ D        │ Vacant         │        │
│         └──────────┴────────┴──────────┴──────────┴────────────────┘        │
│                                                                              │
│         [✅ Create All 20] [📝 Customize Each] [📥 Import from Excel]       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. File Structure

```
js/
├── ai-admin/
│   ├── command-center.js           # Main UI controller
│   ├── command-interpreter.js      # LLM-based command parsing
│   ├── entity-extractor.js         # Extract entities from commands
│   ├── context-manager.js          # Conversation context handling
│   ├── smart-validator.js          # Validation and conflict detection
│   ├── confirmation-engine.js      # Generate confirmation dialogs
│   ├── action-executor.js          # Execute CRUD operations
│   ├── undo-manager.js             # Undo/redo support
│   ├── bulk-processor.js           # Handle bulk operations
│   ├── file-importer.js            # Excel/CSV import
│   └── handlers/
│       ├── flat-handler.js         # Flat CRUD operations
│       ├── member-handler.js       # Member CRUD operations
│       ├── building-handler.js     # Building CRUD operations
│       └── master-data-handler.js  # Master data operations
├── components/
│   ├── command-input.js            # Voice/text input component
│   ├── confirmation-card.js        # Confirmation UI component
│   └── action-history.js           # Recent actions component
└── config/
    └── ai-admin-config.js          # Configuration

css/
└── command-center.css              # Styles
```

---

## 6. Implementation

### 6.1 Command Interpreter (Core AI)

```javascript
// js/ai-admin/command-interpreter.js

class CommandInterpreter {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.contextManager = new ContextManager();
    this.dataSchema = null;
  }

  async initialize(storage) {
    // Load current data schema
    this.dataSchema = await this.loadDataSchema(storage);
  }

  async loadDataSchema(storage) {
    const [flats, buildings, flatTypes, chargeTypes] = await Promise.all([
      storage.read('Flats'),
      storage.read('Buildings') || storage.read('MasterData')?.buildings,
      storage.read('FlatTypes') || storage.read('MasterData')?.flatTypes,
      storage.read('ChargeTypes') || storage.read('MasterData')?.chargeTypes
    ]);

    return {
      existingFlats: flats?.map(f => f.flatNo) || [],
      buildings: buildings?.map(b => b.name) || ['A', 'B', 'C', 'D'],
      flatTypes: flatTypes?.map(t => ({ name: t.name, area: t.defaultArea })) || [
        { name: '1BHK', area: 550 },
        { name: '2BHK', area: 750 },
        { name: '3BHK', area: 1200 }
      ],
      chargeTypes: chargeTypes || []
    };
  }

  async interpret(userInput, conversationHistory = []) {
    const context = this.contextManager.getContext();
    const systemPrompt = this.buildSystemPrompt(context);

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
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            ...conversationHistory,
            { role: 'user', content: userInput }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;

      const parsed = this.parseResponse(content);

      // Update context with extracted entities
      if (parsed.entities) {
        this.contextManager.updateContext(parsed.entities);
      }

      return parsed;

    } catch (error) {
      console.error('Command interpretation error:', error);
      return {
        success: false,
        error: error.message,
        suggestions: this.getSuggestions(userInput)
      };
    }
  }

  buildSystemPrompt(context) {
    return `You are an AI assistant for managing residential society data. You help admins add, update, and delete flats, members, buildings, and other society data using natural language commands.

CURRENT DATA SCHEMA:
- Existing Flats: ${this.dataSchema.existingFlats.slice(0, 20).join(', ')}${this.dataSchema.existingFlats.length > 20 ? '...' : ''}
- Buildings: ${this.dataSchema.buildings.join(', ')}
- Flat Types: ${this.dataSchema.flatTypes.map(t => `${t.name} (${t.area} sqft)`).join(', ')}

CONVERSATION CONTEXT:
${context.lastMentioned ? `Last mentioned: ${JSON.stringify(context.lastMentioned)}` : 'No prior context'}

YOUR TASK:
1. Parse the user's command to understand the intent
2. Extract all relevant entities (flat numbers, names, phone numbers, etc.)
3. Resolve references like "his", "her", "the same flat", "that member"
4. Validate data and detect potential issues
5. Return a structured response

RESPOND ONLY WITH VALID JSON:
{
  "intent": "ADD_FLAT|UPDATE_FLAT|DELETE_FLAT|TRANSFER_FLAT|ADD_MEMBER|UPDATE_MEMBER|DELETE_MEMBER|ADD_BUILDING|UPDATE_BUILDING|BULK_ADD|BULK_UPDATE|ADD_CHARGE_TYPE|UPDATE_RATE|CONFIRMATION|CANCELLATION|CLARIFICATION|GREETING",

  "entities": {
    "flatNo": "A-405",
    "flatType": "2BHK",
    "area": 850,
    "building": "A",
    "floor": 4,
    "ownerName": "Rajesh Kumar",
    "ownerPhone": "9876543210",
    "ownerEmail": "rajesh@email.com",
    "coOwnerName": null,
    "tenantName": null,
    "occupancyStatus": "occupied|vacant|rented",
    "twoWheelerCount": 0,
    "fourWheelerCount": 1,
    "memberRole": "owner|co-owner|tenant|family",

    // For bulk operations
    "flatRange": { "start": "D-101", "end": "D-120" },
    "bulkCount": 20,

    // For updates
    "updateFields": { "area": 920, "phone": "9988776655" },

    // For transfers
    "newOwnerName": "Priya Sharma",
    "newOwnerPhone": "9123456789"
  },

  "validation": {
    "isValid": true,
    "warnings": ["Phone number already exists for flat B-102"],
    "errors": [],
    "suggestions": ["Did you mean flat A-406? A-405 already exists"]
  },

  "confirmation": {
    "summary": "Add new flat A-405 (2BHK, 850 sqft) with owner Rajesh Kumar",
    "details": [
      { "label": "Flat Number", "value": "A-405" },
      { "label": "Type", "value": "2BHK" },
      { "label": "Area", "value": "850 sqft" },
      { "label": "Owner", "value": "Rajesh Kumar" },
      { "label": "Phone", "value": "9876543210" },
      { "label": "Est. Monthly Charges", "value": "₹2,550" }
    ],
    "requiresConfirmation": true,
    "editableFields": ["area", "flatType", "phone"]
  },

  "response": "I'll add flat A-405 as a 2BHK unit with Rajesh Kumar as the owner. Please confirm the details.",

  "followUpActions": [
    { "label": "Add Family Member", "command": "Add family member to A-405" },
    { "label": "Add Vehicle", "command": "Add car to A-405" }
  ],

  "needsClarification": false,
  "clarificationQuestion": null
}

IMPORTANT RULES:
1. For flat numbers, extract building from prefix (A-405 → Building A, Floor 4)
2. Default flat type to 2BHK if not specified
3. Default area based on flat type if not specified
4. Phone numbers should be 10 digits (strip +91 or 0 prefix)
5. Calculate estimated monthly charges based on area × ₹3/sqft + fixed charges
6. Flag duplicates: Check if flatNo exists in existing flats list
7. Flag if phone is likely already registered
8. For pronouns (his/her/their), refer to context.lastMentioned
9. For "same flat" / "that flat", refer to context.lastMentioned.flatNo

HANDLE THESE PATTERNS:
- "Add flat X" → ADD_FLAT
- "Add flats X to Y" → BULK_ADD
- "Update flat X" / "Change X's phone" → UPDATE_FLAT
- "Delete flat X" / "Remove flat X" → DELETE_FLAT
- "Transfer flat X to Y" / "Change ownership" → TRANSFER_FLAT
- "Add member/owner/tenant to flat X" → ADD_MEMBER
- "Yes" / "Confirm" / "OK" / "हाँ" → CONFIRMATION
- "No" / "Cancel" / "नहीं" → CANCELLATION
- "Change area to X" (during confirmation) → UPDATE_PENDING with field update

HINDI SUPPORT:
- "नया फ्लैट जोड़ो A-405" → ADD_FLAT
- "फ्लैट B-203 का मालिक बदलो" → TRANSFER_FLAT
- "सभी 2BHK का मेंटेनेंस बढ़ाओ" → BULK_UPDATE`;
  }

  parseResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          success: true,
          ...JSON.parse(jsonMatch[0])
        };
      }
      throw new Error('No JSON found');
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
        rawResponse: content
      };
    }
  }

  getSuggestions(input) {
    const lower = input.toLowerCase();

    if (lower.includes('flat') || lower.includes('add')) {
      return [
        'Add flat A-101, 2BHK, owner Name, phone 9876543210',
        'Add flats B-101 to B-110',
        'Update flat A-101 area to 800 sqft'
      ];
    }

    if (lower.includes('member') || lower.includes('owner')) {
      return [
        'Add owner to flat A-101',
        'Add tenant to flat B-202',
        'Update phone for A-101 owner'
      ];
    }

    return [
      'Add new flat',
      'Add new member',
      'Update flat details',
      'Transfer ownership'
    ];
  }
}

window.CommandInterpreter = CommandInterpreter;
```

### 6.2 Context Manager

```javascript
// js/ai-admin/context-manager.js

class ContextManager {
  constructor() {
    this.context = {
      lastMentioned: null,
      pendingAction: null,
      conversationHistory: [],
      sessionStart: new Date()
    };
  }

  getContext() {
    return { ...this.context };
  }

  updateContext(entities) {
    // Track last mentioned entities for pronoun resolution
    if (entities.flatNo) {
      this.context.lastMentioned = {
        ...this.context.lastMentioned,
        flatNo: entities.flatNo,
        building: entities.building
      };
    }

    if (entities.ownerName) {
      this.context.lastMentioned = {
        ...this.context.lastMentioned,
        personName: entities.ownerName,
        personPhone: entities.ownerPhone,
        personType: 'owner'
      };
    }

    if (entities.tenantName) {
      this.context.lastMentioned = {
        ...this.context.lastMentioned,
        personName: entities.tenantName,
        personPhone: entities.tenantPhone,
        personType: 'tenant'
      };
    }
  }

  setPendingAction(action) {
    this.context.pendingAction = {
      ...action,
      timestamp: new Date()
    };
  }

  getPendingAction() {
    return this.context.pendingAction;
  }

  clearPendingAction() {
    this.context.pendingAction = null;
  }

  addToHistory(role, content) {
    this.context.conversationHistory.push({ role, content });

    // Keep history manageable
    if (this.context.conversationHistory.length > 20) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-20);
    }
  }

  getHistory() {
    return [...this.context.conversationHistory];
  }

  clearContext() {
    this.context = {
      lastMentioned: null,
      pendingAction: null,
      conversationHistory: [],
      sessionStart: new Date()
    };
  }

  // Resolve pronouns and references
  resolveReference(reference) {
    const lower = reference.toLowerCase();

    // Pronouns
    if (['his', 'her', 'their', 'उनका', 'उनकी', 'इनका'].includes(lower)) {
      return this.context.lastMentioned?.personName || null;
    }

    // Flat references
    if (['that flat', 'same flat', 'the flat', 'वो फ्लैट', 'वही फ्लैट'].includes(lower)) {
      return this.context.lastMentioned?.flatNo || null;
    }

    // Person references
    if (['that person', 'that owner', 'that member'].includes(lower)) {
      return this.context.lastMentioned?.personName || null;
    }

    return null;
  }
}

window.ContextManager = ContextManager;
```

### 6.3 Smart Validator

```javascript
// js/ai-admin/smart-validator.js

class SmartValidator {
  constructor(storage) {
    this.storage = storage;
  }

  async validate(intent, entities) {
    const errors = [];
    const warnings = [];
    const suggestions = [];

    switch (intent) {
      case 'ADD_FLAT':
        await this.validateAddFlat(entities, errors, warnings, suggestions);
        break;

      case 'UPDATE_FLAT':
        await this.validateUpdateFlat(entities, errors, warnings, suggestions);
        break;

      case 'DELETE_FLAT':
        await this.validateDeleteFlat(entities, errors, warnings, suggestions);
        break;

      case 'TRANSFER_FLAT':
        await this.validateTransferFlat(entities, errors, warnings, suggestions);
        break;

      case 'ADD_MEMBER':
        await this.validateAddMember(entities, errors, warnings, suggestions);
        break;

      case 'BULK_ADD':
        await this.validateBulkAdd(entities, errors, warnings, suggestions);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  async validateAddFlat(entities, errors, warnings, suggestions) {
    const flats = await this.storage.read('Flats') || [];

    // Check if flat already exists
    if (entities.flatNo) {
      const existing = flats.find(f =>
        f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
      );

      if (existing) {
        errors.push(`Flat ${entities.flatNo} already exists`);

        // Suggest next available number
        const nextFlat = this.findNextAvailableFlatNo(entities.flatNo, flats);
        suggestions.push(`Next available: ${nextFlat}`);
      }
    }

    // Validate phone number
    if (entities.ownerPhone) {
      const phoneFlat = flats.find(f =>
        f.ownerPhone === entities.ownerPhone
      );

      if (phoneFlat) {
        warnings.push(`Phone ${entities.ownerPhone} is registered to ${phoneFlat.flatNo}`);
      }

      if (!this.isValidPhone(entities.ownerPhone)) {
        errors.push('Invalid phone number format');
      }
    }

    // Validate email
    if (entities.ownerEmail && !this.isValidEmail(entities.ownerEmail)) {
      errors.push('Invalid email format');
    }

    // Check building exists
    const buildings = await this.storage.read('Buildings') ||
                      (await this.storage.read('MasterData'))?.buildings || [];

    if (entities.building) {
      const buildingExists = buildings.some(b =>
        b.name?.toLowerCase() === entities.building.toLowerCase() ||
        b.code?.toLowerCase() === entities.building.toLowerCase()
      );

      if (!buildingExists && buildings.length > 0) {
        warnings.push(`Building '${entities.building}' not in master data`);
        suggestions.push(`Available buildings: ${buildings.map(b => b.name || b.code).join(', ')}`);
      }
    }

    // Validate flat type
    const flatTypes = (await this.storage.read('MasterData'))?.flatTypes || [];
    if (entities.flatType && flatTypes.length > 0) {
      const typeExists = flatTypes.some(t =>
        t.name.toLowerCase() === entities.flatType.toLowerCase()
      );

      if (!typeExists) {
        warnings.push(`Flat type '${entities.flatType}' not in master data`);
        suggestions.push(`Available types: ${flatTypes.map(t => t.name).join(', ')}`);
      }
    }

    // Validate area
    if (entities.area && (entities.area < 100 || entities.area > 10000)) {
      warnings.push(`Area ${entities.area} sqft seems unusual`);
    }
  }

  async validateUpdateFlat(entities, errors, warnings, suggestions) {
    const flats = await this.storage.read('Flats') || [];

    // Check if flat exists
    if (entities.flatNo) {
      const existing = flats.find(f =>
        f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
      );

      if (!existing) {
        errors.push(`Flat ${entities.flatNo} not found`);

        // Suggest similar flats
        const similar = this.findSimilarFlats(entities.flatNo, flats);
        if (similar.length > 0) {
          suggestions.push(`Did you mean: ${similar.join(', ')}?`);
        }
      }
    }

    // Validate phone if updating
    if (entities.updateFields?.ownerPhone) {
      const phoneFlat = flats.find(f =>
        f.ownerPhone === entities.updateFields.ownerPhone &&
        f.flatNo !== entities.flatNo
      );

      if (phoneFlat) {
        warnings.push(`Phone already registered to ${phoneFlat.flatNo}`);
      }
    }
  }

  async validateDeleteFlat(entities, errors, warnings, suggestions) {
    const flats = await this.storage.read('Flats') || [];
    const bills = await this.storage.read('Bills') || [];

    // Check if flat exists
    const existing = flats.find(f =>
      f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
    );

    if (!existing) {
      errors.push(`Flat ${entities.flatNo} not found`);
      return;
    }

    // Check for pending bills
    const pendingBills = bills.filter(b =>
      b.flatId === existing.id &&
      (b.status === 'pending' || b.status === 'partial')
    );

    if (pendingBills.length > 0) {
      const totalDue = pendingBills.reduce((sum, b) =>
        sum + (b.grandTotal - (b.paidAmount || 0)), 0
      );

      warnings.push(`Flat has ${pendingBills.length} pending bills (₹${totalDue.toLocaleString()} due)`);
      suggestions.push('Clear pending dues before deletion');
    }
  }

  async validateTransferFlat(entities, errors, warnings, suggestions) {
    // Validate existing flat
    await this.validateUpdateFlat(entities, errors, warnings, suggestions);

    // Validate new owner details
    if (!entities.newOwnerName) {
      errors.push('New owner name is required');
    }

    if (!entities.newOwnerPhone) {
      errors.push('New owner phone is required');
    } else if (!this.isValidPhone(entities.newOwnerPhone)) {
      errors.push('Invalid phone number for new owner');
    }
  }

  async validateAddMember(entities, errors, warnings, suggestions) {
    const flats = await this.storage.read('Flats') || [];
    const users = await this.storage.read('Users') || [];

    // Check if flat exists
    if (entities.flatNo) {
      const flat = flats.find(f =>
        f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
      );

      if (!flat) {
        errors.push(`Flat ${entities.flatNo} not found`);
      }
    }

    // Check for duplicate member
    if (entities.ownerPhone) {
      const existingUser = users.find(u =>
        u.phone === entities.ownerPhone
      );

      if (existingUser) {
        warnings.push(`User with phone ${entities.ownerPhone} already exists`);
      }
    }
  }

  async validateBulkAdd(entities, errors, warnings, suggestions) {
    const flats = await this.storage.read('Flats') || [];
    const existingFlatNos = new Set(flats.map(f => f.flatNo.toLowerCase()));

    if (entities.flatRange) {
      const { start, end } = entities.flatRange;

      // Parse range
      const startMatch = start.match(/([A-Z]+)-?(\d+)/i);
      const endMatch = end.match(/([A-Z]+)-?(\d+)/i);

      if (!startMatch || !endMatch) {
        errors.push('Invalid flat range format');
        return;
      }

      const building = startMatch[1].toUpperCase();
      const startNum = parseInt(startMatch[2]);
      const endNum = parseInt(endMatch[2]);

      if (startNum > endNum) {
        errors.push('Start number must be less than end number');
        return;
      }

      // Check for existing flats in range
      const conflicts = [];
      for (let i = startNum; i <= endNum; i++) {
        const flatNo = `${building}-${i}`;
        if (existingFlatNos.has(flatNo.toLowerCase())) {
          conflicts.push(flatNo);
        }
      }

      if (conflicts.length > 0) {
        errors.push(`${conflicts.length} flats already exist: ${conflicts.slice(0, 5).join(', ')}${conflicts.length > 5 ? '...' : ''}`);
      }

      // Warn if large bulk
      const count = endNum - startNum + 1;
      if (count > 50) {
        warnings.push(`Creating ${count} flats - this may take a moment`);
      }
    }
  }

  findNextAvailableFlatNo(flatNo, flats) {
    const match = flatNo.match(/([A-Z]+)-?(\d+)/i);
    if (!match) return flatNo;

    const building = match[1].toUpperCase();
    let num = parseInt(match[2]);

    const existingNums = new Set(
      flats
        .filter(f => f.flatNo.toUpperCase().startsWith(building))
        .map(f => {
          const m = f.flatNo.match(/\d+/);
          return m ? parseInt(m[0]) : 0;
        })
    );

    while (existingNums.has(num)) {
      num++;
    }

    return `${building}-${num}`;
  }

  findSimilarFlats(flatNo, flats) {
    const lower = flatNo.toLowerCase();
    return flats
      .filter(f => {
        const fLower = f.flatNo.toLowerCase();
        return fLower.includes(lower.slice(0, 2)) ||
               lower.includes(fLower.slice(0, 2));
      })
      .map(f => f.flatNo)
      .slice(0, 3);
  }

  isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

window.SmartValidator = SmartValidator;
```

### 6.4 Action Executor

```javascript
// js/ai-admin/action-executor.js

class ActionExecutor {
  constructor(storage, config = {}) {
    this.storage = storage;
    this.undoManager = new UndoManager();
    this.notificationService = config.notificationService;
  }

  async execute(intent, entities, options = {}) {
    const handler = this.getHandler(intent);

    if (!handler) {
      throw new Error(`Unknown intent: ${intent}`);
    }

    // Create undo point before execution
    const undoData = await this.createUndoPoint(intent, entities);

    try {
      const result = await handler.call(this, entities, options);

      // Store undo data
      this.undoManager.push({
        intent,
        entities,
        undoData,
        timestamp: new Date(),
        result
      });

      // Send notifications if configured
      if (options.notify && this.notificationService) {
        await this.sendNotifications(intent, entities, result);
      }

      return {
        success: true,
        ...result
      };

    } catch (error) {
      console.error('Execution error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getHandler(intent) {
    const handlers = {
      'ADD_FLAT': this.addFlat,
      'UPDATE_FLAT': this.updateFlat,
      'DELETE_FLAT': this.deleteFlat,
      'TRANSFER_FLAT': this.transferFlat,
      'ADD_MEMBER': this.addMember,
      'UPDATE_MEMBER': this.updateMember,
      'DELETE_MEMBER': this.deleteMember,
      'ADD_BUILDING': this.addBuilding,
      'UPDATE_BUILDING': this.updateBuilding,
      'BULK_ADD': this.bulkAddFlats,
      'BULK_UPDATE': this.bulkUpdate,
      'ADD_CHARGE_TYPE': this.addChargeType,
      'UPDATE_RATE': this.updateRate
    };

    return handlers[intent];
  }

  async addFlat(entities) {
    const flats = await this.storage.read('Flats') || [];

    const newFlat = {
      id: crypto.randomUUID(),
      flatNo: entities.flatNo,
      building: entities.building || this.extractBuilding(entities.flatNo),
      floor: entities.floor || this.extractFloor(entities.flatNo),
      flatType: entities.flatType || '2BHK',
      area: entities.area || this.getDefaultArea(entities.flatType),
      ownerName: entities.ownerName,
      ownerPhone: entities.ownerPhone,
      ownerEmail: entities.ownerEmail || null,
      occupancyStatus: entities.occupancyStatus || 'occupied',
      twoWheelerCount: entities.twoWheelerCount || 0,
      fourWheelerCount: entities.fourWheelerCount || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: entities.adminId
    };

    flats.push(newFlat);
    await this.storage.write('Flats', flats);

    // Create user account for owner
    if (entities.ownerPhone) {
      await this.createUserAccount(newFlat, 'owner');
    }

    return {
      flatId: newFlat.id,
      flatNo: newFlat.flatNo,
      message: `Flat ${newFlat.flatNo} added successfully`
    };
  }

  async updateFlat(entities) {
    const flats = await this.storage.read('Flats') || [];
    const index = flats.findIndex(f =>
      f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Flat ${entities.flatNo} not found`);
    }

    const updateFields = entities.updateFields || {};

    // Apply updates
    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined && value !== null) {
        flats[index][key] = value;
      }
    }

    flats[index].updatedAt = new Date().toISOString();
    flats[index].updatedBy = entities.adminId;

    await this.storage.write('Flats', flats);

    return {
      flatId: flats[index].id,
      flatNo: flats[index].flatNo,
      updatedFields: Object.keys(updateFields),
      message: `Flat ${entities.flatNo} updated successfully`
    };
  }

  async deleteFlat(entities) {
    const flats = await this.storage.read('Flats') || [];
    const index = flats.findIndex(f =>
      f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Flat ${entities.flatNo} not found`);
    }

    const deletedFlat = flats[index];

    // Soft delete - mark as inactive
    if (entities.softDelete !== false) {
      flats[index].isActive = false;
      flats[index].deletedAt = new Date().toISOString();
      flats[index].deletedBy = entities.adminId;
    } else {
      flats.splice(index, 1);
    }

    await this.storage.write('Flats', flats);

    // Deactivate associated users
    await this.deactivateUsers(deletedFlat.id);

    return {
      flatId: deletedFlat.id,
      flatNo: deletedFlat.flatNo,
      message: `Flat ${entities.flatNo} deleted successfully`
    };
  }

  async transferFlat(entities) {
    const flats = await this.storage.read('Flats') || [];
    const index = flats.findIndex(f =>
      f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Flat ${entities.flatNo} not found`);
    }

    const previousOwner = {
      name: flats[index].ownerName,
      phone: flats[index].ownerPhone,
      email: flats[index].ownerEmail
    };

    // Update owner details
    flats[index].ownerName = entities.newOwnerName;
    flats[index].ownerPhone = entities.newOwnerPhone;
    flats[index].ownerEmail = entities.newOwnerEmail || null;
    flats[index].transferredAt = new Date().toISOString();
    flats[index].previousOwners = [
      ...(flats[index].previousOwners || []),
      { ...previousOwner, transferDate: new Date().toISOString() }
    ];

    await this.storage.write('Flats', flats);

    // Deactivate old user account
    await this.deactivateUserByPhone(previousOwner.phone);

    // Create new user account
    await this.createUserAccount(flats[index], 'owner');

    return {
      flatId: flats[index].id,
      flatNo: entities.flatNo,
      previousOwner: previousOwner.name,
      newOwner: entities.newOwnerName,
      message: `Flat ${entities.flatNo} transferred to ${entities.newOwnerName}`
    };
  }

  async addMember(entities) {
    const flats = await this.storage.read('Flats') || [];
    const users = await this.storage.read('Users') || [];

    const flat = flats.find(f =>
      f.flatNo.toLowerCase() === entities.flatNo.toLowerCase()
    );

    if (!flat) {
      throw new Error(`Flat ${entities.flatNo} not found`);
    }

    const newUser = {
      id: crypto.randomUUID(),
      flatId: flat.id,
      name: entities.ownerName || entities.memberName,
      phone: entities.ownerPhone || entities.memberPhone,
      email: entities.ownerEmail || entities.memberEmail || null,
      role: entities.memberRole || 'member',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Generate password
    newUser.passwordHash = await this.hashPassword(
      entities.password || this.generatePassword()
    );

    users.push(newUser);
    await this.storage.write('Users', users);

    return {
      userId: newUser.id,
      flatNo: entities.flatNo,
      memberName: newUser.name,
      message: `Member ${newUser.name} added to flat ${entities.flatNo}`
    };
  }

  async bulkAddFlats(entities) {
    const { flatRange, flatType, building, area } = entities;
    const results = [];

    // Parse range
    const startMatch = flatRange.start.match(/([A-Z]+)-?(\d+)/i);
    const endMatch = flatRange.end.match(/([A-Z]+)-?(\d+)/i);

    const prefix = startMatch[1].toUpperCase();
    const startNum = parseInt(startMatch[2]);
    const endNum = parseInt(endMatch[2]);

    for (let i = startNum; i <= endNum; i++) {
      const flatNo = `${prefix}-${i}`;

      try {
        const result = await this.addFlat({
          flatNo,
          flatType: flatType || '2BHK',
          building: building || prefix,
          area: area || this.getDefaultArea(flatType),
          occupancyStatus: 'vacant',
          adminId: entities.adminId
        });

        results.push({ flatNo, success: true, ...result });
      } catch (error) {
        results.push({ flatNo, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      totalRequested: endNum - startNum + 1,
      successCount,
      failedCount: results.length - successCount,
      results,
      message: `Created ${successCount} flats successfully`
    };
  }

  // Helper methods
  extractBuilding(flatNo) {
    const match = flatNo.match(/^([A-Z]+)/i);
    return match ? match[1].toUpperCase() : 'A';
  }

  extractFloor(flatNo) {
    const match = flatNo.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      return Math.floor(num / 100) || Math.floor(num / 10) || 1;
    }
    return 1;
  }

  getDefaultArea(flatType) {
    const defaults = {
      '1BHK': 550,
      '2BHK': 750,
      '3BHK': 1200,
      '4BHK': 1800,
      'Studio': 400,
      'Shop': 300
    };
    return defaults[flatType] || 750;
  }

  async createUserAccount(flat, role) {
    const users = await this.storage.read('Users') || [];

    // Check if user already exists
    const existing = users.find(u => u.phone === flat.ownerPhone);
    if (existing) {
      // Link to flat if not already
      if (!existing.flatIds) existing.flatIds = [];
      if (!existing.flatIds.includes(flat.id)) {
        existing.flatIds.push(flat.id);
        await this.storage.write('Users', users);
      }
      return existing;
    }

    const password = this.generatePassword();
    const newUser = {
      id: crypto.randomUUID(),
      flatId: flat.id,
      flatIds: [flat.id],
      name: flat.ownerName,
      phone: flat.ownerPhone,
      email: flat.ownerEmail,
      role: role,
      passwordHash: await this.hashPassword(password),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.storage.write('Users', users);

    // Send credentials via SMS/WhatsApp if notification service available
    if (this.notificationService) {
      await this.notificationService.sendCredentials(flat.ownerPhone, {
        flatNo: flat.flatNo,
        username: flat.ownerPhone,
        password: password
      });
    }

    return newUser;
  }

  generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async deactivateUsers(flatId) {
    const users = await this.storage.read('Users') || [];
    let updated = false;

    for (const user of users) {
      if (user.flatId === flatId || (user.flatIds && user.flatIds.includes(flatId))) {
        user.isActive = false;
        user.deactivatedAt = new Date().toISOString();
        updated = true;
      }
    }

    if (updated) {
      await this.storage.write('Users', users);
    }
  }

  async deactivateUserByPhone(phone) {
    const users = await this.storage.read('Users') || [];
    const user = users.find(u => u.phone === phone);

    if (user) {
      user.isActive = false;
      user.deactivatedAt = new Date().toISOString();
      await this.storage.write('Users', users);
    }
  }

  async createUndoPoint(intent, entities) {
    // Store current state for undo
    const relevantData = {};

    if (['ADD_FLAT', 'UPDATE_FLAT', 'DELETE_FLAT', 'TRANSFER_FLAT'].includes(intent)) {
      relevantData.flats = await this.storage.read('Flats');
    }

    if (['ADD_MEMBER', 'UPDATE_MEMBER', 'DELETE_MEMBER'].includes(intent)) {
      relevantData.users = await this.storage.read('Users');
    }

    return relevantData;
  }

  async undo() {
    return this.undoManager.undo(this.storage);
  }
}

// Undo Manager
class UndoManager {
  constructor(maxHistory = 50) {
    this.history = [];
    this.maxHistory = maxHistory;
  }

  push(action) {
    this.history.push(action);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  async undo(storage) {
    const lastAction = this.history.pop();
    if (!lastAction) {
      return { success: false, error: 'Nothing to undo' };
    }

    try {
      // Restore previous state
      for (const [key, data] of Object.entries(lastAction.undoData)) {
        await storage.write(key, data);
      }

      return {
        success: true,
        undoneAction: lastAction.intent,
        message: `Undone: ${lastAction.intent} for ${lastAction.entities.flatNo || 'item'}`
      };
    } catch (error) {
      // Restore action to history if undo failed
      this.history.push(lastAction);
      return { success: false, error: error.message };
    }
  }

  getHistory() {
    return [...this.history];
  }

  clear() {
    this.history = [];
  }
}

window.ActionExecutor = ActionExecutor;
window.UndoManager = UndoManager;
```

### 6.5 Command Center UI

```javascript
// js/ai-admin/command-center.js

class CommandCenter {
  constructor(config) {
    this.config = config;
    this.storage = config.storage;

    // Initialize components
    this.interpreter = new CommandInterpreter({ apiKey: config.apiKey });
    this.validator = new SmartValidator(this.storage);
    this.executor = new ActionExecutor(this.storage, {
      notificationService: config.notificationService
    });

    // State
    this.conversationHistory = [];
    this.pendingConfirmation = null;
    this.isProcessing = false;

    this.init();
  }

  async init() {
    await this.interpreter.initialize(this.storage);
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById(this.config.containerId);

    container.innerHTML = `
      <div class="command-center">
        <!-- Header -->
        <div class="cc-header">
          <h1>🎤 AI Admin Assistant</h1>
          <p>Manage flats, members, and data using voice or text commands</p>
        </div>

        <!-- Input Area -->
        <div class="cc-input-area">
          <div class="cc-input-wrapper">
            <input
              type="text"
              id="commandInput"
              class="cc-input"
              placeholder="Try: Add flat A-405, 2BHK, owner Rajesh Kumar..."
              autocomplete="off"
            >
            <button class="cc-voice-btn" id="voiceBtn" title="Voice input">
              🎤
            </button>
            <button class="cc-send-btn" id="sendBtn">
              Send
            </button>
          </div>

          <!-- Quick Actions -->
          <div class="cc-quick-actions">
            <button class="cc-quick-btn" data-template="Add flat ">➕ Add Flat</button>
            <button class="cc-quick-btn" data-template="Add member to flat ">👤 Add Member</button>
            <button class="cc-quick-btn" data-template="Transfer flat ">🔄 Transfer</button>
            <button class="cc-quick-btn" data-template="Update flat ">✏️ Update</button>
            <button class="cc-quick-btn" data-action="bulk">📋 Bulk Import</button>
          </div>
        </div>

        <!-- Conversation Area -->
        <div class="cc-conversation" id="conversation">
          <!-- Welcome message -->
          <div class="cc-message ai">
            <div class="cc-avatar">🤖</div>
            <div class="cc-bubble">
              <p>Hello! I'm your AI admin assistant. I can help you:</p>
              <ul>
                <li>Add, update, or delete flats</li>
                <li>Manage members and owners</li>
                <li>Transfer ownership</li>
                <li>Bulk operations</li>
              </ul>
              <p>Just tell me what you need in plain English or Hindi!</p>
            </div>
          </div>
        </div>

        <!-- Recent Actions -->
        <div class="cc-recent-actions" id="recentActions">
          <h3>Recent Actions</h3>
          <div class="cc-actions-list" id="actionsList">
            <p class="cc-empty">No recent actions</p>
          </div>
        </div>
      </div>

      <!-- Bulk Import Modal -->
      <div class="cc-modal" id="bulkModal" style="display: none;">
        <div class="cc-modal-content">
          <div class="cc-modal-header">
            <h3>📋 Bulk Import</h3>
            <button class="cc-modal-close" id="closeBulkModal">×</button>
          </div>
          <div class="cc-modal-body">
            <div class="cc-upload-area" id="bulkUploadArea">
              <p>📄 Drag & drop Excel/CSV file here</p>
              <p>or</p>
              <label class="cc-upload-btn">
                <input type="file" id="bulkFileInput" accept=".xlsx,.xls,.csv" hidden>
                Browse Files
              </label>
              <p class="cc-upload-hint">
                <a href="#" id="downloadTemplate">Download template</a>
              </p>
            </div>
            <div class="cc-preview" id="bulkPreview" style="display: none;">
              <!-- Preview table -->
            </div>
          </div>
          <div class="cc-modal-footer" id="bulkModalFooter" style="display: none;">
            <button class="btn btn-secondary" id="cancelBulk">Cancel</button>
            <button class="btn btn-primary" id="confirmBulk">Import All</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Input events
    const commandInput = document.getElementById('commandInput');
    const sendBtn = document.getElementById('sendBtn');

    commandInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isProcessing) {
        this.processCommand(commandInput.value);
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!this.isProcessing) {
        this.processCommand(commandInput.value);
      }
    });

    // Voice input
    document.getElementById('voiceBtn').addEventListener('click', () => {
      this.startVoiceInput();
    });

    // Quick actions
    document.querySelectorAll('.cc-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.template) {
          commandInput.value = btn.dataset.template;
          commandInput.focus();
        } else if (btn.dataset.action === 'bulk') {
          this.showBulkModal();
        }
      });
    });

    // Bulk modal
    document.getElementById('closeBulkModal').addEventListener('click', () => {
      this.hideBulkModal();
    });

    document.getElementById('bulkFileInput').addEventListener('change', (e) => {
      this.handleBulkFile(e.target.files[0]);
    });
  }

  async processCommand(input) {
    if (!input.trim()) return;

    const commandInput = document.getElementById('commandInput');
    commandInput.value = '';

    // Add user message
    this.addMessage('user', input);
    this.isProcessing = true;
    this.showTypingIndicator();

    try {
      // Check if this is a confirmation/cancellation
      if (this.pendingConfirmation) {
        await this.handleConfirmationResponse(input);
        return;
      }

      // Interpret the command
      const interpreted = await this.interpreter.interpret(
        input,
        this.conversationHistory
      );

      this.hideTypingIndicator();

      if (!interpreted.success) {
        this.addMessage('ai', interpreted.error, {
          suggestions: interpreted.suggestions
        });
        return;
      }

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: input },
        { role: 'assistant', content: JSON.stringify(interpreted) }
      );

      // Handle different intents
      await this.handleInterpretedCommand(interpreted);

    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('ai', `Sorry, something went wrong: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  async handleInterpretedCommand(interpreted) {
    const { intent, entities, confirmation, validation, response } = interpreted;

    // Handle clarification
    if (intent === 'CLARIFICATION' || interpreted.needsClarification) {
      this.addMessage('ai', interpreted.clarificationQuestion || response);
      return;
    }

    // Handle conversation
    if (intent === 'CONVERSATION' || intent === 'GREETING') {
      this.addMessage('ai', response);
      return;
    }

    // Validate
    const validationResult = await this.validator.validate(intent, entities);

    if (!validationResult.isValid) {
      this.addMessage('ai', 'I found some issues:', {
        errors: validationResult.errors,
        suggestions: validationResult.suggestions
      });
      return;
    }

    // Show warnings if any
    if (validationResult.warnings.length > 0) {
      confirmation.warnings = validationResult.warnings;
    }

    // Show confirmation
    if (confirmation?.requiresConfirmation) {
      this.pendingConfirmation = { intent, entities, confirmation };
      this.addConfirmationMessage(confirmation);
    } else {
      // Execute directly
      await this.executeAction(intent, entities);
    }
  }

  async handleConfirmationResponse(input) {
    const lower = input.toLowerCase();
    const { intent, entities, confirmation } = this.pendingConfirmation;

    this.hideTypingIndicator();

    // Check for confirmation
    if (['yes', 'confirm', 'ok', 'हाँ', 'हां', 'ठीक'].some(w => lower.includes(w))) {
      this.pendingConfirmation = null;
      await this.executeAction(intent, entities);
      return;
    }

    // Check for cancellation
    if (['no', 'cancel', 'नहीं', 'रद्द'].some(w => lower.includes(w))) {
      this.pendingConfirmation = null;
      this.addMessage('ai', 'Cancelled. What else can I help with?');
      return;
    }

    // Check for field updates
    const fieldUpdate = await this.parseFieldUpdate(input, entities);
    if (fieldUpdate) {
      // Update entities
      Object.assign(entities, fieldUpdate);

      // Re-validate and show updated confirmation
      const validationResult = await this.validator.validate(intent, entities);
      if (!validationResult.isValid) {
        this.addMessage('ai', 'Updated, but there are issues:', {
          errors: validationResult.errors
        });
        return;
      }

      // Update confirmation details
      this.updateConfirmationDetails(fieldUpdate);
      this.addMessage('ai', `Updated! ${Object.keys(fieldUpdate).join(', ')} changed. Please confirm.`);
      return;
    }

    // Couldn't understand
    this.addMessage('ai', 'Please say "confirm" to proceed or "cancel" to abort. You can also update fields like "change area to 900 sqft"');
  }

  async parseFieldUpdate(input, currentEntities) {
    // Simple field update parsing
    const patterns = {
      area: /(?:change|update|set)\s+area\s+to\s+(\d+)/i,
      phone: /(?:change|update|set)\s+phone\s+to\s+(\d{10})/i,
      name: /(?:change|update|set)\s+(?:owner\s+)?name\s+to\s+(.+)/i,
      flatType: /(?:change|update|set)\s+type\s+to\s+(\w+BHK)/i
    };

    const updates = {};

    for (const [field, pattern] of Object.entries(patterns)) {
      const match = input.match(pattern);
      if (match) {
        updates[field] = field === 'area' ? parseInt(match[1]) : match[1].trim();
      }
    }

    return Object.keys(updates).length > 0 ? updates : null;
  }

  async executeAction(intent, entities) {
    this.showTypingIndicator();

    try {
      const result = await this.executor.execute(intent, entities, {
        notify: true
      });

      this.hideTypingIndicator();

      if (result.success) {
        this.addMessage('ai', `✅ ${result.message}`, {
          followUpActions: this.getFollowUpActions(intent, entities)
        });

        // Add to recent actions
        this.addRecentAction(intent, entities, result);
      } else {
        this.addMessage('ai', `❌ ${result.error}`);
      }

    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('ai', `❌ Error: ${error.message}`);
    }
  }

  addMessage(type, content, options = {}) {
    const conversation = document.getElementById('conversation');

    const messageDiv = document.createElement('div');
    messageDiv.className = `cc-message ${type}`;

    if (type === 'user') {
      messageDiv.innerHTML = `
        <div class="cc-bubble">${content}</div>
        <div class="cc-avatar">👤</div>
      `;
    } else {
      let html = `
        <div class="cc-avatar">🤖</div>
        <div class="cc-bubble">
          <p>${content}</p>
      `;

      // Add errors
      if (options.errors?.length > 0) {
        html += `<ul class="cc-errors">`;
        options.errors.forEach(e => html += `<li>❌ ${e}</li>`);
        html += `</ul>`;
      }

      // Add warnings
      if (options.warnings?.length > 0) {
        html += `<ul class="cc-warnings">`;
        options.warnings.forEach(w => html += `<li>⚠️ ${w}</li>`);
        html += `</ul>`;
      }

      // Add suggestions
      if (options.suggestions?.length > 0) {
        html += `<div class="cc-suggestions">`;
        options.suggestions.forEach(s => {
          html += `<button class="cc-suggestion-btn" onclick="commandCenter.processCommand('${s}')">${s}</button>`;
        });
        html += `</div>`;
      }

      // Add follow-up actions
      if (options.followUpActions?.length > 0) {
        html += `<div class="cc-follow-ups">`;
        options.followUpActions.forEach(action => {
          html += `<button class="cc-follow-btn" onclick="commandCenter.processCommand('${action.command}')">${action.label}</button>`;
        });
        html += `</div>`;
      }

      html += `</div>`;
      messageDiv.innerHTML = html;
    }

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
  }

  addConfirmationMessage(confirmation) {
    const conversation = document.getElementById('conversation');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'cc-message ai';

    let detailsHtml = '';
    if (confirmation.details) {
      detailsHtml = `<table class="cc-details-table">`;
      confirmation.details.forEach(d => {
        detailsHtml += `<tr><td>${d.label}</td><td><strong>${d.value}</strong></td></tr>`;
      });
      detailsHtml += `</table>`;
    }

    let warningsHtml = '';
    if (confirmation.warnings?.length > 0) {
      warningsHtml = `<ul class="cc-warnings">`;
      confirmation.warnings.forEach(w => warningsHtml += `<li>⚠️ ${w}</li>`);
      warningsHtml += `</ul>`;
    }

    messageDiv.innerHTML = `
      <div class="cc-avatar">🤖</div>
      <div class="cc-bubble cc-confirmation">
        <p><strong>${confirmation.summary}</strong></p>
        ${detailsHtml}
        ${warningsHtml}
        <div class="cc-confirm-actions">
          <button class="cc-confirm-btn" onclick="commandCenter.processCommand('confirm')">✅ Confirm</button>
          <button class="cc-edit-btn" onclick="document.getElementById('commandInput').focus()">✏️ Edit</button>
          <button class="cc-cancel-btn" onclick="commandCenter.processCommand('cancel')">❌ Cancel</button>
        </div>
      </div>
    `;

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
  }

  getFollowUpActions(intent, entities) {
    const actions = [];

    if (intent === 'ADD_FLAT') {
      actions.push(
        { label: 'Add Another Flat', command: 'Add flat ' },
        { label: 'Add Family Member', command: `Add member to ${entities.flatNo}` },
        { label: 'Add Vehicle', command: `Add car to ${entities.flatNo}` }
      );
    }

    if (intent === 'TRANSFER_FLAT') {
      actions.push(
        { label: 'View Flat Details', command: `Show flat ${entities.flatNo}` },
        { label: 'Add Co-owner', command: `Add co-owner to ${entities.flatNo}` }
      );
    }

    return actions;
  }

  addRecentAction(intent, entities, result) {
    const actionsList = document.getElementById('actionsList');
    const emptyMsg = actionsList.querySelector('.cc-empty');
    if (emptyMsg) emptyMsg.remove();

    const actionDiv = document.createElement('div');
    actionDiv.className = 'cc-action-item';
    actionDiv.innerHTML = `
      <span class="cc-action-icon">✅</span>
      <span class="cc-action-text">${result.message}</span>
      <span class="cc-action-time">just now</span>
      <button class="cc-undo-btn" onclick="commandCenter.undo()">Undo</button>
    `;

    actionsList.insertBefore(actionDiv, actionsList.firstChild);

    // Keep only last 10 actions
    while (actionsList.children.length > 10) {
      actionsList.removeChild(actionsList.lastChild);
    }
  }

  async undo() {
    const result = await this.executor.undo();

    if (result.success) {
      this.addMessage('ai', `↩️ ${result.message}`);
      // Remove from recent actions
      const actionsList = document.getElementById('actionsList');
      if (actionsList.firstChild) {
        actionsList.removeChild(actionsList.firstChild);
      }
    } else {
      this.addMessage('ai', `Could not undo: ${result.error}`);
    }
  }

  showTypingIndicator() {
    const conversation = document.getElementById('conversation');
    const existing = conversation.querySelector('.cc-typing');
    if (existing) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'cc-message ai cc-typing';
    typingDiv.innerHTML = `
      <div class="cc-avatar">🤖</div>
      <div class="cc-bubble">
        <div class="cc-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    conversation.appendChild(typingDiv);
    conversation.scrollTop = conversation.scrollHeight;
  }

  hideTypingIndicator() {
    const typing = document.querySelector('.cc-typing');
    if (typing) typing.remove();
  }

  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.interimResults = true;

    const voiceBtn = document.getElementById('voiceBtn');
    const commandInput = document.getElementById('commandInput');

    voiceBtn.classList.add('listening');
    voiceBtn.textContent = '🔴';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      commandInput.value = transcript;

      if (event.results[0].isFinal) {
        recognition.stop();
      }
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
      voiceBtn.textContent = '🎤';

      if (commandInput.value.trim()) {
        this.processCommand(commandInput.value);
      }
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove('listening');
      voiceBtn.textContent = '🎤';
    };

    recognition.start();
  }

  showBulkModal() {
    document.getElementById('bulkModal').style.display = 'flex';
  }

  hideBulkModal() {
    document.getElementById('bulkModal').style.display = 'none';
  }

  async handleBulkFile(file) {
    // Handle Excel/CSV import
    // Implementation would use SheetJS library
    console.log('Processing file:', file.name);
  }
}

window.CommandCenter = CommandCenter;
```

---

## 7. CSS Styles

```css
/* css/command-center.css */

.command-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.cc-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cc-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.cc-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

/* Input Area */
.cc-input-area {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.cc-input-wrapper {
  display: flex;
  max-width: 800px;
  margin: 0 auto;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
}

.cc-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
}

.cc-voice-btn, .cc-send-btn {
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.cc-voice-btn:hover {
  background: #e2e8f0;
}

.cc-voice-btn.listening {
  background: #fee2e2;
}

.cc-send-btn {
  background: #667eea;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.cc-send-btn:hover {
  background: #5a67d8;
}

/* Quick Actions */
.cc-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 800px;
  margin: 16px auto 0;
  justify-content: center;
}

.cc-quick-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.cc-quick-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Conversation */
.cc-conversation {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.cc-message {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

.cc-message.user {
  flex-direction: row-reverse;
}

.cc-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.cc-message.user .cc-avatar {
  background: #667eea;
}

.cc-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  margin: 0 12px;
}

.cc-message.ai .cc-bubble {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px 16px 16px 4px;
}

.cc-message.user .cc-bubble {
  background: #667eea;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.cc-bubble p {
  margin: 0 0 8px 0;
}

.cc-bubble p:last-child {
  margin-bottom: 0;
}

.cc-bubble ul {
  margin: 8px 0;
  padding-left: 20px;
}

/* Confirmation */
.cc-confirmation {
  background: #f0f9ff !important;
  border-color: #667eea !important;
}

.cc-details-table {
  width: 100%;
  margin: 12px 0;
  border-collapse: collapse;
}

.cc-details-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.cc-details-table td:first-child {
  color: #64748b;
  width: 40%;
}

.cc-confirm-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.cc-confirm-btn, .cc-edit-btn, .cc-cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.cc-confirm-btn {
  background: #10b981;
  color: white;
}

.cc-edit-btn {
  background: #f59e0b;
  color: white;
}

.cc-cancel-btn {
  background: #ef4444;
  color: white;
}

/* Errors & Warnings */
.cc-errors, .cc-warnings {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.cc-errors li {
  color: #ef4444;
  padding: 4px 0;
}

.cc-warnings li {
  color: #f59e0b;
  padding: 4px 0;
}

/* Suggestions & Follow-ups */
.cc-suggestions, .cc-follow-ups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.cc-suggestion-btn, .cc-follow-btn {
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.cc-suggestion-btn:hover, .cc-follow-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Typing Indicator */
.cc-typing-dots {
  display: flex;
  gap: 4px;
}

.cc-typing-dots span {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.cc-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.cc-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Recent Actions */
.cc-recent-actions {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.cc-recent-actions h3 {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.cc-action-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.cc-action-icon {
  margin-right: 8px;
}

.cc-action-text {
  flex: 1;
  font-size: 14px;
}

.cc-action-time {
  font-size: 12px;
  color: #94a3b8;
  margin-right: 12px;
}

.cc-undo-btn {
  padding: 4px 12px;
  background: #f1f5f9;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.cc-undo-btn:hover {
  background: #e2e8f0;
}

.cc-empty {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  padding: 12px;
}

/* Modal */
.cc-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cc-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.cc-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.cc-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
}

.cc-modal-body {
  padding: 20px;
}

.cc-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 8. Cost Estimation

| Item | Cost | Notes |
|------|------|-------|
| Claude API | $0.02-0.05/command | Intent + entity extraction |
| Voice (Web Speech API) | Free | Browser-native |
| **Monthly (500 commands)** | **$10-25/month** | |

---

## 9. Summary: Before vs After

| Task | Before (Manual) | After (AI) |
|------|----------------|------------|
| Add single flat | 2-3 minutes (navigate, fill form) | 10 seconds (voice/text command) |
| Add 20 flats | 40-60 minutes | 30 seconds (bulk command) |
| Transfer ownership | 5+ minutes (multiple steps) | 15 seconds |
| Update member phone | Navigate, search, edit, save | "Update phone for A-101 to 9876543210" |
| Add vehicle | Find flat, edit, add vehicle, save | "Add 2 cars to flat B-205" |

**Total Time Savings**: 80-90% reduction in administrative tasks

---

This design completely replaces form-based data entry with conversational AI, making administration accessible even to non-technical committee members. Would you like me to implement any specific part of this?
