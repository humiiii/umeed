# Umeed 🌟

Umeed is a premium, high-performance web boilerplate built on Next.js, customized with JavaScript, Tailwind CSS v4, Framer Motion, Lucide Icons, and optimized Cloudinary assets. 

This repository was initialized and linked to [GitHub - humiiii/umeed](https://github.com/humiiii/umeed.git).

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router & JavaScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config)
- **Animations**: [Framer Motion](https://motion.dev/) (Hardware accelerated dynamic transitions)
- **Icons**: [Lucide React](https://lucide.dev/) (Beautiful customized vector SVG iconset)
- **Media Optimization**: [Cloudinary](https://cloudinary.com/) (Next-Cloudinary & Server-side Cloudinary SDK)

---

## 🛠️ Getting Started

### 1. Install Dependencies

Standard npm packages are already configured in `package.json`. If you need to reinstall them:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and append your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Spin Up Development Server

Start the interactive Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the responsive UI, micro-animations, and live media transformation modules.

---

## 📦 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css         # Custom premium theme & styles
│   │   ├── layout.js           # Shared app layouts (navbar, footer, typographic styles)
│   │   └── page.js             # Interactive landing page with showcase & code helpers
│   └── lib/
│       └── cloudinary.js       # Cloudinary server upload & deletion backend helpers
├── next.config.mjs             # Enabled Cloudinary CDN hosts
├── package.json
└── README.md
```

---

## 🧪 Build & Verify

To compile the application and bundle optimized resources for deployment:

```bash
npm run build
```
