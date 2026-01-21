# Design 4: Computer Vision Receipt Scanner
## Complete Implementation Plan

---

## 1. Overview

An AI-powered receipt scanner that automatically extracts payment information from photos of UPI screenshots, bank transfer confirmations, cheques, and bank statements, then matches them to pending bills for one-click reconciliation.

### Key Capabilities
- OCR extraction from payment screenshots
- Automatic flat/bill matching
- Bulk bank statement processing
- Cheque image scanning
- Smart reconciliation suggestions
- Fraud detection for duplicate receipts

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INPUT LAYER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│   │   UPI      │  │   Bank     │  │   Cheque   │  │   Bank     │       │
│   │ Screenshot │  │ Transfer   │  │   Image    │  │ Statement  │       │
│   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │
│         │               │               │               │               │
│         └───────────────┴───────────────┴───────────────┘               │
│                                    │                                     │
├────────────────────────────────────┼─────────────────────────────────────┤
│                          PROCESSING LAYER                                │
├────────────────────────────────────┼─────────────────────────────────────┤
│                                    ▼                                     │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    IMAGE PREPROCESSING                            │  │
│   │   • Rotation correction  • Contrast enhancement                  │  │
│   │   • Noise reduction      • Cropping                              │  │
│   └───────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    OCR ENGINE                                     │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│   │   │ Google      │  │ Tesseract   │  │ Claude Vision           │  │  │
│   │   │ Vision API  │  │ (Fallback)  │  │ (LLM Extraction)        │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│   └───────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
│                                   ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    DATA EXTRACTION                                │  │
│   │   • Amount parsing       • Date extraction                       │  │
│   │   • UPI Reference ID     • Payer name matching                   │  │
│   │   • Bank account number  • Transaction type                      │  │
│   └───────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
├───────────────────────────────────┼──────────────────────────────────────┤
│                          MATCHING LAYER                                  │
├───────────────────────────────────┼──────────────────────────────────────┤
│                                   ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    INTELLIGENT MATCHER                            │  │
│   │   • Flat identification (by name/amount/phone)                   │  │
│   │   • Bill matching (by amount/date)                               │  │
│   │   • Duplicate detection                                          │  │
│   │   • Confidence scoring                                           │  │
│   └───────────────────────────────┬──────────────────────────────────┘  │
│                                   │                                      │
├───────────────────────────────────┼──────────────────────────────────────┤
│                          ACTION LAYER                                    │
├───────────────────────────────────┼──────────────────────────────────────┤
│                                   ▼                                      │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    RECONCILIATION ENGINE                          │  │
│   │   • Auto-record payment      • Update bill status                │  │
│   │   • Generate receipt         • Notify resident                   │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Component | Primary Choice | Alternative | Cost |
|-----------|---------------|-------------|------|
| OCR Engine | Google Vision API | Tesseract.js | $1.50/1K images vs Free |
| LLM Extraction | Claude Vision | GPT-4 Vision | $0.01/image |
| Image Processing | Sharp (Node.js) | Jimp | Free |
| PDF Processing | pdf-lib + pdf2pic | PDFBox | Free |
| Frontend | Existing HTML/JS | - | Free |

### Recommended Approach
- **Primary**: Claude Vision API for intelligent extraction
- **Fallback**: Google Vision API for raw OCR
- **Cost-effective**: ~$0.01-0.02 per receipt processed

---

## 4. File Structure

```
js/
├── scanner/
│   ├── receipt-scanner.js          # Main scanner controller
│   ├── image-preprocessor.js       # Image enhancement
│   ├── ocr-engine.js               # OCR abstraction layer
│   ├── claude-extractor.js         # Claude Vision extraction
│   ├── google-vision.js            # Google Vision fallback
│   ├── data-parser.js              # Parse extracted text
│   ├── matcher.js                  # Flat/bill matching
│   ├── reconciler.js               # Payment reconciliation
│   ├── duplicate-detector.js       # Fraud prevention
│   └── bulk-processor.js           # Bank statement processing
├── components/
│   └── scanner-ui.js               # Scanner UI component
└── config/
    └── scanner-config.js           # API keys, settings

css/
└── scanner.css                     # Scanner UI styles

api/
└── scanner-backend.gs              # Google Apps Script additions
```

---

## 5. Database Schema Additions

### New Sheet: ScannedReceipts
```javascript
{
  id: "uuid",
  imageUrl: "https://storage.../receipt.jpg",
  imageHash: "sha256_hash",               // For duplicate detection

  // Extracted data
  extractedData: {
    amount: 2450,
    date: "2024-01-15",
    time: "14:32:05",
    payerName: "RAJESH KUMAR",
    payeeUPI: "society@upi",
    transactionId: "402115847523",
    referenceNumber: "UPI/402115847523",
    bankName: "HDFC Bank",
    paymentMode: "upi",
    rawText: "Full OCR text..."
  },

  // Matching results
  matchResult: {
    flatId: "uuid",
    flatNo: "A-304",
    billId: "uuid",
    confidence: 0.92,
    matchMethod: "name_and_amount",
    alternativeMatches: []
  },

  // Processing status
  status: "pending|matched|confirmed|rejected|duplicate",
  duplicateOf: null,                      // ID of original if duplicate

  // Metadata
  uploadedBy: "admin_user_id",
  uploadedAt: "ISO_date",
  processedAt: "ISO_date",
  confirmedAt: "ISO_date",
  confirmedBy: "admin_user_id",

  // If converted to payment
  paymentId: "uuid"
}
```

### New Sheet: ProcessingHistory
```javascript
{
  id: "uuid",
  type: "single|bulk",
  source: "upload|whatsapp|email",

  totalImages: 10,
  successCount: 8,
  failedCount: 2,
  duplicateCount: 1,

  processedAt: "ISO_date",
  processingTimeMs: 5420,
  processedBy: "admin_user_id",

  results: [
    { imageId: "uuid", status: "matched", confidence: 0.95 },
    { imageId: "uuid", status: "failed", error: "Could not extract amount" }
  ]
}
```

---

## 6. Implementation Phases

### Phase 1: Image Preprocessing (Week 1)

#### 6.1.1 Image Preprocessor

```javascript
// js/scanner/image-preprocessor.js

class ImagePreprocessor {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async preprocess(imageFile) {
    // Load image
    const img = await this.loadImage(imageFile);

    // Set canvas size
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Draw original
    this.ctx.drawImage(img, 0, 0);

    // Apply preprocessing steps
    let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // 1. Convert to grayscale for better OCR
    imageData = this.toGrayscale(imageData);

    // 2. Increase contrast
    imageData = this.adjustContrast(imageData, 1.5);

    // 3. Apply threshold for cleaner text
    imageData = this.applyThreshold(imageData, 128);

    // 4. Reduce noise
    imageData = this.reduceNoise(imageData);

    // Put processed image back
    this.ctx.putImageData(imageData, 0, 0);

    // Return as blob
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, 'image/png');
    });
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;

      if (file instanceof File || file instanceof Blob) {
        img.src = URL.createObjectURL(file);
      } else if (typeof file === 'string') {
        img.src = file;
      } else {
        reject(new Error('Invalid image source'));
      }
    });
  }

  toGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha unchanged
    }
    return imageData;
  }

  adjustContrast(imageData, factor) {
    const data = imageData.data;
    const intercept = 128 * (1 - factor);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept));
    }
    return imageData;
  }

  applyThreshold(imageData, threshold) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    return imageData;
  }

  reduceNoise(imageData) {
    // Simple median filter (3x3)
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data.slice();
    const dst = imageData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const neighbors = [];

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(src[idx]);
          }
        }

        neighbors.sort((a, b) => a - b);
        const median = neighbors[4]; // Middle value

        const idx = (y * width + x) * 4;
        dst[idx] = median;
        dst[idx + 1] = median;
        dst[idx + 2] = median;
      }
    }

    return imageData;
  }

  // Detect and correct rotation
  async autoRotate(imageBlob) {
    // Use EXIF data if available
    try {
      const orientation = await this.getExifOrientation(imageBlob);
      if (orientation && orientation !== 1) {
        return await this.applyRotation(imageBlob, orientation);
      }
    } catch (e) {
      // No EXIF data, return as is
    }
    return imageBlob;
  }

  async getExifOrientation(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target.result);
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(null);
          return;
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;

          if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
              resolve(null);
              return;
            }

            const little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;

            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                resolve(view.getUint16(offset + (i * 12) + 8, little));
                return;
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(null);
      };
      reader.readAsArrayBuffer(blob.slice(0, 65536));
    });
  }

  // Calculate image hash for duplicate detection
  async calculateHash(imageBlob) {
    const arrayBuffer = await imageBlob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

window.ImagePreprocessor = ImagePreprocessor;
```

### Phase 2: OCR & AI Extraction (Week 1-2)

#### 6.2.1 Claude Vision Extractor (Primary)

```javascript
// js/scanner/claude-extractor.js

class ClaudeExtractor {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = 'claude-3-5-sonnet-20241022';
  }

  async extract(imageBlob) {
    // Convert blob to base64
    const base64 = await this.blobToBase64(imageBlob);

    // Determine media type
    const mediaType = imageBlob.type || 'image/png';

    const systemPrompt = `You are an expert at extracting payment information from Indian payment receipts, screenshots, and bank statements.

Extract payment details and return ONLY valid JSON with these fields:
{
  "documentType": "upi_screenshot|bank_transfer|cheque|bank_statement|unknown",
  "amount": number (in rupees, without commas),
  "date": "YYYY-MM-DD",
  "time": "HH:MM:SS" or null,
  "payerName": "Name as shown" or null,
  "payerPhone": "10-digit phone" or null,
  "payerAccount": "Account number" or null,
  "payeeUPI": "UPI ID" or null,
  "payeeName": "Payee name" or null,
  "payeeAccount": "Account number" or null,
  "transactionId": "UPI ref or UTR number" or null,
  "referenceNumber": "Any reference" or null,
  "bankName": "Bank name" or null,
  "paymentMode": "upi|neft|imps|rtgs|cheque|cash|unknown",
  "status": "success|pending|failed",
  "confidence": 0.0-1.0,
  "notes": "Any relevant notes or extracted flat/society info"
}

IMPORTANT:
- Extract ALL visible amounts, dates, and reference numbers
- For UPI screenshots, look for "Transaction ID", "UPI Ref", "UTR"
- For bank statements, extract individual transactions if multiple
- If flat number or society name is visible, include in notes
- If amount is unclear, set confidence lower
- Parse Indian date formats (DD/MM/YYYY, DD-MM-YYYY)
- Handle Hindi/regional text if present`;

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
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64.split(',')[1] // Remove data URL prefix
                }
              },
              {
                type: 'text',
                text: 'Extract all payment information from this image.'
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;

      // Parse JSON from response
      return this.parseResponse(content);

    } catch (error) {
      console.error('Claude extraction error:', error);
      throw new Error('Failed to extract payment information');
    }
  }

  parseResponse(content) {
    try {
      // Find JSON in response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!parsed.amount || isNaN(parsed.amount)) {
          throw new Error('Amount not found or invalid');
        }

        // Normalize data
        return {
          documentType: parsed.documentType || 'unknown',
          amount: parseFloat(parsed.amount),
          date: this.normalizeDate(parsed.date),
          time: parsed.time || null,
          payerName: parsed.payerName || null,
          payerPhone: this.normalizePhone(parsed.payerPhone),
          payerAccount: parsed.payerAccount || null,
          payeeUPI: parsed.payeeUPI || null,
          payeeName: parsed.payeeName || null,
          payeeAccount: parsed.payeeAccount || null,
          transactionId: parsed.transactionId || null,
          referenceNumber: parsed.referenceNumber || null,
          bankName: parsed.bankName || null,
          paymentMode: parsed.paymentMode || 'unknown',
          status: parsed.status || 'success',
          confidence: parsed.confidence || 0.8,
          notes: parsed.notes || null,
          rawExtraction: parsed
        };
      }

      throw new Error('Could not parse extraction result');

    } catch (error) {
      console.error('Parse error:', error);
      throw error;
    }
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null;

    // Try various Indian date formats
    const formats = [
      /(\d{4})-(\d{2})-(\d{2})/,          // YYYY-MM-DD
      /(\d{2})\/(\d{2})\/(\d{4})/,         // DD/MM/YYYY
      /(\d{2})-(\d{2})-(\d{4})/,           // DD-MM-YYYY
      /(\d{2}) (\w{3}) (\d{4})/            // DD Mon YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        // Return ISO format
        if (format === formats[0]) {
          return dateStr;
        }
        // Convert DD/MM/YYYY or DD-MM-YYYY
        if (format === formats[1] || format === formats[2]) {
          return `${match[3]}-${match[2]}-${match[1]}`;
        }
      }
    }

    return dateStr; // Return as-is if no match
  }

  normalizePhone(phone) {
    if (!phone) return null;

    // Extract 10 digits
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) {
      return digits;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits.slice(2);
    }

    return null;
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

window.ClaudeExtractor = ClaudeExtractor;
```

#### 6.2.2 Google Vision Fallback

```javascript
// js/scanner/google-vision.js

class GoogleVisionOCR {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://vision.googleapis.com/v1/images:annotate';
  }

  async extractText(imageBlob) {
    const base64 = await this.blobToBase64(imageBlob);

    const requestBody = {
      requests: [{
        image: {
          content: base64.split(',')[1]
        },
        features: [
          { type: 'TEXT_DETECTION' },
          { type: 'DOCUMENT_TEXT_DETECTION' }
        ]
      }]
    };

    try {
      const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const result = data.responses[0];
      const fullText = result.fullTextAnnotation?.text ||
                       result.textAnnotations?.[0]?.description ||
                       '';

      return {
        text: fullText,
        blocks: result.fullTextAnnotation?.pages?.[0]?.blocks || [],
        confidence: this.calculateConfidence(result)
      };

    } catch (error) {
      console.error('Google Vision error:', error);
      throw error;
    }
  }

  calculateConfidence(result) {
    const blocks = result.fullTextAnnotation?.pages?.[0]?.blocks || [];
    if (blocks.length === 0) return 0;

    let totalConfidence = 0;
    let count = 0;

    for (const block of blocks) {
      for (const para of block.paragraphs || []) {
        if (para.confidence) {
          totalConfidence += para.confidence;
          count++;
        }
      }
    }

    return count > 0 ? totalConfidence / count : 0.5;
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

window.GoogleVisionOCR = GoogleVisionOCR;
```

### Phase 3: Intelligent Matcher (Week 2-3)

#### 6.3.1 Flat & Bill Matcher

```javascript
// js/scanner/matcher.js

class PaymentMatcher {
  constructor(storage) {
    this.storage = storage;
  }

  async findMatch(extractedData) {
    const [flats, bills, payments] = await Promise.all([
      this.storage.read('Flats'),
      this.storage.read('Bills'),
      this.storage.read('Payments')
    ]);

    // Get pending bills only
    const pendingBills = bills.filter(b =>
      b.status === 'pending' || b.status === 'partial'
    );

    // Try multiple matching strategies
    const matches = [];

    // 1. Match by payer name
    if (extractedData.payerName) {
      const nameMatches = this.matchByName(extractedData.payerName, flats);
      matches.push(...nameMatches.map(m => ({ ...m, method: 'name' })));
    }

    // 2. Match by phone number
    if (extractedData.payerPhone) {
      const phoneMatches = this.matchByPhone(extractedData.payerPhone, flats);
      matches.push(...phoneMatches.map(m => ({ ...m, method: 'phone' })));
    }

    // 3. Match by amount (exact match with pending bill)
    if (extractedData.amount) {
      const amountMatches = this.matchByAmount(extractedData.amount, pendingBills, flats);
      matches.push(...amountMatches.map(m => ({ ...m, method: 'amount' })));
    }

    // 4. Check notes for flat number
    if (extractedData.notes) {
      const noteMatches = this.matchByNotes(extractedData.notes, flats);
      matches.push(...noteMatches.map(m => ({ ...m, method: 'notes' })));
    }

    // Deduplicate and score matches
    const scoredMatches = this.scoreMatches(matches, extractedData, pendingBills);

    // Check for duplicates
    const duplicateCheck = await this.checkDuplicate(extractedData, payments);

    return {
      matches: scoredMatches,
      bestMatch: scoredMatches[0] || null,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateOf: duplicateCheck.originalPayment,
      confidence: scoredMatches[0]?.confidence || 0
    };
  }

  matchByName(payerName, flats) {
    const normalizedName = this.normalizeName(payerName);
    const matches = [];

    for (const flat of flats) {
      const ownerName = this.normalizeName(flat.ownerName || '');
      const similarity = this.calculateSimilarity(normalizedName, ownerName);

      if (similarity > 0.6) {
        matches.push({
          flatId: flat.id,
          flatNo: flat.flatNo,
          ownerName: flat.ownerName,
          similarity
        });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  }

  matchByPhone(phone, flats) {
    const matches = [];
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

    for (const flat of flats) {
      const flatPhone = (flat.ownerPhone || '').replace(/\D/g, '').slice(-10);

      if (flatPhone === normalizedPhone) {
        matches.push({
          flatId: flat.id,
          flatNo: flat.flatNo,
          ownerName: flat.ownerName,
          similarity: 1.0
        });
      }
    }

    return matches;
  }

  matchByAmount(amount, pendingBills, flats) {
    const matches = [];
    const tolerance = 1; // Allow ₹1 difference for rounding

    for (const bill of pendingBills) {
      const balance = bill.grandTotal - (bill.paidAmount || 0);

      if (Math.abs(balance - amount) <= tolerance) {
        const flat = flats.find(f => f.id === bill.flatId);
        matches.push({
          flatId: bill.flatId,
          flatNo: flat?.flatNo,
          ownerName: flat?.ownerName,
          billId: bill.id,
          billNo: bill.billNo,
          billAmount: bill.grandTotal,
          balance,
          similarity: 0.9
        });
      }
    }

    return matches;
  }

  matchByNotes(notes, flats) {
    const matches = [];

    // Look for flat number patterns
    const flatPatterns = [
      /flat[:\s]*([A-Z]?-?\d+)/i,
      /([A-Z]-\d+)/,
      /(\d{3,4})/
    ];

    for (const pattern of flatPatterns) {
      const match = notes.match(pattern);
      if (match) {
        const flatNo = match[1].toUpperCase();
        const flat = flats.find(f =>
          f.flatNo.toUpperCase() === flatNo ||
          f.flatNo.toUpperCase().includes(flatNo)
        );

        if (flat) {
          matches.push({
            flatId: flat.id,
            flatNo: flat.flatNo,
            ownerName: flat.ownerName,
            similarity: 0.85
          });
          break;
        }
      }
    }

    return matches;
  }

  scoreMatches(matches, extractedData, pendingBills) {
    // Group by flat
    const flatGroups = {};

    for (const match of matches) {
      if (!flatGroups[match.flatId]) {
        flatGroups[match.flatId] = {
          flatId: match.flatId,
          flatNo: match.flatNo,
          ownerName: match.ownerName,
          billId: match.billId,
          billNo: match.billNo,
          methods: [],
          scores: []
        };
      }

      flatGroups[match.flatId].methods.push(match.method);
      flatGroups[match.flatId].scores.push(match.similarity);

      if (match.billId && !flatGroups[match.flatId].billId) {
        flatGroups[match.flatId].billId = match.billId;
        flatGroups[match.flatId].billNo = match.billNo;
      }
    }

    // Calculate final confidence
    const scoredMatches = Object.values(flatGroups).map(group => {
      // Multiple matching methods increase confidence
      const methodBonus = Math.min(0.2, group.methods.length * 0.05);
      const avgScore = group.scores.reduce((a, b) => a + b, 0) / group.scores.length;

      // Find best matching bill
      if (!group.billId) {
        const flatBills = pendingBills.filter(b => b.flatId === group.flatId);
        if (flatBills.length === 1) {
          group.billId = flatBills[0].id;
          group.billNo = flatBills[0].billNo;
        } else if (flatBills.length > 0) {
          // Find closest amount match
          const closest = flatBills.reduce((best, bill) => {
            const balance = bill.grandTotal - (bill.paidAmount || 0);
            const diff = Math.abs(balance - extractedData.amount);
            return diff < best.diff ? { bill, diff } : best;
          }, { diff: Infinity });

          if (closest.diff < extractedData.amount * 0.1) {
            group.billId = closest.bill.id;
            group.billNo = closest.bill.billNo;
          }
        }
      }

      return {
        ...group,
        confidence: Math.min(0.99, avgScore + methodBonus),
        matchMethods: [...new Set(group.methods)]
      };
    });

    return scoredMatches.sort((a, b) => b.confidence - a.confidence);
  }

  async checkDuplicate(extractedData, payments) {
    // Check by transaction ID
    if (extractedData.transactionId) {
      const duplicate = payments.find(p =>
        p.referenceNo === extractedData.transactionId ||
        p.transactionId === extractedData.transactionId
      );

      if (duplicate) {
        return { isDuplicate: true, originalPayment: duplicate };
      }
    }

    // Check by amount + date combination
    if (extractedData.amount && extractedData.date) {
      const sameDayPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate).toISOString().split('T')[0];
        return paymentDate === extractedData.date &&
               Math.abs(p.amount - extractedData.amount) < 1;
      });

      if (sameDayPayments.length > 0) {
        // Could be duplicate, return for manual review
        return {
          isDuplicate: false,
          possibleDuplicates: sameDayPayments,
          warning: 'Similar payment found on same day'
        };
      }
    }

    return { isDuplicate: false };
  }

  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    // Levenshtein distance based similarity
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);

    return 1 - distance / maxLen;
  }
}

window.PaymentMatcher = PaymentMatcher;
```

### Phase 4: Main Scanner Controller (Week 3)

#### 6.4.1 Receipt Scanner

```javascript
// js/scanner/receipt-scanner.js

class ReceiptScanner {
  constructor(config) {
    this.config = config;
    this.storage = config.storage;

    // Initialize components
    this.preprocessor = new ImagePreprocessor();
    this.claudeExtractor = new ClaudeExtractor(config.claudeApiKey);
    this.googleVision = config.googleVisionApiKey
      ? new GoogleVisionOCR(config.googleVisionApiKey)
      : null;
    this.matcher = new PaymentMatcher(this.storage);

    this.processingQueue = [];
    this.isProcessing = false;
  }

  async scanReceipt(imageFile, options = {}) {
    const startTime = Date.now();

    try {
      // Step 1: Preprocess image
      const preprocessed = await this.preprocessor.preprocess(imageFile);

      // Step 2: Calculate hash for duplicate detection
      const imageHash = await this.preprocessor.calculateHash(preprocessed);

      // Check if already processed
      const existing = await this.checkExistingReceipt(imageHash);
      if (existing) {
        return {
          success: false,
          error: 'This receipt has already been processed',
          existingReceipt: existing
        };
      }

      // Step 3: Extract data using AI
      let extractedData;
      try {
        extractedData = await this.claudeExtractor.extract(preprocessed);
      } catch (primaryError) {
        console.warn('Claude extraction failed, trying fallback:', primaryError);

        if (this.googleVision) {
          const ocrResult = await this.googleVision.extractText(preprocessed);
          extractedData = await this.parseOCRResult(ocrResult);
        } else {
          throw primaryError;
        }
      }

      // Step 4: Find matching flat and bill
      const matchResult = await this.matcher.findMatch(extractedData);

      // Step 5: Check for duplicates
      if (matchResult.isDuplicate) {
        return {
          success: false,
          error: 'Duplicate payment detected',
          duplicate: matchResult.duplicateOf,
          extractedData
        };
      }

      // Step 6: Upload image and save receipt record
      const imageUrl = await this.uploadImage(preprocessed);

      const receipt = {
        id: crypto.randomUUID(),
        imageUrl,
        imageHash,
        extractedData,
        matchResult: matchResult.bestMatch ? {
          flatId: matchResult.bestMatch.flatId,
          flatNo: matchResult.bestMatch.flatNo,
          billId: matchResult.bestMatch.billId,
          confidence: matchResult.bestMatch.confidence,
          matchMethod: matchResult.bestMatch.matchMethods.join('+')
        } : null,
        alternativeMatches: matchResult.matches.slice(1, 4),
        status: matchResult.bestMatch?.confidence > 0.85 ? 'matched' : 'pending',
        uploadedAt: new Date().toISOString(),
        uploadedBy: options.userId,
        processingTimeMs: Date.now() - startTime
      };

      // Save to database
      await this.saveReceipt(receipt);

      return {
        success: true,
        receipt,
        extractedData,
        matchResult,
        needsReview: matchResult.bestMatch?.confidence < 0.85 ||
                     matchResult.matches.length > 1
      };

    } catch (error) {
      console.error('Receipt scanning error:', error);
      return {
        success: false,
        error: error.message,
        processingTimeMs: Date.now() - startTime
      };
    }
  }

  async checkExistingReceipt(imageHash) {
    const receipts = await this.storage.read('ScannedReceipts') || [];
    return receipts.find(r => r.imageHash === imageHash);
  }

  async parseOCRResult(ocrResult) {
    // Parse raw OCR text to extract structured data
    const text = ocrResult.text;

    // Amount patterns
    const amountPatterns = [
      /(?:rs\.?|₹|inr)\s*([0-9,]+(?:\.[0-9]{2})?)/gi,
      /amount[:\s]*([0-9,]+(?:\.[0-9]{2})?)/gi,
      /paid[:\s]*([0-9,]+(?:\.[0-9]{2})?)/gi
    ];

    let amount = null;
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // Date patterns
    const datePatterns = [
      /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/,
      /(\d{4}[\/\-]\d{2}[\/\-]\d{2})/,
      /(\d{2}\s+\w{3}\s+\d{4})/
    ];

    let date = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }

    // Transaction ID patterns
    const txnPatterns = [
      /(?:upi\s*ref|txn\s*id|transaction\s*id)[:\s]*([A-Z0-9]+)/gi,
      /([0-9]{12})/g  // 12-digit UPI reference
    ];

    let transactionId = null;
    for (const pattern of txnPatterns) {
      const match = text.match(pattern);
      if (match) {
        transactionId = match[1];
        break;
      }
    }

    return {
      documentType: this.detectDocumentType(text),
      amount,
      date,
      transactionId,
      paymentMode: this.detectPaymentMode(text),
      rawText: text,
      confidence: ocrResult.confidence
    };
  }

  detectDocumentType(text) {
    const lower = text.toLowerCase();

    if (lower.includes('upi') || lower.includes('gpay') ||
        lower.includes('phonepe') || lower.includes('paytm')) {
      return 'upi_screenshot';
    }
    if (lower.includes('neft') || lower.includes('imps') ||
        lower.includes('rtgs')) {
      return 'bank_transfer';
    }
    if (lower.includes('cheque') || lower.includes('check')) {
      return 'cheque';
    }
    if (lower.includes('statement') || lower.includes('account summary')) {
      return 'bank_statement';
    }

    return 'unknown';
  }

  detectPaymentMode(text) {
    const lower = text.toLowerCase();

    if (lower.includes('upi')) return 'upi';
    if (lower.includes('neft')) return 'neft';
    if (lower.includes('imps')) return 'imps';
    if (lower.includes('rtgs')) return 'rtgs';
    if (lower.includes('cheque') || lower.includes('check')) return 'cheque';

    return 'unknown';
  }

  async uploadImage(imageBlob) {
    // Upload to Google Drive or cloud storage
    // For now, convert to data URL (not recommended for production)

    // In production, implement proper cloud storage upload
    // e.g., Google Cloud Storage, Cloudinary, or Google Drive

    const base64 = await this.blobToBase64(imageBlob);
    return base64; // Return base64 for now
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async saveReceipt(receipt) {
    const receipts = await this.storage.read('ScannedReceipts') || [];
    receipts.push(receipt);
    await this.storage.write('ScannedReceipts', receipts);
  }

  // Confirm and create payment
  async confirmReceipt(receiptId, adminId, overrides = {}) {
    const receipts = await this.storage.read('ScannedReceipts') || [];
    const receipt = receipts.find(r => r.id === receiptId);

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    if (receipt.status === 'confirmed') {
      throw new Error('Receipt already confirmed');
    }

    // Get final match (may be overridden by admin)
    const finalMatch = overrides.flatId ? {
      flatId: overrides.flatId,
      billId: overrides.billId
    } : receipt.matchResult;

    if (!finalMatch?.flatId) {
      throw new Error('No flat selected for this receipt');
    }

    // Create payment record
    const payment = {
      id: crypto.randomUUID(),
      receiptNo: this.generateReceiptNo(),
      flatId: finalMatch.flatId,
      billId: finalMatch.billId || null,
      amount: overrides.amount || receipt.extractedData.amount,
      paymentMode: receipt.extractedData.paymentMode || 'upi',
      referenceNo: receipt.extractedData.transactionId,
      paymentDate: receipt.extractedData.date || new Date().toISOString().split('T')[0],
      receivedBy: adminId,
      remarks: `Scanned receipt - ${receipt.id}`,
      createdAt: new Date().toISOString(),
      scannedReceiptId: receipt.id
    };

    // Save payment
    const payments = await this.storage.read('Payments') || [];
    payments.push(payment);
    await this.storage.write('Payments', payments);

    // Update bill status
    if (finalMatch.billId) {
      await this.updateBillStatus(finalMatch.billId, payment.amount);
    }

    // Update receipt status
    receipt.status = 'confirmed';
    receipt.confirmedAt = new Date().toISOString();
    receipt.confirmedBy = adminId;
    receipt.paymentId = payment.id;
    await this.storage.write('ScannedReceipts', receipts);

    return { success: true, payment, receipt };
  }

  async updateBillStatus(billId, paymentAmount) {
    const bills = await this.storage.read('Bills') || [];
    const bill = bills.find(b => b.id === billId);

    if (bill) {
      bill.paidAmount = (bill.paidAmount || 0) + paymentAmount;

      if (bill.paidAmount >= bill.grandTotal) {
        bill.status = 'paid';
      } else {
        bill.status = 'partial';
      }

      await this.storage.write('Bills', bills);
    }
  }

  generateReceiptNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}-${month}-${random}`;
  }

  // Reject receipt
  async rejectReceipt(receiptId, adminId, reason) {
    const receipts = await this.storage.read('ScannedReceipts') || [];
    const receipt = receipts.find(r => r.id === receiptId);

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    receipt.status = 'rejected';
    receipt.rejectedAt = new Date().toISOString();
    receipt.rejectedBy = adminId;
    receipt.rejectionReason = reason;

    await this.storage.write('ScannedReceipts', receipts);

    return { success: true, receipt };
  }
}

window.ReceiptScanner = ReceiptScanner;
```

### Phase 5: Scanner UI Component (Week 4)

#### 6.5.1 Scanner UI

```javascript
// js/components/scanner-ui.js

class ScannerUI {
  constructor(container, scanner, options = {}) {
    this.container = container;
    this.scanner = scanner;
    this.options = options;

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="scanner-container">
        <div class="scanner-header">
          <h2>📸 Payment Receipt Scanner</h2>
          <p class="scanner-subtitle">Upload UPI screenshots, bank transfers, or cheque images</p>
        </div>

        <!-- Upload Area -->
        <div class="scanner-upload-area" id="uploadArea">
          <div class="upload-icon">📄</div>
          <p class="upload-text">Drag & drop images here</p>
          <p class="upload-subtext">or</p>
          <label class="upload-button">
            <input type="file" id="fileInput" accept="image/*" multiple hidden>
            Browse Files
          </label>
          <button class="camera-button" id="cameraBtn">
            📷 Use Camera
          </button>
        </div>

        <!-- Processing Queue -->
        <div class="scanner-queue" id="scannerQueue" style="display: none;">
          <h3>Processing Queue</h3>
          <div class="queue-list" id="queueList"></div>
        </div>

        <!-- Results -->
        <div class="scanner-results" id="scannerResults" style="display: none;">
          <h3>Scan Results</h3>
          <div class="results-list" id="resultsList"></div>
        </div>

        <!-- Bulk Actions -->
        <div class="scanner-actions" id="scannerActions" style="display: none;">
          <button class="btn btn-primary" id="confirmAllBtn">
            ✅ Confirm All Matched
          </button>
          <button class="btn btn-secondary" id="exportBtn">
            📥 Export Report
          </button>
        </div>
      </div>

      <!-- Match Selection Modal -->
      <div class="modal" id="matchModal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Select Flat for Payment</h3>
            <button class="modal-close" id="closeModal">&times;</button>
          </div>
          <div class="modal-body" id="matchModalBody">
            <!-- Populated dynamically -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="confirmMatchBtn">Confirm</button>
            <button class="btn btn-secondary" id="skipMatchBtn">Skip</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // File input
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    // Camera button
    document.getElementById('cameraBtn').addEventListener('click', () => {
      this.openCamera();
    });

    // Confirm all button
    document.getElementById('confirmAllBtn').addEventListener('click', () => {
      this.confirmAllMatched();
    });

    // Modal close
    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeModal();
    });
  }

  async handleFiles(files) {
    const queue = document.getElementById('scannerQueue');
    const queueList = document.getElementById('queueList');

    queue.style.display = 'block';

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      // Add to queue
      const queueItem = this.createQueueItem(file);
      queueList.appendChild(queueItem);

      // Process
      await this.processFile(file, queueItem);
    }
  }

  createQueueItem(file) {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.innerHTML = `
      <div class="queue-item-preview">
        <img src="${URL.createObjectURL(file)}" alt="Preview">
      </div>
      <div class="queue-item-info">
        <div class="queue-item-name">${file.name}</div>
        <div class="queue-item-status">Processing...</div>
        <div class="queue-item-progress">
          <div class="progress-bar"></div>
        </div>
      </div>
    `;
    return item;
  }

  async processFile(file, queueItem) {
    const statusEl = queueItem.querySelector('.queue-item-status');
    const progressBar = queueItem.querySelector('.progress-bar');

    try {
      // Update progress
      progressBar.style.width = '30%';
      statusEl.textContent = 'Extracting data...';

      const result = await this.scanner.scanReceipt(file, {
        userId: this.options.userId
      });

      progressBar.style.width = '100%';

      if (result.success) {
        statusEl.textContent = '✅ Processed';
        queueItem.classList.add('success');

        // Show result
        this.addResult(result);

        // If needs review, open modal
        if (result.needsReview) {
          await this.showMatchModal(result);
        }
      } else {
        statusEl.textContent = `❌ ${result.error}`;
        queueItem.classList.add('error');
      }

    } catch (error) {
      statusEl.textContent = `❌ ${error.message}`;
      queueItem.classList.add('error');
    }
  }

  addResult(result) {
    const resultsContainer = document.getElementById('scannerResults');
    const resultsList = document.getElementById('resultsList');
    const actionsContainer = document.getElementById('scannerActions');

    resultsContainer.style.display = 'block';
    actionsContainer.style.display = 'flex';

    const { receipt, extractedData, matchResult } = result;

    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${matchResult.bestMatch ? 'matched' : 'unmatched'}`;
    resultItem.dataset.receiptId = receipt.id;

    resultItem.innerHTML = `
      <div class="result-preview">
        <img src="${receipt.imageUrl}" alt="Receipt">
      </div>
      <div class="result-details">
        <div class="result-amount">₹${extractedData.amount?.toLocaleString() || 'Unknown'}</div>
        <div class="result-date">${extractedData.date || 'Date unknown'}</div>
        <div class="result-ref">${extractedData.transactionId || 'No reference'}</div>
        <div class="result-payer">${extractedData.payerName || 'Unknown payer'}</div>
      </div>
      <div class="result-match">
        ${matchResult.bestMatch ? `
          <div class="match-flat">${matchResult.bestMatch.flatNo}</div>
          <div class="match-confidence">${Math.round(matchResult.bestMatch.confidence * 100)}% match</div>
          <div class="match-owner">${matchResult.bestMatch.ownerName || ''}</div>
        ` : `
          <div class="no-match">No match found</div>
          <button class="btn btn-sm" onclick="scannerUI.showMatchModal({receipt: {id: '${receipt.id}'}})">
            Select Flat
          </button>
        `}
      </div>
      <div class="result-actions">
        ${matchResult.bestMatch ? `
          <button class="btn btn-sm btn-primary confirm-btn" data-receipt-id="${receipt.id}">
            ✅ Confirm
          </button>
        ` : ''}
        <button class="btn btn-sm btn-secondary reject-btn" data-receipt-id="${receipt.id}">
          ❌ Reject
        </button>
      </div>
    `;

    // Bind action buttons
    const confirmBtn = resultItem.querySelector('.confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.confirmReceipt(receipt.id));
    }

    const rejectBtn = resultItem.querySelector('.reject-btn');
    rejectBtn.addEventListener('click', () => this.rejectReceipt(receipt.id));

    resultsList.appendChild(resultItem);
  }

  async showMatchModal(result) {
    const modal = document.getElementById('matchModal');
    const modalBody = document.getElementById('matchModalBody');

    this.currentReceiptId = result.receipt.id;

    // Load flats for selection
    const flats = await this.scanner.storage.read('Flats');

    modalBody.innerHTML = `
      <div class="extracted-info">
        <h4>Extracted Information</h4>
        <p><strong>Amount:</strong> ₹${result.extractedData?.amount?.toLocaleString() || 'Unknown'}</p>
        <p><strong>Payer:</strong> ${result.extractedData?.payerName || 'Unknown'}</p>
        <p><strong>Date:</strong> ${result.extractedData?.date || 'Unknown'}</p>
      </div>

      ${result.matchResult?.matches?.length > 0 ? `
        <div class="suggested-matches">
          <h4>Suggested Matches</h4>
          ${result.matchResult.matches.map(match => `
            <label class="match-option">
              <input type="radio" name="flatMatch" value="${match.flatId}">
              <span class="match-option-content">
                <strong>${match.flatNo}</strong> - ${match.ownerName || 'Unknown'}
                <span class="match-confidence">${Math.round(match.confidence * 100)}%</span>
              </span>
            </label>
          `).join('')}
        </div>
      ` : ''}

      <div class="manual-select">
        <h4>Or Select Manually</h4>
        <select id="manualFlatSelect">
          <option value="">-- Select Flat --</option>
          ${flats.map(f => `
            <option value="${f.id}">${f.flatNo} - ${f.ownerName || 'Unknown'}</option>
          `).join('')}
        </select>
      </div>
    `;

    // Bind confirm button
    document.getElementById('confirmMatchBtn').onclick = () => this.confirmManualMatch();
    document.getElementById('skipMatchBtn').onclick = () => this.closeModal();

    modal.style.display = 'flex';
  }

  async confirmManualMatch() {
    const selectedRadio = document.querySelector('input[name="flatMatch"]:checked');
    const manualSelect = document.getElementById('manualFlatSelect');

    const flatId = selectedRadio?.value || manualSelect.value;

    if (!flatId) {
      alert('Please select a flat');
      return;
    }

    try {
      await this.scanner.confirmReceipt(this.currentReceiptId, this.options.userId, {
        flatId
      });

      // Update UI
      this.updateResultItem(this.currentReceiptId, 'confirmed');
      this.closeModal();

      this.showNotification('Payment confirmed successfully!', 'success');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  async confirmReceipt(receiptId) {
    try {
      await this.scanner.confirmReceipt(receiptId, this.options.userId);
      this.updateResultItem(receiptId, 'confirmed');
      this.showNotification('Payment confirmed!', 'success');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  async rejectReceipt(receiptId) {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;

    try {
      await this.scanner.rejectReceipt(receiptId, this.options.userId, reason);
      this.updateResultItem(receiptId, 'rejected');
      this.showNotification('Receipt rejected', 'info');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  updateResultItem(receiptId, status) {
    const item = document.querySelector(`[data-receipt-id="${receiptId}"]`);
    if (item) {
      item.classList.remove('matched', 'unmatched');
      item.classList.add(status);

      const actions = item.querySelector('.result-actions');
      actions.innerHTML = `<span class="status-badge ${status}">${status.toUpperCase()}</span>`;
    }
  }

  async confirmAllMatched() {
    const matchedItems = document.querySelectorAll('.result-item.matched:not(.confirmed)');

    for (const item of matchedItems) {
      const receiptId = item.dataset.receiptId;
      await this.confirmReceipt(receiptId);
    }

    this.showNotification(`Confirmed ${matchedItems.length} payments`, 'success');
  }

  closeModal() {
    document.getElementById('matchModal').style.display = 'none';
    this.currentReceiptId = null;
  }

  openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => this.handleFiles(e.target.files);
    input.click();
  }

  showNotification(message, type = 'info') {
    // Use existing notification system or create simple one
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      alert(message);
    }
  }
}

window.ScannerUI = ScannerUI;
```

#### 6.5.2 Scanner Styles

```css
/* css/scanner.css */

.scanner-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.scanner-header {
  text-align: center;
  margin-bottom: 30px;
}

.scanner-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.scanner-subtitle {
  color: #666;
}

/* Upload Area */
.scanner-upload-area {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: #fafafa;
  transition: all 0.3s ease;
}

.scanner-upload-area.dragover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.upload-subtext {
  color: #999;
  margin-bottom: 16px;
}

.upload-button {
  display: inline-block;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.upload-button:hover {
  background: #5a67d8;
}

.camera-button {
  display: block;
  margin: 16px auto 0;
  padding: 10px 20px;
  background: none;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Queue */
.scanner-queue {
  margin-top: 30px;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
}

.queue-item.success {
  border-color: #10b981;
  background: #f0fdf4;
}

.queue-item.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.queue-item-preview {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 16px;
}

.queue-item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.queue-item-info {
  flex: 1;
}

.queue-item-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.queue-item-status {
  font-size: 14px;
  color: #666;
}

.queue-item-progress {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #667eea;
  width: 0;
  transition: width 0.3s ease;
}

/* Results */
.scanner-results {
  margin-top: 30px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.result-item.matched {
  border-left: 4px solid #10b981;
}

.result-item.unmatched {
  border-left: 4px solid #f59e0b;
}

.result-item.confirmed {
  opacity: 0.7;
  border-left-color: #6b7280;
}

.result-item.rejected {
  opacity: 0.5;
  border-left-color: #ef4444;
}

.result-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 16px;
}

.result-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-details {
  flex: 1;
}

.result-amount {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.result-date, .result-ref, .result-payer {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.result-match {
  text-align: center;
  padding: 0 20px;
  min-width: 140px;
}

.match-flat {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.match-confidence {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.match-owner {
  font-size: 12px;
  color: #64748b;
}

.no-match {
  color: #f59e0b;
  font-weight: 600;
  margin-bottom: 8px;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Actions */
.scanner-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

/* Modal */
.modal {
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

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.match-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.match-option:hover {
  background: #f8fafc;
}

.match-option input {
  margin-right: 12px;
}

.match-option-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

#manualFlatSelect {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}
```

---

## 7. Testing Plan

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-CV-001 | Upload clear UPI screenshot | Amount, date, ref extracted |
| TC-CV-002 | Upload blurry image | Graceful degradation or retry prompt |
| TC-CV-003 | Upload duplicate receipt | Duplicate detected, prevented |
| TC-CV-004 | Match by payer name | Correct flat identified |
| TC-CV-005 | Match by exact amount | Bill matched correctly |
| TC-CV-006 | No match found | Manual selection offered |
| TC-CV-007 | Admin confirms receipt | Payment created, bill updated |
| TC-CV-008 | Admin rejects receipt | Receipt marked rejected |
| TC-CV-009 | Bulk upload 10 images | All processed sequentially |
| TC-CV-010 | Hindi text in receipt | Extracted correctly |

---

## 8. Cost Estimation

| Item | Cost | Notes |
|------|------|-------|
| Claude Vision API | $0.01/image | Primary extraction |
| Google Vision API (fallback) | $1.50/1K images | Optional |
| Cloud Storage | $0.02/GB | Receipt images |
| **Monthly (500 receipts)** | **$5-10/month** | |

---

## 9. Security Considerations

1. **Image Storage**: Store receipts securely, encrypt at rest
2. **PII Handling**: Mask bank account numbers in logs
3. **Access Control**: Only admins can confirm/reject
4. **Audit Trail**: Log all confirmation/rejection actions
5. **Duplicate Prevention**: Hash-based duplicate detection
6. **Data Retention**: Auto-delete receipts after 1 year
