# Telecom Directory — Local Network Phone Directory Application

A lightweight, mobile-friendly Progressive Web Application (PWA) designed to provide fast and easy access to telephone directory data across a **local area network (LAN)**. Instead of manually opening and searching large Excel spreadsheets, authorized users can search extensions, locations, device types, and network port details directly from any desktop or mobile browser on the local network.

> **Important Notice — Application Only (No Database Included)**
>
> This repository contains **only the application source code** and **does not include any telephone database, personal records, or classified/sensitive information**. To use the directory, an administrator must upload and load their own Excel workbook (`.xlsx` or `.xls`) through the built-in Administration panel.

---

## Key Features

- **Easy Local Network Access:** Host the application on a local server (Windows PC, Linux host, or Debian LXC container) so team members can access the phone directory from any computer or smartphone on the same network.
- **Instant Multi-Field Search:** Quickly search by phone extension, caller ID, organization, building, MAC address, switch IP, switch port, serial number, or device model.
- **Smart Filters:** Filter records by **Building** (with a dedicated searchable modal) and **Device Type**, and switch between Card and Table views.
- **Mobile-First PWA Interface:** Responsive layout with Light/Dark mode, a native-style bottom navigation bar on mobile devices, and installable home screen support.
- **1-Click Copy Info:** Copy formatted extension and wiring details for a record with a single click.
- **Emergency / Priority Lines View:** Dedicated tab for quick lookup of primary and secondary emergency/crash phone lines.
- **Excel Import & Version History:** Upload updated Excel workbooks directly from the browser. Every upload is logged as a version so administrators can roll back or delete old snapshots at any time.
- **Centralized Multi-User Administration:** Includes a lightweight Node.js API backend (`server/server.mjs`) to keep administrator accounts, phone data, and version history synchronized across all devices on the network.
- **System Backup & Restore:** Export and restore full system snapshots in `.json` format for disaster recovery.

---

## Loading Your Own Data

Because this repository ships as a standalone application without preloaded directory data, follow these steps after starting the app:

1. Open the application in your browser and sign in with an administrator account.
2. Go to the **Administration** tab.
3. Under **Excel & Versions**, drag and drop (or browse for) your organization's Excel file (`.xlsx` or `.xls`).
4. Review the parsed preview (total extensions and emergency lines) and click **Save and Log New Version**.
5. The directory will immediately populate and become searchable for all users on your local network.

### Expected Excel Sheets
- `Phone Database` — Main telephone extensions, caller IDs, buildings, device types, MAC addresses, switch/port info, and remarks.
- `Primary Crash` *(optional)* — Primary emergency/priority lines.
- `Secondary Crash` *(optional)* — Secondary emergency/priority conference lines.

---

## Quick Start

### Option 1: Development / Local Run (Node.js)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend API server:
   ```bash
   node server/server.mjs
   ```
3. Start the frontend development server (accessible on your local network):
   ```bash
   npm run dev -- --host
   ```
4. Access the app at `http://localhost:5173` (or `http://<YOUR_LOCAL_IP>:5173` from mobile devices on the same network).

### Option 2: Production Build (Linux / Debian LXC / Nginx)

1. Build the static frontend bundle:
   ```bash
   npm run build
   ```
2. Serve the generated `dist/` folder with Nginx (or any static web server) and proxy `/api/` requests to the Node.js backend running `server/server.mjs` on port `3001`.

### Option 3: Windows Quick Launcher

Double-click `iniciar_directorio.bat` to automatically detect your local IP address and launch the application on your local network.

---

## Default Administrator Credentials

Authentication is required to view or manage directory data:

| Role | Username | Default Password |
|---|---|---|
| **Administrator** | `admin` | `admin` |
| **Telecom Admin** | `telecom` | `telecom123` |

> **Security Recommendation:** Change the default passwords immediately after your first login under **Administration → Administrators**.

---

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend API:** Zero-dependency Node.js HTTP server (`server/server.mjs`) with JSON file persistence
- **Spreadsheet Parser:** SheetJS (`xlsx`)
- **PWA:** Web App Manifest & Service Worker
