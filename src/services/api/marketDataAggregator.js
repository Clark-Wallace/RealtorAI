// Market Data Aggregator - Combines data from multiple sources
import mlsService from './mlsService';
import zillowService from './zillowService';
import publicRecordsService from './publicRecordsService';
import { validateApiConfig, retryWithBackoff, getFallbackData } from './config';

class MarketDataAggregator {
  constructor() {
    this.services = {
      mls: mlsService,
      zillow: zillowService,
      publicRecords: publicRecordsService
    };
    
    // Check API configuration on initialization
    this.isConfigured = validateApiConfig();
  }

  // Get comprehensive property data from all sources
  async getPropertyData(address, options = {}) {
    const { includeComps = true, includeHistory = true, includeTaxData = true } = options;
    
    try {
      // Fetch data from all sources in parallel
      const promises = [];
      const sources = {};

      // MLS data
      if (this.hasMLSAccess()) {
        promises.push(
          mlsService.searchListings({ 
            address: address.street,
            city: address.city,
            limit: 1 
          }).then(result => {
            sources.mls = result.listings[0] || null;
          }).catch(err => {
            console.error('MLS fetch error:', err);
            sources.mls = null;
          })
        );
      }

      // Zillow data
      if (this.hasZillowAccess()) {
        promises.push(
          zillowService.getPropertyByAddress(
            address.street,
            `${address.city}, ${address.state} ${address.zip}`
          ).then(results => {
            sources.zillow = results[0] || null;
          }).catch(err => {
            console.error('Zillow fetch error:', err);
            sources.zillow = null;
          })
        );
      }

      // Public Records data
      if (this.hasPublicRecordsAccess()) {
        promises.push(
          publicRecordsService.getPropertyAssessment(
            `${address.street}, ${address.city}, ${address.state} ${address.zip}`
          ).then(result => {
            sources.publicRecords = result;
          }).catch(err => {
            console.error('Public Records fetch error:', err);
            sources.publicRecords = null;
          })
        );
      }

      await Promise.all(promises);

      // Aggregate the data
      const aggregated = this.mergePropertyData(sources);

      // Fetch additional data if requested
      if (includeComps && (sources.mls || sources.zillow)) {
        aggregated.comparables = await this.getComparables(aggregated);
      }

      if (includeHistory && sources.publicRecords) {
        aggregated.history = await this.getPropertyHistory(address);
      }

      if (includeTaxData && sources.publicRecords) {
        aggregated.taxData = await publicRecordsService.getPropertyTaxHistory(
          `${address.street}, ${address.city}, ${address.state} ${address.zip}`
        );
      }

      // Calculate confidence score
      aggregated.dataQuality = this.calculateDataQuality(sources);

      return aggregated;
    } catch (error) {
      console.error('Error aggregating property data:', error);
      throw error;
    }
  }

  // Get neighborhood market data with retry and fallback
  async getNeighborhoodData(neighborhood, city, state) {
    const promises = [];
    const data = {};
    const errors = [];

    // MLS market stats with retry
    if (this.hasMLSAccess()) {
      promises.push(
        retryWithBackoff(
          () => mlsService.getMarketStats({ 
            city: city,
            neighborhood: neighborhood 
          }),
          'mls'
        ).then(stats => {
          data.mlsStats = stats;
        }).catch(err => {
          console.error('MLS stats error after retries:', err);
          errors.push({ service: 'mls', error: err.message });
          data.mlsStats = getFallbackData('mls', 'marketStats');
        })
      );
    }

    // Zillow demographics and trends with retry
    if (this.hasZillowAccess()) {
      promises.push(
        retryWithBackoff(
          () => zillowService.getDemographics(neighborhood, 'neighborhood'),
          'zillow'
        ).then(demo => {
          data.demographics = demo;
        }).catch(err => {
          console.error('Zillow demographics error after retries:', err);
          errors.push({ service: 'zillow', error: err.message });
          data.demographics = getFallbackData('zillow', 'demographics');
        })
      );
    }

    // Public records neighborhood stats with retry
    if (this.hasPublicRecordsAccess()) {
      promises.push(
        retryWithBackoff(
          () => publicRecordsService.getNeighborhoodStats(neighborhood, city),
          'publicRecords'
        ).then(stats => {
          data.publicRecordsStats = stats;
        }).catch(err => {
          console.error('Public records stats error after retries:', err);
          errors.push({ service: 'publicRecords', error: err.message });
          data.publicRecordsStats = getFallbackData('publicRecords', 'marketStats');
        })
      );
    }

    await Promise.allSettled(promises);

    const result = this.mergeNeighborhoodData(data);
    
    // Add error information to the result
    if (errors.length > 0) {
      result.errors = errors;
      result.reliability = this.calculateReliability(data, errors);
    }

    return result;
  }

  // Get market forecast combining multiple data sources
  async getMarketForecast(region, options = {}) {
    const { months = 6 } = options;
    const forecasts = {};

    // Get Zillow forecast if available
    if (this.hasZillowAccess()) {
      try {
        const trends = await zillowService.getMarketTrends(region);
        forecasts.zillow = {
          appreciation: trends.trends.forecastedAppreciation,
          confidence: 75,
          factors: ['Historical trends', 'Economic indicators', 'Inventory levels']
        };
      } catch (err) {
        console.error('Zillow forecast error:', err);
      }
    }

    // Calculate our own forecast based on available data
    const historicalData = await this.getHistoricalMarketData(region, 24); // 2 years
    if (historicalData.length > 0) {
      forecasts.calculated = this.calculateForecast(historicalData, months);
    }

    // Combine forecasts with weighted average
    return this.combinedForecast(forecasts, months);
  }

  // Get comprehensive comparables from all sources
  async getComparables(property, radius = 0.5) {
    const allComps = [];
    const seen = new Set(); // Avoid duplicates

    // MLS comparables
    if (this.hasMLSAccess() && property.coordinates) {
      try {
        const mlsComps = await mlsService.getComparables(property, radius);
        mlsComps.listings.forEach(comp => {
          const key = `${comp.address.street}-${comp.address.zip}`;
          if (!seen.has(key)) {
            seen.add(key);
            allComps.push({
              ...comp,
              source: 'MLS',
              confidence: 95
            });
          }
        });
      } catch (err) {
        console.error('MLS comps error:', err);
      }
    }

    // Zillow comparables
    if (this.hasZillowAccess() && property.zpid) {
      try {
        const zillowComps = await zillowService.getComparables(property.zpid);
        zillowComps.forEach(comp => {
          const key = `${comp.address.street}-${comp.address.zip}`;
          if (!seen.has(key)) {
            seen.add(key);
            allComps.push({
              ...comp,
              source: 'Zillow',
              confidence: 85
            });
          }
        });
      } catch (err) {
        console.error('Zillow comps error:', err);
      }
    }

    // Public records comparables
    if (this.hasPublicRecordsAccess()) {
      try {
        const publicComps = await publicRecordsService.getComparableSales(
          property,
          radius,
          6 // Last 6 months
        );
        publicComps.forEach(comp => {
          const key = `${comp.address}`;
          if (!seen.has(key)) {
            seen.add(key);
            allComps.push({
              ...comp,
              source: 'PublicRecords',
              confidence: 90
            });
          }
        });
      } catch (err) {
        console.error('Public records comps error:', err);
      }
    }

    // Sort by relevance/confidence
    return allComps.sort((a, b) => b.confidence - a.confidence);
  }

  // Merge property data from multiple sources
  mergePropertyData(sources) {
    const merged = {
      address: null,
      price: null,
      details: {},
      features: {},
      valuation: {},
      market: {},
      sources: []
    };

    // Prefer data in this order: MLS > Public Records > Zillow
    if (sources.mls) {
      merged.address = sources.mls.address;
      merged.price = sources.mls.price;
      merged.details = { ...sources.mls.property };
      merged.features = { ...sources.mls.features };
      merged.market = { ...sources.mls.status };
      merged.sources.push('MLS');
    }

    if (sources.publicRecords) {
      merged.address = merged.address || sources.publicRecords.property.address;
      merged.details = { ...merged.details, ...sources.publicRecords.building };
      merged.taxAssessment = sources.publicRecords.assessment;
      merged.owner = sources.publicRecords.owner;
      merged.sources.push('PublicRecords');
    }

    if (sources.zillow) {
      merged.address = merged.address || sources.zillow.address;
      merged.valuation = { ...sources.zillow.valuation };
      merged.zpid = sources.zillow.zpid;
      merged.sources.push('Zillow');
      
      // Fill in missing details from Zillow
      Object.keys(sources.zillow.details).forEach(key => {
        if (!merged.details[key]) {
          merged.details[key] = sources.zillow.details[key];
        }
      });
    }

    return merged;
  }

  // Merge neighborhood data from multiple sources
  mergeNeighborhoodData(data) {
    const merged = {
      stats: {},
      demographics: {},
      market: {},
      trends: {}
    };

    if (data.mlsStats) {
      merged.stats = {
        totalListings: data.mlsStats.totalListings,
        averagePrice: data.mlsStats.averagePrice,
        medianPrice: data.mlsStats.medianPrice,
        averageDaysOnMarket: data.mlsStats.averageDaysOnMarket,
        pricePerSqft: data.mlsStats.averagePricePerSqft
      };
      merged.market = { ...data.mlsStats.priceRanges };
    }

    if (data.demographics) {
      merged.demographics = { ...data.demographics.demographics };
      merged.education = { ...data.demographics.education };
      if (data.demographics.market) {
        merged.market = { ...merged.market, ...data.demographics.market };
      }
    }

    if (data.publicRecordsStats) {
      merged.stats.propertyCount = data.publicRecordsStats.propertyCount;
      merged.stats.ownerOccupiedRate = data.publicRecordsStats.ownerOccupiedRate;
      merged.stats.averageTaxBill = data.publicRecordsStats.averageTaxBill;
      merged.propertyTypes = data.publicRecordsStats.propertyTypes;
    }

    return merged;
  }

  // Calculate data quality/confidence score
  calculateDataQuality(sources) {
    let score = 0;
    let sourcesCount = 0;

    if (sources.mls) {
      score += 40;
      sourcesCount++;
    }
    if (sources.publicRecords) {
      score += 35;
      sourcesCount++;
    }
    if (sources.zillow) {
      score += 25;
      sourcesCount++;
    }

    // Bonus for multiple sources
    if (sourcesCount > 1) {
      score += 10;
    }
    if (sourcesCount > 2) {
      score += 10;
    }

    return {
      score: Math.min(score, 100),
      sources: sourcesCount,
      confidence: score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low'
    };
  }

  // Calculate forecast from historical data
  calculateForecast(historicalData, months) {
    // Simple linear regression for now
    const n = historicalData.length;
    const sumX = historicalData.reduce((sum, _, i) => sum + i, 0);
    const sumY = historicalData.reduce((sum, d) => sum + d.price, 0);
    const sumXY = historicalData.reduce((sum, d, i) => sum + i * d.price, 0);
    const sumX2 = historicalData.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast = [];
    for (let i = 0; i < months; i++) {
      const monthIndex = n + i;
      const predictedPrice = intercept + slope * monthIndex;
      const changePercent = ((predictedPrice - historicalData[n - 1].price) / historicalData[n - 1].price) * 100;
      
      forecast.push({
        month: i + 1,
        predictedPrice: Math.round(predictedPrice),
        changePercent: changePercent.toFixed(2)
      });
    }

    return {
      forecast,
      confidence: 65,
      method: 'Linear Regression',
      factors: ['Historical price trends', 'Seasonal patterns']
    };
  }

  // Combine forecasts from multiple sources
  combinedForecast(forecasts, months) {
    const combined = {
      months: months,
      sources: Object.keys(forecasts),
      predictions: []
    };

    // Weight-based combination
    const weights = {
      zillow: 0.5,
      calculated: 0.5
    };

    for (let i = 0; i < months; i++) {
      let weightedSum = 0;
      let totalWeight = 0;

      if (forecasts.zillow) {
        weightedSum += forecasts.zillow.appreciation * weights.zillow;
        totalWeight += weights.zillow;
      }

      if (forecasts.calculated) {
        const change = parseFloat(forecasts.calculated.forecast[i].changePercent);
        weightedSum += change * weights.calculated;
        totalWeight += weights.calculated;
      }

      combined.predictions.push({
        month: i + 1,
        changePercent: totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 0
      });
    }

    combined.confidence = Math.round(
      Object.values(forecasts).reduce((sum, f) => sum + f.confidence, 0) / 
      Object.keys(forecasts).length
    );

    return combined;
  }

  // Get property history from all sources
  async getPropertyHistory(address) {
    const history = {
      sales: [],
      priceChanges: [],
      permits: [],
      taxHistory: []
    };

    // Public records sales history
    if (this.hasPublicRecordsAccess()) {
      try {
        const deeds = await publicRecordsService.getPropertyDeeds(
          `${address.street}, ${address.city}, ${address.state} ${address.zip}`
        );
        history.sales = deeds;

        const permits = await publicRecordsService.getBuildingPermits(
          `${address.street}, ${address.city}, ${address.state} ${address.zip}`
        );
        history.permits = permits;
      } catch (err) {
        console.error('History fetch error:', err);
      }
    }

    return history;
  }

  // Get historical market data for forecasting
  async getHistoricalMarketData(region, months) {
    // This would fetch historical data from available sources
    // For now, return mock data
    const data = [];
    const basePrice = 500000;
    
    for (let i = months; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.02; // ±2% monthly variation
      const price = basePrice * (1 + (months - i) * 0.005) * (1 + variation);
      
      data.push({
        month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        price: Math.round(price),
        volume: Math.floor(Math.random() * 100) + 50
      });
    }

    return data;
  }

  // Check service availability
  hasMLSAccess() {
    return !!this.services.mls && this.isConfigured;
  }

  hasZillowAccess() {
    return !!this.services.zillow && this.isConfigured;
  }

  hasPublicRecordsAccess() {
    return !!this.services.publicRecords && this.isConfigured;
  }

  // Calculate data reliability based on available sources and errors
  calculateReliability(data, errors) {
    const totalSources = Object.keys(this.services).length;
    const availableSources = Object.values(data).filter(source => 
      source !== null && !source?.isFallback
    ).length;
    const fallbackSources = Object.values(data).filter(source => 
      source?.isFallback
    ).length;
    
    let reliability = 'high';
    
    if (errors.length >= totalSources) {
      reliability = 'low';
    } else if (fallbackSources > 0 || errors.length > 0) {
      reliability = 'medium';
    }
    
    return {
      level: reliability,
      availableSources,
      fallbackSources,
      errors: errors.length,
      confidence: Math.max(0, 100 - (errors.length * 20) - (fallbackSources * 10))
    };
  }

  // Get service status for debugging
  getServiceStatus() {
    return {
      mls: {
        configured: this.hasMLSAccess(),
        healthy: true // Would be updated by health checks
      },
      zillow: {
        configured: this.hasZillowAccess(),
        healthy: true
      },
      publicRecords: {
        configured: this.hasPublicRecordsAccess(),
        healthy: true
      }
    };
  }
}

// Create singleton instance
const marketDataAggregator = new MarketDataAggregator();

export default marketDataAggregator;