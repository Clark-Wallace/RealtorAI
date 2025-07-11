// Zillow API Service Implementation
import { ApiClient } from './client';
import { API_ENDPOINTS, API_KEYS, CACHE_TTL } from './config';

class ZillowService extends ApiClient {
  constructor() {
    super('zillow');
    this.baseUrl = API_ENDPOINTS.zillow.baseUrl;
  }

  // Transform Zillow data to our format
  transformZillowProperty(zillowData) {
    const property = zillowData.property || zillowData;
    const details = property.details || {};
    const address = property.address || {};
    const zestimate = property.zestimate || {};
    const rentZestimate = property.rentZestimate || {};

    return {
      zpid: property.zpid,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zipcode,
        latitude: parseFloat(address.latitude),
        longitude: parseFloat(address.longitude)
      },
      details: {
        bedrooms: parseInt(details.bedrooms) || null,
        bathrooms: parseFloat(details.bathrooms) || null,
        sqft: parseInt(details.livingArea) || null,
        lotSize: parseInt(details.lotSize) || null,
        yearBuilt: parseInt(details.yearBuilt) || null,
        homeType: details.homeType,
        parking: details.parking,
        heating: details.heating,
        cooling: details.cooling,
        appliances: details.appliances || []
      },
      valuation: {
        zestimate: parseInt(zestimate.amount) || null,
        zestimateRange: {
          low: parseInt(zestimate.valuationRange?.low) || null,
          high: parseInt(zestimate.valuationRange?.high) || null
        },
        lastUpdated: zestimate.lastUpdated,
        valueChange: parseInt(zestimate.valueChange) || null,
        percentChange: parseFloat(zestimate.percentChange) || null,
        rentZestimate: parseInt(rentZestimate.amount) || null,
        rentRange: {
          low: parseInt(rentZestimate.valuationRange?.low) || null,
          high: parseInt(rentZestimate.valuationRange?.high) || null
        }
      },
      priceHistory: property.priceHistory || [],
      taxHistory: property.taxHistory || [],
      comparables: property.comparables || [],
      neighborhood: property.neighborhood || {},
      schools: property.schools || [],
      links: {
        homeDetails: property.links?.homeDetails,
        photos: property.links?.photos,
        map: property.links?.map
      }
    };
  }

  // Get property details by address
  async getPropertyByAddress(address, citystatezip) {
    // Zillow requires special URL encoding for addresses
    const params = {
      'zws-id': API_KEYS.zillow.zwsId,
      address: encodeURIComponent(address),
      citystatezip: encodeURIComponent(citystatezip)
    };

    try {
      const response = await this.get(
        API_ENDPOINTS.zillow.deepSearch,
        params,
        CACHE_TTL.propertyDetails
      );

      if (response.searchresults?.response?.results?.result) {
        const results = Array.isArray(response.searchresults.response.results.result)
          ? response.searchresults.response.results.result
          : [response.searchresults.response.results.result];
        
        return results.map(r => this.transformZillowProperty(r));
      }

      return [];
    } catch (error) {
      console.error('Zillow search error:', error);
      throw error;
    }
  }

  // Get property details by Zillow Property ID (ZPID)
  async getPropertyByZpid(zpid) {
    const params = {
      'zws-id': API_KEYS.zillow.zwsId,
      zpid: zpid
    };

    const response = await this.get(
      '/GetUpdatedPropertyDetails',
      params,
      CACHE_TTL.propertyDetails
    );

    return this.transformZillowProperty(response.updatedPropertyDetails);
  }

  // Get Zestimate (home value estimate)
  async getZestimate(zpid) {
    const params = {
      'zws-id': API_KEYS.zillow.zwsId,
      zpid: zpid
    };

    const response = await this.get(
      '/GetZestimate',
      params,
      CACHE_TTL.marketStats
    );

    const zestimate = response.zestimate?.response;
    
    return {
      zpid: zestimate.zpid,
      value: parseInt(zestimate.zestimate?.amount) || null,
      lastUpdated: zestimate.zestimate?.lastUpdated,
      valueChange: parseInt(zestimate.zestimate?.valueChange) || null,
      valuationRange: {
        low: parseInt(zestimate.zestimate?.valuationRange?.low) || null,
        high: parseInt(zestimate.zestimate?.valuationRange?.high) || null
      },
      percentile: parseInt(zestimate.localRealEstate?.percentile) || null,
      region: {
        name: zestimate.localRealEstate?.region?.name,
        type: zestimate.localRealEstate?.region?.type,
        zindex: parseInt(zestimate.localRealEstate?.region?.zindex) || null
      }
    };
  }

  // Get comparable homes
  async getComparables(zpid, count = 10) {
    const params = {
      'zws-id': API_KEYS.zillow.zwsId,
      zpid: zpid,
      count: count
    };

    const response = await this.get(
      '/GetComps',
      params,
      CACHE_TTL.propertyDetails
    );

    const comps = response.comps?.response?.properties?.comp || [];
    
    return (Array.isArray(comps) ? comps : [comps]).map(comp => ({
      zpid: comp.zpid,
      address: {
        street: comp.address?.street,
        city: comp.address?.city,
        state: comp.address?.state,
        zip: comp.address?.zipcode
      },
      distance: parseFloat(comp.distance) || null,
      value: parseInt(comp.zestimate?.amount) || null,
      details: {
        bedrooms: parseInt(comp.bedrooms) || null,
        bathrooms: parseFloat(comp.bathrooms) || null,
        sqft: parseInt(comp.finishedSqFt) || null,
        yearBuilt: parseInt(comp.yearBuilt) || null
      },
      lastSold: {
        date: comp.lastSoldDate,
        price: parseInt(comp.lastSoldPrice) || null
      },
      score: parseFloat(comp.score) || null
    }));
  }

  // Get neighborhood demographics
  async getDemographics(regionId, regionType = 'neighborhood') {
    const params = {
      'api-key': API_KEYS.zillow.apiKey,
      regionId: regionId,
      regionType: regionType
    };

    const response = await this.get(
      API_ENDPOINTS.zillow.demographics,
      params,
      CACHE_TTL.demographics
    );

    return {
      regionId: response.regionId,
      regionName: response.regionName,
      demographics: {
        medianAge: response.medianAge,
        medianIncome: response.medianHouseholdIncome,
        populationDensity: response.populationDensity,
        percentOwnerOccupied: response.percentOwnerOccupied,
        percentRenterOccupied: response.percentRenterOccupied,
        medianHomeValue: response.medianHomeValue,
        avgHouseholdSize: response.avgHouseholdSize
      },
      education: {
        percentHighSchool: response.percentHighSchoolOrHigher,
        percentBachelors: response.percentBachelorsOrHigher
      },
      market: {
        homesForSale: response.homesForSale,
        medianListPrice: response.medianListPrice,
        medianSalePrice: response.medianSalePrice,
        medianRent: response.medianRent,
        inventoryCount: response.inventoryCount,
        daysOnMarket: response.medianDaysOnMarket
      }
    };
  }

  // Get mortgage rates
  async getMortgageRates(price, downPayment, zip) {
    const params = {
      'api-key': API_KEYS.zillow.apiKey,
      price: price,
      down: downPayment,
      zip: zip
    };

    const response = await this.get(
      API_ENDPOINTS.zillow.mortgage,
      params,
      CACHE_TTL.marketStats
    );

    return {
      rates: response.rates.map(rate => ({
        lender: rate.lender,
        rate: rate.rate,
        apr: rate.apr,
        type: rate.loanType,
        term: rate.term,
        monthlyPayment: rate.monthlyPayment,
        fees: rate.fees
      })),
      lastUpdated: response.lastUpdated
    };
  }

  // Search for properties
  async searchProperties(criteria) {
    const params = {
      'api-key': API_KEYS.zillow.apiKey,
      location: criteria.location,
      status: criteria.status || 'for_sale',
      price_min: criteria.minPrice,
      price_max: criteria.maxPrice,
      beds_min: criteria.minBedrooms,
      beds_max: criteria.maxBedrooms,
      baths_min: criteria.minBathrooms,
      sqft_min: criteria.minSqft,
      sqft_max: criteria.maxSqft,
      type: criteria.propertyType,
      sort: criteria.sortBy || 'days_on_market',
      page: criteria.page || 1,
      per_page: criteria.limit || 20
    };

    const response = await this.get(
      '/properties/search',
      params,
      CACHE_TTL.listings
    );

    return {
      properties: response.properties.map(p => this.transformZillowProperty(p)),
      totalResults: response.totalResults,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    };
  }

  // Get regional market trends
  async getMarketTrends(regionId, regionType = 'city') {
    const params = {
      'api-key': API_KEYS.zillow.apiKey,
      regionId: regionId,
      regionType: regionType,
      metric: 'all'
    };

    const response = await this.get(
      '/market/trends',
      params,
      CACHE_TTL.marketStats
    );

    return {
      region: {
        id: response.regionId,
        name: response.regionName,
        type: response.regionType
      },
      trends: {
        medianListPrice: response.medianListPrice,
        medianSalePrice: response.medianSalePrice,
        priceTrend: response.priceTrend, // YoY change
        inventoryCount: response.inventoryCount,
        inventoryTrend: response.inventoryTrend,
        daysOnMarket: response.medianDaysOnMarket,
        domTrend: response.domTrend,
        pricePerSqft: response.medianPricePerSqft,
        forecastedAppreciation: response.forecastedAppreciation
      },
      historicalData: response.historical || []
    };
  }

  // Get rent estimate (Rent Zestimate)
  async getRentEstimate(zpid) {
    const params = {
      'zws-id': API_KEYS.zillow.zwsId,
      zpid: zpid
    };

    const response = await this.get(
      '/GetRentZestimate',
      params,
      CACHE_TTL.marketStats
    );

    const rentData = response.rentZestimate?.response;
    
    return {
      zpid: rentData.zpid,
      rentEstimate: parseInt(rentData.rent?.amount) || null,
      lastUpdated: rentData.rent?.lastUpdated,
      rentRange: {
        low: parseInt(rentData.rent?.valuationRange?.low) || null,
        high: parseInt(rentData.rent?.valuationRange?.high) || null
      },
      comparableRents: rentData.comparableRents || []
    };
  }

  // Calculate affordability
  calculateAffordability(homePrice, annualIncome, downPaymentPercent = 20) {
    const downPayment = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyIncome = annualIncome / 12;
    
    // Assume 6.8% interest rate, 30-year mortgage
    const monthlyRate = 0.068 / 12;
    const numPayments = 360;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Add estimated property tax, insurance, HOA
    const propertyTax = (homePrice * 0.012) / 12; // 1.2% annually
    const insurance = (homePrice * 0.004) / 12; // 0.4% annually
    const hoa = 200; // Estimated HOA
    
    const totalMonthlyPayment = monthlyPayment + propertyTax + insurance + hoa;
    const debtToIncomeRatio = (totalMonthlyPayment / monthlyIncome) * 100;
    
    return {
      affordable: debtToIncomeRatio <= 28,
      monthlyPayment: Math.round(totalMonthlyPayment),
      debtToIncomeRatio: Math.round(debtToIncomeRatio),
      maxAffordablePrice: Math.round((monthlyIncome * 0.28 - propertyTax - insurance - hoa) / monthlyRate * 1000) * 1000
    };
  }
}

// Create singleton instance
const zillowService = new ZillowService();

export default zillowService;