# Design 5: Natural Language Query Dashboard
## Complete Implementation Plan

---

## 1. Overview

An intelligent dashboard where admins can ask questions in plain English (or Hindi) instead of navigating complex reports. The AI understands queries, fetches relevant data, generates visualizations, and provides actionable insights.

### Key Capabilities
- Natural language to SQL/data query conversion
- Dynamic chart and table generation
- Contextual follow-up questions
- Export results to CSV/PDF
- Saved queries and scheduled reports
- Multi-language support (English, Hindi)

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    QUERY INPUT                                    │  │
│   │   [🔍 "Which flats haven't paid for 3 months?"              🎤]  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   ┌─────────────────────┐  ┌─────────────────────────────────────────┐  │
│   │   SUGGESTED         │  │   RESULTS PANEL                         │  │
│   │   QUERIES           │  │   ┌─────────────────────────────────┐   │  │
│   │   • Top defaulters  │  │   │   📊 Chart / 📋 Table           │   │  │
│   │   • This month...   │  │   │                                   │   │  │
│   │   • Compare...      │  │   └─────────────────────────────────┘   │  │
│   └─────────────────────┘  │   ┌─────────────────────────────────┐   │  │
│                            │   │   💡 AI Insights                 │   │  │
│                            │   └─────────────────────────────────┘   │  │
│                            │   ┌─────────────────────────────────┐   │  │
│                            │   │   📥 Export  📌 Save Query      │   │  │
│                            │   └─────────────────────────────────┘   │  │
│                            └─────────────────────────────────────────┘  │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          PROCESSING LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    NL QUERY PROCESSOR                             │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│   │   │ Query       │  │ Intent      │  │ Data Query              │  │  │
│   │   │ Parser      │──│ Classifier  │──│ Generator               │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    DATA EXECUTION ENGINE                          │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│   │   │ Query       │  │ Data        │  │ Result                  │  │  │
│   │   │ Executor    │──│ Aggregator  │──│ Formatter               │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                                    ▼                                     │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    VISUALIZATION ENGINE                           │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│   │   │ Chart       │  │ Table       │  │ Insight                 │  │  │
│   │   │ Generator   │  │ Generator   │  │ Generator               │  │  │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   │
│   │  Flats    │  │  Bills    │  │ Payments  │  │  Other Sheets     │   │
│   └───────────┘  └───────────┘  └───────────┘  └───────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| NL Processing | Claude API | Query understanding |
| Charts | Chart.js | Visualizations |
| Tables | DataTables.js | Interactive tables |
| Export | jsPDF + SheetJS | PDF/Excel export |
| Voice Input | Web Speech API | Voice queries |
| Frontend | Existing HTML/JS | UI integration |

### Cost Estimation
- Claude API: ~$0.01-0.05 per query
- Other libraries: Free (open source)
- **Monthly (1000 queries)**: $10-50

---

## 4. File Structure

```
js/
├── nl-query/
│   ├── query-dashboard.js          # Main dashboard controller
│   ├── nl-processor.js             # Natural language processor
│   ├── query-executor.js           # Execute data queries
│   ├── data-aggregator.js          # Aggregate and transform data
│   ├── visualization-engine.js     # Generate charts/tables
│   ├── insight-generator.js        # AI-generated insights
│   ├── query-templates.js          # Pre-built query templates
│   ├── export-manager.js           # Export to PDF/CSV/Excel
│   └── query-history.js            # Saved queries management
├── components/
│   └── query-input.js              # Query input component
└── config/
    └── query-config.js             # Configuration

css/
└── query-dashboard.css             # Dashboard styles

lib/
├── chart.min.js                    # Chart.js library
└── datatables.min.js               # DataTables library
```

---

## 5. Supported Query Types

### 5.1 Query Categories

| Category | Example Queries | Data Sources |
|----------|----------------|--------------|
| **Outstanding** | "Which flats haven't paid?", "Total outstanding" | Bills, Payments |
| **Collection** | "How much collected today?", "This month's collection" | Payments |
| **Comparison** | "Compare Jan vs Feb collection", "YoY growth" | Bills, Payments |
| **Defaulters** | "Who owes more than ₹10,000?", "Chronic defaulters" | Bills, Flats |
| **Trends** | "Collection trend last 6 months", "Payment patterns" | Payments |
| **Flat Details** | "Show all 2BHK flats", "Vacant flats" | Flats |
| **Building** | "Building A collection", "Building-wise outstanding" | All |
| **Summary** | "Dashboard summary", "Today's snapshot" | All |

### 5.2 Query Intent Mapping

```javascript
const QUERY_INTENTS = {
  // Outstanding queries
  'OUTSTANDING_ALL': {
    patterns: ['outstanding', 'pending', 'due', "haven't paid", 'not paid'],
    dataNeeded: ['Bills', 'Flats'],
    visualization: 'table',
    aggregation: 'sum'
  },
  'OUTSTANDING_FLAT': {
    patterns: ['flat \\w+ outstanding', 'how much does \\w+ owe'],
    dataNeeded: ['Bills', 'Payments', 'Flats'],
    visualization: 'detail',
    aggregation: 'single'
  },
  'OUTSTANDING_DURATION': {
    patterns: ['(\\d+) months', 'overdue', 'more than'],
    dataNeeded: ['Bills', 'Flats'],
    visualization: 'table',
    aggregation: 'filter'
  },

  // Collection queries
  'COLLECTION_TODAY': {
    patterns: ['today', 'collected today'],
    dataNeeded: ['Payments'],
    visualization: 'stat',
    aggregation: 'sum_filtered'
  },
  'COLLECTION_PERIOD': {
    patterns: ['this month', 'last month', 'this week', 'january', 'february'],
    dataNeeded: ['Payments'],
    visualization: 'stat_with_chart',
    aggregation: 'sum_filtered'
  },
  'COLLECTION_COMPARISON': {
    patterns: ['compare', 'vs', 'versus', 'growth'],
    dataNeeded: ['Payments', 'Bills'],
    visualization: 'comparison_chart',
    aggregation: 'multi_period'
  },

  // Trend queries
  'TREND_COLLECTION': {
    patterns: ['trend', 'over time', 'last \\d+ months', 'history'],
    dataNeeded: ['Payments'],
    visualization: 'line_chart',
    aggregation: 'time_series'
  },

  // Building queries
  'BUILDING_SUMMARY': {
    patterns: ['building', 'block', 'tower'],
    dataNeeded: ['Bills', 'Payments', 'Flats'],
    visualization: 'bar_chart',
    aggregation: 'group_by_building'
  },

  // Summary
  'DASHBOARD_SUMMARY': {
    patterns: ['summary', 'overview', 'dashboard', 'snapshot'],
    dataNeeded: ['Bills', 'Payments', 'Flats'],
    visualization: 'multi_stat',
    aggregation: 'multiple'
  }
};
```

---

## 6. Implementation Phases

### Phase 1: NL Processor (Week 1-2)

#### 6.1.1 Natural Language Processor

```javascript
// js/nl-query/nl-processor.js

class NLQueryProcessor {
  constructor(config = {}) {
    this.apiKey = config.apiKey || NL_QUERY_CONFIG.claudeApiKey;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.dataSchema = null;
  }

  async initialize(storage) {
    // Build schema from actual data
    this.dataSchema = await this.buildDataSchema(storage);
  }

  async buildDataSchema(storage) {
    // Get sample data to understand schema
    const [flats, bills, payments] = await Promise.all([
      storage.read('Flats'),
      storage.read('Bills'),
      storage.read('Payments')
    ]);

    return {
      Flats: {
        fields: this.extractFields(flats[0]),
        count: flats.length,
        sample: flats.slice(0, 2)
      },
      Bills: {
        fields: this.extractFields(bills[0]),
        count: bills.length,
        sample: bills.slice(0, 2)
      },
      Payments: {
        fields: this.extractFields(payments[0]),
        count: payments.length,
        sample: payments.slice(0, 2)
      }
    };
  }

  extractFields(obj) {
    if (!obj) return [];
    return Object.entries(obj).map(([key, value]) => ({
      name: key,
      type: typeof value,
      example: value
    }));
  }

  async processQuery(userQuery, context = {}) {
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
            ...context.history || [],
            { role: 'user', content: userQuery }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;

      return this.parseResponse(content, userQuery);

    } catch (error) {
      console.error('NL processing error:', error);
      return {
        success: false,
        error: error.message,
        fallbackSuggestions: this.getFallbackSuggestions(userQuery)
      };
    }
  }

  buildSystemPrompt(context) {
    return `You are a data analyst assistant for a residential society billing management system in India.
Users ask questions in natural language (English or Hindi) about billing, payments, and society data.

Your job is to:
1. Understand the user's query intent
2. Generate a structured data query specification
3. Suggest the best visualization
4. Provide a natural language explanation

DATA SCHEMA:
${JSON.stringify(this.dataSchema, null, 2)}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "intent": "QUERY_TYPE",
  "explanation": "What this query will show in simple terms",
  "dataQuery": {
    "sources": ["Bills", "Flats"],
    "filters": [
      {"field": "status", "operator": "in", "value": ["pending", "partial"]},
      {"field": "dueDate", "operator": "<", "value": "{{today}}"}
    ],
    "joins": [
      {"from": "Bills", "to": "Flats", "on": "flatId"}
    ],
    "aggregations": [
      {"function": "sum", "field": "grandTotal", "as": "totalOutstanding"},
      {"function": "count", "field": "id", "as": "billCount"}
    ],
    "groupBy": ["flatId", "flatNo"],
    "orderBy": [{"field": "totalOutstanding", "direction": "desc"}],
    "limit": 20
  },
  "visualization": {
    "type": "table|bar_chart|line_chart|pie_chart|stat_cards|detail",
    "config": {
      "title": "Outstanding Bills by Flat",
      "xAxis": "flatNo",
      "yAxis": "totalOutstanding",
      "columns": ["flatNo", "ownerName", "totalOutstanding", "billCount"]
    }
  },
  "followUpQuestions": [
    "Send reminders to these flats?",
    "Show payment history for any flat?"
  ],
  "insights": [
    "5 flats have outstanding > ₹10,000",
    "Total outstanding is ₹2.5 lakhs"
  ]
}

SUPPORTED OPERATORS: =, !=, >, <, >=, <=, in, not_in, contains, between
SUPPORTED AGGREGATIONS: sum, count, avg, min, max, count_distinct
SUPPORTED VISUALIZATIONS: table, bar_chart, line_chart, pie_chart, stat_cards, detail, comparison

DATE PLACEHOLDERS: {{today}}, {{yesterday}}, {{this_month_start}}, {{last_month_start}}, {{this_year_start}}

If the query is unclear, set intent to "CLARIFICATION" and ask a clarifying question.
If query is a greeting or off-topic, set intent to "CONVERSATION" and respond appropriately.

Handle Hindi queries by translating internally:
- "kitna baaki hai" → Outstanding amount query
- "aaj kitna collect hua" → Today's collection
- "kaunse flat ne nahi diya" → Which flats haven't paid`;
  }

  parseResponse(content, originalQuery) {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.intent) {
        throw new Error('Missing intent in response');
      }

      return {
        success: true,
        originalQuery,
        ...parsed,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Parse error:', error);
      return {
        success: false,
        error: 'Failed to parse query',
        originalQuery,
        fallbackSuggestions: this.getFallbackSuggestions(originalQuery)
      };
    }
  }

  getFallbackSuggestions(query) {
    const lower = query.toLowerCase();

    if (lower.includes('outstanding') || lower.includes('pending') || lower.includes('due')) {
      return [
        'Show all outstanding bills',
        'Total outstanding amount',
        'Flats with overdue payments'
      ];
    }

    if (lower.includes('collect') || lower.includes('payment') || lower.includes('paid')) {
      return [
        "Today's collection",
        'This month collection',
        'Payment history'
      ];
    }

    if (lower.includes('flat') || lower.includes('building')) {
      return [
        'List all flats',
        'Building-wise summary',
        'Vacant flats'
      ];
    }

    return [
      'Show dashboard summary',
      'Outstanding bills',
      "Today's collection",
      'Top defaulters'
    ];
  }

  // Pre-process common query patterns for faster response
  matchPresetQuery(query) {
    const presets = {
      'outstanding': {
        intent: 'OUTSTANDING_ALL',
        dataQuery: {
          sources: ['Bills', 'Flats'],
          filters: [{ field: 'status', operator: 'in', value: ['pending', 'partial'] }],
          joins: [{ from: 'Bills', to: 'Flats', on: 'flatId' }],
          aggregations: [
            { function: 'sum', field: 'grandTotal', as: 'totalBilled' },
            { function: 'sum', field: 'paidAmount', as: 'totalPaid' }
          ],
          groupBy: ['flatId']
        },
        visualization: { type: 'table' }
      },
      'today collection': {
        intent: 'COLLECTION_TODAY',
        dataQuery: {
          sources: ['Payments'],
          filters: [{ field: 'paymentDate', operator: '=', value: '{{today}}' }],
          aggregations: [
            { function: 'sum', field: 'amount', as: 'totalCollected' },
            { function: 'count', field: 'id', as: 'paymentCount' }
          ]
        },
        visualization: { type: 'stat_cards' }
      }
    };

    const lower = query.toLowerCase();
    for (const [pattern, preset] of Object.entries(presets)) {
      if (lower.includes(pattern)) {
        return preset;
      }
    }

    return null;
  }
}

window.NLQueryProcessor = NLQueryProcessor;
```

### Phase 2: Query Executor (Week 2)

#### 6.2.1 Query Executor

```javascript
// js/nl-query/query-executor.js

class QueryExecutor {
  constructor(storage) {
    this.storage = storage;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async execute(dataQuery) {
    const cacheKey = JSON.stringify(dataQuery);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    try {
      // Load required data sources
      const data = await this.loadSources(dataQuery.sources);

      // Apply joins
      let result = this.applyJoins(data, dataQuery.joins);

      // Apply filters
      result = this.applyFilters(result, dataQuery.filters);

      // Apply aggregations and grouping
      if (dataQuery.aggregations && dataQuery.aggregations.length > 0) {
        result = this.applyAggregations(result, dataQuery.aggregations, dataQuery.groupBy);
      }

      // Apply ordering
      if (dataQuery.orderBy) {
        result = this.applyOrdering(result, dataQuery.orderBy);
      }

      // Apply limit
      if (dataQuery.limit) {
        result = result.slice(0, dataQuery.limit);
      }

      // Cache result
      this.cache.set(cacheKey, { result, timestamp: Date.now() });

      return result;

    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  async loadSources(sources) {
    const data = {};

    for (const source of sources) {
      data[source] = await this.storage.read(source) || [];
    }

    return data;
  }

  applyJoins(data, joins) {
    if (!joins || joins.length === 0) {
      // Return first source if no joins
      const firstSource = Object.keys(data)[0];
      return data[firstSource] || [];
    }

    let result = null;

    for (const join of joins) {
      const fromData = result || data[join.from];
      const toData = data[join.to];

      if (!fromData || !toData) continue;

      // Create lookup map for efficient joining
      const toMap = new Map();
      for (const item of toData) {
        const key = item.id || item[join.on];
        toMap.set(key, item);
      }

      // Perform join
      result = fromData.map(fromItem => {
        const joinKey = fromItem[join.on];
        const toItem = toMap.get(joinKey);

        if (toItem) {
          // Merge with prefixed keys to avoid conflicts
          const merged = { ...fromItem };
          for (const [key, value] of Object.entries(toItem)) {
            if (!(key in merged)) {
              merged[key] = value;
            } else {
              merged[`${join.to}_${key}`] = value;
            }
          }
          return merged;
        }

        return fromItem;
      });
    }

    return result || [];
  }

  applyFilters(data, filters) {
    if (!filters || filters.length === 0) {
      return data;
    }

    return data.filter(item => {
      for (const filter of filters) {
        const value = this.getNestedValue(item, filter.field);
        const filterValue = this.resolveValue(filter.value);

        if (!this.evaluateCondition(value, filter.operator, filterValue)) {
          return false;
        }
      }
      return true;
    });
  }

  evaluateCondition(value, operator, filterValue) {
    switch (operator) {
      case '=':
      case '==':
        return value == filterValue;
      case '!=':
        return value != filterValue;
      case '>':
        return value > filterValue;
      case '<':
        return value < filterValue;
      case '>=':
        return value >= filterValue;
      case '<=':
        return value <= filterValue;
      case 'in':
        return Array.isArray(filterValue) && filterValue.includes(value);
      case 'not_in':
        return Array.isArray(filterValue) && !filterValue.includes(value);
      case 'contains':
        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
      case 'between':
        return Array.isArray(filterValue) && value >= filterValue[0] && value <= filterValue[1];
      case 'is_null':
        return value === null || value === undefined;
      case 'is_not_null':
        return value !== null && value !== undefined;
      default:
        return true;
    }
  }

  resolveValue(value) {
    if (typeof value !== 'string') return value;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const placeholders = {
      '{{today}}': today.toISOString().split('T')[0],
      '{{yesterday}}': new Date(today.getTime() - 86400000).toISOString().split('T')[0],
      '{{this_month_start}}': new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
      '{{last_month_start}}': new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0],
      '{{this_year_start}}': new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0],
      '{{last_year_start}}': new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0]
    };

    for (const [placeholder, replacement] of Object.entries(placeholders)) {
      if (value === placeholder) {
        return replacement;
      }
    }

    return value;
  }

  applyAggregations(data, aggregations, groupBy) {
    if (!groupBy || groupBy.length === 0) {
      // Aggregate all data into single result
      const result = {};

      for (const agg of aggregations) {
        result[agg.as] = this.aggregate(data, agg.function, agg.field);
      }

      return [result];
    }

    // Group data
    const groups = new Map();

    for (const item of data) {
      const groupKey = groupBy.map(field => item[field]).join('|');

      if (!groups.has(groupKey)) {
        const groupItem = {};
        for (const field of groupBy) {
          groupItem[field] = item[field];
        }
        groups.set(groupKey, { key: groupItem, items: [] });
      }

      groups.get(groupKey).items.push(item);
    }

    // Apply aggregations to each group
    const result = [];

    for (const group of groups.values()) {
      const aggregatedItem = { ...group.key };

      for (const agg of aggregations) {
        aggregatedItem[agg.as] = this.aggregate(group.items, agg.function, agg.field);
      }

      result.push(aggregatedItem);
    }

    return result;
  }

  aggregate(data, func, field) {
    if (data.length === 0) return 0;

    const values = data.map(item => {
      const val = this.getNestedValue(item, field);
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });

    switch (func) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'count':
        return data.length;
      case 'count_distinct':
        return new Set(data.map(item => item[field])).size;
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return 0;
    }
  }

  applyOrdering(data, orderBy) {
    return [...data].sort((a, b) => {
      for (const order of orderBy) {
        const aVal = this.getNestedValue(a, order.field);
        const bVal = this.getNestedValue(b, order.field);

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        if (comparison !== 0) {
          return order.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  getNestedValue(obj, path) {
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }

    return value;
  }

  clearCache() {
    this.cache.clear();
  }
}

window.QueryExecutor = QueryExecutor;
```

### Phase 3: Visualization Engine (Week 2-3)

#### 6.3.1 Visualization Engine

```javascript
// js/nl-query/visualization-engine.js

class VisualizationEngine {
  constructor(container) {
    this.container = container;
    this.currentChart = null;
    this.currentTable = null;
  }

  render(data, vizConfig, explanation) {
    this.container.innerHTML = '';

    // Create visualization container
    const vizContainer = document.createElement('div');
    vizContainer.className = 'viz-container';

    // Add explanation
    if (explanation) {
      const explainEl = document.createElement('div');
      explainEl.className = 'viz-explanation';
      explainEl.innerHTML = `<p>${explanation}</p>`;
      vizContainer.appendChild(explainEl);
    }

    // Render based on type
    switch (vizConfig.type) {
      case 'table':
        this.renderTable(vizContainer, data, vizConfig.config);
        break;

      case 'bar_chart':
        this.renderBarChart(vizContainer, data, vizConfig.config);
        break;

      case 'line_chart':
        this.renderLineChart(vizContainer, data, vizConfig.config);
        break;

      case 'pie_chart':
        this.renderPieChart(vizContainer, data, vizConfig.config);
        break;

      case 'stat_cards':
        this.renderStatCards(vizContainer, data, vizConfig.config);
        break;

      case 'comparison':
        this.renderComparison(vizContainer, data, vizConfig.config);
        break;

      case 'detail':
        this.renderDetail(vizContainer, data, vizConfig.config);
        break;

      default:
        this.renderTable(vizContainer, data, vizConfig.config);
    }

    this.container.appendChild(vizContainer);
  }

  renderTable(container, data, config) {
    const title = config?.title || 'Results';
    const columns = config?.columns || (data[0] ? Object.keys(data[0]) : []);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'viz-table-container';

    tableContainer.innerHTML = `
      <h3 class="viz-title">${title}</h3>
      <div class="table-wrapper">
        <table class="viz-table" id="resultTable">
          <thead>
            <tr>
              ${columns.map(col => `<th>${this.formatColumnName(col)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${this.formatValue(row[col], col)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <span class="result-count">${data.length} results</span>
      </div>
    `;

    container.appendChild(tableContainer);

    // Initialize DataTables if available
    if (typeof $.fn.DataTable !== 'undefined') {
      this.currentTable = $('#resultTable').DataTable({
        pageLength: 10,
        order: [],
        responsive: true
      });
    }
  }

  renderBarChart(container, data, config) {
    const title = config?.title || 'Chart';
    const xAxis = config?.xAxis || Object.keys(data[0])[0];
    const yAxis = config?.yAxis || Object.keys(data[0])[1];

    const chartContainer = document.createElement('div');
    chartContainer.className = 'viz-chart-container';

    chartContainer.innerHTML = `
      <h3 class="viz-title">${title}</h3>
      <div class="chart-wrapper">
        <canvas id="barChart"></canvas>
      </div>
    `;

    container.appendChild(chartContainer);

    // Create chart
    const ctx = document.getElementById('barChart').getContext('2d');

    this.currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item[xAxis]),
        datasets: [{
          label: this.formatColumnName(yAxis),
          data: data.map(item => item[yAxis]),
          backgroundColor: this.generateColors(data.length, 0.6),
          borderColor: this.generateColors(data.length, 1),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${this.formatColumnName(yAxis)}: ${this.formatValue(context.raw, yAxis)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatAxisValue(value, yAxis)
            }
          }
        }
      }
    });
  }

  renderLineChart(container, data, config) {
    const title = config?.title || 'Trend';
    const xAxis = config?.xAxis || Object.keys(data[0])[0];
    const yAxis = config?.yAxis || Object.keys(data[0])[1];

    const chartContainer = document.createElement('div');
    chartContainer.className = 'viz-chart-container';

    chartContainer.innerHTML = `
      <h3 class="viz-title">${title}</h3>
      <div class="chart-wrapper">
        <canvas id="lineChart"></canvas>
      </div>
    `;

    container.appendChild(chartContainer);

    const ctx = document.getElementById('lineChart').getContext('2d');

    this.currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item[xAxis]),
        datasets: [{
          label: this.formatColumnName(yAxis),
          data: data.map(item => item[yAxis]),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => this.formatAxisValue(value, yAxis)
            }
          }
        }
      }
    });
  }

  renderPieChart(container, data, config) {
    const title = config?.title || 'Distribution';
    const labelField = config?.labelField || Object.keys(data[0])[0];
    const valueField = config?.valueField || Object.keys(data[0])[1];

    const chartContainer = document.createElement('div');
    chartContainer.className = 'viz-chart-container viz-pie';

    chartContainer.innerHTML = `
      <h3 class="viz-title">${title}</h3>
      <div class="chart-wrapper pie-wrapper">
        <canvas id="pieChart"></canvas>
      </div>
    `;

    container.appendChild(chartContainer);

    const ctx = document.getElementById('pieChart').getContext('2d');

    this.currentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item[labelField]),
        datasets: [{
          data: data.map(item => item[valueField]),
          backgroundColor: this.generateColors(data.length, 0.8),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${this.formatValue(context.raw, valueField)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  renderStatCards(container, data, config) {
    const title = config?.title || 'Summary';

    const statsContainer = document.createElement('div');
    statsContainer.className = 'viz-stats-container';

    let statsHTML = `<h3 class="viz-title">${title}</h3><div class="stat-cards">`;

    // Render each stat as a card
    const statData = Array.isArray(data) ? data[0] : data;

    for (const [key, value] of Object.entries(statData)) {
      const formattedValue = this.formatValue(value, key);
      const icon = this.getStatIcon(key);

      statsHTML += `
        <div class="stat-card">
          <div class="stat-icon">${icon}</div>
          <div class="stat-content">
            <div class="stat-value">${formattedValue}</div>
            <div class="stat-label">${this.formatColumnName(key)}</div>
          </div>
        </div>
      `;
    }

    statsHTML += '</div>';
    statsContainer.innerHTML = statsHTML;
    container.appendChild(statsContainer);
  }

  renderComparison(container, data, config) {
    const title = config?.title || 'Comparison';

    const compContainer = document.createElement('div');
    compContainer.className = 'viz-comparison-container';

    // Assume data has period1 and period2
    const period1 = data[0] || {};
    const period2 = data[1] || {};

    let compHTML = `
      <h3 class="viz-title">${title}</h3>
      <div class="comparison-grid">
    `;

    const keys = [...new Set([...Object.keys(period1), ...Object.keys(period2)])];

    for (const key of keys) {
      if (key === 'period' || key === 'label') continue;

      const val1 = period1[key] || 0;
      const val2 = period2[key] || 0;
      const change = val1 !== 0 ? ((val2 - val1) / val1 * 100) : 0;
      const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';

      compHTML += `
        <div class="comparison-item">
          <div class="comparison-label">${this.formatColumnName(key)}</div>
          <div class="comparison-values">
            <span class="period1">${this.formatValue(val1, key)}</span>
            <span class="arrow">→</span>
            <span class="period2">${this.formatValue(val2, key)}</span>
          </div>
          <div class="comparison-change ${changeClass}">
            ${change > 0 ? '↑' : change < 0 ? '↓' : '→'} ${Math.abs(change).toFixed(1)}%
          </div>
        </div>
      `;
    }

    compHTML += '</div>';
    compContainer.innerHTML = compHTML;
    container.appendChild(compContainer);
  }

  renderDetail(container, data, config) {
    const title = config?.title || 'Details';
    const item = Array.isArray(data) ? data[0] : data;

    const detailContainer = document.createElement('div');
    detailContainer.className = 'viz-detail-container';

    let detailHTML = `
      <h3 class="viz-title">${title}</h3>
      <div class="detail-grid">
    `;

    for (const [key, value] of Object.entries(item)) {
      if (key === 'id' || key.endsWith('Id')) continue;

      detailHTML += `
        <div class="detail-item">
          <div class="detail-label">${this.formatColumnName(key)}</div>
          <div class="detail-value">${this.formatValue(value, key)}</div>
        </div>
      `;
    }

    detailHTML += '</div>';
    detailContainer.innerHTML = detailHTML;
    container.appendChild(detailContainer);
  }

  // Helper methods
  formatColumnName(name) {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }

  formatValue(value, field) {
    if (value === null || value === undefined) return '-';

    const fieldLower = field.toLowerCase();

    // Currency formatting
    if (fieldLower.includes('amount') || fieldLower.includes('total') ||
        fieldLower.includes('paid') || fieldLower.includes('due') ||
        fieldLower.includes('outstanding') || fieldLower.includes('collection')) {
      return '₹' + Number(value).toLocaleString('en-IN');
    }

    // Date formatting
    if (fieldLower.includes('date') || fieldLower.includes('at')) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN');
      }
    }

    // Percentage
    if (fieldLower.includes('rate') || fieldLower.includes('percent')) {
      return Number(value).toFixed(1) + '%';
    }

    // Count
    if (fieldLower.includes('count')) {
      return Number(value).toLocaleString();
    }

    return value;
  }

  formatAxisValue(value, field) {
    const fieldLower = field.toLowerCase();

    if (fieldLower.includes('amount') || fieldLower.includes('total') ||
        fieldLower.includes('collection')) {
      if (value >= 100000) {
        return '₹' + (value / 100000).toFixed(1) + 'L';
      }
      if (value >= 1000) {
        return '₹' + (value / 1000).toFixed(0) + 'K';
      }
      return '₹' + value;
    }

    return value;
  }

  getStatIcon(key) {
    const keyLower = key.toLowerCase();

    if (keyLower.includes('collection') || keyLower.includes('paid')) return '💰';
    if (keyLower.includes('outstanding') || keyLower.includes('due')) return '📋';
    if (keyLower.includes('count') || keyLower.includes('total')) return '📊';
    if (keyLower.includes('flat')) return '🏠';
    if (keyLower.includes('payment')) return '💳';

    return '📈';
  }

  generateColors(count, alpha = 1) {
    const baseColors = [
      `rgba(102, 126, 234, ${alpha})`,
      `rgba(118, 75, 162, ${alpha})`,
      `rgba(240, 147, 251, ${alpha})`,
      `rgba(245, 87, 108, ${alpha})`,
      `rgba(16, 185, 129, ${alpha})`,
      `rgba(245, 158, 11, ${alpha})`,
      `rgba(59, 130, 246, ${alpha})`,
      `rgba(236, 72, 153, ${alpha})`
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }

    return colors;
  }

  destroy() {
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }
    if (this.currentTable) {
      this.currentTable.destroy();
      this.currentTable = null;
    }
  }
}

window.VisualizationEngine = VisualizationEngine;
```

### Phase 4: Main Dashboard Controller (Week 3-4)

#### 6.4.1 Query Dashboard

```javascript
// js/nl-query/query-dashboard.js

class QueryDashboard {
  constructor(config) {
    this.config = config;
    this.storage = config.storage;

    // Initialize components
    this.nlProcessor = new NLQueryProcessor({ apiKey: config.apiKey });
    this.queryExecutor = new QueryExecutor(this.storage);
    this.vizEngine = null;

    // State
    this.conversationHistory = [];
    this.queryHistory = [];
    this.savedQueries = [];

    this.init();
  }

  async init() {
    await this.nlProcessor.initialize(this.storage);
    await this.loadSavedQueries();
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById(this.config.containerId);

    container.innerHTML = `
      <div class="query-dashboard">
        <!-- Header -->
        <div class="query-header">
          <h1>🔍 Ask Anything</h1>
          <p class="query-subtitle">Ask questions about bills, payments, and society data in plain English or Hindi</p>
        </div>

        <!-- Query Input -->
        <div class="query-input-container">
          <div class="query-input-wrapper">
            <input
              type="text"
              id="queryInput"
              class="query-input"
              placeholder="e.g., Which flats haven't paid for 3 months?"
              autocomplete="off"
            >
            <button class="voice-btn" id="voiceQueryBtn" title="Voice input">
              🎤
            </button>
            <button class="query-btn" id="submitQueryBtn">
              Ask
            </button>
          </div>
          <div class="query-suggestions" id="querySuggestions">
            <span class="suggestion-label">Try:</span>
            <button class="suggestion-chip" data-query="Show outstanding bills">Outstanding bills</button>
            <button class="suggestion-chip" data-query="Today's collection">Today's collection</button>
            <button class="suggestion-chip" data-query="Top 10 defaulters">Top defaulters</button>
            <button class="suggestion-chip" data-query="Collection trend last 6 months">Collection trend</button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="query-content">
          <!-- Sidebar -->
          <aside class="query-sidebar">
            <!-- Recent Queries -->
            <div class="sidebar-section">
              <h3>Recent Queries</h3>
              <div class="recent-queries" id="recentQueries">
                <p class="empty-state">No recent queries</p>
              </div>
            </div>

            <!-- Saved Queries -->
            <div class="sidebar-section">
              <h3>Saved Queries</h3>
              <div class="saved-queries" id="savedQueries">
                <p class="empty-state">No saved queries</p>
              </div>
            </div>
          </aside>

          <!-- Results Area -->
          <main class="query-results">
            <div class="results-container" id="resultsContainer">
              <div class="welcome-state">
                <div class="welcome-icon">💬</div>
                <h2>Ask a Question</h2>
                <p>Type your question above or click a suggestion to get started</p>

                <div class="example-queries">
                  <h3>Example Questions</h3>
                  <ul>
                    <li>"Which flats have outstanding more than ₹10,000?"</li>
                    <li>"Compare January and February collection"</li>
                    <li>"Show payment history for flat A-101"</li>
                    <li>"Building-wise collection summary"</li>
                    <li>"कितना बाकी है इस महीने?" (Hindi)</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div class="loading-state" id="loadingState" style="display: none;">
              <div class="loading-spinner"></div>
              <p>Analyzing your question...</p>
            </div>

            <!-- Follow-up Actions -->
            <div class="follow-up-container" id="followUpContainer" style="display: none;">
              <h4>Follow-up Questions</h4>
              <div class="follow-up-buttons" id="followUpButtons"></div>
            </div>

            <!-- Insights Panel -->
            <div class="insights-panel" id="insightsPanel" style="display: none;">
              <h4>💡 Insights</h4>
              <div class="insights-list" id="insightsList"></div>
            </div>

            <!-- Actions Bar -->
            <div class="actions-bar" id="actionsBar" style="display: none;">
              <button class="action-btn" id="exportCsvBtn">📥 Export CSV</button>
              <button class="action-btn" id="exportPdfBtn">📄 Export PDF</button>
              <button class="action-btn" id="saveQueryBtn">📌 Save Query</button>
              <button class="action-btn" id="shareBtn">🔗 Share</button>
            </div>
          </main>
        </div>
      </div>
    `;

    // Initialize visualization engine
    this.vizEngine = new VisualizationEngine(document.getElementById('resultsContainer'));
  }

  bindEvents() {
    // Query input
    const queryInput = document.getElementById('queryInput');
    const submitBtn = document.getElementById('submitQueryBtn');

    queryInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.executeQuery(queryInput.value);
      }
    });

    submitBtn.addEventListener('click', () => {
      this.executeQuery(queryInput.value);
    });

    // Voice input
    document.getElementById('voiceQueryBtn').addEventListener('click', () => {
      this.startVoiceInput();
    });

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        queryInput.value = query;
        this.executeQuery(query);
      });
    });

    // Export buttons
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      this.exportResults('csv');
    });

    document.getElementById('exportPdfBtn').addEventListener('click', () => {
      this.exportResults('pdf');
    });

    document.getElementById('saveQueryBtn').addEventListener('click', () => {
      this.saveCurrentQuery();
    });
  }

  async executeQuery(queryText) {
    if (!queryText.trim()) return;

    const queryInput = document.getElementById('queryInput');
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');

    // Show loading
    loadingState.style.display = 'flex';
    resultsContainer.innerHTML = '';

    try {
      // Process natural language query
      const processed = await this.nlProcessor.processQuery(queryText, {
        history: this.conversationHistory
      });

      if (!processed.success) {
        this.showError(processed.error, processed.fallbackSuggestions);
        return;
      }

      // Handle conversation/clarification
      if (processed.intent === 'CONVERSATION' || processed.intent === 'CLARIFICATION') {
        this.showConversationResponse(processed);
        return;
      }

      // Execute data query
      const data = await this.queryExecutor.execute(processed.dataQuery);

      // Store for export
      this.currentResult = { data, query: processed };

      // Render visualization
      this.vizEngine.render(data, processed.visualization, processed.explanation);

      // Show follow-ups and insights
      this.showFollowUps(processed.followUpQuestions);
      this.showInsights(processed.insights);

      // Show action bar
      document.getElementById('actionsBar').style.display = 'flex';

      // Add to history
      this.addToHistory(queryText, processed);

      // Update conversation context
      this.conversationHistory.push(
        { role: 'user', content: queryText },
        { role: 'assistant', content: JSON.stringify(processed) }
      );

      // Keep history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

    } catch (error) {
      console.error('Query execution error:', error);
      this.showError(error.message);
    } finally {
      loadingState.style.display = 'none';
    }
  }

  showError(message, suggestions = []) {
    const resultsContainer = document.getElementById('resultsContainer');

    resultsContainer.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Couldn't process that query</h3>
        <p>${message}</p>
        ${suggestions.length > 0 ? `
          <div class="error-suggestions">
            <p>Try one of these:</p>
            ${suggestions.map(s => `
              <button class="suggestion-chip" onclick="queryDashboard.executeQuery('${s}')">${s}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('actionsBar').style.display = 'none';
  }

  showConversationResponse(processed) {
    const resultsContainer = document.getElementById('resultsContainer');

    resultsContainer.innerHTML = `
      <div class="conversation-response">
        <div class="ai-message">
          <div class="ai-avatar">🤖</div>
          <div class="ai-content">
            <p>${processed.explanation || processed.response}</p>
            ${processed.followUpQuestions ? `
              <div class="quick-replies">
                ${processed.followUpQuestions.map(q => `
                  <button class="quick-reply" onclick="queryDashboard.executeQuery('${q}')">${q}</button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  showFollowUps(questions) {
    const container = document.getElementById('followUpContainer');
    const buttons = document.getElementById('followUpButtons');

    if (!questions || questions.length === 0) {
      container.style.display = 'none';
      return;
    }

    buttons.innerHTML = questions.map(q => `
      <button class="follow-up-btn" onclick="queryDashboard.executeQuery('${q}')">${q}</button>
    `).join('');

    container.style.display = 'block';
  }

  showInsights(insights) {
    const container = document.getElementById('insightsPanel');
    const list = document.getElementById('insightsList');

    if (!insights || insights.length === 0) {
      container.style.display = 'none';
      return;
    }

    list.innerHTML = insights.map(insight => `
      <div class="insight-item">
        <span class="insight-bullet">💡</span>
        <span class="insight-text">${insight}</span>
      </div>
    `).join('');

    container.style.display = 'block';
  }

  addToHistory(queryText, processed) {
    const historyItem = {
      id: crypto.randomUUID(),
      query: queryText,
      intent: processed.intent,
      timestamp: new Date().toISOString()
    };

    this.queryHistory.unshift(historyItem);
    this.queryHistory = this.queryHistory.slice(0, 20);

    this.updateHistoryUI();
  }

  updateHistoryUI() {
    const container = document.getElementById('recentQueries');

    if (this.queryHistory.length === 0) {
      container.innerHTML = '<p class="empty-state">No recent queries</p>';
      return;
    }

    container.innerHTML = this.queryHistory.slice(0, 5).map(item => `
      <div class="history-item" onclick="queryDashboard.executeQuery('${item.query}')">
        <span class="history-query">${item.query}</span>
        <span class="history-time">${this.formatTimeAgo(item.timestamp)}</span>
      </div>
    `).join('');
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  }

  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    const voiceBtn = document.getElementById('voiceQueryBtn');
    voiceBtn.classList.add('listening');
    voiceBtn.textContent = '🔴';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('queryInput').value = transcript;
      this.executeQuery(transcript);
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
      voiceBtn.textContent = '🎤';
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      voiceBtn.classList.remove('listening');
      voiceBtn.textContent = '🎤';
    };

    recognition.start();
  }

  async exportResults(format) {
    if (!this.currentResult) {
      alert('No results to export');
      return;
    }

    const { data, query } = this.currentResult;

    if (format === 'csv') {
      this.exportCSV(data, query.explanation);
    } else if (format === 'pdf') {
      this.exportPDF(data, query);
    }
  }

  exportCSV(data, title) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        // Escape quotes and wrap in quotes if contains comma
        const strVal = String(val ?? '');
        if (strVal.includes(',') || strVal.includes('"')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  exportPDF(data, query) {
    // Using jsPDF
    if (typeof jspdf === 'undefined') {
      alert('PDF export requires jsPDF library');
      return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(query.explanation || 'Query Results', 20, 20);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

    // Table
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => String(row[h] ?? '')));

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 }
      });
    }

    doc.save(`query_results_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async saveCurrentQuery() {
    if (!this.currentResult) {
      alert('No query to save');
      return;
    }

    const name = prompt('Enter a name for this query:');
    if (!name) return;

    const savedQuery = {
      id: crypto.randomUUID(),
      name,
      query: document.getElementById('queryInput').value,
      dataQuery: this.currentResult.query.dataQuery,
      visualization: this.currentResult.query.visualization,
      savedAt: new Date().toISOString()
    };

    this.savedQueries.push(savedQuery);
    await this.persistSavedQueries();
    this.updateSavedQueriesUI();

    alert('Query saved!');
  }

  async loadSavedQueries() {
    try {
      const saved = await this.storage.read('SavedQueries');
      this.savedQueries = saved || [];
      this.updateSavedQueriesUI();
    } catch (error) {
      console.error('Failed to load saved queries:', error);
    }
  }

  async persistSavedQueries() {
    await this.storage.write('SavedQueries', this.savedQueries);
  }

  updateSavedQueriesUI() {
    const container = document.getElementById('savedQueries');

    if (this.savedQueries.length === 0) {
      container.innerHTML = '<p class="empty-state">No saved queries</p>';
      return;
    }

    container.innerHTML = this.savedQueries.map(item => `
      <div class="saved-query-item">
        <span class="saved-name" onclick="queryDashboard.executeQuery('${item.query}')">${item.name}</span>
        <button class="delete-btn" onclick="queryDashboard.deleteSavedQuery('${item.id}')">×</button>
      </div>
    `).join('');
  }

  async deleteSavedQuery(id) {
    this.savedQueries = this.savedQueries.filter(q => q.id !== id);
    await this.persistSavedQueries();
    this.updateSavedQueriesUI();
  }
}

window.QueryDashboard = QueryDashboard;
```

### Phase 5: Dashboard Styles (Week 4)

```css
/* css/query-dashboard.css */

.query-dashboard {
  min-height: 100vh;
  background: #f8fafc;
}

.query-header {
  text-align: center;
  padding: 40px 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.query-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.query-subtitle {
  opacity: 0.9;
  font-size: 14px;
}

/* Query Input */
.query-input-container {
  max-width: 800px;
  margin: -30px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

.query-input-wrapper {
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.query-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  font-size: 16px;
  outline: none;
}

.voice-btn {
  padding: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.voice-btn:hover {
  background: #f1f5f9;
}

.voice-btn.listening {
  background: #fee2e2;
  animation: pulse 1s infinite;
}

.query-btn {
  padding: 16px 24px;
  background: #667eea;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.query-btn:hover {
  background: #5a67d8;
}

/* Suggestions */
.query-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  align-items: center;
}

.suggestion-label {
  font-size: 13px;
  color: #64748b;
}

.suggestion-chip {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Main Content Layout */
.query-content {
  display: flex;
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 20px;
  gap: 24px;
}

/* Sidebar */
.query-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-section h3 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-item, .saved-query-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 4px;
}

.history-item:hover, .saved-query-item:hover {
  background: #f1f5f9;
}

.history-query, .saved-name {
  display: block;
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 11px;
  color: #94a3b8;
}

.delete-btn {
  float: right;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
}

.delete-btn:hover {
  color: #ef4444;
}

/* Results Area */
.query-results {
  flex: 1;
  min-width: 0;
}

.results-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

/* Welcome State */
.welcome-state {
  text-align: center;
  padding: 60px 20px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.welcome-state h2 {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 8px;
}

.welcome-state > p {
  color: #64748b;
  margin-bottom: 30px;
}

.example-queries {
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
}

.example-queries h3 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
}

.example-queries ul {
  list-style: none;
  padding: 0;
}

.example-queries li {
  padding: 8px 0;
  color: #475569;
  font-size: 14px;
  border-bottom: 1px solid #e2e8f0;
}

.example-queries li:last-child {
  border-bottom: none;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Visualization Styles */
.viz-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.viz-explanation {
  background: #f0f9ff;
  border-left: 4px solid #667eea;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 0 8px 8px 0;
}

.viz-explanation p {
  margin: 0;
  color: #1e40af;
  font-size: 14px;
}

.viz-title {
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 16px;
}

/* Table */
.viz-table-container {
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.viz-table {
  width: 100%;
  border-collapse: collapse;
}

.viz-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  border-bottom: 2px solid #e2e8f0;
}

.viz-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.viz-table tr:hover {
  background: #f8fafc;
}

.table-footer {
  padding: 12px 0;
  text-align: right;
}

.result-count {
  font-size: 13px;
  color: #64748b;
}

/* Charts */
.viz-chart-container {
  padding: 20px 0;
}

.chart-wrapper {
  height: 350px;
  position: relative;
}

.pie-wrapper {
  max-width: 500px;
  margin: 0 auto;
}

/* Stat Cards */
.viz-stats-container {
  padding: 20px 0;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 32px;
  margin-right: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* Comparison */
.viz-comparison-container {
  padding: 20px 0;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.comparison-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.comparison-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.comparison-values {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.comparison-values .period1 {
  color: #64748b;
}

.comparison-values .arrow {
  margin: 0 8px;
  color: #94a3b8;
}

.comparison-values .period2 {
  color: #1e293b;
}

.comparison-change {
  font-size: 14px;
  font-weight: 600;
}

.comparison-change.positive { color: #10b981; }
.comparison-change.negative { color: #ef4444; }
.comparison-change.neutral { color: #64748b; }

/* Follow-ups & Insights */
.follow-up-container, .insights-panel {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.follow-up-container h4, .insights-panel h4 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
}

.follow-up-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.follow-up-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-up-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
}

.insight-bullet {
  margin-right: 8px;
}

.insight-text {
  font-size: 14px;
  color: #334155;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #ef4444;
  margin-bottom: 8px;
}

.error-state p {
  color: #64748b;
  margin-bottom: 20px;
}

.error-suggestions {
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .query-content {
    flex-direction: column;
  }

  .query-sidebar {
    width: 100%;
    order: 2;
  }

  .query-results {
    order: 1;
  }

  .stat-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    min-width: 45%;
  }
}
```

---

## 7. Integration with Existing App

```javascript
// Add to admin pages

// Initialize Query Dashboard
function initQueryDashboard() {
  window.queryDashboard = new QueryDashboard({
    containerId: 'queryDashboardContainer',
    storage: window.storage, // Existing Storage instance
    apiKey: NL_QUERY_CONFIG.claudeApiKey
  });
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('queryDashboardContainer')) {
    initQueryDashboard();
  }
});
```

---

## 8. Testing Plan

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| TC-NL-001 | "Show outstanding bills" | Table with pending bills |
| TC-NL-002 | "Today's collection" | Stat cards with amounts |
| TC-NL-003 | "Compare Jan and Feb" | Comparison visualization |
| TC-NL-004 | "Collection trend 6 months" | Line chart |
| TC-NL-005 | "Building A summary" | Filtered results |
| TC-NL-006 | Hindi query "kitna baaki hai" | Correct interpretation |
| TC-NL-007 | Ambiguous query | Clarification requested |
| TC-NL-008 | Voice input | Transcribed and processed |
| TC-NL-009 | Export to CSV | File downloaded |
| TC-NL-010 | Save and reload query | Query persisted |

---

## 9. Cost Estimation

| Item | Cost | Notes |
|------|------|-------|
| Claude API | $0.01-0.05/query | Intent + SQL generation |
| Chart.js | Free | Open source |
| DataTables | Free | Open source |
| jsPDF | Free | Open source |
| **Monthly (1000 queries)** | **$10-50/month** | |

---

## 10. Security Considerations

1. **Input Sanitization**: Sanitize all user queries before processing
2. **Data Access Control**: Respect user role permissions in queries
3. **Rate Limiting**: Limit queries per user to prevent abuse
4. **Query Validation**: Validate generated queries before execution
5. **Sensitive Data**: Mask sensitive fields in exports
6. **Audit Logging**: Log all queries for audit trail
