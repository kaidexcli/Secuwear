# SecuWear 🛡️

> **Continuous pulse monitoring. Instant GSM alerts. Precision GPS tracking.**
> Safety isn't a reaction—it's a constant state.

SecuWear is an integrated IoT hardware and full-stack web ecosystem designed to protect lives when every second counts. It bridges the gap between complex embedded systems (biometric scanning, cellular connectivity) and real-time emergency dispatch response.

---

## ⚡ Core Architecture

The SecuWear ecosystem is divided into two main components: the **Hardware Wearable** and the **Web Application/Dispatch Center**.

### 1. Hardware Wearable (Edge Computing)
*   **ESP32 Core Logic:** Low-latency edge computing handles real-time sensor data aggregation, hardware interrupts, and HTTP routing.
*   **SIM800 GSM Integration:** Standalone cellular connectivity independent of a paired smartphone, guaranteeing SMS distress alerts and HTTP payloads are broadcasted to servers instantly.
*   **Analog Biometric Scan:** Continuous skin-contact pulse rate monitoring detects severe physiological anomalies.
*   **Dual Emergency Triggers:** Dedicated physical interrupts for Medical SOS and Crime-related emergencies.

### 2. Software Platform (Next.js 16 + Supabase)
*   **Framework:** Next.js 16 (App Router) with React Server Components.
*   **Authentication & Database:** Supabase (PostgreSQL, Row Level Security, Edge Auth via `proxy.ts`).
*   **3D UI Rendering:** React Three Fiber / Drei for interactive 3D hardware previews.
*   **Styling:** Tailwind CSS and Framer Motion for highly responsive, cinematic UI interactions.

---

## 🛠️ Project Structure

```text
secuwear/
├── app/
│   ├── api/
│   │   └── emergency/   # Webhook receiving hardware payloads
│   ├── dashboard/       # Protected route: End-user management portal
│   ├── dispatch/        # Protected route: Authority/Admin monitoring hub
│   ├── login/           # Supabase Auth UI
│   ├── page.tsx         # Cinematic 3D landing page
│   ├── layout.tsx       # Root layout & providers
│   └── globals.css      # Tailwind directives
├── components/          # Reusable UI elements (Three.js canvas, buttons)
├── lib/
│   └── supabase/        # Supabase client initializers (client, server)
├── proxy.ts             # Next.js 16 Edge Auth & Route Protection 
├── next.config.js       # Next.js build configuration
└── package.json
