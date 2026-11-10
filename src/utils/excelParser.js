import * as XLSX from 'xlsx';

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\u00a0/g, ' ').trim();
}

export function parseExcelFile(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  
  // 1. Phone Database
  let phones = [];
  if (wb.SheetNames.includes('Phone Database')) {
    const ws = wb.Sheets['Phone Database'];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    
    // Row 0 is header: [' Number ', 'Cisco VG/Switch', 'Port', 'Serial No', 'MAC', 'Building', 'Organization', 'Sub Org - Caller ID', 'Type Device', 'Cable', 'Pair', 'Remarks']
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const numStr = cleanStr(row[0]);
      if (!numStr) continue;

      const cisco_switch = cleanStr(row[1]);
      const port = cleanStr(row[2]);
      const serial_no = cleanStr(row[3]);
      const mac = cleanStr(row[4]).replace(/\s+/g, '').toUpperCase();
      const building = cleanStr(row[5]);
      const organization = cleanStr(row[6]);
      const caller_id = cleanStr(row[7]);
      const device_type = cleanStr(row[8]);
      const cable = cleanStr(row[9]);
      const pair = cleanStr(row[10]);
      const remarks = cleanStr(row[11]);
      const display_name = caller_id || organization || 'Sin Asignar';

      phones.push({
        id: `p_${r + 1}`,
        number: numStr,
        cisco_switch,
        port,
        serial_no,
        mac,
        building,
        organization,
        caller_id,
        display_name,
        device_type,
        cable,
        pair,
        remarks,
      });
    }
  }

  // 2. Primary Crash
  let primary_crash = [];
  let primary_crash_title = 'Primary Crash System : ETVS from D-11';
  if (wb.SheetNames.includes('Primary Crash')) {
    const ws = wb.Sheets['Primary Crash'];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (rows[0] && rows[0][0]) {
      primary_crash_title = cleanStr(rows[0][0]);
    }
    // Data rows start at index 2 (row 3)
    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      const remarks = cleanStr(row[7]);
      const building = cleanStr(row[6]);
      if (!remarks && !building) continue;

      primary_crash.push({
        id: `pc_${r + 1}`,
        origin: cleanStr(row[0]) || 'D-11',
        cable_source: cleanStr(row[1]),
        pair_source: cleanStr(row[2]),
        jumper: cleanStr(row[3]),
        cable_dest: cleanStr(row[4]),
        pair_dest: cleanStr(row[5]),
        building: building,
        remarks: remarks,
        system: 'Primary Crash'
      });
    }
  }

  // 3. Secondary Crash
  let secondary_crash = [];
  let secondary_crash_title = 'Secondary Crash Conference: Customer calls to 5903';
  if (wb.SheetNames.includes('Secondary Crash')) {
    const ws = wb.Sheets['Secondary Crash'];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (rows[0] && rows[0][0]) {
      secondary_crash_title = cleanStr(rows[0][0]);
    }
    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      const numStr = cleanStr(row[0]);
      if (!numStr || !/\d/.test(numStr)) continue;

      secondary_crash.push({
        id: `sc_${r + 1}`,
        number: numStr,
        cisco_switch: cleanStr(row[1]),
        port: cleanStr(row[2]),
        building: cleanStr(row[3]),
        caller_id: cleanStr(row[4]),
        device_type: cleanStr(row[5]),
        cable: cleanStr(row[6]),
        pair: cleanStr(row[7]),
        remarks: cleanStr(row[8]),
        system: 'Secondary Crash'
      });
    }
  }

  return {
    metadata: {
      title: 'JTFB Cisco Phone Database',
      total_phones: phones.length,
      primary_crash_title,
      secondary_crash_title,
      exported_at: new Date().toISOString().split('T')[0]
    },
    phones,
    primary_crash,
    secondary_crash
  };
}
