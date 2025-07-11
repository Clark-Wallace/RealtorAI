# RealtorAI API Integration Guide 🔗

This guide provides detailed instructions for setting up and integrating various APIs with RealtorAI. Whether you're a licensed realtor or not, you'll find options that work for your needs.

## Table of Contents
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [For Licensed Realtors](#for-licensed-realtors)
- [For Non-Realtors](#for-non-realtors)
- [API Setup Instructions](#api-setup-instructions)
- [Configuration](#configuration)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Choose Your APIs
Based on your status:
- **Licensed Realtor**: Start with MLS Grid + ATTOM Data
- **Non-Realtor**: Start with Realty Mole + Census + FRED

### 2. Get API Keys
Follow the instructions in the [API Setup Instructions](#api-setup-instructions) section.

### 3. Configure RealtorAI
1. Copy `.env.example` to `.env.local`
2. Add your API keys
3. Start the app and go to Market Intelligence → Configure

### 4. Test & Verify
Use the built-in connection tester to verify your APIs are working.

## API Overview

### Real Estate Data APIs

| API | License Required | Cost | Best For |
|-----|-----------------|------|----------|
| **MLS Grid** | ✅ Yes | $50-200/mo | Complete listing data |
| **Zillow** | ✅ Partner | Custom | Large brokerages |
| **Realty Mole** | ❌ No | $49/mo | Individual investors |
| **ATTOM Data** | ❌ No | $199/mo | Public records |
| **Rentals.com** | ❌ No | Free | Rental market |

### Public Data APIs (Free)

| API | Purpose | Rate Limit |
|-----|---------|------------|
| **Census** | Demographics | Unlimited |
| **FRED** | Economic data | 120/min |
| **Walk Score** | Walkability | 5k/day |
| **OpenWeather** | Climate data | 60/min |

## For Licensed Realtors

### MLS Grid (Recommended)
The most comprehensive source for active listings.

**Setup Process:**
1. Visit [mlsgrid.com](https://www.mlsgrid.com)
2. Click "Get Started" → Select "Broker/Agent"
3. Provide:
   - Real estate license number
   - MLS membership verification
   - Business information
4. Wait 2-3 business days for approval
5. Receive via email:
   - Client ID
   - Client Secret
   - API Documentation

**Configuration:**
```env
REACT_APP_MLS_CLIENT_ID=your_client_id
REACT_APP_MLS_CLIENT_SECRET=your_client_secret
REACT_APP_MLS_ENDPOINT=https://api.mlsgrid.com
```

### Local MLS/IDX Provider
If MLS Grid isn't available in your area:

1. Contact your local MLS board
2. Request IDX/RETS access
3. Typical requirements:
   - Active MLS membership
   - Broker approval (if agent)
   - Signed data agreement
   - Setup fee: $100-500
   - Monthly fee: $50-300

## For Non-Realtors

### Option 1: Realty Mole (Best Overall)

**Why Realty Mole?**
- No license required
- Instant access
- Good data coverage
- Affordable pricing

**Setup:**
1. Visit [RapidAPI](https://rapidapi.com/realtymole/api/realty-mole-property-api)
2. Create free RapidAPI account
3. Subscribe to Realty Mole ($49/month)
4. Get your RapidAPI key instantly

**Configuration:**
```env
REACT_APP_RAPIDAPI_KEY=your_rapidapi_key
REACT_APP_REALTY_MOLE_HOST=realty-mole-property-api.p.rapidapi.com
```

### Option 2: ATTOM Data

**Best for:** Investors needing deep property data

**Setup:**
1. Visit [attomdata.com](https://www.attomdata.com/products/property-data-api/)
2. Click "Try It Free"
3. Get 10,000 free API calls
4. Upgrade to paid plan when ready

**Configuration:**
```env
REACT_APP_PUBLIC_RECORDS_API_KEY=your_attom_key
```

### Option 3: Build with Free APIs

Combine these free APIs for basic functionality:

**Census API:**
```bash
# Get your key instantly at:
https://api.census.gov/data/key_signup.html
```

**FRED API:**
```bash
# Get your key instantly at:
https://fred.stlouisfed.org/docs/api/api_key.html
```

## API Setup Instructions

### Step 1: Realty Mole Setup
```markdown
1. Go to https://rapidapi.com
2. Sign up for free account
3. Search for "Realty Mole Property API"
4. Click "Subscribe to Test"
5. Choose plan ($0 test, $49 basic)
6. Copy your X-RapidAPI-Key
```

### Step 2: Census API Setup
```markdown
1. Visit https://api.census.gov/data/key_signup.html
2. Fill out form (name, email, organization)
3. Check email for API key (instant)
4. No payment required
```

### Step 3: FRED API Setup
```markdown
1. Visit https://fred.stlouisfed.org/docs/api/api_key.html
2. Create account or sign in
3. Click "Request API Key"
4. Copy key from dashboard (instant)
5. No payment required
```

### Step 4: Walk Score API
```markdown
1. Visit https://www.walkscore.com/professional/
2. Click "Get Your Free API Key"
3. Fill out application
4. Wait 1-2 days for approval
5. Free tier: 5,000 calls/day
```

### Step 5: Google Places API
```markdown
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable "Places API"
4. Create credentials → API Key
5. Restrict key to your domain
6. $200 free credit monthly
```

## Configuration

### Environment Setup

1. **Copy the example file:**
```bash
cp .env.example .env.local
```

2. **Add your API keys:**
```env
# For Non-Realtors: Start with these
REACT_APP_RAPIDAPI_KEY=your_key_here
REACT_APP_CENSUS_API_KEY=your_key_here
REACT_APP_FRED_API_KEY=your_key_here

# Optional but recommended
VITE_GOOGLE_PLACES_API_KEY=your_key_here
REACT_APP_WALK_SCORE_KEY=your_key_here
```

3. **Configure features:**
```env
# Enable/disable features based on your APIs
VITE_ENABLE_MARKET_INTELLIGENCE=true
VITE_USE_MOCK_DATA=false  # Set to true for testing
```

### In-App Configuration

1. Start the application:
```bash
npm run dev
```

2. Navigate to **Market Intelligence** tab

3. Click **Configure** in the API Status Indicator

4. Enter your credentials and test each connection

5. Save configuration

## Testing Your Setup

### Using the Built-in Tester

1. Go to Market Intelligence → Configure
2. Enter API credentials
3. Click "Test Connection" for each API
4. Look for green checkmarks

### Manual Testing

Test your APIs with curl:

```bash
# Test Realty Mole
curl -X GET "https://realty-mole-property-api.p.rapidapi.com/properties" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: realty-mole-property-api.p.rapidapi.com"

# Test Census API
curl "https://api.census.gov/data/2019/acs/acs5?get=NAME,B01001_001E&for=state:*&key=YOUR_KEY"

# Test FRED API
curl "https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=YOUR_KEY&file_type=json"
```

## Troubleshooting

### Common Issues

**"Invalid API Key" Error**
- Double-check key is copied correctly
- Ensure no extra spaces
- Verify key is activated

**"Rate Limit Exceeded"**
- Check your plan limits
- Enable caching in settings
- Upgrade plan if needed

**"CORS Error"**
- This is normal in development
- APIs work through our backend
- Ignore in browser console

**No Data Showing**
1. Check API Status Indicator
2. Verify all connections green
3. Toggle to mock data and back
4. Clear cache and retry

### API-Specific Issues

**Realty Mole**
- Ensure RapidAPI subscription active
- Check both API key and host header
- Verify not exceeding monthly quota

**Census API**
- Some endpoints require specific parameters
- Check year in API calls (use recent years)
- Refer to Census API documentation

**MLS Grid (Realtors)**
- Token may expire - re-authenticate
- Check IP whitelist settings
- Verify MLS coverage in your area

### Getting Help

1. **Check browser console** for detailed errors
2. **Review API documentation** for each service
3. **Use mock data** to test app functionality
4. **Contact support**:
   - Realty Mole: hello@realtymole.com
   - Census: cedsci.feedback@census.gov
   - ATTOM: support@attomdata.com

## Best Practices

### Security
- Never commit API keys to Git
- Use environment variables
- Rotate keys periodically
- Set up domain restrictions

### Performance
- Enable caching (reduces API calls)
- Batch requests when possible
- Use mock data for development
- Monitor usage in dashboards

### Cost Management
- Start with free tiers
- Set up usage alerts
- Cache aggressively
- Use mock data for testing

## Next Steps

1. **Start Small**: Begin with 1-2 APIs
2. **Test Thoroughly**: Verify data quality
3. **Monitor Usage**: Track API calls
4. **Scale Gradually**: Add more APIs as needed
5. **Provide Feedback**: Help us improve integrations

---

**Need more help?** Check the [troubleshooting](#troubleshooting) section or open an issue on GitHub.