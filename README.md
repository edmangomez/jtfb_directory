# Telecom Directory (JTFB Cisco VoIP System)

Official progressive web application (PWA) for managing and searching Cisco VoIP extensions, MAC addresses, network switches, and emergency crash lines for Joint Task Force-Bravo (JTFB).

---

## 🚀 Quick Start (Windows)

1. Double-click on:
   ```
   iniciar_directorio.bat
   ```
2. The launcher will automatically detect your local network IP and open your default browser at:
   - **Local PC:** `http://localhost:3000`
   - **Mobile Devices (same Wi-Fi):** `http://<YOUR_LOCAL_IP>:3000`

---

## 🔐 Default Administrator Access

For security, the application requires authentication before accessing any directory records or administrative controls:

| Role | Username | Password |
|---|---|---|
| **Chief Administrator** | `admin` | `admin` |
| **Telecom Lead** | `telecom` | `telecom123` |

*(Administrators can edit their username, title, and password at any time in the Administration panel)*.

---

## 📁 Initializing Directory with Excel Workbook

This repository contains the full application engine and user security system **without any sensitive telephone data**. To load your directory:

1. Log in as an administrator.
2. Navigate to the **Administration** tab.
3. In **Excel Database**, drag & drop your official workbook (`JTFB Phone Database Cisco.xlsx`).
4. Click **Save and Log New Version**.
5. All extensions, building filters, and emergency crash lines will be instantly active!

---

## 🌟 Key Features

- **PWA Mobile-First Design:** Fully responsive, installable on mobile home screens with offline capabilities.
- **Telecom Tower Branding:** Custom Telecom portal identity.
- **Unified 1-Click Copy:** Single `Copy Info` button per record that copies all extension and wiring details formatted for tickets/messages.
- **Version History & Logs:** Every Excel upload is timestamped and logged; administrators can rollback or restore previous versions with 1 click.
- **Disaster Recovery:** Export complete `.json` system backups and restore anytime.
- **Building Modal Filter:** Search and filter across 700+ base buildings.
- **Emergency Crash Lines:** Dedicated search and circuits for Primary (ETVS) and Secondary Crash (5903).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 3
- **Icons:** Lucide React
- **Client-side Excel Engine:** SheetJS (`xlsx`)
- **PWA:** Web App Manifest & Service Worker
