# 🚀 Starfleet

A 3D web experience where users can launch personalized spaceships that orbit an alien planet forever. Each spaceship represents a creator's product/profile and is visible to all visitors in real-time.

![Starfleet Preview](https://via.placeholder.com/800x400/1a0033/ffffff?text=Starfleet+3D+Experience)

## ✨ Features

- **🌍 3D Alien Planet** - Beautiful alien world with atmospheric effects, rings, and cloud layers
- **🛩️ Free Aircraft** - Launch airplanes and airships in lower orbit (atmospheric layer)
- **🚀 Paid Spaceships** - Premium spaceship models in higher orbit (space layer) - $5 each
- **👥 Pilot Profiles** - View who's flying each spaceship model
- **📦 Inventory System** - Owned vehicles can be relaunched for free
- **💳 Payment Integration** - Dodo Payments for spaceship purchases
- **⚡ Real-time Updates** - Live spaceship additions via Supabase Realtime
- **📱 Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 19 + TypeScript
- **3D Graphics**: Three.js + @react-three/fiber + @react-three/drei
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth
- **Payments**: Dodo Payments API
- **File Storage**: UploadThing CDN
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or pnpm
- Supabase account
- UploadThing account (for GLB model hosting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/starfleet.git
   cd starfleet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   DODO_PAYMENTS_API_KEY=your_dodo_payments_key
   DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Set up Supabase database**
   ```sql
   -- Create profiles table
   create table profiles (
     id uuid references auth.users primary key,
     display_name varchar(60),
     x_handle varchar(50),
     avatar_url varchar(255)
   );

   -- Create purchases table
   create table purchases (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references profiles(id),
     spaceship_id varchar(50),
     bought_at timestamp default now(),
     unique (user_id, spaceship_id)
   );

   -- Create ships table (renamed from products)
   create table ships (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users,
     website_url varchar(255) not null,
     name varchar(100) not null,
     tagline varchar(60),
     description text,
     icon_url varchar(255),
     screenshot_url varchar(255),
     spaceship_id varchar(50) not null,
     orbit_radius integer,
     inclination real,
     phase real,
     angular_speed real,
     price integer not null default 0,
     created_at timestamp default now()
   );
   ```

5. **Upload 3D models to UploadThing**
   - Upload your GLB files to UploadThing
   - Update `src/lib/data/spaceships.ts` with the CDN URLs

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How It Works

### Vehicle System
- **Free Aircraft**: Airplanes and airships orbit in lower atmosphere (radius 4-5)
- **Paid Spaceships**: 9 premium models orbit in space (radius 6-8)

### User Flow
1. Visit the 3D planet scene
2. Click "Launch Your Ship"
3. Choose vehicle type (free aircraft or paid spaceship)
4. Fill in product details
5. Pay (if spaceship selected)
6. Watch your vehicle join the orbit!

### Pilot System
- Each spaceship model shows all pilots who own it
- Click on any orbiting vehicle to see pilot profiles
- View avatars from X handles or uploaded images

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main 3D scene
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── ...               # Custom components
├── lib/
│   ├── data/
│   │   └── spaceships.ts # Vehicle asset mapping
│   ├── three/
│   │   └── load-vehicle.ts # GLB loader helper
│   └── supabase/         # Database clients
└── public/
    ├── models/           # Local GLB fallback files
    └── draco/           # Draco decoder files
```

## 🎯 Roadmap

- [ ] Upload GLB models to UploadThing
- [ ] Implement 3D scene components
- [ ] Add authentication flow
- [ ] Build launch wizard modal
- [ ] Create inventory system
- [ ] Add payment integration
- [ ] Implement real-time updates
- [ ] Add pilot profile system
- [ ] Mobile optimization
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for 3D graphics
- [Supabase](https://supabase.com/) for backend services
- [UploadThing](https://uploadthing.com/) for file hosting
- [Dodo Payments](https://dodopayments.com/) for payment processing
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components

## 🏢 About PxlCorp

PxlCorp is a tiny internet space where we experiment and build cool stuff. Visit us at [www.pxlcorp.xyz](https://www.pxlcorp.xyz) to see more of our projects and experiments.

---

**Made with ❤️ by [PxlCorp](https://www.pxlcorp.xyz)**

A tiny internet space where we experiment and build cool stuff.
