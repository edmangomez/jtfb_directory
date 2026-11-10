import openpyxl
import json
import os
import re

def clean_str(val):
    if val is None:
        return ""
    s = str(val).replace('\xa0', ' ').strip()
    return s

def export_data():
    excel_path = "JTFB Phone Database Cisco.xlsx"
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    
    # 1. Phone Database
    ws_phone = wb['Phone Database']
    phones = []
    
    for r in range(2, ws_phone.max_row + 1):
        num_val = ws_phone.cell(r, 1).value
        num_str = clean_str(num_val)
        if not num_str:
            continue
            
        cisco_switch = clean_str(ws_phone.cell(r, 2).value)
        port = clean_str(ws_phone.cell(r, 3).value)
        serial_no = clean_str(ws_phone.cell(r, 4).value)
        mac = clean_str(ws_phone.cell(r, 5).value).replace(' ', '').upper()
        building = clean_str(ws_phone.cell(r, 6).value)
        organization = clean_str(ws_phone.cell(r, 7).value)
        caller_id = clean_str(ws_phone.cell(r, 8).value)
        device_type = clean_str(ws_phone.cell(r, 9).value)
        cable = clean_str(ws_phone.cell(r, 10).value)
        pair = clean_str(ws_phone.cell(r, 11).value)
        remarks = clean_str(ws_phone.cell(r, 12).value)
        
        # Display name for search & presentation
        display_name = caller_id or organization or "Sin Asignar"
        
        phones.append({
            "id": f"p_{r}",
            "number": num_str,
            "cisco_switch": cisco_switch,
            "port": port,
            "serial_no": serial_no,
            "mac": mac,
            "building": building,
            "organization": organization,
            "caller_id": caller_id,
            "display_name": display_name,
            "device_type": device_type,
            "cable": cable,
            "pair": pair,
            "remarks": remarks
        })

    # 2. Primary Crash
    ws_primary = wb['Primary Crash']
    primary_crash_title = clean_str(ws_primary.cell(1, 1).value) or "Primary Crash System : ETVS from D-11"
    primary_crash = []
    for r in range(3, ws_primary.max_row + 1):
        remarks = clean_str(ws_primary.cell(r, 8).value)
        building = clean_str(ws_primary.cell(r, 7).value)
        if not remarks and not building:
            continue
            
        primary_crash.append({
            "id": f"pc_{r}",
            "origin": clean_str(ws_primary.cell(r, 1).value) or "D-11",
            "cable_source": clean_str(ws_primary.cell(r, 2).value),
            "pair_source": clean_str(ws_primary.cell(r, 3).value),
            "jumper": clean_str(ws_primary.cell(r, 4).value),
            "cable_dest": clean_str(ws_primary.cell(r, 5).value),
            "pair_dest": clean_str(ws_primary.cell(r, 6).value),
            "building": building,
            "remarks": remarks,
            "system": "Primary Crash"
        })
        
    # 3. Secondary Crash
    ws_sec = wb['Secondary Crash']
    sec_crash_title = clean_str(ws_sec.cell(1, 1).value) or "Secondary Crash Conference: Customer calls to 5903"
    sec_crash = []
    for r in range(3, ws_sec.max_row + 1):
        num_str = clean_str(ws_sec.cell(r, 1).value)
        if not num_str or not re.search(r'\d', num_str):
            continue
            
        sec_crash.append({
            "id": f"sc_{r}",
            "number": num_str,
            "cisco_switch": clean_str(ws_sec.cell(r, 2).value),
            "port": clean_str(ws_sec.cell(r, 3).value),
            "building": clean_str(ws_sec.cell(r, 4).value),
            "caller_id": clean_str(ws_sec.cell(r, 5).value),
            "device_type": clean_str(ws_sec.cell(r, 6).value),
            "cable": clean_str(ws_sec.cell(r, 7).value),
            "pair": clean_str(ws_sec.cell(r, 8).value),
            "remarks": clean_str(ws_sec.cell(r, 9).value),
            "system": "Secondary Crash"
        })
        
    os.makedirs("src/data", exist_ok=True)
    out_data = {
        "metadata": {
            "title": "JTFB Cisco Phone Database",
            "total_phones": len(phones),
            "primary_crash_title": primary_crash_title,
            "secondary_crash_title": sec_crash_title,
            "exported_at": "2026-11-10"
        },
        "phones": phones,
        "primary_crash": primary_crash,
        "secondary_crash": sec_crash
    }
    
    out_file = "src/data/directorio_inicial.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
        
    print(f"Exported successfully to {out_file}:")
    print(f" - Phones: {len(phones)}")
    print(f" - Primary Crash lines: {len(primary_crash)}")
    print(f" - Secondary Crash lines: {len(sec_crash)}")

if __name__ == "__main__":
    export_data()
