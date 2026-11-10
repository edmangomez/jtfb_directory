import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PORT = process.env.PORT || 3001;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DATABASE_FILE = path.join(DATA_DIR, 'database.json');
const VERSIONS_FILE = path.join(DATA_DIR, 'versions.json');

// Default initial administrators
const DEFAULT_USERS = [
  {
    id: 'u_admin',
    username: 'admin',
    name: 'JTFB Chief Administrator',
    role: 'admin',
    password: 'admin',
    createdAt: '2026-11-10'
  },
  {
    id: 'u_telecom',
    username: 'telecom',
    name: 'Telecom Lead Specialist',
    role: 'admin',
    password: 'telecom123',
    createdAt: '2026-11-10'
  }
];

function readJson(file, defaultVal) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultVal;
}

function writeJson(file, data) {
  try {
    const tempFile = `${file}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, file);
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Initialize files if not present
function initFiles() {
  if (!fs.existsSync(USERS_FILE)) {
    writeJson(USERS_FILE, DEFAULT_USERS);
  }
  if (!fs.existsSync(VERSIONS_FILE)) {
    // Initial version placeholder
    const initVer = [{
      id: 'ver_init_1',
      versionNumber: 1,
      fileName: 'JTFB Phone Database Cisco.xlsx',
      uploadedBy: 'System (Factory)',
      timestamp: '2026-11-10 08:15',
      totalPhones: 1609,
      primaryCrash: 4,
      secondaryCrash: 9
    }];
    writeJson(VERSIONS_FILE, initVer);
  }
}

initFiles();

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(payload);
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method;

  try {
    // 1. Health check
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, { status: 'ok', uptime: process.uptime() });
    }

    // 2. Auth: Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const username = (body.username || '').trim().toLowerCase();
      const password = (body.password || '').trim();

      if (!username || !password) {
        return sendJson(res, 400, { success: false, error: 'Username and password are required' });
      }

      const users = readJson(USERS_FILE, DEFAULT_USERS);
      const isMatch = (u) => {
        if (u.username.toLowerCase() !== username) return false;
        const p = String(u.password).trim();
        return p === password || p.toLowerCase() === password.toLowerCase();
      };

      const found = users.find(isMatch) || DEFAULT_USERS.find(isMatch);
      if (found) {
        return sendJson(res, 200, {
          success: true,
          user: {
            id: found.id,
            username: found.username,
            name: found.name,
            role: 'admin'
          }
        });
      }

      return sendJson(res, 401, { success: false, error: 'Invalid username or password' });
    }

    // 3. Users: List all administrators
    if (pathname === '/api/users' && method === 'GET') {
      const users = readJson(USERS_FILE, DEFAULT_USERS);
      return sendJson(res, 200, users);
    }

    // 4. Users: Create administrator
    if (pathname === '/api/users' && method === 'POST') {
      const body = await parseBody(req);
      const username = (body.username || '').trim();
      const name = (body.name || '').trim() || username;
      const password = (body.password || '').trim();

      if (!username) {
        return sendJson(res, 400, { success: false, error: 'Username is required' });
      }
      if (!password || password.length < 4) {
        return sendJson(res, 400, { success: false, error: 'Password must be at least 4 characters long' });
      }

      const users = readJson(USERS_FILE, DEFAULT_USERS);
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return sendJson(res, 400, { success: false, error: 'An administrator with this username already exists' });
      }

      const newUser = {
        id: `u_${Date.now()}`,
        username,
        name,
        password,
        role: 'admin',
        createdAt: new Date().toISOString().split('T')[0]
      };

      users.push(newUser);
      writeJson(USERS_FILE, users);
      return sendJson(res, 201, { success: true, user: newUser });
    }

    // 5. Users: Update administrator (PUT /api/users/:id)
    if (pathname.startsWith('/api/users/') && method === 'PUT') {
      const userId = pathname.split('/')[3];
      const body = await parseBody(req);
      const users = readJson(USERS_FILE, DEFAULT_USERS);
      const idx = users.findIndex(u => u.id === userId);

      if (idx === -1) {
        return sendJson(res, 404, { success: false, error: 'User not found' });
      }

      if (body.username) {
        const uLower = body.username.trim().toLowerCase();
        if (users.some(u => u.id !== userId && u.username.toLowerCase() === uLower)) {
          return sendJson(res, 400, { success: false, error: 'Username is already taken by another administrator' });
        }
        users[idx].username = body.username.trim();
      }

      if (body.name !== undefined) {
        users[idx].name = body.name.trim();
      }

      if (body.password) {
        if (body.password.trim().length < 4) {
          return sendJson(res, 400, { success: false, error: 'Password must be at least 4 characters long' });
        }
        users[idx].password = body.password.trim();
      }

      writeJson(USERS_FILE, users);
      return sendJson(res, 200, { success: true, user: users[idx] });
    }

    // 6. Users: Delete administrator (DELETE /api/users/:id)
    if (pathname.startsWith('/api/users/') && method === 'DELETE') {
      const userId = pathname.split('/')[3];
      const users = readJson(USERS_FILE, DEFAULT_USERS);
      const filtered = users.filter(u => u.id !== userId);

      if (filtered.length === users.length) {
        return sendJson(res, 404, { success: false, error: 'User not found' });
      }

      writeJson(USERS_FILE, filtered);
      return sendJson(res, 200, { success: true });
    }

    // 7. Database: Get active database
    if (pathname === '/api/database' && method === 'GET') {
      if (fs.existsSync(DATABASE_FILE)) {
        const db = readJson(DATABASE_FILE, null);
        if (db && Array.isArray(db.phones) && db.phones.length > 0) {
          return sendJson(res, 200, db);
        }
      }
      return sendJson(res, 404, { error: 'Database not initialized on server' });
    }

    // 8. Database: Save active database
    if (pathname === '/api/database' && method === 'POST') {
      const body = await parseBody(req);
      if (!body || !Array.isArray(body.phones) || body.phones.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Refusing to save empty phone database' });
      }
      writeJson(DATABASE_FILE, body);
      return sendJson(res, 200, { success: true, totalPhones: body.phones.length });
    }

    // 9. Versions: List versions
    if (pathname === '/api/versions' && method === 'GET') {
      const versions = readJson(VERSIONS_FILE, []);
      return sendJson(res, 200, versions);
    }

    // 10. Versions: Add new version snapshot
    if (pathname === '/api/versions' && method === 'POST') {
      const body = await parseBody(req);
      const { fileName, data, uploadedBy } = body;

      if (!data || !Array.isArray(data.phones) || data.phones.length === 0) {
        return sendJson(res, 400, { success: false, error: 'Empty phone data' });
      }

      // Also save to DATABASE_FILE as the active database
      writeJson(DATABASE_FILE, data);

      const versions = readJson(VERSIONS_FILE, []);
      const maxVerNum = versions.reduce((max, v) => Math.max(max, v.versionNumber || 1), 1);
      const nextVerNum = maxVerNum + 1;
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

      const verId = `ver_${Date.now()}`;
      // Save full version data to a dedicated file
      const verDataFile = path.join(DATA_DIR, `data_${verId}.json`);
      writeJson(verDataFile, data);

      const newVerEntry = {
        id: verId,
        versionNumber: nextVerNum,
        fileName: fileName || `Upload_v${nextVerNum}.xlsx`,
        uploadedBy: uploadedBy || 'admin',
        timestamp,
        totalPhones: data.phones.length,
        primaryCrash: data.primary_crash?.length || 0,
        secondaryCrash: data.secondary_crash?.length || 0
      };

      versions.unshift(newVerEntry);
      writeJson(VERSIONS_FILE, versions);

      return sendJson(res, 201, { success: true, version: newVerEntry });
    }

    // 11. Versions: Delete version (DELETE /api/versions/:id)
    if (pathname.startsWith('/api/versions/') && method === 'DELETE') {
      const versionId = pathname.split('/')[3];
      if (versionId === 'ver_init_1') {
        return sendJson(res, 400, { success: false, error: 'Factory version is protected' });
      }

      const versions = readJson(VERSIONS_FILE, []);
      const filtered = versions.filter(v => v.id !== versionId);
      writeJson(VERSIONS_FILE, filtered);

      const verDataFile = path.join(DATA_DIR, `data_${versionId}.json`);
      if (fs.existsSync(verDataFile)) {
        try { fs.unlinkSync(verDataFile); } catch (e) {}
      }

      return sendJson(res, 200, { success: true, remaining: filtered });
    }

    // 12. Versions: Restore version (POST /api/versions/:id/restore)
    if (pathname.startsWith('/api/versions/') && pathname.endsWith('/restore') && method === 'POST') {
      const parts = pathname.split('/');
      const versionId = parts[3];

      let dataToRestore = null;
      if (versionId === 'ver_init_1') {
        // Read factory initial data
        const factoryFile = path.join(DATA_DIR, 'factory_data.json');
        if (fs.existsSync(factoryFile)) {
          dataToRestore = readJson(factoryFile, null);
        }
      } else {
        const verDataFile = path.join(DATA_DIR, `data_${versionId}.json`);
        if (fs.existsSync(verDataFile)) {
          dataToRestore = readJson(verDataFile, null);
        }
      }

      if (!dataToRestore || !dataToRestore.phones || dataToRestore.phones.length === 0) {
        return sendJson(res, 404, { success: false, error: 'Version data not found or empty' });
      }

      writeJson(DATABASE_FILE, dataToRestore);
      return sendJson(res, 200, { success: true, data: dataToRestore });
    }

    // 13. System Backup: Export
    if (pathname === '/api/backup' && method === 'GET') {
      const db = readJson(DATABASE_FILE, {});
      const users = readJson(USERS_FILE, DEFAULT_USERS);
      const versions = readJson(VERSIONS_FILE, []);

      return sendJson(res, 200, {
        system: 'JTFB Cisco Phone Directory & Telecom System',
        backupVersion: 2,
        exportedAt: new Date().toISOString(),
        database: db,
        administrators: users,
        versionLogs: versions
      });
    }

    // 14. System Backup: Import
    if (pathname === '/api/backup' && method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.database || !Array.isArray(body.database.phones)) {
        return sendJson(res, 400, { success: false, error: 'Invalid backup file structure' });
      }

      writeJson(DATABASE_FILE, body.database);
      if (Array.isArray(body.administrators) && body.administrators.length > 0) {
        writeJson(USERS_FILE, body.administrators);
      }
      if (Array.isArray(body.versionLogs) && body.versionLogs.length > 0) {
        writeJson(VERSIONS_FILE, body.versionLogs);
      }

      return sendJson(res, 200, { success: true, totalPhones: body.database.phones.length });
    }

    // Default 404
    return sendJson(res, 404, { error: 'Not found' });

  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, 500, { error: 'Internal Server Error: ' + err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`JTFB Central API Server running on http://127.0.0.1:${PORT}`);
});
