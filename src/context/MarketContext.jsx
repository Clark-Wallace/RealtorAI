import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from '../components/NotificationSystem';
import marketDataAggregator from '../services/api/marketDataAggregator';

const MarketContext = createContext();

// Mock data generator for market intelligence
const generateMockMarketData = () => {
  const neighborhoods = [
    'Westfield Estates', 'Oak Manor', 'Pine Ridge', 'Riverside Heights', 
    'Downtown Core', 'Tech Quarter', 'Historic District', 'Lakefront'
  ];

  const generateNeighborhoodData = (name) => ({
    name,
    medianPrice: Math.floor(Math.random() * 2000000) + 800000,
    priceChange: (Math.random() * 30 - 10).toFixed(1),
    averageDom: Math.floor(Math.random() * 45) + 10,
    domChange: (Math.random() * 40 - 20).toFixed(1),
    inventory: (Math.random() * 6 + 0.5).toFixed(1),
    pricePerSqft: Math.floor(Math.random() * 300) + 250,
    marketTemp: ['hot', 'warm', 'balanced', 'cool'][Math.floor(Math.random() * 4)],
    trendDirection: ['rising', 'stable', 'declining'][Math.floor(Math.random() * 3)],
    keyDrivers: [
      ['New tech campus', 'Transit expansion', 'School upgrades'],
      ['Shopping center', 'Park renovation', 'Low crime rate'],
      ['Waterfront access', 'Historic charm', 'Walkable downtown']
    ][Math.floor(Math.random() * 3)]
  });

  return {
    neighborhoods: neighborhoods.reduce((acc, name) => ({
      ...acc,
      [name]: generateNeighborhoodData(name)
    }), {}),
    marketPulse: {
      overallTemp: 'warm',
      medianPrice: 1450000,
      inventoryMonths: 2.3,
      avgDom: 28,
      priceDirection: 'stable',
      buyerDemand: 'high',
      sellerSupply: 'low'
    },
    trends: {
      seasonal: {
        bestListingMonths: ['March', 'April', 'May'],
        bestBuyingMonths: ['November', 'December', 'January'],
        currentAdvantage: 'seller',
        seasonalPremium: 12
      },
      interestRates: {
        current: 6.8,
        monthChange: 0.2,
        buyerImpact: -15
      }
    }
  };
};

export const MarketProvider = ({ children }) => {
  const { notify } = useNotification();
  const [marketData, setMarketData] = useState(generateMockMarketData());
  const [competitiveListings, setCompetitiveListings] = useState([]);
  const [marketAlerts, setMarketAlerts] = useState([]);
  const [priceAnalysis, setPriceAnalysis] = useState({});
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  
  // Market timing insights
  const [marketTiming, setMarketTiming] = useState({
    currentPhase: 'growth',
    monthsInPhase: 3,
    nextPhaseEstimate: 'Q2 2024',
    confidence: 78
  });

  // Simulate real-time market updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update market pulse randomly
      setMarketData(prev => ({
        ...prev,
        marketPulse: {
          ...prev.marketPulse,
          avgDom: prev.marketPulse.avgDom + (Math.random() * 2 - 1),
          buyerDemand: Math.random() > 0.5 ? 'high' : 'moderate'
        }
      }));

      // Generate occasional market alerts
      if (Math.random() > 0.9) {
        const newAlert = generateMarketAlert();
        setMarketAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
        notify.info(newAlert.title, {
          description: newAlert.message,
          duration: 10000
        });
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [notify]);

  // Generate market alert
  const generateMarketAlert = () => {
    const alertTypes = [
      {
        type: 'opportunity',
        title: 'New Investment Opportunity',
        message: '3 foreclosures listed in Westfield Estates - below market value'
      },
      {
        type: 'trend',
        title: 'Market Shift Detected',
        message: 'Luxury inventory dropped 15% this week - seller advantage increasing'
      },
      {
        type: 'competition',
        title: 'Competitive Alert',
        message: '2 similar properties just reduced prices in Oak Manor'
      },
      {
        type: 'timing',
        title: 'Optimal Listing Window',
        message: 'Next 3 weeks show historically 18% faster sales'
      }
    ];

    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    return {
      ...alert,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      priority: Math.random() > 0.7 ? 'high' : 'medium'
    };
  };

  // Get neighborhood intelligence
  const getNeighborhoodIntel = (neighborhood) => {
    return marketData.neighborhoods[neighborhood] || null;
  };

  // Get competitive listings
  const getCompetitiveListings = (criteria) => {
    // In real app, this would query external APIs
    return competitiveListings.filter(listing => {
      if (criteria.priceMin && listing.price < criteria.priceMin) return false;
      if (criteria.priceMax && listing.price > criteria.priceMax) return false;
      if (criteria.neighborhood && listing.neighborhood !== criteria.neighborhood) return false;
      return true;
    });
  };

  // Analyze pricing for a property
  const analyzePricing = (property) => {
    const neighborhood = marketData.neighborhoods[property.neighborhood];
    if (!neighborhood) return null;

    const basePrice = neighborhood.pricePerSqft * property.sqft;
    const marketAdjustment = neighborhood.marketTemp === 'hot' ? 1.05 : 
                           neighborhood.marketTemp === 'cool' ? 0.95 : 1;
    
    const suggestedPrice = Math.round(basePrice * marketAdjustment / 10000) * 10000;
    
    return {
      suggestedPrice,
      pricePerSqft: neighborhood.pricePerSqft,
      marketPosition: neighborhood.marketTemp,
      expectedDom: neighborhood.averageDom,
      confidence: 85,
      priceRange: {
        aggressive: suggestedPrice * 1.05,
        moderate: suggestedPrice,
        conservative: suggestedPrice * 0.95
      },
      reasoning: `Based on ${neighborhood.name} avg of $${neighborhood.pricePerSqft}/sqft in a ${neighborhood.marketTemp} market`
    };
  };

  // Get market timing insights
  const getMarketTiming = () => {
    const currentMonth = new Date().getMonth();
    const springMonths = [2, 3, 4]; // March, April, May
    const winterMonths = [10, 11, 0]; // Nov, Dec, Jan
    
    return {
      ...marketTiming,
      isOptimalListing: springMonths.includes(currentMonth),
      isOptimalBuying: winterMonths.includes(currentMonth),
      recommendation: springMonths.includes(currentMonth) 
        ? 'Excellent time to list - peak buyer activity'
        : winterMonths.includes(currentMonth)
        ? 'Good time to buy - less competition'
        : 'Moderate market activity - price strategically'
    };
  };

  // Market forecast
  const getMarketForecast = (months = 6) => {
    const trend = marketData.marketPulse.priceDirection;
    const baseChange = trend === 'rising' ? 0.02 : trend === 'declining' ? -0.01 : 0.005;
    
    return {
      priceForecast: Array.from({ length: months }, (_, i) => ({
        month: i + 1,
        change: (baseChange * (i + 1) * 100).toFixed(1)
      })),
      inventoryForecast: 'increasing',
      rateImpact: 'stabilizing',
      confidence: 72,
      risks: ['Interest rate uncertainty', 'Economic indicators mixed'],
      opportunities: ['Tech sector growth', 'Infrastructure improvements']
    };
  };

  // Track showing activity
  const trackShowingActivity = (propertyId, clientId) => {
    // In real app, aggregate this data for market insights
    console.log('Tracking showing:', { propertyId, clientId, timestamp: new Date() });
  };

  // Load real neighborhood data
  const loadRealNeighborhoodData = async (neighborhood, city, state) => {
    setIsLoadingRealData(true);
    try {
      const data = await marketDataAggregator.getNeighborhoodData(neighborhood, city, state);
      
      // Transform API data to match our UI format
      const transformedData = {
        name: neighborhood,
        medianPrice: data.demographics?.medianHomeValue || data.stats?.medianPrice || 0,
        priceChange: data.trends?.priceChange || 0,
        averageDom: data.stats?.averageDaysOnMarket || data.market?.daysOnMarket || 0,
        domChange: data.trends?.domChange || 0,
        inventory: data.market?.inventoryMonths || 0,
        pricePerSqft: data.stats?.pricePerSqft || 0,
        marketTemp: determineMarketTemperature(data),
        trendDirection: data.trends?.direction || 'stable',
        keyDrivers: extractKeyDrivers(data),
        dataQuality: data.dataQuality || { confidence: 'Medium', sources: 1 }
      };
      
      setMarketData(prev => ({
        ...prev,
        neighborhoods: {
          ...prev.neighborhoods,
          [neighborhood]: transformedData
        }
      }));
      
      notify.success(`Loaded real data for ${neighborhood}`, {
        description: `Data from ${data.dataQuality?.sources || 1} sources`
      });
    } catch (error) {
      console.error('Error loading real neighborhood data:', error);
      notify.error('Failed to load real market data', {
        description: 'Using mock data instead'
      });
    } finally {
      setIsLoadingRealData(false);
    }
  };

  // Load real property data
  const loadRealPropertyData = async (address) => {
    setIsLoadingRealData(true);
    try {
      const data = await marketDataAggregator.getPropertyData(address, {
        includeComps: true,
        includeHistory: true,
        includeTaxData: true
      });
      
      return {
        property: data,
        pricing: {
          zestimate: data.valuation?.zestimate,
          taxAssessment: data.taxAssessment?.totalValue,
          marketValue: data.valuation?.zestimate || data.taxAssessment?.totalValue,
          pricePerSqft: data.details?.sqft ? 
            (data.valuation?.zestimate || data.taxAssessment?.totalValue) / data.details.sqft : 0
        },
        comparables: data.comparables || [],
        history: data.history || {},
        dataQuality: data.dataQuality
      };
    } catch (error) {
      console.error('Error loading real property data:', error);
      notify.error('Failed to load property data', {
        description: error.message
      });
      return null;
    } finally {
      setIsLoadingRealData(false);
    }
  };

  // Load real market forecast
  const loadRealMarketForecast = async (region, months = 6) => {
    try {
      const forecast = await marketDataAggregator.getMarketForecast(region, { months });
      
      return {
        priceForecast: forecast.predictions || [],
        confidence: forecast.confidence || 50,
        sources: forecast.sources || [],
        factors: forecast.factors || [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error loading forecast:', error);
      return getMarketForecast(months); // Fallback to mock
    }
  };

  // Helper function to determine market temperature
  const determineMarketTemperature = (data) => {
    const inventory = data.market?.inventoryMonths || data.stats?.inventoryMonths || 3;
    const dom = data.market?.daysOnMarket || data.stats?.averageDaysOnMarket || 30;
    
    if (inventory < 2 || dom < 20) return 'hot';
    if (inventory < 4 || dom < 40) return 'warm';
    if (inventory < 6 || dom < 60) return 'balanced';
    return 'cool';
  };

  // Helper function to extract key drivers
  const extractKeyDrivers = (data) => {
    const drivers = [];
    
    if (data.demographics?.medianIncome > 100000) drivers.push('High income area');
    if (data.demographics?.percentBachelors > 50) drivers.push('Highly educated');
    if (data.market?.priceAppreciation > 5) drivers.push('Strong appreciation');
    if (data.stats?.newConstruction > 0) drivers.push('New development');
    
    return drivers.length > 0 ? drivers : ['Market data analysis'];
  };

  // Toggle between real and mock data
  const toggleRealData = () => {
    setUseRealData(prev => !prev);
    if (!useRealData) {
      notify.info('Switched to real market data', {
        description: 'API connections active'
      });
    } else {
      notify.info('Switched to mock data', {
        description: 'Using simulated data'
      });
    }
  };

  const value = {
    marketData,
    marketAlerts,
    isLoadingRealData,
    useRealData,
    getNeighborhoodIntel,
    getCompetitiveListings,
    analyzePricing,
    getMarketTiming,
    getMarketForecast,
    trackShowingActivity,
    generateMarketAlert,
    loadRealNeighborhoodData,
    loadRealPropertyData,
    loadRealMarketForecast,
    toggleRealData
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
};