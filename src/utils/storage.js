import initialData from '../data/directorio_inicial.json' with { type: 'json' };

const STORAGE_KEY = 'jtfb_phone_database_v1';
const USERS_KEY = 'jtfb_users_v2';
const SESSION_KEY = 'jtfb_session_v2';
const VERSIONS_KEY = 'jtfb_excel_versions_v1';

// Default initial administrators (All users are administrators)
export const DEFAULT_USERS = [
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

// Initial Version Record
const INITIAL_VERSION = {
  id: 'ver_init_1',
  versionNumber: 1,
  fileName: 'JTFB Phone Database Cisco.xlsx',
  uploadedBy: 'System (Factory)',
  timestamp: '2026-11-10 08:15',
  totalPhones: initialData.phones?.length || 1609,
  primaryCrash: initialData.primary_crash?.length || 4,
  secondaryCrash: initialData.secondary_crash?.length || 9,
  data: initialData
};

// --- Server API Helper ---

async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, status: res.status, error: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

// --- Directory Data Methods ---

export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.phones && Array.isArray(parsed.phones) && parsed.phones.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading saved directory:', err);
  }
  // Fallback to initial bundled data (1,609 phones) and initialize storage
  if (initialData && initialData.phones && initialData.phones.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    } catch (e) {}
  }
  return initialData;
}

export async function fetchServerDatabase() {
  const apiRes = await apiCall('/database', 'GET');
  if (apiRes.ok && apiRes.data?.phones && Array.isArray(apiRes.data.phones) && apiRes.data.phones.length > 0) {
    saveData(apiRes.data, false);
    return apiRes.data;
  }
  return null;
}

export function saveData(data, syncToServer = true) {
  try {
    if (!data || !data.phones || !Array.isArray(data.phones) || data.phones.length === 0) {
      console.warn('Refusing to overwrite database with empty data');
      return false;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (syncToServer) {
      apiCall('/database', 'POST', data).catch(err => console.warn('Could not sync DB to server:', err));
    }
    return true;
  } catch (err) {
    console.error('Error saving directory to storage:', err);
    return false;
  }
}

export function resetToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    saveData(initialData, true);
    return initialData;
  } catch (err) {
    console.error('Error resetting directory:', err);
    return initialData;
  }
}

// --- Version History & Logs Methods ---

export function getVersions() {
  try {
    const saved = localStorage.getItem(VERSIONS_KEY);
    if (saved) {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let needsSave = false;
        parsed = parsed.map((v) => {
          if (v.id === 'ver_init_1') {
            v.data = initialData;
            v.totalPhones = initialData.phones?.length || 1609;
            v.primaryCrash = initialData.primary_crash?.length || 4;
            v.secondaryCrash = initialData.secondary_crash?.length || 9;
            needsSave = true;
          }
          return v;
        });

        if (needsSave) {
          const leanToStore = parsed.map((v) =>
            v.id === 'ver_init_1' ? { ...v, data: undefined } : v
          );
          try {
            localStorage.setItem(VERSIONS_KEY, JSON.stringify(leanToStore));
          } catch (e) {}
        }

        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading version logs:', err);
  }

  const defaultList = [
    {
      ...INITIAL_VERSION,
      totalPhones: initialData.phones?.length || 1609,
      primaryCrash: initialData.primary_crash?.length || 4,
      secondaryCrash: initialData.secondary_crash?.length || 9,
      data: initialData
    }
  ];
  try {
    const leanToStore = defaultList.map((v) => ({ ...v, data: undefined }));
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(leanToStore));
  } catch (e) {}
  return defaultList;
}

export async function fetchVersions() {
  const apiRes = await apiCall('/versions', 'GET');
  if (apiRes.ok && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
    const enriched = apiRes.data.map(v => {
      if (v.id === 'ver_init_1') {
        return {
          ...v,
          totalPhones: initialData.phones?.length || 1609,
          primaryCrash: initialData.primary_crash?.length || 4,
          secondaryCrash: initialData.secondary_crash?.length || 9,
          data: initialData
        };
      }
      return v;
    });
    try {
      const lean = enriched.map(v => v.id === 'ver_init_1' ? { ...v, data: undefined } : v);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(lean));
    } catch (e) {}
    return enriched;
  }
  return getVersions();
}

export function addVersion(fileName, data, uploadedBy = 'admin') {
  if (!data || !data.phones || !Array.isArray(data.phones) || data.phones.length === 0) {
    console.warn('Cannot log version with empty phone data');
    return null;
  }

  // Push to server in background
  apiCall('/versions', 'POST', { fileName, data, uploadedBy }).catch(err => {
    console.warn('Could not push version to server:', err);
  });

  try {
    const versions = getVersions();
    const maxVerNum = versions.reduce((max, v) => Math.max(max, v.versionNumber || 1), 1);
    const nextVerNum = maxVerNum + 1;
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);

    const newVersion = {
      id: `ver_${Date.now()}`,
      versionNumber: nextVerNum,
      fileName: fileName || `Upload_v${nextVerNum}.xlsx`,
      uploadedBy: uploadedBy || 'admin',
      timestamp: timestamp,
      totalPhones: data.phones?.length || 0,
      primaryCrash: data.primary_crash?.length || 0,
      secondaryCrash: data.secondary_crash?.length || 0,
      data: data
    };

    const existingOther = versions.filter((v) => v.id !== 'ver_init_1');
    const factoryVer = {
      id: 'ver_init_1',
      versionNumber: 1,
      fileName: 'JTFB Phone Database Cisco.xlsx',
      uploadedBy: 'System (Factory)',
      timestamp: '2026-11-10 08:15',
      totalPhones: initialData.phones?.length || 1609,
      primaryCrash: initialData.primary_crash?.length || 4,
      secondaryCrash: initialData.secondary_crash?.length || 9,
      data: initialData
    };

    const combined = [newVersion, ...existingOther.slice(0, 4), factoryVer];
    const leanToStore = combined.map((v) =>
      v.id === 'ver_init_1' ? { ...v, data: undefined } : v
    );

    localStorage.setItem(VERSIONS_KEY, JSON.stringify(leanToStore));
    return newVersion;
  } catch (err) {
    console.error('Error saving version log:', err);
    return null;
  }
}

export async function restoreVersion(versionId) {
  // Try server restore
  const apiRes = await apiCall(`/versions/${versionId}/restore`, 'POST');
  if (apiRes.ok && apiRes.data?.data) {
    saveData(apiRes.data.data, false);
    return apiRes.data.data;
  }

  // Fallback to local
  if (versionId === 'ver_init_1') {
    saveData(initialData);
    getVersions();
    return initialData;
  }

  const versions = getVersions();
  const target = versions.find((v) => v.id === versionId);
  if (!target) return null;

  let dataToRestore = target.data;
  if (target.id === 'ver_init_1' || !dataToRestore || !dataToRestore.phones || dataToRestore.phones.length === 0) {
    if (target.id === 'ver_init_1') {
      dataToRestore = initialData;
    } else {
      console.error('Cannot restore version: invalid or empty phone dataset', target);
      return null;
    }
  }

  const ok = saveData(dataToRestore);
  if (!ok) return null;
  return dataToRestore;
}

export async function deleteVersion(versionId) {
  if (versionId === 'ver_init_1') {
    return { success: false, error: 'Factory version (v1) is protected and cannot be deleted.' };
  }

  // Delete on server
  const apiRes = await apiCall(`/versions/${versionId}`, 'DELETE');
  if (apiRes.ok && apiRes.data?.remaining) {
    try {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(apiRes.data.remaining));
    } catch (e) {}
    return { success: true, remaining: apiRes.data.remaining };
  }

  try {
    const versions = getVersions();
    const filtered = versions.filter((v) => v.id !== versionId);
    const leanToStore = filtered.map((v) =>
      v.id === 'ver_init_1' ? { ...v, data: undefined } : v
    );
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(leanToStore));
    return { success: true, remaining: filtered };
  } catch (err) {
    console.error('Error deleting version log:', err);
    return { success: false, error: 'Failed to delete version log: ' + err.message };
  }
}

// --- Administrator Accounts Methods ---

export function getUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u) => ({ ...u, role: 'admin' }));
      }
    }
  } catch (err) {
    console.error('Error reading users:', err);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export async function fetchUsers() {
  const apiRes = await apiCall('/users', 'GET');
  if (apiRes.ok && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
    const mapped = apiRes.data.map(u => ({ ...u, role: 'admin' }));
    saveUsers(mapped);
    return mapped;
  }
  return getUsers();
}

export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (err) {
    console.error('Error saving users:', err);
    return false;
  }
}

export async function createUser(userData) {
  const cleanUsername = userData.username.trim();
  const cleanName = (userData.name || '').trim() || cleanUsername;
  const cleanPassword = userData.password.trim();

  // 1. Try server API
  const apiRes = await apiCall('/users', 'POST', {
    username: cleanUsername,
    name: cleanName,
    password: cleanPassword
  });

  if (apiRes.ok && apiRes.data?.success) {
    const users = await fetchUsers();
    return { success: true, user: apiRes.data.user, users };
  }

  if (apiRes.status >= 400 && apiRes.error) {
    return { success: false, error: apiRes.error };
  }

  // 2. Offline fallback
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, error: 'An administrator with this username already exists.' };
  }

  const newUser = {
    id: `u_${Date.now()}`,
    username: cleanUsername,
    name: cleanName,
    role: 'admin',
    password: cleanPassword,
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser, users };
}

export async function updateUser(userId, updatedFields) {
  const apiRes = await apiCall(`/users/${userId}`, 'PUT', updatedFields);
  if (apiRes.ok && apiRes.data?.success) {
    const users = await fetchUsers();
    const currentSession = getSession();
    if (currentSession && currentSession.id === userId) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: apiRes.data.user.id,
          username: apiRes.data.user.username,
          name: apiRes.data.user.name,
          role: 'admin'
        })
      );
    }
    return { success: true, user: apiRes.data.user, users };
  }

  if (apiRes.status >= 400 && apiRes.error) {
    return { success: false, error: apiRes.error };
  }

  // Offline fallback
  let users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: 'User not found' };

  if (
    updatedFields.username &&
    users.some(
      (u) => u.id !== userId && u.username.toLowerCase() === updatedFields.username.toLowerCase()
    )
  ) {
    return { success: false, error: 'Username is already taken by another administrator.' };
  }

  users[idx] = {
    ...users[idx],
    username: updatedFields.username ? updatedFields.username.trim() : users[idx].username,
    name: updatedFields.name !== undefined ? updatedFields.name.trim() : users[idx].name,
    password: updatedFields.password ? updatedFields.password.trim() : users[idx].password,
    role: 'admin'
  };

  saveUsers(users);

  const currentSession = getSession();
  if (currentSession && currentSession.id === userId) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: users[idx].id,
        username: users[idx].username,
        name: users[idx].name,
        role: 'admin'
      })
    );
  }

  return { success: true, user: users[idx], users };
}

export async function deleteUser(userId) {
  const apiRes = await apiCall(`/users/${userId}`, 'DELETE');
  if (apiRes.ok) {
    const users = await fetchUsers();
    return { success: true, users };
  }

  if (apiRes.status >= 400 && apiRes.error) {
    return { success: false, error: apiRes.error };
  }

  const users = getUsers();
  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  return { success: true, users: filtered };
}

// --- Session & Authentication ---

export function getSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error reading session:', err);
  }
  return null;
}

export async function loginUser(username, password) {
  const cleanUser = username ? username.trim().toLowerCase() : '';
  const cleanPass = password ? password.trim() : '';

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Please enter both username and password' };
  }

  // 1. Check Central Server API
  const apiRes = await apiCall('/auth/login', 'POST', { username: cleanUser, password: cleanPass });
  if (apiRes.ok && apiRes.data?.success) {
    const sessionData = apiRes.data.user;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {}
    // Sync users immediately so local cache is populated
    await fetchUsers().catch(() => {});
    return { success: true, user: sessionData };
  }

  if (apiRes.status === 401 || apiRes.status === 400) {
    return { success: false, error: apiRes.error || 'Invalid username or password' };
  }

  // 2. Offline fallback
  const users = getUsers();
  const isMatch = (storedUser) => {
    if (storedUser.username.toLowerCase() !== cleanUser) return false;
    const p = String(storedUser.password).trim();
    return (
      p === password ||
      p === cleanPass ||
      p.toLowerCase() === cleanPass.toLowerCase()
    );
  };

  let found = users.find(isMatch);
  if (!found) {
    found = DEFAULT_USERS.find(isMatch);
    if (found) {
      const filtered = users.filter((u) => u.username.toLowerCase() !== cleanUser);
      saveUsers([...filtered, found]);
    }
  }

  if (found) {
    const sessionData = {
      id: found.id,
      username: found.username,
      name: found.name,
      role: 'admin'
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {}
    return { success: true, user: sessionData };
  }

  return { success: false, error: 'Invalid username or password' };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// --- Disaster Recovery / Complete System Backup & Restore ---

export function exportCompleteSystemBackup() {
  const currentData = loadData();
  const users = getUsers();
  const versions = getVersions();

  const backupPayload = {
    system: 'JTFB Cisco Phone Directory & Telecom System',
    backupVersion: 2,
    exportedAt: new Date().toISOString(),
    database: currentData,
    administrators: users,
    versionLogs: versions
  };

  return JSON.stringify(backupPayload, null, 2);
}

export async function importCompleteSystemBackup(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.database || !Array.isArray(parsed.database.phones)) {
      return { success: false, error: 'Invalid backup file structure: missing database phones array.' };
    }

    saveData(parsed.database, true);

    if (Array.isArray(parsed.administrators) && parsed.administrators.length > 0) {
      saveUsers(parsed.administrators);
    }

    if (Array.isArray(parsed.versionLogs) && parsed.versionLogs.length > 0) {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(parsed.versionLogs));
    }

    // Sync full backup to server API in background
    apiCall('/backup', 'POST', parsed).catch(err => console.warn('Sync backup to server failed:', err));

    return {
      success: true,
      data: parsed.database,
      totalPhones: parsed.database.phones.length,
      usersRestored: parsed.administrators?.length || 0,
      versionsRestored: parsed.versionLogs?.length || 0
    };
  } catch (err) {
    return { success: false, error: 'Failed to read backup JSON file: ' + err.message };
  }
}
