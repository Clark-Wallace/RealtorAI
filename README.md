# RealtorAI - Market Intelligence Platform 🏠🧠

A comprehensive real estate intelligence platform that combines client preference tracking with powerful market analytics. Track structured preferences, analyze market trends, get AI-powered pricing insights, and match clients with perfect properties. Built as a Progressive Web App (PWA) with real-time data integration.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-ready-orange.svg)
![API](https://img.shields.io/badge/API-ready-purple.svg)

## 🌟 Key Features

### Intelligent Preference Tracking
- **Comprehensive Categories**: Track preferences across 10+ categories (Layout, Kitchen, Bathrooms, Outdoor, Location, etc.)
- **Quick-Add System**: One-tap preference tracking with smart suggestions
- **Deal Breakers**: Identify and track absolute no-go features
- **Mobile-First Design**: Optimized for on-the-go feedback entry during showings

### Smart Client Intelligence
- **Preference Analytics**: Visualize client preferences and patterns
- **Interest Tracking**: Monitor interest levels across properties
- **Smart Matching**: AI-powered property recommendations based on preferences
- **Feedback History**: Complete timeline of all property viewings and reactions

### Market Intelligence Suite 🧠
- **Market Pulse**: Real-time market conditions and trends
- **Neighborhood Analysis**: Deep dive into local area dynamics
- **Pricing Intelligence**: AI-powered property valuations and pricing strategies
- **Competitive Intel**: Track competing listings and market positioning
- **Market Forecast**: Predictive analytics for market timing

### Professional Tools
- **CRM Integration**: Sync with Salesforce, Follow Up Boss, kvCORE, and more
- **Property Search**: Multi-source property search with real API integration
- **Export & Reports**: Generate professional preference and market reports
- **Team Collaboration**: Share client and market insights across your team
- **API Integration**: Connect to MLS, Zillow alternatives, and public records

### Built for Realtors
- **Offline-First**: Works perfectly without internet during showings
- **PWA Technology**: Install like a native app on any device
- **Quick Entry**: Multiple input methods - guided flow, quick form, or mobile wizard
- **Auto-Save**: Never lose feedback with automatic background saving

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Safari, Firefox)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Clark-Wallace/RealtorAI.git
cd RealtorAI
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## 📱 PWA Installation

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install

### Android/Desktop
1. Look for the install prompt in the address bar
2. Click "Install" when prompted
3. Or use the in-app install button

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Core Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/v1
VITE_ENVIRONMENT=development

# Real Estate APIs (see API_GUIDE.md for setup)
REACT_APP_MLS_API_KEY=your_mls_key
REACT_APP_MLS_CLIENT_ID=your_mls_client_id
REACT_APP_MLS_CLIENT_SECRET=your_mls_secret
REACT_APP_MLS_ENDPOINT=https://api.mlsgrid.com

# Alternative APIs (No Realtor License Required)
REACT_APP_REALTY_MOLE_KEY=your_rapidapi_key
REACT_APP_RENTALS_API_KEY=your_rentals_key

# Public Data APIs (Free)
REACT_APP_CENSUS_API_KEY=your_census_key
REACT_APP_FRED_API_KEY=your_fred_key
REACT_APP_WALK_SCORE_KEY=your_walkscore_key

# Google Services
VITE_GOOGLE_PLACES_API_KEY=your_google_api_key

# Feature Flags
VITE_ENABLE_PROPERTY_SEARCH=true
VITE_ENABLE_CRM_INTEGRATION=true
VITE_ENABLE_PREFERENCE_TRACKING=true
VITE_ENABLE_SMART_MATCHING=true
VITE_ENABLE_MARKET_INTELLIGENCE=true

# Analytics (optional)
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

## 📋 Usage Guide

### Recording Property Feedback

#### Method 1: Guided Workflow
1. Select or add a client
2. Choose the property they viewed
3. Use the comprehensive preference tracker
4. Add overall rating and interest level
5. Include any additional notes
6. Review and save

#### Method 2: Quick Form
1. Select client and property at once
2. Toggle between Quick Preferences and Detailed Feedback tabs
3. Tap preference chips for rapid entry
4. Save with one click

#### Method 3: Mobile Flow (Phones)
1. Step-by-step wizard optimized for mobile
2. Large touch targets for easy entry during showings
3. Progress tracking and auto-save
4. Swipe navigation between steps

### Using the Preference Tracker

The preference tracker organizes feedback into intuitive categories:

- **Layout & Space**: Open concept, formal dining, high ceilings, etc.
- **Kitchen Features**: Island, stainless appliances, pantry space, etc.
- **Bedrooms**: Master location, walk-in closets, ensuite, etc.
- **Bathrooms**: Double vanity, soaking tub, walk-in shower, etc.
- **Outdoor Space**: Yard size, deck/patio, pool, garden, etc.
- **Parking & Storage**: Garage size, workshop, RV parking, etc.
- **Systems & Efficiency**: HVAC, solar, smart home, insulation, etc.
- **Location Preferences**: Quiet street, walkability, schools, etc.
- **Community & Schools**: HOA, amenities, school ratings, etc.
- **Deal Breakers**: Absolute no-go features

### Smart Matching

1. Navigate to "Smart Match" from the header
2. Choose matching mode:
   - **Match Properties to Client**: Find properties matching preferences
   - **Find Clients for Property**: Identify potentially interested buyers
3. Review match scores with detailed breakdowns
4. Export matches for client presentations

### Analytics Dashboard

- **Client Overview**: See all clients and their preference profiles
- **Property Performance**: Track which features drive interest
- **Preference Trends**: Identify market trends in buyer preferences
- **Conversion Insights**: Understand what leads to offers

### Market Intelligence Features

#### API Configuration
1. Navigate to Market Intelligence tab
2. Click the "Configure" button in the API Status Indicator
3. Enter your API credentials (see [API_GUIDE.md](API_GUIDE.md) for setup)
4. Test connections and save configuration
5. Toggle between real and mock data as needed

#### Market Analysis Tools
- **Market Pulse**: Real-time overview of market conditions
  - Temperature indicators (hot/warm/balanced/cool)
  - Inventory levels and trends
  - Average days on market
  - Price movements

- **Neighborhood Analysis**: 
  - Demographic insights
  - School ratings and amenities
  - Market appreciation trends
  - Comparable sales data

- **Pricing Intelligence**:
  - AI-powered property valuations
  - Pricing strategy recommendations
  - Market positioning analysis
  - Price-per-sqft comparisons

- **Competition Tracking**:
  - Monitor similar listings
  - Price change alerts
  - Market share analysis
  - Competitive advantages

- **Market Forecast**:
  - 6-month price predictions
  - Seasonal trend analysis
  - Interest rate impact modeling
  - Buy/sell timing recommendations

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **PWA**: Service Worker with offline support
- **Icons**: Lucide React
- **Data Persistence**: LocalStorage with IndexedDB backup
- **API Integration**: REST APIs with caching and rate limiting
- **Error Handling**: Error boundaries and circuit breakers
- **Real-time Updates**: WebSocket support (coming soon)

### Project Structure
```
realtor-ai/
├── public/
│   ├── icons/          # PWA icons
│   ├── splash/         # iOS splash screens
│   ├── manifest.json   # PWA manifest
│   └── sw.js          # Service worker
├── src/
│   ├── components/     # React components
│   ├── context/        # State management
│   ├── services/       # API integrations
│   ├── utils/          # Helper functions
│   └── App.jsx         # Main app component
├── scripts/            # Build and deployment scripts
└── docs/              # Additional documentation
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

### Deploy to AWS S3
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Run deployment script
- `npm run analyze` - Analyze bundle size

### Key Components

- **QuickPreferences**: Comprehensive preference tracking system
- **FeedbackForm**: Detailed feedback entry with tabs
- **MobileFeedbackFlow**: Step-by-step mobile interface
- **SmartMatching**: AI-powered matching algorithm
- **Dashboard**: Analytics and insights

## 📊 Data Model

### Client Preferences
```javascript
{
  clientId: number,
  preferences: {
    layout: ["open concept", "high ceilings"],
    kitchen: ["island", "stainless appliances"],
    dealBreakers: ["busy road", "small lot"],
    // ... other categories
  }
}
```

### Property Feedback
```javascript
{
  clientId: number,
  propertyId: number,
  overallRating: 1-5,
  interestedLevel: "low|medium|high|very high",
  likes: ["great location", "updated kitchen"],
  dislikes: ["small bedrooms", "no garage"],
  preferences: { /* tracked preferences */ },
  realtorNotes: "Client loved the kitchen...",
  createdAt: timestamp
}
```

## 🔒 Security

- All data is stored locally using encrypted localStorage
- API keys should never be committed to version control
- Use environment variables for sensitive configuration
- HTTPS is required for PWA functionality
- No client PII is transmitted without encryption

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation as needed
5. Test on mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs)
- **Issues**: [GitHub Issues](https://github.com/Clark-Wallace/RealtorAI/issues)
- **Email**: support@realtorai.com
- **Wiki**: [Project Wiki](https://github.com/Clark-Wallace/RealtorAI/wiki)

## 🙏 Acknowledgments

- Built with React and Vite
- Icons by Lucide
- UI components styled with Tailwind CSS
- Inspired by real feedback from real estate professionals

---

Made with ❤️ for real estate professionals who understand that structured data beats unstructured notes every time.