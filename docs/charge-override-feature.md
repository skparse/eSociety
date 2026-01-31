# Feature Specification: Flat-Level Charge Overrides

## Problem Statement

The current eSociety billing system only supports:
- **Fixed charges** (same for all flats)
- **Per-sqft charges** (based on flat area)
- **Per-vehicle charges** (based on vehicle count)

However, real-world societies have charges that vary per flat but don't fit these patterns:
- **Water Charges**: Different rates based on BHK type (1 BHK = ₹300, 1.5+ BHK = ₹480)
- **Parking Premium**: Some flats have covered parking at higher rates
- **Special Assessments**: One-time charges for specific flats

---

## Proposed Solution

Add a **Charge Override** system that allows administrators to:
1. Override the default charge amount for specific flats
2. Disable certain charges for specific flats
3. Add flat-specific charges

---

## Data Model

### New Table: FlatChargeOverrides

| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique identifier |
| flatId | string | Reference to Flats table |
| chargeTypeId | string | Reference to ChargeTypes table |
| overrideType | enum | "fixed", "disabled" |
| amount | number | Override amount (if type = "fixed") |
| reason | string | Optional note for override |
| createdAt | timestamp | When override was created |
| updatedAt | timestamp | Last update time |

### Google Sheet Structure

**Sheet Name:** `FlatChargeOverrides`

```
id | flatId | chargeTypeId | overrideType | amount | reason | createdAt | updatedAt
```

---

## Implementation

### 1. Backend Changes (google-apps-script.js)

Add functions to manage charge overrides:

```javascript
// Read flat charge overrides
function readFlatChargeOverrides() {
    return readTabularData('FlatChargeOverrides');
}

// Write flat charge overrides
function writeFlatChargeOverrides(data) {
    return writeTabularData('FlatChargeOverrides', data);
}
```

### 2. Storage Layer Changes (js/storage.js)

```javascript
// Get charge overrides for a flat
async getFlatChargeOverrides(flatId) {
    const overrides = await this.getData('FlatChargeOverrides');
    return flatId ? overrides.filter(o => o.flatId === flatId) : overrides;
}

// Save charge overrides
async saveFlatChargeOverrides(overrides) {
    return this.saveData('FlatChargeOverrides', overrides);
}
```

### 3. Billing Calculation Changes (js/admin/billing.js)

Modify the `generateBills()` function to check for overrides:

```javascript
// Load overrides at start
const chargeOverrides = await storage.getFlatChargeOverrides();

// Inside the billing loop, for each charge type:
for (const chargeType of chargeTypes) {
    let amount = 0;

    // Check for override
    const override = chargeOverrides.find(
        o => o.flatId === flat.id && o.chargeTypeId === chargeType.id
    );

    if (override) {
        if (override.overrideType === 'disabled') {
            continue; // Skip this charge
        } else if (override.overrideType === 'fixed') {
            amount = override.amount;
            description = `${chargeType.name} (custom)`;
        }
    } else {
        // Normal calculation (existing code)
        if (chargeType.calculationType === 'per_sqft') {
            amount = (flat.area || 0) * chargeType.defaultAmount;
        } else if (chargeType.calculationType === 'per_vehicle') {
            // ... existing vehicle logic
        } else {
            amount = chargeType.defaultAmount;
        }
    }

    // ... rest of the code
}
```

### 4. Admin UI Changes

#### Option A: Inline on Flat Edit Modal

Add a "Charge Overrides" section in the flat edit modal:

```html
<div class="form-section">
    <h4>Charge Overrides</h4>
    <p class="text-muted small">Override default charges for this flat</p>

    <table class="table table-sm">
        <thead>
            <tr>
                <th>Charge Type</th>
                <th>Default</th>
                <th>Override</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="charge-overrides-body">
            <!-- Dynamically populated -->
        </tbody>
    </table>
</div>
```

#### Option B: Dedicated Override Management Page

Create `admin/charge-overrides.html`:
- List all overrides
- Filter by flat or charge type
- Bulk import from CSV
- Export overrides

---

## CSV Import Format

### charge-overrides.csv

```csv
flatNo,chargeTypeName,overrideType,amount,reason
A103,Water Charges,fixed,300,1 BHK flat
A203,Water Charges,fixed,300,1 BHK flat
A302,Water Charges,fixed,300,1 BHK flat
B101,Water Charges,fixed,300,1 BHK flat
B201,Water Charges,fixed,300,1 BHK flat
B301,Water Charges,fixed,300,1 BHK flat
```

---

## Use Cases

### Use Case 1: Water Charge Override (1 BHK)

**Scenario:** Flat A103 is 1 BHK, so water charge is ₹300 instead of default ₹480

**Configuration:**
```json
{
    "flatId": "flat-a103",
    "chargeTypeId": "ct-water",
    "overrideType": "fixed",
    "amount": 300,
    "reason": "1 BHK flat - water ₹300"
}
```

**1 BHK Flats requiring override:** A103, A203, A302, B101, B201, B301

### Use Case 2: Disable Parking for Non-Parking Flat

**Scenario:** Flat A101 has no parking allotted

**Configuration:**
```json
{
    "flatId": "flat-a101",
    "chargeTypeId": "ct-parking",
    "overrideType": "disabled",
    "reason": "No parking allotted"
}
```

### Use Case 3: Premium Parking Rate

**Scenario:** Flat A001 has covered parking at ₹200 per slot instead of ₹40

**Configuration:**
```json
{
    "flatId": "flat-a001",
    "chargeTypeId": "ct-parking",
    "overrideType": "fixed",
    "amount": 600,
    "reason": "Premium covered parking (3 slots × ₹200)"
}
```

---

## Migration Path

### For Existing Societies

1. Generate override entries for flats with non-default charges
2. Import via CSV or manual entry
3. Re-generate bills to verify correctness

### Water Charge Migration Script (1 BHK Flats)

```javascript
// Identify 1 BHK flats (₹300 water)
const oneBhkFlats = ['A103', 'A203', 'A302', 'B101', 'B201', 'B301'];

const waterOverrides = oneBhkFlats.map(flatNo => ({
    id: Utils.generateId(),
    flatId: flatsData.find(f => f.flatNo === flatNo)?.id,
    chargeTypeId: chargeTypes.find(c => c.name === 'Water Charges')?.id,
    overrideType: 'fixed',
    amount: 300,
    reason: '1 BHK flat',
    createdAt: new Date().toISOString()
}));
```

### Alternative: BHK-Based Calculation

Instead of overrides, add `bhkType` field to flat types and calculate water automatically:

```javascript
// In billing calculation
const waterCharge = flatType.bhkType === 1 ? 300 : 480;
```

---

## UI Mockup

### Flat Edit Modal - Charge Overrides Section

```
┌─────────────────────────────────────────────────────────┐
│ Charge Overrides                                        │
├─────────────────────────────────────────────────────────┤
│ Charge Type          │ Default  │ Override  │ Action   │
├──────────────────────┼──────────┼───────────┼──────────┤
│ Service Charges      │ ₹432     │ -         │ [+]      │
│ Water Charges        │ ₹480     │ ₹300 ✓    │ [✏️] [🗑] │
│ Parking Charges      │ ₹160     │ Disabled  │ [✏️] [🗑] │
│ Sinking Fund         │ ₹58      │ -         │ [+]      │
│ ...                  │ ...      │ ...       │ ...      │
└─────────────────────────────────────────────────────────┘
```

---

## Alternative Quick Solution

If the full feature is not implemented immediately, use this workaround:

### Create Water Adjustment Charge

1. Create charge type: "Water Adjustment" (fixed, -180, monthly)
2. Set as inactive by default
3. For Slab 1 flats:
   - Create a special "Slab 1" flat type
   - Or manually add adjustment in bill line items

### Bill Line Item Edit

Add ability to edit individual bill line items after generation:
- Click on bill → Edit line items
- Change Water Charges from 480 to 300
- Save and recalculate total

---

## Implementation Priority

| Phase | Feature | Effort |
|-------|---------|--------|
| 1 | Charge override data model | Low |
| 2 | Billing calculation integration | Medium |
| 3 | Admin UI for managing overrides | Medium |
| 4 | CSV import for bulk overrides | Low |
| 5 | Bill line item editing | High |

---

## Files to Modify

1. `google-apps-script.js` - Add sheet handlers
2. `js/storage.js` - Add override methods
3. `js/admin/billing.js` - Modify calculation logic
4. `js/admin/flats.js` - Add override UI to modal
5. `admin/flats.html` - Add override section markup
6. `css/admin.css` - Style override components

---

## Testing Checklist

- [ ] Override correctly applies fixed amount
- [ ] Disabled override skips charge
- [ ] Override shows in bill preview
- [ ] Override persists across bill regeneration
- [ ] CSV import creates correct overrides
- [ ] Override reason displays in reports
- [ ] Edge case: Override for inactive charge type
- [ ] Edge case: Multiple overrides for same flat/charge
