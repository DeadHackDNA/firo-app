# FIRO - Advanced Wildfire Intelligence Platform 🔥

FIRO is an innovative web application developed for the NASA Space Apps Challenge that combines real-time satellite data, machine learning predictions, and 3D geospatial visualization to revolutionize wildfire monitoring and management.

## 🌟 Features

### 🌍 3D Interactive Globe
- **Cesium.js Integration**: High-performance 3D Earth visualization
- **Real-time Fire Data**: Live wildfire locations from NASA FIRMS
- **Interactive Navigation**: Zoom, pan, and explore fire incidents globally
- **Dynamic Loading**: Data loads automatically based on viewport

### 🤖 AI-Powered Chat Assistant
- **Context-Aware Analysis**: AI assistant that sees what you're viewing on the map
- **Real-time View Integration**: Provides analysis of current map view and fire data
- **Intelligent Explanations**: Explains why certain areas have no fires (like remote regions)
- **Location-Specific Insights**: Understands geographic context and regional patterns
- **Historical Data**: Access to previous conversations and analysis

### 🔍 Advanced Search & Navigation
- **Location Search**: Find and navigate to any location worldwide
- **Smart Geocoding**: Powered by OpenStreetMap Nominatim API
- **Quick Navigation**: One-click travel to areas of interest

### 📊 Predictive Analytics
- **Machine Learning**: AI-powered fire risk predictions
- **Real-time Processing**: Dynamic risk assessment based on current conditions
- **Visual Indicators**: Color-coded risk levels on the map

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### 3D Visualization
- **Cesium.js** - WebGL-powered 3D globe
- **Custom Particle Systems** - Fire and smoke effects
- **Real-time Rendering** - Optimized performance

### State Management
- **TanStack Query** - Server state management
- **Custom Hooks** - Optimized state logic
- **Local Storage** - Session persistence

### APIs & Data Sources
- **NASA FIRMS** - Fire Information for Resource Management System
- **OpenStreetMap** - Location search and geocoding
- **Custom AI Backend** - Machine learning predictions

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Cesium Ion Account** (for 3D map access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DeadHackDNA/firo-app.git
   cd firo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   VITE_CESIUM_TOKEN=your_cesium_token_here
   VITE_FIRO_API=http://localhost:8000/api
   VITE_FIRO_IA_API=http://localhost:8001/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CESIUM_TOKEN` | Cesium Ion access token for 3D maps | ✅ |
| `VITE_FIRO_API` | Main backend API endpoint | ✅ |
| `VITE_FIRO_IA_API` | AI/ML services API endpoint | ✅ |

## 🏗️ Project Structure

```
src/
├── api/                    # API clients and models
│   ├── models/            # TypeScript interfaces
│   ├── http-client.ts     # Main API client
│   └── http-ia-client.ts  # AI API client
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── chatbot/          # Chat system components
│   └── cesium-viewer.tsx # 3D map component
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── services/             # Business logic
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

The project includes:
- **TypeScript** for type safety
- **ESLint** with strict rules
- **Prettier** for code formatting
- **Strict TypeScript config** for better reliability

## 🌐 API Integration

### NASA FIRMS Integration
FIRO integrates with NASA's Fire Information for Resource Management System (FIRMS) to provide real-time wildfire data.

### AI Predictions
The application uses machine learning models to predict fire risk based on:
- Current weather conditions
- Historical fire patterns
- Terrain and vegetation data
- Satellite imagery analysis

## 🎨 UI/UX Improvements

### Design System
- **Modern Interface**: Clean, professional design
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Optimized animations and interactions

### Features Added
- ✅ **Context-Aware Chatbot**: AI assistant that knows what you're viewing
- ✅ **Real-time View Context**: Live updates of current location and fire data  
- ✅ **Location search with autocomplete**: Find and navigate to any place worldwide
- ✅ **Visual Context Summary**: Real-time summary of fires and location in chat
- ✅ **Transparent UI Elements**: Non-intrusive interface that doesn't block controls
- ✅ **Enhanced Error Handling**: Robust validation and error management
- ✅ **Performance Optimizations**: Efficient state management and data loading
- ✅ **Configuration Validation**: Automatic setup verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is developed for the NASA Space Apps Challenge 2025.

## 🏆 NASA Space Apps Challenge

FIRO was created as part of the NASA Space Apps Challenge, demonstrating innovative use of space technology and data to address real-world challenges in wildfire management and prevention.

### Team
- **GitHub**: [DeadHackDNA](https://github.com/DeadHackDNA/)
- **Challenge**: Wildfire Monitoring and Prediction
- **Year**: 2025

---

**Built with ❤️ for wildfire prevention and environmental protection**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
