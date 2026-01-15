# Society Maintenance Billing System

A complete web-based Society Maintenance Billing software built with HTML5 and vanilla JavaScript. Designed to run on GitHub Pages with **Google Sheets** as the cloud storage backend.

## Features

### Admin Portal
- **Dashboard** - Overview of flats, members, bills, and outstanding amounts
- **Flat Management** - Add, edit, delete flats with building and type assignment
- **Member Management** - Create member accounts, link to flats, reset passwords
- **Master Data** - Manage buildings, flat types, charge types, and society settings
- **Billing** - Generate monthly bills (individual or bulk), view and print bills
- **Payments** - Record payments, generate receipts, partial payment support
- **Reports** - Outstanding report, collection report, flat-wise ledger with CSV export

### Member Portal
- **Dashboard** - View outstanding amount and flat information
- **Bills** - View all bills with detailed breakdown, print bills
- **Payments** - View payment history, print receipts

### Billing Features
- Per square foot billing calculation
- Fixed amount billing
- Multiple charge types (Maintenance, Parking, Water, Sinking Fund, etc.)
- Previous due carry forward
- Bill status tracking (Pending, Partial, Paid)

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: Google Sheets via Google Apps Script (Free, unlimited)
- **Hosting**: GitHub Pages (or any static hosting)

## Quick Setup (5 minutes)

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

### Step 2: Configure the Application

1. Open `setup.html` in your browser
2. Paste the Web App URL
3. Click **Initialize System**
4. Wait for setup to complete

### Step 3: Login

Default credentials:
- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change the admin password after first login!

## Deployment to GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to **Settings** > **Pages**
4. Select the branch (usually `main`) and save
5. Your site will be available at `https://yourusername.github.io/repository-name`

**Note**: Users only need the Web App URL to connect - no additional setup required on their devices.

## Project Structure

```
eSociety/
├── index.html              # Login page
├── setup.html              # One-time setup page
├── google-apps-script.js   # Script to deploy to Google Apps Script
├── admin/
│   ├── dashboard.html      # Admin dashboard
│   ├── flats.html          # Flat management
│   ├── members.html        # Member management
│   ├── billing.html        # Bill generation & management
│   ├── payments.html       # Payment recording
│   ├── master-data.html    # Master data settings
│   └── reports.html        # Various reports
├── member/
│   ├── dashboard.html      # Member dashboard
│   ├── bills.html          # View bills
│   └── payments.html       # Payment history
├── css/
│   ├── style.css           # Main styles
│   ├── admin.css           # Admin-specific styles
│   ├── member.css          # Member-specific styles
│   └── print.css           # Print styles
├── js/
│   ├── config.js           # Configuration
│   ├── storage.js          # Google Apps Script integration
│   ├── auth.js             # Authentication
│   ├── utils.js            # Utility functions
│   ├── admin/              # Admin page scripts
│   └── member/             # Member page scripts
├── README.md
└── DOCUMENTATION.md        # Detailed documentation
```

## Data Storage

All data is stored in a Google Sheet (automatically created):
- `Settings` - Society configuration
- `MasterData` - Buildings, flat types, charge types
- `Users` - User accounts
- `Flats` - Flat information
- `Bills` - Generated bills
- `Payments` - Payment records

You can view and edit the data directly in Google Sheets!

## Security Notes

- Passwords are hashed using SHA-256
- Session expires after 30 minutes of inactivity
- Role-based access control (Admin/Member)
- Data stored in your own Google account

## Troubleshooting

### "Setup Failed" error
- Verify the Apps Script is deployed as a Web App
- Check "Who has access" is set to "Anyone"
- Make sure you copied the correct URL (ends with `/exec`)

### Cannot login
- Clear browser cache and localStorage
- Verify the Web App URL is saved correctly
- Try re-running the setup

### CORS errors
- This is normal for Google Apps Script - it uses redirects
- The app handles this automatically

## License

This project is open source and available for personal and commercial use.

## Support

For issues and feature requests, please create an issue in the GitHub repository.
