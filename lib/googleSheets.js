import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import creds from '../nobita.json'; 

let doc;
const headerIndex = 2; // Assuming headers are on row 1

async function loadSheet() {
  if (doc) return doc;
  
  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  doc = new GoogleSpreadsheet('10YblmbZ4-_UwleQYShg8mP2Ov3uRQCZDHV5AEX7uik8', serviceAccountAuth);

  await doc.loadInfo();
  return doc;
}

export const db = {
  // --- NEW METHOD: Get all sheet titles dynamically ---
  getSheets: async () => {
    const doc = await loadSheet();
    // Returns an array of strings: ['Sheet1', 'case-studies', 'Sheet3'...]
    return doc.sheetsByIndex.map(sheet => sheet.title);
  },

  getAll: async (sheetTitle = 'Sheet1') => {
    const doc = await loadSheet();
    const sheet = doc.sheetsByTitle[sheetTitle];
    if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found`);

    await sheet.loadHeaderRow(headerIndex);
    const headers = sheet.headerValues;
    const rows = await sheet.getRows();
    
    return rows.map((row) => {
      const cleanRow = {};
      headers.forEach((header) => {
        const cellValue = row.get(header);
        cleanRow[header] = (cellValue === undefined || cellValue === null) ? "" : cellValue;
      });
      cleanRow.rowIndex = row.rowIndex; 
      return cleanRow;
    });
  },
  
  // ... (keep getColumn, findOne, query as they were) ...
  getColumn: async (columns = [], sheetTitle = 'Sheet1') => {
    const allRows = await db.getAll(sheetTitle); 
    return allRows.map((row) => {
      const filteredRow = {};
      columns.forEach((col) => {
        if (Object.prototype.hasOwnProperty.call(row, col)) {
          filteredRow[col] = row[col];
        }
      });
      return filteredRow;
    });
  },

  findOne: async (column, value, sheetTitle = 'Sheet1') => {
    const allRows = await db.getAll(sheetTitle);
    return allRows.find((row) => row[column] === value) || null;
  },
  
  query: async (filterFn, sheetTitle = 'Sheet1') => {
    const allRows = await db.getAll(sheetTitle);
    return allRows.filter(filterFn);
  },

  // --- WRITE METHODS ---
  add: async (data, sheetTitle = 'Sheet1') => {
    const doc = await loadSheet();
    const sheet = doc.sheetsByTitle[sheetTitle];
    await sheet.addRow(data);
    return true;
  },

  update: async (s_no, data, sheetTitle = 'Sheet1') => {
    const doc = await loadSheet();
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('s_no') == s_no);
    if (row) {
      row.assign(data);
      await row.save();
      return true;
    }
    return false;
  },

  delete: async (s_no, sheetTitle = 'Sheet1') => {
    const doc = await loadSheet();
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('s_no') == s_no);
    if (row) {
      await row.delete();
      return true;
    }
    return false;
  }
};