# Design 2: Predictive Smart Billing System
## Complete Implementation Plan

---

## 1. Overview

An AI-powered billing system that predicts payment behaviors, automates reminders, forecasts cash flow, and provides intelligent recommendations to improve collection rates.

### Key Capabilities
- Payment behavior prediction per flat
- Optimal reminder timing based on individual patterns
- Cash flow forecasting
- Defaulter risk scoring
- Automated escalation workflows
- Anomaly detection in billing

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Admin         │  │   Prediction    │  │   Automated     │     │
│  │   Dashboard     │  │   Dashboard     │  │   Reports       │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                     │
├────────────────────────────────┼─────────────────────────────────────┤
│                      AI/ML LAYER                                     │
├────────────────────────────────┼─────────────────────────────────────┤
│                                ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    PREDICTION ENGINE                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │ Payment     │ │ Risk        │ │ Cash Flow           │   │   │
│  │  │ Predictor   │ │ Scorer      │ │ Forecaster          │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  │                                                              │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │ Reminder    │ │ Anomaly     │ │ Recommendation      │   │   │
│  │  │ Optimizer   │ │ Detector    │ │ Engine              │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
├────────────────────────────────┼─────────────────────────────────────┤
│                      AUTOMATION LAYER                                │
├────────────────────────────────┼─────────────────────────────────────┤
│                                ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    WORKFLOW ENGINE                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │   │
│  │  │ Auto Bill   │ │ Smart       │ │ Escalation          │   │   │
│  │  │ Generator   │ │ Reminders   │ │ Manager             │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
├────────────────────────────────┼─────────────────────────────────────┤
│                      DATA LAYER                                      │
├────────────────────────────────┼─────────────────────────────────────┤
│                                ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           EXISTING GOOGLE SHEETS + ANALYTICS STORE           │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │   │
│  │  │ Bills     │ │ Payments  │ │ Flats     │ │ Analytics │   │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| ML Runtime | TensorFlow.js | Browser-based predictions |
| Feature Store | Google Sheets + IndexedDB | Store computed features |
| Scheduler | Google Apps Script Triggers | Automated tasks |
| Notifications | Web Push + Email (SendGrid) | Reminders |
| Analytics | Custom + LLM Analysis | Insights generation |

### ML Model Options

| Approach | Complexity | Accuracy | Cost |
|----------|------------|----------|------|
| Rule-based heuristics | Low | Medium | Free |
| TensorFlow.js (browser) | Medium | Good | Free |
| Cloud ML (Vertex AI) | High | Best | $50+/month |
| **LLM-based analysis** | Medium | Good | $10-20/month |

**Recommended**: Start with rule-based + LLM analysis, then add TensorFlow.js for advanced predictions.

---

## 4. File Structure

```
js/
├── predictive/
│   ├── prediction-engine.js      # Main prediction orchestrator
│   ├── payment-predictor.js      # Payment timing predictions
│   ├── risk-scorer.js            # Defaulter risk scoring
│   ├── cash-flow-forecaster.js   # Monthly cash flow predictions
│   ├── reminder-optimizer.js     # Optimal reminder timing
│   ├── anomaly-detector.js       # Unusual pattern detection
│   ├── recommendation-engine.js  # AI-powered recommendations
│   ├── feature-extractor.js      # Extract ML features from data
│   └── models/
│       ├── payment-model.json    # Trained TF.js model
│       └── risk-model.json       # Risk scoring model
├── automation/
│   ├── workflow-engine.js        # Automation orchestrator
│   ├── auto-bill-generator.js    # Scheduled bill generation
│   ├── smart-reminders.js        # Intelligent reminder system
│   └── escalation-manager.js     # Escalation workflows
├── admin/
│   └── prediction-dashboard.js   # Admin prediction UI
└── config/
    └── prediction-config.js      # ML and automation settings

api/
├── predictive-backend.gs         # Google Apps Script additions
└── scheduled-tasks.gs            # Trigger-based automation

css/
└── prediction-dashboard.css      # Prediction UI styles
```

---

## 5. Database Schema Additions

### New Sheet: PaymentPatterns
```javascript
{
  flatId: "uuid",
  flatNo: "A-101",

  // Payment behavior metrics
  avgDaysToPayment: 12.5,        // Average days after bill generation
  medianDaysToPayment: 10,
  paymentVariance: 4.2,          // Consistency measure

  // Pattern classification
  payerType: "early|on-time|late|chronic-late|defaulter",

  // Temporal patterns
  preferredPaymentDay: 5,        // Day of month (salary day correlation)
  preferredPaymentWeekday: "friday",

  // Payment method preference
  preferredMethod: "upi",        // cash|cheque|upi|bank_transfer

  // Response to reminders
  respondsToReminder: true,
  avgRemindersNeeded: 1.5,
  optimalReminderDay: 3,         // Days before due date

  // Risk metrics
  riskScore: 0.25,               // 0-1, higher = more risk
  riskFactors: ["late_3_times", "partial_payments"],

  // Financial metrics
  avgPaymentAmount: 2450,
  hasPartialPaymentHistory: false,

  // Timestamps
  lastAnalyzed: "ISO_date",
  dataPointCount: 24             // Months of data analyzed
}
```

### New Sheet: Predictions
```javascript
{
  id: "uuid",
  type: "payment|collection|risk",

  // For payment predictions
  flatId: "uuid",
  billId: "uuid",

  // Prediction details
  predictedDate: "2024-02-08",
  predictedAmount: 2450,
  confidence: 0.85,

  // Factors
  factors: [
    { factor: "salary_day_pattern", weight: 0.4 },
    { factor: "historical_avg", weight: 0.3 },
    { factor: "reminder_sent", weight: 0.2 },
    { factor: "bill_amount_normal", weight: 0.1 }
  ],

  // Outcome (filled after actual payment)
  actualDate: "2024-02-07",
  actualAmount: 2450,
  predictionAccuracy: 0.95,

  createdAt: "ISO_date"
}
```

### New Sheet: AutomationLogs
```javascript
{
  id: "uuid",
  type: "bill_generation|reminder|escalation|report",

  triggeredAt: "ISO_date",
  triggeredBy: "scheduled|manual|event",

  // Action details
  action: "send_reminder",
  targetFlats: ["uuid1", "uuid2"],
  targetCount: 25,

  // Results
  status: "success|partial|failed",
  successCount: 23,
  failedCount: 2,
  failedReasons: ["invalid_email", "invalid_phone"],

  // Performance
  executionTimeMs: 4500,

  metadata: {}
}
```

### New Sheet: Recommendations
```javascript
{
  id: "uuid",
  flatId: "uuid",          // null for society-wide

  type: "payment_plan|early_reminder|escalation|incentive",
  priority: "high|medium|low",

  title: "Suggest installment plan for A-304",
  description: "Flat A-304 has ₹15,200 pending across 3 months. Historical pattern shows difficulty with large amounts.",

  suggestedAction: {
    type: "create_payment_plan",
    params: {
      totalAmount: 15200,
      installments: 3,
      installmentAmount: 5067
    }
  },

  expectedImpact: {
    metric: "collection_rate",
    improvement: 0.15
  },

  status: "pending|accepted|rejected|implemented",
  adminResponse: null,

  generatedAt: "ISO_date",
  expiresAt: "ISO_date"
}
```

---

## 6. Implementation Phases

### Phase 1: Data Collection & Feature Engineering (Week 1-2)

#### 6.1.1 Feature Extractor

```javascript
// js/predictive/feature-extractor.js

class FeatureExtractor {
  constructor(storage) {
    this.storage = storage;
  }

  async extractFlatFeatures(flatId) {
    const [bills, payments, flat] = await Promise.all([
      this.storage.read('Bills'),
      this.storage.read('Payments'),
      this.storage.read('Flats')
    ]);

    const flatBills = bills.filter(b => b.flatId === flatId);
    const flatPayments = payments.filter(p => p.flatId === flatId);
    const flatInfo = flat.find(f => f.id === flatId);

    if (flatBills.length < 3) {
      return null; // Not enough data
    }

    // Calculate payment timing features
    const paymentTimings = this.calculatePaymentTimings(flatBills, flatPayments);

    // Calculate consistency features
    const consistencyMetrics = this.calculateConsistency(paymentTimings);

    // Calculate temporal patterns
    const temporalPatterns = this.analyzeTemporalPatterns(flatPayments);

    // Calculate risk factors
    const riskFactors = this.calculateRiskFactors(flatBills, flatPayments);

    // Payment method analysis
    const methodPreference = this.analyzePaymentMethods(flatPayments);

    return {
      flatId,
      flatNo: flatInfo?.flatNo,

      // Timing features
      avgDaysToPayment: paymentTimings.avgDays,
      medianDaysToPayment: paymentTimings.medianDays,
      minDaysToPayment: paymentTimings.minDays,
      maxDaysToPayment: paymentTimings.maxDays,
      paymentVariance: paymentTimings.variance,

      // Consistency
      payerType: consistencyMetrics.payerType,
      consistencyScore: consistencyMetrics.score,

      // Temporal
      preferredPaymentDay: temporalPatterns.preferredDay,
      preferredPaymentWeekday: temporalPatterns.preferredWeekday,
      salaryDayCorrelation: temporalPatterns.salaryCorrelation,

      // Method preference
      preferredMethod: methodPreference.preferred,
      methodDistribution: methodPreference.distribution,

      // Risk
      riskScore: riskFactors.score,
      riskFactors: riskFactors.factors,

      // Reminder response
      respondsToReminder: this.analyzeReminderResponse(flatBills, flatPayments),
      avgRemindersNeeded: this.calculateAvgReminders(flatBills, flatPayments),

      // Financial
      avgPaymentAmount: this.calculateAvgPayment(flatPayments),
      hasPartialPaymentHistory: this.hasPartialPayments(flatPayments),

      // Meta
      lastAnalyzed: new Date().toISOString(),
      dataPointCount: flatBills.length
    };
  }

  calculatePaymentTimings(bills, payments) {
    const timings = [];

    for (const bill of bills) {
      if (bill.status === 'paid') {
        // Find payment(s) for this bill
        const billPayments = payments.filter(p => p.billId === bill.id);

        if (billPayments.length > 0) {
          // Use first payment date
          const firstPayment = billPayments.sort((a, b) =>
            new Date(a.paymentDate) - new Date(b.paymentDate)
          )[0];

          const billDate = new Date(bill.generatedAt);
          const paymentDate = new Date(firstPayment.paymentDate);
          const daysDiff = Math.floor((paymentDate - billDate) / (1000 * 60 * 60 * 24));

          timings.push(daysDiff);
        }
      }
    }

    if (timings.length === 0) {
      return {
        avgDays: null,
        medianDays: null,
        minDays: null,
        maxDays: null,
        variance: null
      };
    }

    const sorted = [...timings].sort((a, b) => a - b);
    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / timings.length;

    return {
      avgDays: Math.round(avg * 10) / 10,
      medianDays: median,
      minDays: sorted[0],
      maxDays: sorted[sorted.length - 1],
      variance: Math.round(Math.sqrt(variance) * 10) / 10
    };
  }

  calculateConsistency(timings) {
    if (!timings.avgDays) {
      return { payerType: 'unknown', score: 0 };
    }

    const { avgDays, variance } = timings;

    // Classify payer type
    let payerType;
    if (avgDays <= 5) {
      payerType = 'early';
    } else if (avgDays <= 15) {
      payerType = 'on-time';
    } else if (avgDays <= 30) {
      payerType = 'late';
    } else {
      payerType = 'chronic-late';
    }

    // Consistency score (lower variance = more consistent)
    const consistencyScore = Math.max(0, 1 - (variance / 30));

    return {
      payerType,
      score: Math.round(consistencyScore * 100) / 100
    };
  }

  analyzeTemporalPatterns(payments) {
    if (payments.length < 3) {
      return {
        preferredDay: null,
        preferredWeekday: null,
        salaryCorrelation: null
      };
    }

    const dayOfMonth = {};
    const dayOfWeek = {};
    const salaryDays = [1, 5, 7, 10, 15, 25, 28, 30, 31]; // Common salary days

    for (const payment of payments) {
      const date = new Date(payment.paymentDate);
      const dom = date.getDate();
      const dow = date.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();

      dayOfMonth[dom] = (dayOfMonth[dom] || 0) + 1;
      dayOfWeek[dow] = (dayOfWeek[dow] || 0) + 1;
    }

    // Find preferred day
    const preferredDay = Object.entries(dayOfMonth)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const preferredWeekday = Object.entries(dayOfWeek)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calculate salary day correlation
    const salaryDayPayments = payments.filter(p => {
      const day = new Date(p.paymentDate).getDate();
      return salaryDays.some(sd => Math.abs(sd - day) <= 2);
    }).length;

    const salaryCorrelation = salaryDayPayments / payments.length;

    return {
      preferredDay: parseInt(preferredDay) || null,
      preferredWeekday,
      salaryCorrelation: Math.round(salaryCorrelation * 100) / 100
    };
  }

  calculateRiskFactors(bills, payments) {
    const factors = [];
    let score = 0;

    // Check for unpaid bills
    const unpaidBills = bills.filter(b => b.status !== 'paid');
    if (unpaidBills.length > 0) {
      const monthsOverdue = unpaidBills.length;
      if (monthsOverdue >= 3) {
        factors.push('unpaid_3_plus_months');
        score += 0.4;
      } else if (monthsOverdue >= 1) {
        factors.push(`unpaid_${monthsOverdue}_months`);
        score += 0.15 * monthsOverdue;
      }
    }

    // Check for late payment history
    const latePayments = this.countLatePayments(bills, payments);
    if (latePayments >= 6) {
      factors.push('chronic_late_payer');
      score += 0.3;
    } else if (latePayments >= 3) {
      factors.push('frequent_late_payer');
      score += 0.15;
    }

    // Check for partial payments
    const partialPayments = payments.filter(p => {
      const bill = bills.find(b => b.id === p.billId);
      return bill && p.amount < bill.grandTotal;
    });
    if (partialPayments.length > 2) {
      factors.push('partial_payment_history');
      score += 0.1;
    }

    // Check for declining payment frequency
    const recentPaymentGap = this.calculateRecentPaymentGap(payments);
    if (recentPaymentGap > 60) {
      factors.push('long_payment_gap');
      score += 0.2;
    }

    return {
      score: Math.min(1, score),
      factors
    };
  }

  countLatePayments(bills, payments, threshold = 15) {
    let lateCount = 0;

    for (const bill of bills) {
      if (bill.status === 'paid') {
        const billPayments = payments.filter(p => p.billId === bill.id);
        if (billPayments.length > 0) {
          const firstPayment = billPayments.sort((a, b) =>
            new Date(a.paymentDate) - new Date(b.paymentDate)
          )[0];

          const dueDate = new Date(bill.dueDate);
          const paymentDate = new Date(firstPayment.paymentDate);

          if (paymentDate > dueDate) {
            const daysLate = Math.floor((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
            if (daysLate > threshold) {
              lateCount++;
            }
          }
        }
      }
    }

    return lateCount;
  }

  calculateRecentPaymentGap(payments) {
    if (payments.length === 0) return 999;

    const sorted = [...payments].sort((a, b) =>
      new Date(b.paymentDate) - new Date(a.paymentDate)
    );

    const lastPayment = new Date(sorted[0].paymentDate);
    const now = new Date();

    return Math.floor((now - lastPayment) / (1000 * 60 * 60 * 24));
  }

  analyzePaymentMethods(payments) {
    if (payments.length === 0) {
      return { preferred: null, distribution: {} };
    }

    const methods = {};
    for (const payment of payments) {
      const method = payment.paymentMode || 'unknown';
      methods[method] = (methods[method] || 0) + 1;
    }

    const preferred = Object.entries(methods)
      .sort((a, b) => b[1] - a[1])[0][0];

    const total = payments.length;
    const distribution = {};
    for (const [method, count] of Object.entries(methods)) {
      distribution[method] = Math.round((count / total) * 100) / 100;
    }

    return { preferred, distribution };
  }

  analyzeReminderResponse(bills, payments) {
    // This would require reminder tracking data
    // For now, use a heuristic based on payment timing
    const timings = this.calculatePaymentTimings(bills, payments);

    // If payments come soon after typical reminder periods, likely responsive
    if (timings.avgDays && timings.avgDays <= 10) {
      return true;
    }
    return false;
  }

  calculateAvgReminders(bills, payments) {
    // Placeholder - would need reminder tracking
    const timings = this.calculatePaymentTimings(bills, payments);
    if (!timings.avgDays) return 2;

    if (timings.avgDays <= 5) return 0;
    if (timings.avgDays <= 10) return 1;
    if (timings.avgDays <= 20) return 2;
    return 3;
  }

  calculateAvgPayment(payments) {
    if (payments.length === 0) return 0;
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return Math.round(total / payments.length);
  }

  hasPartialPayments(payments) {
    // Check if any payment is marked as partial or has follow-up payments
    return payments.some(p => p.isPartial === true);
  }

  // Analyze all flats and store patterns
  async analyzeAllFlats() {
    const flats = await this.storage.read('Flats');
    const patterns = [];

    for (const flat of flats) {
      const features = await this.extractFlatFeatures(flat.id);
      if (features) {
        patterns.push(features);
      }
    }

    // Store patterns
    await this.storage.write('PaymentPatterns', patterns);

    return patterns;
  }
}

window.FeatureExtractor = FeatureExtractor;
```

### Phase 2: Prediction Models (Week 2-3)

#### 6.2.1 Payment Predictor

```javascript
// js/predictive/payment-predictor.js

class PaymentPredictor {
  constructor(storage) {
    this.storage = storage;
    this.patterns = null;
  }

  async loadPatterns() {
    this.patterns = await this.storage.read('PaymentPatterns') || [];
    return this.patterns;
  }

  async predictPaymentDate(flatId, billId) {
    if (!this.patterns) await this.loadPatterns();

    const pattern = this.patterns.find(p => p.flatId === flatId);
    const bill = (await this.storage.read('Bills')).find(b => b.id === billId);

    if (!pattern || !bill) {
      return this.getDefaultPrediction(bill);
    }

    const billDate = new Date(bill.generatedAt);
    const dueDate = new Date(bill.dueDate);

    // Base prediction on historical average
    let predictedDays = pattern.avgDaysToPayment || 15;
    let confidence = 0.5;

    // Adjust based on payer type
    const payerAdjustments = {
      'early': { days: -3, confidence: 0.85 },
      'on-time': { days: 0, confidence: 0.80 },
      'late': { days: 5, confidence: 0.70 },
      'chronic-late': { days: 15, confidence: 0.60 }
    };

    if (payerAdjustments[pattern.payerType]) {
      predictedDays += payerAdjustments[pattern.payerType].days;
      confidence = payerAdjustments[pattern.payerType].confidence;
    }

    // Adjust for consistency
    confidence *= (0.5 + 0.5 * pattern.consistencyScore);

    // Adjust for salary day correlation
    if (pattern.salaryCorrelation > 0.7) {
      // Strong salary day correlation - predict next salary day
      const nextSalaryDay = this.findNextSalaryDay(billDate, pattern.preferredPaymentDay);
      const salaryDays = Math.floor((nextSalaryDay - billDate) / (1000 * 60 * 60 * 24));

      // Blend with historical average
      predictedDays = Math.round(predictedDays * 0.3 + salaryDays * 0.7);
      confidence *= 1.1; // Higher confidence due to clear pattern
    }

    // Calculate predicted date
    const predictedDate = new Date(billDate);
    predictedDate.setDate(predictedDate.getDate() + predictedDays);

    // Calculate prediction factors
    const factors = this.calculateFactors(pattern, bill);

    return {
      flatId,
      billId,
      predictedDate: predictedDate.toISOString().split('T')[0],
      predictedDays,
      confidence: Math.min(0.95, Math.round(confidence * 100) / 100),
      factors,
      pattern: pattern.payerType,
      recommendation: this.generateRecommendation(pattern, predictedDays, dueDate)
    };
  }

  findNextSalaryDay(fromDate, preferredDay) {
    const date = new Date(fromDate);
    const currentDay = date.getDate();

    if (currentDay < preferredDay) {
      date.setDate(preferredDay);
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(preferredDay);
    }

    return date;
  }

  calculateFactors(pattern, bill) {
    const factors = [];

    factors.push({
      factor: 'historical_average',
      description: `Average ${pattern.avgDaysToPayment} days to payment`,
      weight: 0.35
    });

    if (pattern.payerType) {
      factors.push({
        factor: 'payer_type',
        description: `Classified as ${pattern.payerType} payer`,
        weight: 0.25
      });
    }

    if (pattern.salaryCorrelation > 0.5) {
      factors.push({
        factor: 'salary_day_correlation',
        description: `Usually pays around day ${pattern.preferredPaymentDay}`,
        weight: 0.25
      });
    }

    factors.push({
      factor: 'consistency_score',
      description: `Payment consistency: ${Math.round(pattern.consistencyScore * 100)}%`,
      weight: 0.15
    });

    return factors;
  }

  generateRecommendation(pattern, predictedDays, dueDate) {
    const dueDays = Math.floor((dueDate - new Date()) / (1000 * 60 * 60 * 24));

    if (predictedDays > dueDays + 10) {
      return {
        type: 'early_reminder',
        message: `Send reminder ${Math.max(0, dueDays - 5)} days before due date`,
        priority: 'high'
      };
    }

    if (pattern.payerType === 'chronic-late' && pattern.riskScore > 0.5) {
      return {
        type: 'escalation',
        message: 'Consider personal follow-up or committee involvement',
        priority: 'high'
      };
    }

    if (pattern.payerType === 'early') {
      return {
        type: 'no_action',
        message: 'Reliable early payer - no action needed',
        priority: 'low'
      };
    }

    return {
      type: 'standard_reminder',
      message: 'Send standard reminder on due date',
      priority: 'medium'
    };
  }

  getDefaultPrediction(bill) {
    const billDate = new Date(bill?.generatedAt || new Date());
    const predictedDate = new Date(billDate);
    predictedDate.setDate(predictedDate.getDate() + 15);

    return {
      flatId: bill?.flatId,
      billId: bill?.id,
      predictedDate: predictedDate.toISOString().split('T')[0],
      predictedDays: 15,
      confidence: 0.4,
      factors: [{ factor: 'default', description: 'No historical data', weight: 1 }],
      pattern: 'unknown',
      recommendation: {
        type: 'standard_reminder',
        message: 'New flat - use standard reminder schedule',
        priority: 'medium'
      }
    };
  }

  // Predict all pending bills
  async predictAllPending() {
    const bills = await this.storage.read('Bills');
    const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'partial');

    const predictions = [];
    for (const bill of pendingBills) {
      const prediction = await this.predictPaymentDate(bill.flatId, bill.id);
      predictions.push(prediction);
    }

    // Store predictions
    await this.storage.write('Predictions', predictions);

    return predictions;
  }
}

window.PaymentPredictor = PaymentPredictor;
```

#### 6.2.2 Cash Flow Forecaster

```javascript
// js/predictive/cash-flow-forecaster.js

class CashFlowForecaster {
  constructor(storage) {
    this.storage = storage;
  }

  async forecastMonth(targetMonth, targetYear) {
    const [bills, payments, patterns, flats] = await Promise.all([
      this.storage.read('Bills'),
      this.storage.read('Payments'),
      this.storage.read('PaymentPatterns'),
      this.storage.read('Flats')
    ]);

    // Calculate expected billing
    const expectedBilling = this.calculateExpectedBilling(flats, targetMonth, targetYear);

    // Calculate expected collection based on patterns
    const expectedCollection = this.calculateExpectedCollection(
      bills, patterns, expectedBilling, targetMonth, targetYear
    );

    // Calculate weekly breakdown
    const weeklyForecast = this.calculateWeeklyForecast(
      patterns, expectedBilling, targetMonth, targetYear
    );

    // Historical comparison
    const historical = this.getHistoricalComparison(bills, payments, targetMonth);

    // Risk analysis
    const riskAnalysis = this.analyzeCollectionRisk(patterns, expectedBilling);

    return {
      month: targetMonth,
      year: targetYear,

      // Summary
      expectedBilling: expectedBilling.total,
      expectedCollection: expectedCollection.total,
      collectionRate: expectedCollection.rate,
      confidence: expectedCollection.confidence,

      // Breakdown
      byPayerType: expectedCollection.byPayerType,
      weeklyForecast,

      // Carry forward
      previousDue: expectedBilling.previousDue,
      expectedCarryForward: expectedBilling.total - expectedCollection.total,

      // Risk
      riskAnalysis,

      // Historical context
      historical,

      generatedAt: new Date().toISOString()
    };
  }

  calculateExpectedBilling(flats, month, year) {
    // This would typically come from charge configuration
    // Using estimates based on flat data

    const activeFlats = flats.filter(f => f.isActive !== false);
    let totalBilling = 0;
    let previousDue = 0;

    for (const flat of activeFlats) {
      // Estimate monthly charges (maintenance + water + parking)
      const area = flat.area || 750;
      const maintenance = area * 3; // ₹3/sqft
      const water = 200;
      const twoWheelers = (flat.twoWheelerCount || 0) * 100;
      const fourWheelers = (flat.fourWheelerCount || 0) * 500;

      const monthlyCharge = maintenance + water + twoWheelers + fourWheelers;
      totalBilling += monthlyCharge;

      // Add any previous dues (simplified)
      if (flat.outstandingAmount) {
        previousDue += flat.outstandingAmount;
      }
    }

    return {
      total: totalBilling,
      flatCount: activeFlats.length,
      avgPerFlat: Math.round(totalBilling / activeFlats.length),
      previousDue
    };
  }

  calculateExpectedCollection(bills, patterns, expectedBilling, month, year) {
    let expectedTotal = 0;
    let confidenceSum = 0;
    const byPayerType = {
      early: { count: 0, amount: 0 },
      'on-time': { count: 0, amount: 0 },
      late: { count: 0, amount: 0 },
      'chronic-late': { count: 0, amount: 0 },
      unknown: { count: 0, amount: 0 }
    };

    // Collection rates by payer type
    const collectionRates = {
      'early': 1.0,
      'on-time': 0.98,
      'late': 0.85,
      'chronic-late': 0.60,
      'unknown': 0.75
    };

    const confidences = {
      'early': 0.95,
      'on-time': 0.90,
      'late': 0.75,
      'chronic-late': 0.50,
      'unknown': 0.60
    };

    // Calculate per flat
    const avgBillAmount = expectedBilling.avgPerFlat;

    for (const pattern of patterns) {
      const payerType = pattern.payerType || 'unknown';
      const rate = collectionRates[payerType];
      const confidence = confidences[payerType];

      const expectedFromFlat = avgBillAmount * rate;
      expectedTotal += expectedFromFlat;
      confidenceSum += confidence;

      byPayerType[payerType].count++;
      byPayerType[payerType].amount += expectedFromFlat;
    }

    // Add unknown flats (no pattern data)
    const knownFlats = patterns.length;
    const unknownFlats = expectedBilling.flatCount - knownFlats;

    if (unknownFlats > 0) {
      const unknownCollection = unknownFlats * avgBillAmount * collectionRates.unknown;
      expectedTotal += unknownCollection;
      confidenceSum += unknownFlats * confidences.unknown;
      byPayerType.unknown.count += unknownFlats;
      byPayerType.unknown.amount += unknownCollection;
    }

    const avgConfidence = confidenceSum / expectedBilling.flatCount;

    return {
      total: Math.round(expectedTotal),
      rate: Math.round((expectedTotal / expectedBilling.total) * 100) / 100,
      confidence: Math.round(avgConfidence * 100) / 100,
      byPayerType
    };
  }

  calculateWeeklyForecast(patterns, expectedBilling, month, year) {
    // Group flats by preferred payment timing
    const weeklyDistribution = [0, 0, 0, 0, 0]; // Week 1-4 + overflow

    for (const pattern of patterns) {
      const preferredDay = pattern.preferredPaymentDay || 15;
      const weekIndex = Math.min(4, Math.floor((preferredDay - 1) / 7));

      weeklyDistribution[weekIndex]++;
    }

    // Add unknown flats distributed evenly
    const knownFlats = patterns.length;
    const unknownFlats = expectedBilling.flatCount - knownFlats;
    const perWeek = Math.floor(unknownFlats / 4);

    for (let i = 0; i < 4; i++) {
      weeklyDistribution[i] += perWeek;
    }
    weeklyDistribution[1] += unknownFlats % 4; // Extra to week 2 (typical due date area)

    // Convert to amounts
    const totalFlats = expectedBilling.flatCount;
    const avgAmount = expectedBilling.avgPerFlat;

    return [
      {
        week: 1,
        startDay: 1,
        endDay: 7,
        expectedFlats: weeklyDistribution[0],
        expectedAmount: Math.round(weeklyDistribution[0] * avgAmount * 0.95)
      },
      {
        week: 2,
        startDay: 8,
        endDay: 14,
        expectedFlats: weeklyDistribution[1],
        expectedAmount: Math.round(weeklyDistribution[1] * avgAmount * 0.90)
      },
      {
        week: 3,
        startDay: 15,
        endDay: 21,
        expectedFlats: weeklyDistribution[2],
        expectedAmount: Math.round(weeklyDistribution[2] * avgAmount * 0.80)
      },
      {
        week: 4,
        startDay: 22,
        endDay: 31,
        expectedFlats: weeklyDistribution[3] + weeklyDistribution[4],
        expectedAmount: Math.round((weeklyDistribution[3] + weeklyDistribution[4]) * avgAmount * 0.70)
      }
    ];
  }

  getHistoricalComparison(bills, payments, targetMonth) {
    // Get data from same month last year
    const lastYear = new Date().getFullYear() - 1;

    const historicalBills = bills.filter(b =>
      b.month === targetMonth && b.year === lastYear
    );

    const historicalPayments = payments.filter(p => {
      const date = new Date(p.paymentDate);
      return date.getMonth() + 1 === targetMonth && date.getFullYear() === lastYear;
    });

    const totalBilled = historicalBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const totalCollected = historicalPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      year: lastYear,
      totalBilled,
      totalCollected,
      collectionRate: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) / 100 : 0,
      billCount: historicalBills.length,
      paymentCount: historicalPayments.length
    };
  }

  analyzeCollectionRisk(patterns, expectedBilling) {
    const highRisk = patterns.filter(p => p.riskScore > 0.7);
    const mediumRisk = patterns.filter(p => p.riskScore > 0.4 && p.riskScore <= 0.7);

    const avgAmount = expectedBilling.avgPerFlat;
    const atRiskAmount = (highRisk.length * avgAmount * 0.6) + (mediumRisk.length * avgAmount * 0.85);

    return {
      highRiskFlats: highRisk.length,
      mediumRiskFlats: mediumRisk.length,
      totalAtRiskAmount: Math.round(atRiskAmount),
      riskPercentage: Math.round((atRiskAmount / expectedBilling.total) * 100)
    };
  }

  // Generate multi-month forecast
  async forecastQuarter(startMonth, startYear) {
    const forecasts = [];

    let month = startMonth;
    let year = startYear;

    for (let i = 0; i < 3; i++) {
      const forecast = await this.forecastMonth(month, year);
      forecasts.push(forecast);

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return {
      forecasts,
      summary: {
        totalExpectedBilling: forecasts.reduce((sum, f) => sum + f.expectedBilling, 0),
        totalExpectedCollection: forecasts.reduce((sum, f) => sum + f.expectedCollection, 0),
        avgCollectionRate: forecasts.reduce((sum, f) => sum + f.collectionRate, 0) / 3,
        avgConfidence: forecasts.reduce((sum, f) => sum + f.confidence, 0) / 3
      }
    };
  }
}

window.CashFlowForecaster = CashFlowForecaster;
```

### Phase 3: Recommendation Engine (Week 3-4)

#### 6.3.1 LLM-Based Recommendation Engine

```javascript
// js/predictive/recommendation-engine.js

class RecommendationEngine {
  constructor(config = {}) {
    this.apiKey = config.apiKey || PREDICTION_CONFIG.claudeApiKey;
    this.storage = config.storage;
  }

  async generateRecommendations(societyData) {
    // Prepare context for LLM
    const context = this.prepareContext(societyData);

    const systemPrompt = `You are an AI assistant for a residential society billing management system in India.
Analyze the provided data and generate actionable recommendations to improve bill collection.

Focus on:
1. Identifying at-risk accounts that need attention
2. Optimal timing for reminders based on payment patterns
3. Suggesting payment plans for accounts with high outstanding amounts
4. Detecting unusual patterns or anomalies
5. Strategies to convert chronic late payers to on-time payers

Output your recommendations in the following JSON format:
{
  "recommendations": [
    {
      "type": "early_reminder|payment_plan|escalation|incentive|process_improvement",
      "priority": "high|medium|low",
      "targetFlats": ["A-101", "B-205"],
      "title": "Short title",
      "description": "Detailed description",
      "suggestedAction": {
        "type": "action_type",
        "params": {}
      },
      "expectedImpact": "Description of expected improvement"
    }
  ],
  "insights": [
    {
      "category": "pattern|risk|opportunity",
      "insight": "Description of the insight",
      "supportingData": "Relevant numbers"
    }
  ],
  "summary": "Overall summary of findings"
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `Here is the society billing data to analyze:\n\n${JSON.stringify(context, null, 2)}`
          }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        return this.processRecommendations(recommendations, societyData);
      }

      return { recommendations: [], insights: [], summary: 'Unable to generate recommendations' };
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return this.getFallbackRecommendations(societyData);
    }
  }

  prepareContext(societyData) {
    const { patterns, forecasts, pendingBills, recentPayments, settings } = societyData;

    // Summarize payment patterns
    const patternSummary = {
      totalFlats: patterns.length,
      byPayerType: {
        early: patterns.filter(p => p.payerType === 'early').length,
        onTime: patterns.filter(p => p.payerType === 'on-time').length,
        late: patterns.filter(p => p.payerType === 'late').length,
        chronicLate: patterns.filter(p => p.payerType === 'chronic-late').length
      },
      highRiskFlats: patterns.filter(p => p.riskScore > 0.6).map(p => ({
        flatNo: p.flatNo,
        riskScore: p.riskScore,
        riskFactors: p.riskFactors,
        avgDaysToPayment: p.avgDaysToPayment
      })),
      avgCollectionTime: Math.round(
        patterns.reduce((sum, p) => sum + (p.avgDaysToPayment || 15), 0) / patterns.length
      )
    };

    // Summarize pending bills
    const pendingSummary = {
      totalPending: pendingBills.length,
      totalAmount: pendingBills.reduce((sum, b) => sum + (b.grandTotal - (b.paidAmount || 0)), 0),
      overdueCount: pendingBills.filter(b => new Date(b.dueDate) < new Date()).length,
      byAgeBucket: {
        current: pendingBills.filter(b => {
          const age = Math.floor((new Date() - new Date(b.generatedAt)) / (1000 * 60 * 60 * 24));
          return age <= 30;
        }).length,
        '31-60days': pendingBills.filter(b => {
          const age = Math.floor((new Date() - new Date(b.generatedAt)) / (1000 * 60 * 60 * 24));
          return age > 30 && age <= 60;
        }).length,
        '61-90days': pendingBills.filter(b => {
          const age = Math.floor((new Date() - new Date(b.generatedAt)) / (1000 * 60 * 60 * 24));
          return age > 60 && age <= 90;
        }).length,
        over90days: pendingBills.filter(b => {
          const age = Math.floor((new Date() - new Date(b.generatedAt)) / (1000 * 60 * 60 * 24));
          return age > 90;
        }).length
      },
      largestOutstanding: pendingBills
        .sort((a, b) => (b.grandTotal - (b.paidAmount || 0)) - (a.grandTotal - (a.paidAmount || 0)))
        .slice(0, 5)
        .map(b => ({
          flatNo: b.flatNo,
          amount: b.grandTotal - (b.paidAmount || 0),
          monthsOverdue: Math.floor((new Date() - new Date(b.generatedAt)) / (1000 * 60 * 60 * 24 * 30))
        }))
    };

    // Collection trends
    const collectionTrends = {
      lastMonthCollection: recentPayments.reduce((sum, p) => sum + p.amount, 0),
      paymentCount: recentPayments.length,
      avgPaymentAmount: recentPayments.length > 0
        ? Math.round(recentPayments.reduce((sum, p) => sum + p.amount, 0) / recentPayments.length)
        : 0
    };

    return {
      societyName: settings?.name || 'Society',
      patternSummary,
      pendingSummary,
      collectionTrends,
      forecast: forecasts?.[0] || null
    };
  }

  processRecommendations(llmOutput, societyData) {
    const { recommendations, insights, summary } = llmOutput;

    // Add IDs and timestamps
    const processedRecommendations = recommendations.map(rec => ({
      id: crypto.randomUUID(),
      ...rec,
      status: 'pending',
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    return {
      recommendations: processedRecommendations,
      insights,
      summary,
      generatedAt: new Date().toISOString()
    };
  }

  getFallbackRecommendations(societyData) {
    // Rule-based fallback when LLM is unavailable
    const recommendations = [];
    const { patterns, pendingBills } = societyData;

    // Recommend early reminders for late payers
    const latePayers = patterns.filter(p =>
      p.payerType === 'late' || p.payerType === 'chronic-late'
    );

    if (latePayers.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'early_reminder',
        priority: 'high',
        targetFlats: latePayers.slice(0, 10).map(p => p.flatNo),
        title: `Send early reminders to ${latePayers.length} late-paying flats`,
        description: `These flats have a history of late payments. Sending reminders 5 days before due date may improve collection.`,
        suggestedAction: {
          type: 'schedule_reminder',
          params: { daysBefore: 5 }
        },
        expectedImpact: 'Potential 15-20% improvement in on-time collection',
        status: 'pending',
        generatedAt: new Date().toISOString()
      });
    }

    // Recommend payment plans for high outstanding
    const highOutstanding = pendingBills
      .filter(b => (b.grandTotal - (b.paidAmount || 0)) > 10000)
      .slice(0, 5);

    if (highOutstanding.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'payment_plan',
        priority: 'medium',
        targetFlats: highOutstanding.map(b => b.flatNo),
        title: `Offer payment plans to ${highOutstanding.length} flats with high outstanding`,
        description: 'These flats have outstanding amounts over ₹10,000. A structured payment plan may help recover dues.',
        suggestedAction: {
          type: 'create_payment_plan',
          params: { installments: 3 }
        },
        expectedImpact: 'Higher recovery rate for large outstanding amounts',
        status: 'pending',
        generatedAt: new Date().toISOString()
      });
    }

    return {
      recommendations,
      insights: [],
      summary: 'Generated basic recommendations based on payment patterns.',
      generatedAt: new Date().toISOString()
    };
  }

  // Store and track recommendation outcomes
  async trackRecommendationOutcome(recommendationId, outcome) {
    const recommendations = await this.storage.read('Recommendations') || [];
    const index = recommendations.findIndex(r => r.id === recommendationId);

    if (index >= 0) {
      recommendations[index] = {
        ...recommendations[index],
        status: outcome.accepted ? 'implemented' : 'rejected',
        adminResponse: outcome.response,
        implementedAt: outcome.accepted ? new Date().toISOString() : null,
        outcomeTracking: outcome.tracking || null
      };

      await this.storage.write('Recommendations', recommendations);
    }
  }
}

window.RecommendationEngine = RecommendationEngine;
```

### Phase 4: Automation Engine (Week 4-5)

#### 6.4.1 Smart Reminder System

```javascript
// js/automation/smart-reminders.js

class SmartReminderSystem {
  constructor(storage, config = {}) {
    this.storage = storage;
    this.config = {
      emailProvider: config.emailProvider || 'sendgrid',
      smsProvider: config.smsProvider || 'twilio',
      ...config
    };
  }

  async generateReminderSchedule(month, year) {
    const [patterns, bills, flats] = await Promise.all([
      this.storage.read('PaymentPatterns'),
      this.storage.read('Bills'),
      this.storage.read('Flats')
    ]);

    const pendingBills = bills.filter(b =>
      b.month === month &&
      b.year === year &&
      b.status !== 'paid'
    );

    const schedule = [];

    for (const bill of pendingBills) {
      const pattern = patterns.find(p => p.flatId === bill.flatId);
      const flat = flats.find(f => f.id === bill.flatId);

      if (!flat) continue;

      const reminderPlan = this.createReminderPlan(bill, pattern, flat);
      schedule.push(...reminderPlan);
    }

    // Sort by scheduled date
    schedule.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

    return schedule;
  }

  createReminderPlan(bill, pattern, flat) {
    const reminders = [];
    const dueDate = new Date(bill.dueDate);
    const today = new Date();

    // Determine payer type and strategy
    const payerType = pattern?.payerType || 'unknown';
    const strategy = this.getReminderStrategy(payerType);

    // Pre-due reminders
    for (const preDays of strategy.preDueReminders) {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - preDays);

      if (reminderDate > today) {
        reminders.push({
          id: crypto.randomUUID(),
          billId: bill.id,
          flatId: bill.flatId,
          flatNo: flat.flatNo,
          type: 'pre_due',
          channel: strategy.preferredChannel,
          scheduledFor: reminderDate.toISOString(),
          template: this.selectTemplate('pre_due', preDays, bill),
          priority: preDays <= 3 ? 'high' : 'medium',
          status: 'scheduled'
        });
      }
    }

    // Due date reminder
    if (dueDate > today) {
      reminders.push({
        id: crypto.randomUUID(),
        billId: bill.id,
        flatId: bill.flatId,
        flatNo: flat.flatNo,
        type: 'due_date',
        channel: 'all',
        scheduledFor: dueDate.toISOString(),
        template: this.selectTemplate('due_date', 0, bill),
        priority: 'high',
        status: 'scheduled'
      });
    }

    // Post-due reminders (escalation)
    for (let i = 0; i < strategy.postDueReminders.length; i++) {
      const postDays = strategy.postDueReminders[i];
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() + postDays);

      if (reminderDate > today) {
        const escalationLevel = i + 1;
        reminders.push({
          id: crypto.randomUUID(),
          billId: bill.id,
          flatId: bill.flatId,
          flatNo: flat.flatNo,
          type: 'overdue',
          channel: escalationLevel >= 2 ? 'all' : strategy.preferredChannel,
          scheduledFor: reminderDate.toISOString(),
          template: this.selectTemplate('overdue', postDays, bill, escalationLevel),
          priority: 'high',
          escalationLevel,
          status: 'scheduled'
        });
      }
    }

    return reminders;
  }

  getReminderStrategy(payerType) {
    const strategies = {
      'early': {
        preDueReminders: [7],              // Just one early notification
        postDueReminders: [7, 15],         // Gentle follow-ups
        preferredChannel: 'email'
      },
      'on-time': {
        preDueReminders: [5, 2],           // Standard reminders
        postDueReminders: [3, 7, 15],
        preferredChannel: 'email'
      },
      'late': {
        preDueReminders: [7, 3, 1],        // More frequent reminders
        postDueReminders: [1, 3, 7, 14],
        preferredChannel: 'sms'            // SMS for urgency
      },
      'chronic-late': {
        preDueReminders: [10, 5, 2, 1],    // Aggressive pre-due
        postDueReminders: [1, 2, 5, 10, 15, 20],
        preferredChannel: 'all'            // All channels
      },
      'unknown': {
        preDueReminders: [5, 1],
        postDueReminders: [3, 7, 14],
        preferredChannel: 'email'
      }
    };

    return strategies[payerType] || strategies.unknown;
  }

  selectTemplate(type, days, bill, escalationLevel = 0) {
    const templates = {
      'pre_due': {
        subject: `Society Maintenance Due in ${days} Days - ${bill.flatNo}`,
        body: `Dear Resident,

This is a friendly reminder that your society maintenance bill of ₹${bill.grandTotal.toLocaleString()} is due on ${new Date(bill.dueDate).toLocaleDateString()}.

Bill Details:
- Bill No: ${bill.billNo}
- Amount: ₹${bill.grandTotal.toLocaleString()}
- Due Date: ${new Date(bill.dueDate).toLocaleDateString()}

Please ensure timely payment to avoid late fees.

Pay Online: [PAYMENT_LINK]

Thank you,
Society Management`
      },
      'due_date': {
        subject: `REMINDER: Maintenance Payment Due Today - ${bill.flatNo}`,
        body: `Dear Resident,

Your society maintenance payment of ₹${bill.grandTotal.toLocaleString()} is due TODAY.

Pay now to avoid late fees: [PAYMENT_LINK]

Society Management`
      },
      'overdue': {
        subject: escalationLevel >= 2
          ? `URGENT: Overdue Maintenance Payment - ${bill.flatNo}`
          : `Overdue: Maintenance Payment - ${bill.flatNo}`,
        body: escalationLevel >= 3
          ? `Dear Resident,

Your maintenance payment is ${days} days overdue. This is our ${escalationLevel}${this.getOrdinalSuffix(escalationLevel)} reminder.

Outstanding: ₹${bill.grandTotal.toLocaleString()}
Late Fee: ₹${Math.round(bill.grandTotal * 0.02 * escalationLevel).toLocaleString()}

Please pay immediately to avoid:
- Further late fees
- Disconnection of common facilities
- Legal action by the society

Pay Now: [PAYMENT_LINK]

Society Management`
          : `Dear Resident,

Your maintenance payment of ₹${bill.grandTotal.toLocaleString()} is ${days} days overdue.

Please pay at your earliest convenience to avoid late fees.

Pay Online: [PAYMENT_LINK]

Society Management`
      }
    };

    return templates[type] || templates.pre_due;
  }

  getOrdinalSuffix(num) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  async sendReminder(reminder) {
    const flat = (await this.storage.read('Flats')).find(f => f.id === reminder.flatId);

    if (!flat) {
      return { success: false, error: 'Flat not found' };
    }

    const results = [];

    // Send via configured channels
    if (reminder.channel === 'email' || reminder.channel === 'all') {
      if (flat.ownerEmail) {
        const emailResult = await this.sendEmail(flat.ownerEmail, reminder.template);
        results.push({ channel: 'email', ...emailResult });
      }
    }

    if (reminder.channel === 'sms' || reminder.channel === 'all') {
      if (flat.ownerPhone) {
        const smsResult = await this.sendSMS(flat.ownerPhone, reminder.template.body);
        results.push({ channel: 'sms', ...smsResult });
      }
    }

    // Update reminder status
    reminder.status = results.every(r => r.success) ? 'sent' : 'partial';
    reminder.sentAt = new Date().toISOString();
    reminder.results = results;

    return {
      success: results.some(r => r.success),
      results
    };
  }

  async sendEmail(to, template) {
    // SendGrid integration
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: this.config.fromEmail, name: 'Society Management' },
          subject: template.subject,
          content: [{ type: 'text/plain', value: template.body }]
        })
      });

      return { success: response.ok, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendSMS(to, message) {
    // Twilio integration
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${this.config.twilioAccountSid}:${this.config.twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: to,
            From: this.config.twilioFromNumber,
            Body: message.substring(0, 160) // SMS limit
          })
        }
      );

      return { success: response.ok, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Process all due reminders
  async processScheduledReminders() {
    const schedule = await this.storage.read('ReminderSchedule') || [];
    const now = new Date();

    const dueReminders = schedule.filter(r =>
      r.status === 'scheduled' &&
      new Date(r.scheduledFor) <= now
    );

    const results = [];

    for (const reminder of dueReminders) {
      const result = await this.sendReminder(reminder);
      results.push({ reminderId: reminder.id, ...result });
    }

    // Update schedule
    await this.storage.write('ReminderSchedule', schedule);

    // Log automation
    await this.logAutomation('reminder', dueReminders.length, results);

    return results;
  }

  async logAutomation(type, targetCount, results) {
    const logs = await this.storage.read('AutomationLogs') || [];

    logs.push({
      id: crypto.randomUUID(),
      type,
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'scheduled',
      action: 'send_reminder',
      targetCount,
      status: results.every(r => r.success) ? 'success' : 'partial',
      successCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length
    });

    await this.storage.write('AutomationLogs', logs);
  }
}

window.SmartReminderSystem = SmartReminderSystem;
```

### Phase 5: Prediction Dashboard (Week 5-6)

```javascript
// js/admin/prediction-dashboard.js

class PredictionDashboard {
  constructor(container, storage) {
    this.container = container;
    this.storage = storage;

    // Initialize components
    this.featureExtractor = new FeatureExtractor(storage);
    this.paymentPredictor = new PaymentPredictor(storage);
    this.cashFlowForecaster = new CashFlowForecaster(storage);
    this.recommendationEngine = new RecommendationEngine({ storage });
  }

  async render() {
    this.container.innerHTML = `
      <div class="prediction-dashboard">
        <header class="dashboard-header">
          <h1>Predictive Analytics</h1>
          <button class="btn btn-primary" id="refreshAnalytics">
            <span class="icon">🔄</span> Refresh Analysis
          </button>
        </header>

        <div class="dashboard-grid">
          <!-- Collection Forecast -->
          <section class="dashboard-card forecast-card">
            <h2>Collection Forecast</h2>
            <div id="forecastContent" class="card-content">
              <div class="loading">Analyzing...</div>
            </div>
          </section>

          <!-- Payment Predictions -->
          <section class="dashboard-card predictions-card">
            <h2>Payment Predictions</h2>
            <div id="predictionsContent" class="card-content">
              <div class="loading">Analyzing...</div>
            </div>
          </section>

          <!-- Risk Analysis -->
          <section class="dashboard-card risk-card">
            <h2>Risk Analysis</h2>
            <div id="riskContent" class="card-content">
              <div class="loading">Analyzing...</div>
            </div>
          </section>

          <!-- AI Recommendations -->
          <section class="dashboard-card recommendations-card full-width">
            <h2>AI Recommendations</h2>
            <div id="recommendationsContent" class="card-content">
              <div class="loading">Generating recommendations...</div>
            </div>
          </section>

          <!-- Payer Distribution -->
          <section class="dashboard-card distribution-card">
            <h2>Payer Distribution</h2>
            <div id="distributionContent" class="card-content">
              <div class="loading">Analyzing...</div>
            </div>
          </section>

          <!-- Automation Status -->
          <section class="dashboard-card automation-card">
            <h2>Automation Status</h2>
            <div id="automationContent" class="card-content">
              <div class="loading">Loading...</div>
            </div>
          </section>
        </div>
      </div>
    `;

    this.bindEvents();
    await this.loadAllData();
  }

  bindEvents() {
    document.getElementById('refreshAnalytics').addEventListener('click', () => {
      this.loadAllData(true);
    });
  }

  async loadAllData(forceRefresh = false) {
    try {
      // Show loading states
      document.querySelectorAll('.card-content').forEach(el => {
        el.innerHTML = '<div class="loading">Analyzing...</div>';
      });

      // Refresh patterns if needed
      if (forceRefresh) {
        await this.featureExtractor.analyzeAllFlats();
      }

      // Load all data in parallel
      const [patterns, bills, payments, settings] = await Promise.all([
        this.storage.read('PaymentPatterns'),
        this.storage.read('Bills'),
        this.storage.read('Payments'),
        this.storage.read('Settings')
      ]);

      const pendingBills = bills.filter(b => b.status !== 'paid');
      const recentPayments = payments.filter(p => {
        const date = new Date(p.paymentDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
      });

      // Run analyses in parallel
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [forecast, predictions, recommendations] = await Promise.all([
        this.cashFlowForecaster.forecastMonth(currentMonth, currentYear),
        this.paymentPredictor.predictAllPending(),
        this.recommendationEngine.generateRecommendations({
          patterns: patterns || [],
          pendingBills,
          recentPayments,
          settings
        })
      ]);

      // Render all sections
      this.renderForecast(forecast);
      this.renderPredictions(predictions);
      this.renderRiskAnalysis(patterns || [], pendingBills);
      this.renderRecommendations(recommendations);
      this.renderDistribution(patterns || []);
      this.renderAutomationStatus();

    } catch (error) {
      console.error('Failed to load analytics:', error);
      this.showError('Failed to load analytics. Please try again.');
    }
  }

  renderForecast(forecast) {
    const container = document.getElementById('forecastContent');

    const collectionRate = Math.round(forecast.collectionRate * 100);
    const confidence = Math.round(forecast.confidence * 100);

    container.innerHTML = `
      <div class="forecast-summary">
        <div class="forecast-metric">
          <span class="metric-value">₹${forecast.expectedCollection.toLocaleString()}</span>
          <span class="metric-label">Expected Collection</span>
        </div>
        <div class="forecast-metric">
          <span class="metric-value">${collectionRate}%</span>
          <span class="metric-label">Collection Rate</span>
        </div>
        <div class="forecast-metric">
          <span class="metric-value">${confidence}%</span>
          <span class="metric-label">Confidence</span>
        </div>
      </div>

      <div class="weekly-forecast">
        <h3>Weekly Breakdown</h3>
        <div class="weekly-chart">
          ${forecast.weeklyForecast.map(week => `
            <div class="week-bar">
              <div class="bar" style="height: ${(week.expectedAmount / forecast.expectedCollection) * 100}%">
                <span class="bar-value">₹${(week.expectedAmount / 1000).toFixed(0)}K</span>
              </div>
              <span class="bar-label">Week ${week.week}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="forecast-comparison">
        <h3>vs Last Year</h3>
        <div class="comparison-row">
          <span>Collection Rate:</span>
          <span class="comparison-value ${forecast.collectionRate > forecast.historical.collectionRate ? 'positive' : 'negative'}">
            ${forecast.historical.collectionRate > 0
              ? `${collectionRate > forecast.historical.collectionRate * 100 ? '↑' : '↓'}
                 ${Math.abs(collectionRate - forecast.historical.collectionRate * 100).toFixed(1)}%`
              : 'No data'}
          </span>
        </div>
      </div>
    `;
  }

  renderPredictions(predictions) {
    const container = document.getElementById('predictionsContent');

    // Group by prediction timing
    const today = new Date();
    const groups = {
      thisWeek: predictions.filter(p => {
        const d = new Date(p.predictedDate);
        return d <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      }),
      nextWeek: predictions.filter(p => {
        const d = new Date(p.predictedDate);
        return d > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) &&
               d <= new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      }),
      later: predictions.filter(p => {
        const d = new Date(p.predictedDate);
        return d > new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      })
    };

    container.innerHTML = `
      <div class="prediction-groups">
        <div class="prediction-group">
          <h3>Expected This Week (${groups.thisWeek.length})</h3>
          <div class="prediction-list">
            ${groups.thisWeek.slice(0, 5).map(p => this.renderPredictionItem(p)).join('')}
            ${groups.thisWeek.length > 5 ? `<div class="more-link">+${groups.thisWeek.length - 5} more</div>` : ''}
          </div>
        </div>

        <div class="prediction-group">
          <h3>Expected Next Week (${groups.nextWeek.length})</h3>
          <div class="prediction-list">
            ${groups.nextWeek.slice(0, 3).map(p => this.renderPredictionItem(p)).join('')}
            ${groups.nextWeek.length > 3 ? `<div class="more-link">+${groups.nextWeek.length - 3} more</div>` : ''}
          </div>
        </div>

        <div class="prediction-group">
          <h3>Uncertain/Later (${groups.later.length})</h3>
          <div class="prediction-list">
            ${groups.later.slice(0, 3).map(p => this.renderPredictionItem(p)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderPredictionItem(prediction) {
    const confidence = Math.round(prediction.confidence * 100);
    const confidenceClass = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';

    return `
      <div class="prediction-item">
        <div class="prediction-flat">${prediction.flatNo || 'Unknown'}</div>
        <div class="prediction-date">${new Date(prediction.predictedDate).toLocaleDateString()}</div>
        <div class="prediction-confidence ${confidenceClass}">${confidence}%</div>
      </div>
    `;
  }

  renderRiskAnalysis(patterns, pendingBills) {
    const container = document.getElementById('riskContent');

    const highRisk = patterns.filter(p => p.riskScore > 0.7);
    const mediumRisk = patterns.filter(p => p.riskScore > 0.4 && p.riskScore <= 0.7);

    // Calculate at-risk amount
    const avgBill = pendingBills.length > 0
      ? pendingBills.reduce((sum, b) => sum + b.grandTotal, 0) / pendingBills.length
      : 0;

    const atRiskAmount = (highRisk.length + mediumRisk.length * 0.5) * avgBill;

    container.innerHTML = `
      <div class="risk-summary">
        <div class="risk-metric high-risk">
          <span class="metric-value">${highRisk.length}</span>
          <span class="metric-label">High Risk Flats</span>
        </div>
        <div class="risk-metric medium-risk">
          <span class="metric-value">${mediumRisk.length}</span>
          <span class="metric-label">Medium Risk</span>
        </div>
        <div class="risk-metric at-risk-amount">
          <span class="metric-value">₹${Math.round(atRiskAmount).toLocaleString()}</span>
          <span class="metric-label">At-Risk Amount</span>
        </div>
      </div>

      <div class="high-risk-list">
        <h3>High Risk Accounts</h3>
        ${highRisk.slice(0, 5).map(p => `
          <div class="risk-item">
            <span class="flat-no">${p.flatNo}</span>
            <span class="risk-score">${Math.round(p.riskScore * 100)}%</span>
            <span class="risk-factors">${p.riskFactors.slice(0, 2).join(', ')}</span>
          </div>
        `).join('')}
        ${highRisk.length === 0 ? '<div class="empty-state">No high-risk accounts</div>' : ''}
      </div>
    `;
  }

  renderRecommendations(data) {
    const container = document.getElementById('recommendationsContent');
    const { recommendations, insights, summary } = data;

    container.innerHTML = `
      <div class="recommendations-summary">
        <p>${summary}</p>
      </div>

      <div class="recommendations-list">
        ${recommendations.map(rec => `
          <div class="recommendation-item priority-${rec.priority}">
            <div class="rec-header">
              <span class="rec-type ${rec.type}">${rec.type.replace('_', ' ')}</span>
              <span class="rec-priority">${rec.priority}</span>
            </div>
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
            <div class="rec-actions">
              <button class="btn btn-sm btn-primary" onclick="implementRecommendation('${rec.id}')">
                Implement
              </button>
              <button class="btn btn-sm btn-secondary" onclick="dismissRecommendation('${rec.id}')">
                Dismiss
              </button>
            </div>
          </div>
        `).join('')}
        ${recommendations.length === 0 ? '<div class="empty-state">No recommendations at this time</div>' : ''}
      </div>

      ${insights.length > 0 ? `
        <div class="insights-section">
          <h3>Key Insights</h3>
          ${insights.map(ins => `
            <div class="insight-item ${ins.category}">
              <span class="insight-icon">${ins.category === 'pattern' ? '📊' : ins.category === 'risk' ? '⚠️' : '💡'}</span>
              <span class="insight-text">${ins.insight}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  renderDistribution(patterns) {
    const container = document.getElementById('distributionContent');

    const distribution = {
      early: patterns.filter(p => p.payerType === 'early').length,
      'on-time': patterns.filter(p => p.payerType === 'on-time').length,
      late: patterns.filter(p => p.payerType === 'late').length,
      'chronic-late': patterns.filter(p => p.payerType === 'chronic-late').length,
      unknown: patterns.filter(p => !p.payerType || p.payerType === 'unknown').length
    };

    const total = patterns.length || 1;

    container.innerHTML = `
      <div class="distribution-chart">
        ${Object.entries(distribution).map(([type, count]) => `
          <div class="distribution-row">
            <span class="dist-label">${type}</span>
            <div class="dist-bar-container">
              <div class="dist-bar ${type}" style="width: ${(count / total) * 100}%"></div>
            </div>
            <span class="dist-count">${count} (${Math.round((count / total) * 100)}%)</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  async renderAutomationStatus() {
    const container = document.getElementById('automationContent');
    const logs = await this.storage.read('AutomationLogs') || [];

    // Get recent logs
    const recentLogs = logs
      .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt))
      .slice(0, 5);

    container.innerHTML = `
      <div class="automation-status">
        <div class="status-row">
          <span>Auto Bill Generation</span>
          <span class="status-badge active">Active</span>
        </div>
        <div class="status-row">
          <span>Smart Reminders</span>
          <span class="status-badge active">Active</span>
        </div>
        <div class="status-row">
          <span>Risk Analysis</span>
          <span class="status-badge active">Daily</span>
        </div>
      </div>

      <div class="automation-logs">
        <h3>Recent Activity</h3>
        ${recentLogs.map(log => `
          <div class="log-item">
            <span class="log-type">${log.type}</span>
            <span class="log-status ${log.status}">${log.status}</span>
            <span class="log-time">${new Date(log.triggeredAt).toLocaleString()}</span>
          </div>
        `).join('')}
        ${recentLogs.length === 0 ? '<div class="empty-state">No recent activity</div>' : ''}
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-state">
        <h2>Error</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

window.PredictionDashboard = PredictionDashboard;
```

---

## 7. Google Apps Script Scheduled Tasks

```javascript
// api/scheduled-tasks.gs

// Run daily at 6 AM
function dailyTasks() {
  // 1. Analyze payment patterns
  analyzeAllPatterns();

  // 2. Generate predictions for pending bills
  generatePredictions();

  // 3. Process scheduled reminders
  processReminders();

  // 4. Generate recommendations
  generateDailyRecommendations();
}

// Run on 1st of each month
function monthlyTasks() {
  // 1. Auto-generate bills
  autoGenerateBills();

  // 2. Generate cash flow forecast
  generateMonthlyForecast();

  // 3. Archive old data
  archiveOldData();
}

function autoGenerateBills() {
  const societies = getSocietyList();

  for (const society of societies) {
    try {
      const settings = getSettings(society.id);
      const flats = getFlats(society.id);
      const chargeTypes = getChargeTypes(society.id);

      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Check if billing day
      if (today.getDate() !== (settings.billingDay || 1)) {
        continue;
      }

      // Generate bills for all active flats
      const bills = [];
      for (const flat of flats) {
        if (!flat.isActive) continue;

        const bill = generateBill(flat, chargeTypes, month, year, settings);
        bills.push(bill);
      }

      // Save bills
      saveBills(society.id, bills);

      // Log automation
      logAutomation(society.id, 'bill_generation', bills.length, 'success');

    } catch (error) {
      logAutomation(society.id, 'bill_generation', 0, 'failed', error.message);
    }
  }
}

function processReminders() {
  const societies = getSocietyList();

  for (const society of societies) {
    try {
      const schedule = getReminderSchedule(society.id);
      const now = new Date();

      const dueReminders = schedule.filter(r =>
        r.status === 'scheduled' &&
        new Date(r.scheduledFor) <= now
      );

      let successCount = 0;
      let failedCount = 0;

      for (const reminder of dueReminders) {
        const result = sendReminder(society.id, reminder);
        if (result.success) {
          successCount++;
          reminder.status = 'sent';
          reminder.sentAt = now.toISOString();
        } else {
          failedCount++;
          reminder.status = 'failed';
          reminder.error = result.error;
        }
      }

      // Update schedule
      saveReminderSchedule(society.id, schedule);

      // Log
      logAutomation(society.id, 'reminder', dueReminders.length,
        failedCount === 0 ? 'success' : 'partial');

    } catch (error) {
      logAutomation(society.id, 'reminder', 0, 'failed', error.message);
    }
  }
}

// Set up triggers (run once)
function setupTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Daily task at 6 AM
  ScriptApp.newTrigger('dailyTasks')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  // Monthly task on 1st at 5 AM
  ScriptApp.newTrigger('monthlyTasks')
    .timeBased()
    .onMonthDay(1)
    .atHour(5)
    .create();
}
```

---

## 8. Configuration

```javascript
// js/config/prediction-config.js

const PREDICTION_CONFIG = {
  // API Keys (should be environment variables in production)
  claudeApiKey: 'YOUR_CLAUDE_API_KEY',
  sendgridApiKey: 'YOUR_SENDGRID_API_KEY',
  twilioAccountSid: 'YOUR_TWILIO_SID',
  twilioAuthToken: 'YOUR_TWILIO_TOKEN',
  twilioFromNumber: '+1234567890',

  // Email settings
  fromEmail: 'noreply@yoursociety.com',

  // Prediction settings
  minDataPoints: 3,                    // Minimum bills for prediction
  predictionConfidenceThreshold: 0.6,  // Below this, use defaults

  // Risk thresholds
  highRiskThreshold: 0.7,
  mediumRiskThreshold: 0.4,

  // Automation settings
  enableAutoReminders: true,
  enableAutoBillGeneration: true,
  enableDailyAnalysis: true,

  // Feature flags
  useLLMRecommendations: true,
  useTensorFlowPredictions: false      // Future enhancement
};

window.PREDICTION_CONFIG = PREDICTION_CONFIG;
```

---

## 9. Testing Plan

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-P-001 | Extract features for flat with 12 months data | Complete feature set generated |
| TC-P-002 | Extract features for new flat (1 month) | Returns null or partial features |
| TC-P-003 | Predict payment for early payer | High confidence, early date |
| TC-P-004 | Predict payment for chronic late payer | Lower confidence, later date |
| TC-P-005 | Forecast month with mixed payer types | Reasonable collection estimate |
| TC-P-006 | Generate recommendations for society with defaulters | Actionable recommendations |
| TC-P-007 | Schedule reminders for late payer | More aggressive schedule |
| TC-P-008 | Auto-generate bills on billing day | Bills created for all active flats |
| TC-P-009 | Process scheduled reminders | Reminders sent, status updated |
| TC-P-010 | Dashboard renders all sections | No errors, data displayed |

---

## 10. Cost Estimation

| Item | Monthly Cost (500 flats) |
|------|-------------------------|
| Claude API (recommendations) | $10-20 |
| SendGrid (emails) | $0-15 (free tier: 100/day) |
| Twilio (SMS) | $20-50 (@ $0.05/SMS) |
| Google Apps Script | Free |
| **Total** | **$30-85/month** |

---

## 11. Security Considerations

1. **API Key Management**: Store keys securely, not in client-side code
2. **Data Privacy**: Anonymize data before sending to LLM
3. **Rate Limiting**: Implement limits on API calls
4. **Audit Logging**: Track all automated actions
5. **User Consent**: Get consent for automated communications
