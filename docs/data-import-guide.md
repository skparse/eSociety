# eSociety Data Import Guide
## Shree Sai Gulmohar Co-op Hsg. Soc. Ltd.

This guide explains how to import your society member data into the eSociety application.

---

## Table of Contents

1. [Pre-requisites](#pre-requisites)
2. [Step 1: Configure Society Settings](#step-1-configure-society-settings)
3. [Step 2: Setup Buildings](#step-2-setup-buildings)
4. [Step 3: Setup Flat Types](#step-3-setup-flat-types)
5. [Step 4: Configure Charge Types](#step-4-configure-charge-types)
6. [Step 5: Import Flats](#step-5-import-flats)
7. [Step 6: Handle Variable Charges](#step-6-handle-variable-charges)
8. [CSV Templates](#csv-templates)

---

## Pre-requisites

1. Admin access to eSociety
2. Google Sheets backend configured
3. Society member data (from the maintenance sheet)

---

## Step 1: Configure Society Settings

Navigate to **Admin > Master Data > Settings** and configure:

```
Society Name: Shree Sai Gulmohar Co-op Hsg. Soc. Ltd.
Registration No: NBOM/CIDCO/HSG(TC)/5627/JTR/Year 2014-2015
Address: Plot No. 146/147/148, Sector - 10, New Panvel, Navi Mumbai - 410 206

Billing Settings:
- Billing Day: 1
- Due Days: 15
- Late Fee Percent: 21 (annual rate = 1.75% monthly)

Non-Occupancy Settings:
- NOC Enabled: Yes
- NOC Amount: 100

Parking Settings:
- Tenant Parking Multiplier: 1 (no multiplier in your case)
```

---

## Step 2: Setup Buildings

Navigate to **Admin > Master Data > Buildings**

| Name | Total Floors | Notes |
|------|--------------|-------|
| A-Wing | 4 | Ground + 3 floors |
| B-Wing | 4 | Ground + 3 floors |

---

## Step 3: Setup Flat Types

Based on verified analysis of your charge data, there are 7 flat types:

| Type Name | Default Area (sqft) | BHK | Water | Sinking | Major | Insurance |
|-----------|---------------------|-----|-------|---------|-------|-----------|
| Type A | 580 | 1 | 300 | 58 | 174 | 53 |
| Type A (Balcony) | 576 | 1.5 | 480 | 58 | 173 | 52 |
| Type B | 596 | 2 | 480 | 60 | 179 | 54 |
| Type C | 640 | 1 | 300 | 64 | 192 | 58 |
| Type D | 726 | 2 | 480 | 73 | 218 | 66 |
| Type E | 766 | 2 | 480 | 77 | 230 | 69 |
| Type F | 833 | 2 | 480 | 83 | 250 | 76 |

**Water Charge Rule:** 1 BHK = ₹300, 1.5+ BHK = ₹480

---

## Step 4: Configure Charge Types

Navigate to **Admin > Master Data > Charge Types**

### Fixed Charges (Same for all flats)

| Name | Type | Amount | Active |
|------|------|--------|--------|
| Service Charges | fixed | 432 | Yes |
| Property Tax | fixed | 0 | No |
| Electricity Charges | fixed | 250 | Yes |
| Education & Training Fund | fixed | 10 | Yes |
| Legal Charges | fixed | 0 | No |
| Other Charges | fixed | 100 | Yes |

### Area-Based Charges (per_sqft)

| Name | Type | Rate/sqft | Active |
|------|------|-----------|--------|
| Sinking Fund | per_sqft | 0.10 | Yes |
| Major Repairs Fund | per_sqft | 0.30 | Yes |
| Insurance | per_sqft | 0.0907 | Yes |

### Vehicle-Based Charges

| Name | Type | Amount | Vehicle Type | Active |
|------|------|--------|--------------|--------|
| Parking - 2 Wheeler | per_vehicle | 40 | 2wheeler | Yes |
| Parking - 4 Wheeler | per_vehicle | 100 | 4wheeler | Yes |

> **Note:** Parking is ₹40 per 2-wheeler and ₹100 per 4-wheeler.

### Variable Charges (BHK-BASED)

**Water Charges** - Based on BHK type:
- **1 BHK = ₹300** (Type A, Type C)
- **1.5+ BHK = ₹480** (Type A Balcony, Type B, D, E, F)

**Implementation Options:**

**Option 1: BHK field on flat type** (Recommended)
- Add `bhkType` field to FlatTypes table
- Calculate water charge based on BHK: `bhkType == 1 ? 300 : 480`

**Option 2: Use charge override**
- Set default water as ₹480
- Create override of ₹300 for 1 BHK flats: A103, A203, A302, B101, B201, B301

---

## Step 5: Import Flats

### CSV Import Format

Create a CSV file with the following columns:

```csv
flatNo,buildingId,flatTypeId,area,ownerName,ownerPhone,ownerEmail,twoWheelerCount,fourWheelerCount,occupancyType
```

### Mapping for Your Society

Use the flat type mapping based on sinking fund amount:

| Sinking Fund | Flat Type | Area | BHK |
|--------------|-----------|------|-----|
| 58 | Type A | 580 | 1 |
| 58 | Type A (Balcony) | 576 | 1.5 |
| 60 | Type B | 596 | 2 |
| 64 | Type C | 640 | 1 |
| 73 | Type D | 726 | 2 |
| 77 | Type E | 766 | 2 |
| 83 | Type F | 833 | 2 |

### Parking Mapping

| 2-Wheeler | 4-Wheeler | Total Parking Charge | Calculation |
|-----------|-----------|----------------------|-------------|
| 0 | 0 | ₹0 | - |
| 1 | 0 | ₹40 | 1×40 |
| 2 | 0 | ₹80 | 2×40 |
| 1 | 1 | ₹140 | (1×40) + (1×100) |
| 2 | 1 | ₹180 | (2×40) + (1×100) |

### Occupancy Type Mapping

| Non-Occupancy Charge | occupancyType |
|---------------------|---------------|
| 0 | owner |
| 100 | tenant |

---

## Step 6: Handle Variable Charges

### Water Charges Workaround

Since water has 2 slabs, use this workaround:

1. **Create a "Water Adjustment" charge type** (fixed, negative)
2. For flats with Slab 1 (₹300):
   - Set Water Charges = 480 (default)
   - Add adjustment of -180 manually

OR

1. **Use the bill line item override** (manual per bill):
   - Generate bill with default water charge
   - Manually edit the water line item amount

### Future: Flat-Level Charge Override Feature

The recommended solution is to add a "Charge Overrides" feature that allows:
- Per-flat custom amounts for any charge type
- Override with fixed amount or disable entirely

---

## CSV Templates

### buildings.csv

```csv
name,totalFloors,address,isActive
A-Wing,4,,true
B-Wing,4,,true
```

### flatTypes.csv

```csv
name,defaultArea,bhkType,isActive
Type A,580,1,true
Type A (Balcony),576,1.5,true
Type B,596,2,true
Type C,640,1,true
Type D,726,2,true
Type E,766,2,true
Type F,833,2,true
```

### chargeTypes.csv

```csv
name,calculationType,defaultAmount,isMonthly,isActive,vehicleType
Service Charges,fixed,432,true,true,
Sinking Fund,per_sqft,0.10,true,true,
Major Repairs Fund,per_sqft,0.30,true,true,
Electricity Charges,fixed,250,true,true,
Water Charges,fixed,480,true,true,
Parking - 2 Wheeler,per_vehicle,40,true,true,2wheeler
Parking - 4 Wheeler,per_vehicle,100,true,true,4wheeler
Education & Training Fund,fixed,10,true,true,
Other Charges,fixed,100,true,true,
Insurance,per_sqft,0.0907,true,true,
```

### flats.csv (A-Wing)

```csv
flatNo,building,flatType,area,ownerName,ownerPhone,ownerEmail,twoWheelerCount,fourWheelerCount,occupancyType
A001,A-Wing,Type B,596,Dr. Balwant Mane,,,1,1,owner
A002,A-Wing,Type A (Balcony),576,Mr. Harish Patil,,,1,1,owner
A101,A-Wing,Type F,833,Mrs. Julie Varghese,,,0,0,owner
A102,A-Wing,Type E,766,Mr. Sapale,,,1,0,owner
A103,A-Wing,Type A,580,Mr. Dinesh Bole,,,1,0,owner
A201,A-Wing,Type F,833,Mr. B. S. Patil,,,1,0,owner
A202,A-Wing,Type E,766,Mr. R. K. Singh,,,0,0,owner
A203,A-Wing,Type A,580,Mr. Satyajeet Ingle,,,1,0,tenant
A301,A-Wing,Type D,726,Mr. Suresh Jadhav,,,2,0,owner
A302,A-Wing,Type C,640,Mr. Akbar Sheikh,,,1,0,owner
```

### flats.csv (B-Wing)

```csv
flatNo,building,flatType,area,ownerName,ownerPhone,ownerEmail,twoWheelerCount,fourWheelerCount,occupancyType
B001,B-Wing,Type B,596,Mr. Kiran Kapse,,,1,1,owner
B002,B-Wing,Type A (Balcony),576,Manoj Chavan,,,1,1,owner
B101,B-Wing,Type A,580,Mr. Tanvir Malik,,,2,1,owner
B102,B-Wing,Type E,766,Mrs. Sujata Kashinath Jadhav,,,0,0,owner
B103,B-Wing,Type F,833,Mr. P. Haridas,,,0,0,owner
B201,B-Wing,Type A,580,Mr. Chandran Nair,,,1,0,tenant
B202,B-Wing,Type E,766,Mr. Santosh Parse,,,0,0,tenant
B203,B-Wing,Type F,833,Mr. N. C. Singh,,,0,0,owner
B301,B-Wing,Type C,640,Mr. Atul Khare,,,1,0,owner
B302,B-Wing,Type D,726,Mr. Atmaram Thakur,,,1,0,owner
```

---

## Verification Checklist

After import, verify the following for sample flats:

### Sample 1: B202 - Type E (766 sq.ft., 2 BHK, Tenant)

| Charge | Expected | Calculation |
|--------|----------|-------------|
| Service Charges | 432 | Fixed |
| Sinking Fund | 77 | 766 × 0.10 = 76.6 → 77 |
| Major Repairs Fund | 230 | 766 × 0.30 = 229.8 → 230 |
| Electricity | 250 | Fixed |
| Water | 480 | 2 BHK = ₹480 |
| Parking | 0 | 0 vehicles |
| NOC | 100 | Tenant occupied |
| Education | 10 | Fixed |
| Other | 100 | Fixed |
| Insurance | 69 | 766 × 0.0907 = 69.48 → 69 |
| **Total** | **1,748** | ✓ Exact match |

### Sample 2: B201 - Type A (580 sq.ft., 1 BHK, Tenant)

| Charge | Expected | Calculation |
|--------|----------|-------------|
| Service Charges | 432 | Fixed |
| Sinking Fund | 58 | 580 × 0.10 = 58 |
| Major Repairs Fund | 174 | 580 × 0.30 = 174 |
| Electricity | 250 | Fixed |
| Water | 300 | 1 BHK = ₹300 |
| Parking | 40 | 1 × 2-wheeler |
| NOC | 100 | Tenant occupied |
| Education | 10 | Fixed |
| Other | 100 | Fixed |
| Insurance | 53 | 580 × 0.0907 = 52.61 → 53 |
| **Total** | **1,517** | ✓ Exact match |

> **Verified:** All 20 flats match exactly with the corrected rates and areas.

---

## Next Steps

1. Import buildings and flat types first
2. Configure charge types with calculated rates
3. Import flats with proper type mapping
4. Generate a test bill and compare with original
5. Adjust rates if needed to match exactly

---

## Recommended Enhancement: Charge Override Feature

To properly handle variable charges like water slabs, the following feature should be added to eSociety:

### Data Model Addition

**FlatChargeOverrides Table:**
```
flatId | chargeTypeId | overrideType | amount | isDisabled
```

- `overrideType`: "fixed" (use this amount) or "multiplier" (multiply default)
- `amount`: Override amount or multiplier value
- `isDisabled`: If true, skip this charge for this flat

This would allow:
- B202 to have Water Charges = 480 (no override)
- A103 to have Water Charges = 300 (override: fixed, 300)

See `charge-override-feature.md` for implementation details.
