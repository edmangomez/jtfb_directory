import initialData from '../data/directorio_inicial.json';

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
  totalPhones: 1609,
  primaryCrash: 4,
  secondaryCrash: 9,
  data: initialData
};

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

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Error saving directory to storage:', err);
    return false;
  }
}

export function resetToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEY);
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
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading version logs:', err);
  }
  const defaultList = [INITIAL_VERSION];
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(defaultList));
  return defaultList;
}

export function addVersion(fileName, data, uploadedBy = 'admin') {
  try {
    const versions = getVersions();
    const nextVerNum = versions.length + 1;
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

    versions.unshift(newVersion);
    const trimmed = versions.slice(0, 25);
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(trimmed));
    return newVersion;
  } catch (err) {
    console.error('Error saving version log:', err);
    return null;
  }
}

export function restoreVersion(versionId) {
  const versions = getVersions();
  const target = versions.find((v) => v.id === versionId);
  if (!target || !target.data) return null;

  saveData(target.data);
  return target.data;
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

export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (err) {
    console.error('Error saving users:', err);
    return false;
  }
}

export function createUser(userData) {
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === userData.username.toLowerCase())) {
    return { success: false, error: 'An administrator with this username already exists.' };
  }

  const newUser = {
    id: `u_${Date.now()}`,
    username: userData.username.trim(),
    name: userData.name.trim() || userData.username.trim(),
    role: 'admin',
    password: userData.password.trim(),
    createdAt: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

export function updateUser(userId, updatedFields) {
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

  return { success: true, user: users[idx] };
}

export function deleteUser(userId) {
  let users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, error: 'User not found' };

  if (users.length <= 1) {
    return { success: false, error: 'Cannot delete the last remaining administrator account.' };
  }

  users = users.filter((u) => u.id !== userId);
  saveUsers(users);
  return { success: true };
}

export function getSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.username) {
        return { ...parsed, role: 'admin' };
      }
    }
  } catch (err) {
    console.error('Error reading session:', err);
  }
  return null;
}

export function loginUser(username, password) {
  const cleanUser = username ? username.trim().toLowerCase() : '';
  const cleanPass = password ? password.trim() : '';

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Please enter both username and password' };
  }

  const users = getUsers();

  // Helper matcher: handles exact match or case-insensitive password (essential for mobile autocapitalize)
  const isMatch = (storedUser) => {
    if (storedUser.username.toLowerCase() !== cleanUser) return false;
    const p = String(storedUser.password).trim();
    return (
      p === password ||
      p === cleanPass ||
      p.toLowerCase() === cleanPass.toLowerCase()
    );
  };

  // 1. Check in stored users
  let found = users.find(isMatch);

  // 2. Fallback guarantee: check hardcoded defaults
  if (!found) {
    found = DEFAULT_USERS.find(isMatch);
    if (found) {
      // Auto-repair storage if phone had stale/corrupt list
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
    } catch (e) {
      console.warn('Could not persist session to localStorage:', e);
    }
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

export function importCompleteSystemBackup(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.database || !Array.isArray(parsed.database.phones)) {
      return { success: false, error: 'Invalid backup file structure: missing database phones array.' };
    }

    saveData(parsed.database);

    if (Array.isArray(parsed.administrators) && parsed.administrators.length > 0) {
      saveUsers(parsed.administrators);
    }

    if (Array.isArray(parsed.versionLogs) && parsed.versionLogs.length > 0) {
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(parsed.versionLogs));
    }

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
