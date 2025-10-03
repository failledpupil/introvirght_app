# 🌈 Introvirght - Mindful Social Platform

A vibrant, text-focused social platform designed for meaningful connections and authentic self-expression.

## ✨ Features

- **Mindful Social Networking**: Connect with others through thoughtful, text-only posts
- **Personal Diary**: Private journaling with AI companion support
- **Colorful UI**: Beautiful gradient-based design with smooth animations
- **Authentication**: Secure user registration and login
- **Real-time Interactions**: Like, share, and engage with posts
- **Responsive Design**: Works beautifully on all devices

## 🚀 Live Demo

- **Frontend**: [https://introvirght.vercel.app](https://introvirght.vercel.app) *(Coming Soon)*
- **Backend API**: [https://your-backend.railway.app](https://your-backend.railway.app) *(Coming Soon)*

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Modern UI Components** with gradient animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** for local development
- **PostgreSQL** for production
- **JWT** authentication
- **RESTful API** design

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/introvirght.git
   cd introvirght
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install
   
   # Install frontend dependencies
   cd ../introvirght && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp server/.env.example server/.env
   
   # Frontend
   cp introvirght/.env.example introvirght/.env
   ```

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This starts both:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173

## 🚀 Deployment

This project is configured for free deployment on:

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon PostgreSQL

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
introvirght/
├── introvirght/          # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── contexts/     # React contexts
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
├── server/               # Backend Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── dist/             # Compiled JavaScript
└── docs/                 # Documentation
```

## 🎨 Design Philosophy

Introvirght embraces a **colorful, mindful** approach to social media:

- **Vibrant Gradients**: Beautiful color transitions throughout the UI
- **Smooth Animations**: Gentle transitions and hover effects
- **Mindful Interactions**: Thoughtful, text-focused content
- **Calming Aesthetics**: Designed to promote positive mental health
- **Authentic Expression**: Encouraging genuine self-expression

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love for mindful digital connections
- Inspired by the need for authentic social platforms
- Designed to promote mental wellness and genuine expression

---

**"Step towards yourself"** - The journey inward is the most important journey of all.