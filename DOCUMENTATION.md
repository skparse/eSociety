# Society Maintenance Billing Software - Complete Documentation

## Overview
A complete Society Maintenance Billing web application using HTML5 and vanilla JavaScript, hosted on GitHub Pages with **Google Sheets** as the cloud storage backend via Google Apps Script.

---

## Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage:** Google Sheets via Google Apps Script (Free, unlimited)
- **Hosting:** GitHub Pages (static files)
- **Print:** Browser native print with CSS print styles

---

## Why Google Sheets?

| Feature | Google Sheets | JSONBin.io |
|---------|--------------|------------|
| Cost | Free (unlimited) | Free tier limits |
| Setup | One-time (5 min) | Per-user setup |
| Data Access | View/Edit in Sheets | API only |
| Rate Limits | Very generous | 10K req/month |
| Reliability | Google infrastructure | Third-party |

---

## Setup Instructions (One-Time, ~5 minutes)

### Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Name it "Society Maintenance Backend"
4. Delete all default code in the editor

### Step 2: Copy the Script Code

1. Open `google-apps-script.js` from this project
2. Copy the entire content
3. Paste it into the Apps Script editor
4. Click **Save** (Ctrl+S)

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon, select **Web app**
3. Configure:
   - **Description:** "Society Maintenance API"
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Click **Authorize access** and allow permissions
6. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/.../exec`)

### Step 4: Initialize the Application

1. Open `setup.html` in your browser
2. Paste the Web App URL
3. Click **Initialize System**
4. Wait for "Setup Complete!" message

### Step 5: Login

Use the admin credentials you set during society creation.

**Important**: Use a strong password and keep it secure!

---

## How It Works

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Your Browser   │────▶│  Google Apps Script  │────▶│  Google Sheets  │
│  (Frontend)     │◀────│  (Backend API)       │◀────│  (Database)     │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

1. **Frontend** - HTML/JS runs in browser, makes API calls
2. **Backend** - Google Apps Script handles requests, reads/writes data
3. **Database** - Google Sheets stores all data in JSON format

---

## Project Structure

```
eSociety/
├── index.html                 # Login page
├── setup.html                 # Setup wizard
├── google-apps-script.js      # Backend script (deploy to Google)
├── admin/
│   ├── dashboard.html         # Admin dashboard
│   ├── members.html           # Member management
│   ├── flats.html             # Flat management
│   ├── billing.html           # Bill generation
│   ├── payments.html          # Payment recording
│   ├── master-data.html       # Master data settings
│   └── reports.html           # Reports
├── member/
│   ├── dashboard.html         # Member dashboard
│   ├── bills.html             # View bills
│   └── payments.html          # Payment history
├── css/
│   ├── style.css              # Main styles
│   ├── admin.css              # Admin styles
│   ├── member.css             # Member styles
│   └── print.css              # Print styles
├── js/
│   ├── config.js              # Configuration
│   ├── storage.js             # API integration
│   ├── auth.js                # Authentication
│   ├── utils.js               # Utilities
│   ├── admin/                 # Admin scripts
│   └── member/                # Member scripts
├── README.md
└── DOCUMENTATION.md
```

---

## Data Models

### Users
```javascript
{
  id: "uuid",
  username: "string",
  password: "sha256_hash",
  role: "admin" | "member",
  flatId: "uuid" | null,
  name: "string",
  email: "string",
  phone: "string",
  isActive: true,
  createdAt: "ISO_date",
  updatedAt: "ISO_date"
}
```

### Buildings
```javascript
{
  id: "uuid",
  name: "string",           // Building A, Wing B
  totalFloors: number,
  address: "string",
  isActive: true
}
```

### Flat Types
```javascript
{
  id: "uuid",
  name: "string",           // 1BHK, 2BHK, Shop
  defaultArea: number,      // sq.ft
  isActive: true
}
```

### Charge Types
```javascript
{
  id: "uuid",
  name: "string",           // Maintenance, Parking
  calculationType: "per_sqft" | "fixed",
  defaultAmount: number,
  isMonthly: true,
  isActive: true
}
```

### Flats
```javascript
{
  id: "uuid",
  flatNo: "string",         // A-101
  buildingId: "uuid",
  flatTypeId: "uuid",
  area: number,             // sq.ft
  ownerName: "string",
  ownerPhone: "string",
  ownerEmail: "string",
  twoWheelerCount: number,  // Vehicles parked inside complex
  fourWheelerCount: number, // Vehicles parked inside complex
  isOccupied: true,
  isActive: true,
  createdAt: "ISO_date"
}
```

### Bills
```javascript
{
  id: "uuid",
  billNo: "BILL-2024-01-001",
  flatId: "uuid",
  month: 1-12,
  year: 2024,
  lineItems: [{
    chargeTypeId: "uuid",
    description: "string",
    amount: number
  }],
  totalAmount: number,
  previousDue: number,
  grandTotal: number,
  status: "pending" | "partial" | "paid",
  paidAmount: number,
  dueDate: "ISO_date",
  generatedAt: "ISO_date"
}
```

### Payments
```javascript
{
  id: "uuid",
  receiptNo: "RCP-2024-01-001",
  flatId: "uuid",
  billId: "uuid" | null,
  amount: number,
  paymentMode: "cash" | "cheque" | "upi" | "bank_transfer",
  referenceNo: "string",
  paymentDate: "ISO_date",
  receivedBy: "uuid",
  remarks: "string",
  createdAt: "ISO_date"
}
```

---

## Google Sheets Structure

A Google Sheet named "Society Maintenance Data" is created with these sheets:

| Sheet | Content |
|-------|---------|
| Settings | Society name, address, billing config |
| MasterData | Buildings, flat types, charge types |
| Users | User accounts (admin + members) |
| Flats | All flat information |
| Bills | Generated maintenance bills |
| Payments | Payment records |

Each sheet stores JSON data in cell A1.

---

## API Endpoints

The Google Apps Script exposes these actions:

| Action | Method | Description |
|--------|--------|-------------|
| `status` | GET | Check if system is initialized |
| `init` | POST | Initialize with default data |
| `read` | GET | Read data from a sheet |
| `write` | POST | Write data to a sheet |

Example URLs:
```
GET  ?action=status
GET  ?action=read&sheet=Users
POST ?action=write&sheet=Flats  (with JSON body)
POST ?action=init
```

---

## Features

### Admin Features
1. **Dashboard** - Stats, quick actions
2. **Member Management** - CRUD, link to flats
3. **Flat Management** - CRUD with building/type
4. **Master Data** - Buildings, types, charges
5. **Billing** - Generate, view, print bills
6. **Payments** - Record, receipts
7. **Reports** - Outstanding, collection, ledger

### Member Features
1. **Dashboard** - Outstanding amount
2. **Bills** - View and print
3. **Payments** - History and receipts

---

## Default Configuration

### Flat Types
- 1 BHK (450 sq.ft)
- 2 BHK (750 sq.ft)
- 3 BHK (1100 sq.ft)
- Shop (200 sq.ft)

### Charge Types
- Maintenance: ₹3/sq.ft
- Sinking Fund: ₹0.5/sq.ft
- Water Charges: ₹200 fixed
- Parking - 2 Wheeler: ₹100/vehicle (only if parked inside complex)
- Parking - 4 Wheeler: ₹500/vehicle (only if parked inside complex)

### Admin Credentials
- Username: `admin`
- Password: Set during society creation (min 6 characters)

---

## Troubleshooting

### Setup Fails
1. Verify script is deployed as **Web app**
2. Check "Who has access" = **Anyone**
3. URL must end with `/exec`
4. Try re-deploying the script

### Cannot Login
```javascript
// Clear stored data in browser console:
localStorage.clear();
```
Then run setup again.

### Data Not Loading
1. Check browser console for errors
2. Verify Web App URL is correct
3. Check Google Sheets has data

### CORS Errors
Google Apps Script uses redirects which can cause CORS warnings. The app handles this - if data loads, ignore the warnings.

### Update Script
If you modify the Apps Script:
1. Click **Deploy** → **Manage deployments**
2. Click pencil icon on existing deployment
3. Change version to **New version**
4. Click **Deploy**

---

## Security

- Passwords hashed with SHA-256 (server-side)
- Session expires after 30 minutes
- Role-based access (Admin/Member)
- Data stored in YOUR Google account
- No third-party access to data

---

## Limitations

- Google Apps Script quota: 6 min execution time
- ~20,000 calls/day (more than enough)
- Data size: Google Sheets limit (~5M cells)
- Single society per installation

---

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

---

## Console Commands

```javascript
// Check configuration
console.log('URL:', localStorage.getItem('society_script_url'));

// Clear all data
localStorage.clear();

// Check session
console.log('Session:', localStorage.getItem('society_session'));
```

---

## Version History

- **v1.1.0** - Google Sheets backend
  - Replaced JSONBin.io with Google Apps Script
  - Simplified setup process
  - Central data storage
  - View data in Google Sheets

- **v1.0.0** - Initial release
  - JSONBin.io backend
  - Full admin/member functionality

---

## License

Open source - free for personal and commercial use.
