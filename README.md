# eSociety - Society Maintenance Billing System

A modern, cloud-based Society Maintenance Billing System built as a Progressive Web App (PWA). Designed for residential and commercial societies to manage billing, payments, and member information with ease.

## Features

### Multi-Tenant Architecture
- Support for multiple societies/buildings from a single deployment
- Each society gets its own isolated Google Spreadsheet database
- Superadmin dashboard to manage all societies

### Admin Portal
- **Dashboard** - Overview of flats, members, bills, and outstanding amounts with quick actions
- **Flat Management** - Add, edit, delete flats with building and type assignment
- **Member Management** - Create member accounts, link to flats, reset passwords
- **Master Data** - Manage buildings, flat types, charge types, and society settings
- **Billing** - Generate monthly bills (individual or bulk), view and print bills
- **Payments** - Record payments, generate receipts, partial payment support
- **Reports** - Outstanding report, collection report, flat-wise ledger with CSV export
- **Bulk Import** - Import buildings, flats, and members via CSV files

### Member Portal
- **Dashboard** - View outstanding amount and flat information
- **Bills** - View all bills with detailed breakdown, print bills
- **Payments** - View payment history, print receipts

### Billing Features
- Per square foot billing calculation
- Fixed amount billing
- Per-vehicle billing (parking charges)
- Multiple charge types (Maintenance, Parking, Water, Sinking Fund, etc.)
- Previous due carry forward
- Bill status tracking (Pending, Partial, Paid)
- Configurable due dates and late fees

### PWA Features
- **Installable** - Add to home screen on mobile/desktop
- **Offline Support** - Service worker caching for offline access
- **Responsive Design** - Mobile-first, works on all devices
- **Fast Loading** - Optimized caching strategy

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Google Apps Script (serverless) |
| **Database** | Google Sheets (JSON stored in cells) |
| **Storage** | Browser localStorage + Google Sheets |
| **Hosting** | GitHub Pages / Any static hosting |
| **Caching** | Service Worker + 5-minute data TTL |

## Project Structure

```
eSociety/
├── index.html                    # Login page (multi-society)
├── login.html                    # Alternative login
├── manifest.json                 # PWA manifest
├── service-worker.js             # Offline support
├── google-apps-script.js         # Backend script (deploy to Google, gitignored)
├── .gitignore                    # Git ignore rules
│
├── admin/                        # Admin Portal
│   ├── dashboard.html            # Stats, overview, quick actions
│   ├── flats.html                # Flat CRUD management
│   ├── members.html              # Member/user management
│   ├── billing.html              # Bill generation & viewing
│   ├── payments.html             # Payment recording
│   ├── master-data.html          # Buildings, types, charges, import
│   └── reports.html              # Outstanding, collection, ledger
│
├── member/                       # Member Portal
│   ├── dashboard.html            # Outstanding balance, stats
│   ├── bills.html                # View all bills
│   └── payments.html             # Payment history
│
├── superadmin/                   # Super Admin Portal
│   ├── login.html                # Super admin login
│   └── dashboard.html            # Create/manage societies
│
├── js/
│   ├── config.js                 # Configuration & constants
│   ├── storage.js                # Google Apps Script API integration
│   ├── auth.js                   # Authentication & session management
│   ├── utils.js                  # Utility functions
│   ├── mobile.js                 # Mobile gestures & PWA enhancements
│   ├── admin/                    # Admin-specific scripts
│   └── member/                   # Member-specific scripts
│
├── css/
│   ├── style.css                 # Global styles
│   ├── admin.css                 # Admin-specific styles
│   ├── member.css                # Member-specific styles
│   └── print.css                 # Print-optimized styles
│
├── icons/                        # PWA icons (72px to 512px)
│
├── docs/
│   └── setup-guide.html          # Interactive setup guide
│
└── DOCUMENTATION.md              # Detailed documentation
```

## Quick Setup

### Prerequisites
- Google Account
- Web hosting (GitHub Pages, Netlify, or any static host)

### Important: Security Note

The following files are excluded from git via `.gitignore` to prevent accidentally exposing sensitive data:

- `google-apps-script.js` - Backend code (deploy directly to Google Apps Script)
- `js/config.js` - Contains your Web App URL

Before pushing to git:
1. Make sure `.gitignore` is committed first
2. Keep local backups of these files securely

### Step 1: Deploy Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Delete the default code
4. Copy the code from `google-apps-script.js` and paste it
5. Click **Deploy → New deployment**
6. Select **Web app**
7. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** and authorize when prompted
9. **Copy the Web App URL**

### Step 2: Setup Superadmin

1. In the Apps Script editor, run the `setupSuperadminSheet()` function
2. Note down the generated credentials from the execution result
3. These credentials are used to login as superadmin

### Step 3: Configure the Application

1. Open `js/config.js` in a text editor
2. Paste your Web App URL in the `WEB_APP_URL` field
3. Save the file

### Step 4: Deploy to Hosting

1. Upload all files to your web hosting
2. For GitHub Pages:
   - Create a new repository
   - Push all files
   - Go to Settings → Pages
   - Select your branch and save

### Step 5: Create Your First Society

1. Open the application URL
2. Click on **"Super Admin"** tab
3. Login with your superadmin credentials
4. Click **"+ Create Society"**
5. Enter society code, name, and admin password
6. Note down the admin credentials

### Step 6: Login as Society Admin

1. Go to the main login page
2. Enter the society code
3. Login with the admin credentials you set

## User Roles

| Role | Access | Capabilities |
|------|--------|--------------|
| **Super Admin** | All societies | Create/manage societies, view statistics |
| **Society Admin** | Single society | Manage flats, members, billing, payments, reports |
| **Member** | Single society | View own bills and payment history |

## Default Charge Types

| Charge | Type | Default Amount |
|--------|------|----------------|
| Maintenance | Per sq.ft | ₹3/sq.ft |
| Sinking Fund | Per sq.ft | ₹0.50/sq.ft |
| Water Charges | Fixed | ₹200 |
| Parking - 2 Wheeler | Per vehicle | ₹100 |
| Parking - 4 Wheeler | Per vehicle | ₹500 |

## Security Features

- **Password Hashing** - SHA-256 hashing for all passwords
- **Session Management** - 30-minute timeout with activity refresh
- **Role-Based Access** - Strict access control by user role
- **Data Isolation** - Each society's data is in a separate spreadsheet
- **Soft Deletes** - Users are deactivated, not permanently deleted
- **Your Data** - All data stored in your own Google account

## Data Storage

All data is stored in Google Sheets (automatically created):

| Sheet | Content |
|-------|---------|
| Settings | Society name, address, billing config |
| MasterData | Buildings, flat types, charge types |
| Users | User accounts (admin + members) |
| Flats | All flat information |
| Bills | Generated maintenance bills |
| Payments | Payment records |

You can view and edit the data directly in Google Sheets!

## API Reference

The Google Apps Script exposes these actions:

| Action | Description |
|--------|-------------|
| `superadminLogin` | Authenticate superadmin |
| `createSociety` | Create a new society |
| `listSocieties` | List all societies |
| `validateSociety` | Check if society exists |
| `init` | Initialize society data |
| `read` | Read from a sheet |
| `write` | Write to a sheet |
| `status` | Get society status |

## Troubleshooting

### Setup Fails
- Verify script is deployed as **Web app**
- Check "Who has access" is set to **Anyone**
- URL must end with `/exec`
- Try re-deploying the script

### Cannot Login
```javascript
// Clear stored data in browser console:
localStorage.clear();
```
Then try logging in again.

### Data Not Loading
1. Check browser console for errors
2. Verify Web App URL is correct in config.js
3. Check Google Sheets has data

### CORS Errors
Google Apps Script uses redirects which can cause CORS warnings. The app handles this automatically - if data loads, ignore the warnings.

### Update Script
If you modify the Apps Script:
1. Click **Deploy → Manage deployments**
2. Click pencil icon on existing deployment
3. Change version to **New version**
4. Click **Deploy**

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

- Google Apps Script quota: 6 min execution time
- ~20,000 API calls/day (more than sufficient for typical usage)
- Data size: Google Sheets limit (~5M cells)
- Requires internet connection (no offline data sync)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is open source and available for personal and commercial use.

## Support

For issues and feature requests, please create an issue in the GitHub repository.

---

**Made with care for residential societies everywhere.**
