/**
 * Society Maintenance Billing System
 * Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project (click "New Project")
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy" and authorize when prompted
 * 9. Copy the Web App URL and use it in your application
 */

// Spreadsheet ID - will be auto-created on first run
let SPREADSHEET_ID = null;

// Sheet names
const SHEETS = {
  SETTINGS: 'Settings',
  MASTER_DATA: 'MasterData',
  USERS: 'Users',
  FLATS: 'Flats',
  BILLS: 'Bills',
  PAYMENTS: 'Payments',
  CONFIG: '_Config'
};

// Default data templates
const INITIAL_DATA = {
  settings: {
    societyName: 'My Society',
    address: '',
    registrationNo: '',
    phone: '',
    email: '',
    billingDay: 1,
    dueDays: 15,
    lateFeePercent: 2,
    logo: ''
  },
  masterData: {
    buildings: [],
    flatTypes: [
      { id: 'ft-1', name: '1 BHK', defaultArea: 450, isActive: true },
      { id: 'ft-2', name: '2 BHK', defaultArea: 750, isActive: true },
      { id: 'ft-3', name: '3 BHK', defaultArea: 1100, isActive: true },
      { id: 'ft-4', name: 'Shop', defaultArea: 200, isActive: true }
    ],
    chargeTypes: [
      { id: 'ct-1', name: 'Maintenance', calculationType: 'per_sqft', defaultAmount: 3, isMonthly: true, isActive: true },
      { id: 'ct-2', name: 'Sinking Fund', calculationType: 'per_sqft', defaultAmount: 0.5, isMonthly: true, isActive: true },
      { id: 'ct-3', name: 'Water Charges', calculationType: 'fixed', defaultAmount: 200, isMonthly: true, isActive: true },
      { id: 'ct-4', name: 'Parking - 2 Wheeler', calculationType: 'per_vehicle', defaultAmount: 100, isMonthly: true, isActive: true, vehicleType: '2wheeler' },
      { id: 'ct-5', name: 'Parking - 4 Wheeler', calculationType: 'per_vehicle', defaultAmount: 500, isMonthly: true, isActive: true, vehicleType: '4wheeler' }
    ]
  },
  users: [],
  flats: [],
  bills: [],
  payments: []
};

/**
 * Handle GET requests
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Handle POST requests
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Main request handler
 */
function handleRequest(e) {
  try {
    const params = e.parameter;
    const action = params.action;

    // Set CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    let result;

    switch(action) {
      case 'init':
        result = initializeSystem(e);
        break;
      case 'read':
        result = readData(params.sheet);
        break;
      case 'write':
        const postData = JSON.parse(e.postData.contents);
        result = writeData(params.sheet, postData);
        break;
      case 'status':
        result = getStatus();
        break;
      default:
        result = { success: false, error: 'Invalid action' };
    }

    output.setContent(JSON.stringify(result));
    return output;

  } catch(error) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({
      success: false,
      error: error.message
    }));
    return output;
  }
}

/**
 * Get or create the spreadsheet
 */
function getSpreadsheet() {
  // Check if we have a stored spreadsheet ID
  const scriptProperties = PropertiesService.getScriptProperties();
  SPREADSHEET_ID = scriptProperties.getProperty('SPREADSHEET_ID');

  if (SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch(e) {
      // Spreadsheet was deleted, create new one
      SPREADSHEET_ID = null;
    }
  }

  // Create new spreadsheet
  const ss = SpreadsheetApp.create('Society Maintenance Data');
  SPREADSHEET_ID = ss.getId();
  scriptProperties.setProperty('SPREADSHEET_ID', SPREADSHEET_ID);

  // Create all required sheets
  createSheets(ss);

  return ss;
}

/**
 * Create all required sheets
 */
function createSheets(ss) {
  // Get or create each sheet
  Object.values(SHEETS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
  });

  // Remove the default "Sheet1" if it exists
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }
}

/**
 * Initialize the system with default data
 */
function initializeSystem(e) {
  try {
    const ss = getSpreadsheet();
    const postData = e.postData ? JSON.parse(e.postData.contents) : {};

    // Create default admin user
    const adminPassword = postData.adminPassword || 'admin123';
    const defaultAdmin = {
      id: generateId(),
      username: 'admin',
      password: hashPassword(adminPassword),
      role: 'admin',
      flatId: null,
      name: 'Administrator',
      email: 'admin@society.com',
      phone: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Write initial data to each sheet
    writeToSheet(ss, SHEETS.SETTINGS, INITIAL_DATA.settings);
    writeToSheet(ss, SHEETS.MASTER_DATA, INITIAL_DATA.masterData);
    writeToSheet(ss, SHEETS.USERS, [defaultAdmin]);
    writeToSheet(ss, SHEETS.FLATS, []);
    writeToSheet(ss, SHEETS.BILLS, []);
    writeToSheet(ss, SHEETS.PAYMENTS, []);

    return {
      success: true,
      message: 'System initialized successfully',
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: ss.getUrl()
    };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Read data from a sheet
 */
function readData(sheetName) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + sheetName };
    }

    const data = readFromSheet(sheet);
    return { success: true, data: data };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Write data to a sheet
 */
function writeData(sheetName, data) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + sheetName };
    }

    writeToSheet(ss, sheetName, data);
    return { success: true, message: 'Data saved successfully' };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get system status
 */
function getStatus() {
  try {
    const ss = getSpreadsheet();
    const configSheet = ss.getSheetByName(SHEETS.SETTINGS);
    const hasData = configSheet && configSheet.getLastRow() > 0;

    return {
      success: true,
      initialized: hasData,
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetUrl: ss.getUrl()
    };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Read JSON data from a sheet (stored in cell A1)
 */
function readFromSheet(sheet) {
  const value = sheet.getRange('A1').getValue();
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch(e) {
    return value;
  }
}

/**
 * Write JSON data to a sheet (stored in cell A1)
 */
function writeToSheet(ss, sheetName, data) {
  const sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    const jsonString = JSON.stringify(data);
    sheet.getRange('A1').setValue(jsonString);
  }
}

/**
 * Generate a unique ID
 */
function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  let hash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hex = (rawHash[i] & 0xFF).toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hash += hex;
  }
  return hash;
}

/**
 * Test function - run this to verify the script works
 */
function testScript() {
  const status = getStatus();
  Logger.log('Status: ' + JSON.stringify(status));

  if (!status.initialized) {
    const initResult = initializeSystem({ postData: null });
    Logger.log('Init Result: ' + JSON.stringify(initResult));
  }

  const settings = readData('Settings');
  Logger.log('Settings: ' + JSON.stringify(settings));
}
