Scan# 📦 Inventory Keeper

A minimalist, high-speed, client-side inventory and pantry management system. Built with **Vue 3**, **Tailwind CSS**, and powered entirely by **LocalStorage**—no complex database configuration or external backend required.

Features real-time camera barcode scanning, custom barcode generation for unbarcoded items, audio-haptic scan feedback, and customizable A4 master sheet catalog printing.

---

## ✨ Features

*   **Real-Time Barcode Scanner:**
    *   Powered by `html5-qrcode` configured with an ultra-wide horizontal viewfinder optimized for 1D product barcodes (EAN-13, UPC, Code 128).
    *   Smart scan handling: auto-increments quantity (`+1`) for existing inventory or triggers the registration modal for newly detected barcodes.
*   **Audio & Haptic Feedback:**
    *   Synthesized via the native Web Audio API (`950Hz triangle wave`), emulating professional retail scanner beeps with zero network latency.
    *   Haptic vibration triggers simultaneously on supported mobile devices using `navigator.vibrate`.
*   **Internal Custom Barcode Generation (`DIF-XXXXXX`):**
    *   Enables barcode workflows for unbarcoded pantry staples (loose vegetables, bulk grains, fresh produce).
    *   Auto-generates and renders standard Code 128 barcodes using `jsbarcode`.
*   **A4 Master Pantry Sheet Generator (`/katalog`):**
    *   Dedicated print view for generating wall/cabinet/fridge master barcode sheets.
    *   Adjustable grid layouts (2, 3, or 4 columns), optional borders, and category filtering.
    *   **Batch Copy Support:** Custom quantity controls to print multiple copies of specific barcodes on a single sheet.
    *   Isolated print stylesheet (`@media print`) that removes application chrome and headers for a clean page output.
*   **Search, Filter & Sorting:**
    *   Instant search by product name or barcode string.
    *   Sort by: Newest, Name (A–Z), Low Stock, and High Stock.
    *   Dynamic category creation, filtering, and tag coloring.
*   **Data Export & Audit Trail:**
    *   One-click data export to **CSV** or **JSON** format.
    *   Live activity log tracking `ADD`, `DEDUCT`, `REGISTER`, and `REMOVE` actions with precise timestamps.
*   **Visual Analytics:**
    *   Monochrome donut/pie chart displaying real-time stock distribution by category.

---

## 🛠️ Tech Stack

*   **Framework:** [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
*   **Router:** [Vue Router 4](https://router.vuejs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Monochrome / Zinc palette)
*   **Barcode Scanning:** [html5-qrcode](https://github.com/mebjas/html5-qrcode)
*   **Barcode Rendering:** [JsBarcode](https://github.com/lindell/JsBarcode)
*   **Storage:** Browser LocalStorage API
*   **Feedback:** Web Audio API & Web Vibration API
*   **Build Tool:** [Vite](https://vitejs.dev/)

---