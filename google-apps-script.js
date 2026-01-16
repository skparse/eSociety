/**
 * Society Maintenance Billing System
 * Google Apps Script Backend - Multi-Tenant Version
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
 * 9. Copy the Web App URL and paste it in config.js
 */

// Sheet names for each society
const SHEETS = {
  SETTINGS: 'Settings',
  MASTER_DATA: 'MasterData',
  USERS: 'Users',
  FLATS: 'Flats',
  BILLS: 'Bills',
  PAYMENTS: 'Payments'
};

// Superadmin credentials (CHANGE THESE!)
const SUPERADMIN = {
  username: 'superadmin',
  // Default password: 'password' - CHANGE THIS after first login!
  // Run resetSuperadminPassword() function to generate a new hash
  passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
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
    const societyId = params.societyId;

    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    let result;

    // Superadmin actions (no societyId required)
    switch(action) {
      case 'superadminLogin':
        result = superadminLogin(e);
        break;
      case 'createSociety':
        result = createSociety(e);
        break;
      case 'listSocieties':
        result = listSocieties();
        break;
      case 'deleteSociety':
        result = deleteSociety(params.societyId);
        break;
      case 'getSocietyInfo':
        result = getSocietyInfo(params.societyId);
        break;
      case 'validateSociety':
        result = validateSociety(params.societyId);
        break;

      // Society-specific actions (require societyId)
      case 'init':
        result = initializeSociety(e, societyId);
        break;
      case 'read':
        result = readData(societyId, params.sheet);
        break;
      case 'write':
        const postData = JSON.parse(e.postData.contents);
        result = writeData(societyId, params.sheet, postData);
        break;
      case 'status':
        result = getStatus(societyId);
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

// ==================== SUPERADMIN FUNCTIONS ====================

/**
 * Superadmin login
 */
function superadminLogin(e) {
  try {
    const postData = e.postData ? JSON.parse(e.postData.contents) : {};
    const { username, password } = postData;

    if (!username || !password) {
      return { success: false, error: 'Username and password required' };
    }

    const hashedPassword = hashPassword(password);

    if (username === SUPERADMIN.username && hashedPassword === SUPERADMIN.passwordHash) {
      return {
        success: true,
        role: 'superadmin',
        message: 'Superadmin login successful'
      };
    }

    return { success: false, error: 'Invalid credentials' };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new society
 */
function createSociety(e) {
  try {
    const postData = e.postData ? JSON.parse(e.postData.contents) : {};
    const { societyCode, societyName, adminPassword } = postData;

    if (!societyCode || !societyName) {
      return { success: false, error: 'Society code and name are required' };
    }

    // Validate society code format (alphanumeric, 3-10 chars)
    if (!/^[A-Z0-9]{3,10}$/i.test(societyCode)) {
      return { success: false, error: 'Society code must be 3-10 alphanumeric characters' };
    }

    const societyIdUpper = societyCode.toUpperCase();
    const scriptProperties = PropertiesService.getScriptProperties();

    // Check if society already exists
    const existingId = scriptProperties.getProperty('society_' + societyIdUpper);
    if (existingId) {
      return { success: false, error: 'Society code already exists' };
    }

    // Create new spreadsheet for this society
    const ss = SpreadsheetApp.create('Society Data - ' + societyIdUpper);
    const spreadsheetId = ss.getId();

    // Store the mapping
    scriptProperties.setProperty('society_' + societyIdUpper, spreadsheetId);

    // Store society metadata
    const societies = getSocietiesRegistry();
    societies.push({
      id: societyIdUpper,
      name: societyName,
      spreadsheetId: spreadsheetId,
      spreadsheetUrl: ss.getUrl(),
      createdAt: new Date().toISOString(),
      isActive: true
    });
    scriptProperties.setProperty('societies_registry', JSON.stringify(societies));

    // Create sheets structure
    createSheets(ss);

    // Initialize with default data and admin user
    const password = adminPassword || 'admin123';
    const defaultAdmin = {
      id: generateId(),
      username: 'admin',
      password: hashPassword(password),
      role: 'admin',
      flatId: null,
      name: 'Administrator',
      email: 'admin@' + societyIdUpper.toLowerCase() + '.com',
      phone: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const settings = { ...INITIAL_DATA.settings, societyName: societyName };

    writeToSheet(ss, SHEETS.SETTINGS, settings);
    writeToSheet(ss, SHEETS.MASTER_DATA, INITIAL_DATA.masterData);
    writeToSheet(ss, SHEETS.USERS, [defaultAdmin]);
    writeToSheet(ss, SHEETS.FLATS, []);
    writeToSheet(ss, SHEETS.BILLS, []);
    writeToSheet(ss, SHEETS.PAYMENTS, []);

    return {
      success: true,
      message: 'Society created successfully',
      society: {
        id: societyIdUpper,
        name: societyName,
        spreadsheetUrl: ss.getUrl(),
        adminUsername: 'admin',
        adminPassword: password
      }
    };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * List all societies
 */
function listSocieties() {
  try {
    const societies = getSocietiesRegistry();
    return { success: true, societies: societies };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a society (soft delete)
 */
function deleteSociety(societyId) {
  try {
    if (!societyId) {
      return { success: false, error: 'Society ID required' };
    }

    const societyIdUpper = societyId.toUpperCase();
    const societies = getSocietiesRegistry();
    const index = societies.findIndex(s => s.id === societyIdUpper);

    if (index === -1) {
      return { success: false, error: 'Society not found' };
    }

    // Soft delete - mark as inactive
    societies[index].isActive = false;
    societies[index].deletedAt = new Date().toISOString();

    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('societies_registry', JSON.stringify(societies));

    return { success: true, message: 'Society deactivated successfully' };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get society info by ID
 */
function getSocietyInfo(societyId) {
  try {
    if (!societyId) {
      return { success: false, error: 'Society ID required' };
    }

    const societyIdUpper = societyId.toUpperCase();
    const societies = getSocietiesRegistry();
    const society = societies.find(s => s.id === societyIdUpper && s.isActive);

    if (!society) {
      return { success: false, error: 'Society not found' };
    }

    return { success: true, society: society };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Validate if society exists and is active
 */
function validateSociety(societyId) {
  try {
    if (!societyId) {
      return { success: false, valid: false, error: 'Society ID required' };
    }

    const societyIdUpper = societyId.toUpperCase();
    const societies = getSocietiesRegistry();
    const society = societies.find(s => s.id === societyIdUpper && s.isActive);

    if (!society) {
      return { success: true, valid: false };
    }

    return { success: true, valid: true, societyName: society.name };
  } catch(error) {
    return { success: false, valid: false, error: error.message };
  }
}

/**
 * Get societies registry
 */
function getSocietiesRegistry() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const registryStr = scriptProperties.getProperty('societies_registry');

  if (!registryStr) {
    return [];
  }

  try {
    return JSON.parse(registryStr);
  } catch(e) {
    return [];
  }
}

// ==================== SOCIETY-SPECIFIC FUNCTIONS ====================

/**
 * Get spreadsheet for a society
 */
function getSocietySpreadsheet(societyId) {
  if (!societyId) {
    throw new Error('Society ID is required');
  }

  const societyIdUpper = societyId.toUpperCase();
  const scriptProperties = PropertiesService.getScriptProperties();
  const spreadsheetId = scriptProperties.getProperty('society_' + societyIdUpper);

  if (!spreadsheetId) {
    throw new Error('Society not found: ' + societyId);
  }

  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch(e) {
    throw new Error('Could not access society data');
  }
}

/**
 * Create all required sheets
 */
function createSheets(ss) {
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
 * Initialize society (if called directly without createSociety)
 */
function initializeSociety(e, societyId) {
  try {
    const ss = getSocietySpreadsheet(societyId);
    const postData = e.postData ? JSON.parse(e.postData.contents) : {};

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

    writeToSheet(ss, SHEETS.SETTINGS, INITIAL_DATA.settings);
    writeToSheet(ss, SHEETS.MASTER_DATA, INITIAL_DATA.masterData);
    writeToSheet(ss, SHEETS.USERS, [defaultAdmin]);
    writeToSheet(ss, SHEETS.FLATS, []);
    writeToSheet(ss, SHEETS.BILLS, []);
    writeToSheet(ss, SHEETS.PAYMENTS, []);

    return {
      success: true,
      message: 'Society initialized successfully'
    };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

/**
 * Read data from a society's sheet
 */
function readData(societyId, sheetName) {
  try {
    const ss = getSocietySpreadsheet(societyId);
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
 * Write data to a society's sheet
 */
function writeData(societyId, sheetName, data) {
  try {
    const ss = getSocietySpreadsheet(societyId);
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
 * Get society status
 */
function getStatus(societyId) {
  try {
    const ss = getSocietySpreadsheet(societyId);
    const configSheet = ss.getSheetByName(SHEETS.SETTINGS);
    const hasData = configSheet && configSheet.getLastRow() > 0;

    return {
      success: true,
      initialized: hasData,
      spreadsheetUrl: ss.getUrl()
    };

  } catch(error) {
    return { success: false, error: error.message };
  }
}

// ==================== UTILITY FUNCTIONS ====================

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
  Logger.log('Testing multi-tenant script...');

  // List societies
  const societies = listSocieties();
  Logger.log('Societies: ' + JSON.stringify(societies));
}

/**
 * Reset superadmin password (run this manually if needed)
 * Change the password below before running
 */
function resetSuperadminPassword() {
  const newPassword = 'super@123'; // CHANGE THIS!
  const hash = hashPassword(newPassword);
  Logger.log('New password hash (update SUPERADMIN.passwordHash with this): ' + hash);
}
