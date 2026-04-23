/**
 * GAS Web App handler for Dashboard PT MPG
 * Deploy this script as a "Web App"
 * Execute as: "Me"
 * Who has access: "Anyone"
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Ganti dengan ID Spreadsheet Anda
const DATA_SHEET_NAME = 'Users'; // Nama sheet yang berisi data user

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const output = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
  
  if (!e.postData || !e.postData.contents) {
    return output.setContent(JSON.stringify({ success: false, message: 'No payload provided' }));
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return output.setContent(JSON.stringify({ success: false, message: 'Invalid JSON' }));
  }

  const { action, username, password } = data;

  if (action === 'login') {
    return processLogin(username, password, output);
  }

  return output.setContent(JSON.stringify({ success: false, message: 'Unknown action' }));
}

function processLogin(username, password, output) {
  if (!username || !password) {
     return output.setContent(JSON.stringify({ success: false, message: 'Username and password required' }));
  }
  
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DATA_SHEET_NAME);
    if (!sheet) {
      return output.setContent(JSON.stringify({ success: false, message: 'Sheet Users tidak ditemukan di konfigurasi GAS' }));
    }

    const data = sheet.getDataRange().getValues(); // Asumsi: Kolom A: Username, Kolom B: Password, Kolom C: Nama Lengkap
    
    let isMatch = false;
    let actualName = username;

    for (let i = 1; i < data.length; i++) {
       const rowUsername = String(data[i][0]).trim().toLowerCase();
       const rowPassword = String(data[i][1]);

       if (rowUsername === username.toLowerCase() && rowPassword === password) {
          isMatch = true;
          actualName = String(data[i][2] || rowUsername);
          break;
       }
    }

    if (isMatch) {
       return output.setContent(JSON.stringify({ success: true, username: actualName }));
    } else {
       return output.setContent(JSON.stringify({ success: false, message: 'Username atau password salah' }));
    }
  } catch(e) {
    return output.setContent(JSON.stringify({ success: false, message: 'System Error: ' + e.toString() }));
  }
}
