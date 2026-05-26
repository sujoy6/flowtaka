# FlowTaka - Dynamic BDT Finance Tracker Hybrid PWA

FlowTaka is a Progressive Web App (PWA) built with React + Vite + Tailwind CSS v4 + Zustand for fast daily personal finance tracking in Bangladesh. It calculates a 30-day dynamic budget limit, tracks debts and subscriptions, and accepts mixed Bangla-English voice commands.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## Voice Recognition Examples
Tap the floating microphone button on the screen and speak naturally:
* **Expense:** `"Rickshaw 120"`, `"আজকে বাজার করলাম ৮৫০ টাকা"`
* **Income:** `"Add salary 25000"`, `"বোনাস পেলাম ৫০০০"`
* **Debt (Borrowed):** `"Borrowed from Rakib 5000"`, `"রাকিবের থেকে ৫০০০ টাকা ধার নিলাম"`
* **Debt (Lent):** `"Lent to Sumon 2000"`, `"সুমনকে ১০০০ টাকা দিলাম"`
* **Subscription:** `"Internet bill 1200 monthly"`, `"বাসা ভাড়া ১২০০০ টাকা মাসিক"`

---

## Deployment Guide

Since FlowTaka is a fully client-side Progressive Web App (PWA), it compiles into static HTML, CSS, and JS. You can host it on any static hosting provider.

### Option A: Firebase Hosting (Recommended)

1. **Login to Firebase CLI:**
   ```bash
   npx -y firebase-tools@latest login
   ```

2. **Initialize Firebase Hosting:**
   ```bash
   npx -y firebase-tools@latest init hosting
   ```
   * *What do you want to use as your public directory?* Enter **`dist`**
   * *Configure as a single-page app (rewrite all urls to /index.html)?* Enter **`y`** (Yes)
   * *Set up automatic builds and deploys with GitHub?* Enter **`n`** (No)
   * *File dist/index.html already exists. Overwrite?* Enter **`n`** (No - keep our index.html)

3. **Build and Deploy Live:**
   ```bash
   npm run build
   npx -y firebase-tools@latest deploy --only hosting
   ```

### Option B: Vercel (Zero Config)

1. Deploy instantly to Vercel using:
   ```bash
   npx vercel
   ```
   * Follow the prompt to log in and select default options. The Vercel CLI will automatically detect the Vite builder and deploy the `dist` directory.

### Option C: Netlify

1. Deploy to Netlify using the CLI:
   ```bash
   npx netlify-cli deploy --dir=dist --prod
   ```
