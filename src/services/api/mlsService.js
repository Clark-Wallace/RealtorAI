// MLS/IDX Service Implementation
import { ApiClient } from './client';
import { API_ENDPOINTS, CACHE_TTL } from './config';

class MLSService extends ApiClient {
  constructor() {
    super('mls');
    this.baseUrl = API_ENDPOINTS.mls.baseUrl;
  }

  // Transform MLS data to our internal format
  transformListing(mlsListing) {
    return {
      id: mlsListing.ListingId || mlsListing.ListingKey,
      address: {
        street: mlsListing.UnparsedAddress || 
                `${mlsListing.StreetNumber} ${mlsListing.StreetName} ${mlsListing.StreetSuffix}`.trim(),
        city: mlsListing.City,
        state: mlsListing.StateOrProvince,
        zip: mlsListing.PostalCode,
        county: mlsListing.CountyOrParish
      },
      price: {
        current: mlsListing.ListPrice,
        original: mlsListing.OriginalListPrice,
        pricePerSqft: mlsListing.ListPrice / mlsListing.LivingArea,
        priceChangeDate: mlsListing.PriceChangeTimestamp
      },
      property: {
        type: mlsListing.PropertyType,
        subType: mlsListing.PropertySubType,
        bedrooms: mlsListing.BedroomsTotal,
        bathrooms: mlsListing.BathroomsTotalInteger,
        sqft: mlsListing.LivingArea,
        lotSize: mlsListing.LotSizeAcres,
        yearBuilt: mlsListing.YearBuilt,
        stories: mlsListing.StoriesTotal
      },
      status: {
        current: mlsListing.StandardStatus,
        daysOnMarket: mlsListing.DaysOnMarket,
        cumulativeDaysOnMarket: mlsListing.CumulativeDaysOnMarket,
        listingDate: mlsListing.ListingContractDate,
        statusChangeDate: mlsListing.StatusChangeTimestamp
      },
      features: {
        cooling: mlsListing.Cooling,
        heating: mlsListing.Heating,
        parking: mlsListing.ParkingFeatures,
        pool: mlsListing.PoolFeatures?.includes('Pool'),
        fireplace: mlsListing.FireplacesTotal > 0,
        basement: mlsListing.Basement?.length > 0,
        garage: mlsListing.GarageSpaces > 0,
        garageSpaces: mlsListing.GarageSpaces
      },
      agent: {
        name: mlsListing.ListAgentFullName,
        id: mlsListing.ListAgentKey,
        email: mlsListing.ListAgentEmail,
        phone: mlsListing.ListAgentDirectPhone
      },
      office: {
        name: mlsListing.ListOfficeName,
        id: mlsListing.ListOfficeKey,
        phone: mlsListing.ListOfficePhone
      },
      photos: mlsListing.Media?.filter(m => m.MediaCategory === 'Photo')
                              .map(m => m.MediaURL) || [],
      virtualTour: mlsListing.VirtualTourURLUnbranded,
      remarks: {
        public: mlsListing.PublicRemarks,
        private: mlsListing.PrivateRemarks
      },
      coordinates: {
        latitude: mlsListing.Latitude,
        longitude: mlsListing.Longitude
      }
    };
  }

  // Search active listings
  async searchListings(criteria) {
    const params = {
      '$filter': this.buildFilterQuery(criteria),
      '$orderby': criteria.sortBy || 'ListPrice desc',
      '$top': criteria.limit || 50,
      '$skip': criteria.offset || 0,
      '$select': 'ListingId,UnparsedAddress,City,StateOrProvince,PostalCode,ListPrice,BedroomsTotal,BathroomsTotalInteger,LivingArea,PropertyType,StandardStatus,DaysOnMarket,ListingContractDate,Latitude,Longitude'
    };

    const response = await this.get(
      API_ENDPOINTS.mls.search,
      params,
      CACHE_TTL.listings
    );

    return {
      listings: response.value.map(listing => this.transformListing(listing)),
      total: response['@odata.count'] || response.value.length,
      hasMore: response['@odata.nextLink'] !== undefined
    };
  }

  // Get detailed listing information
  async getListingDetails(listingId) {
    const response = await this.get(
      `${API_ENDPOINTS.mls.listings}('${listingId}')`,
      {},
      CACHE_TTL.propertyDetails
    );

    return this.transformListing(response);
  }

  // Get listing history (price changes, status changes)
  async getListingHistory(listingId) {
    const params = {
      '$filter': `ListingId eq '${listingId}'`,
      '$orderby': 'ModificationTimestamp desc'
    };

    const response = await this.get(
      API_ENDPOINTS.mls.history,
      params,
      CACHE_TTL.propertyDetails
    );

    return response.value.map(record => ({
      date: record.ModificationTimestamp,
      type: record.ChangeType,
      field: record.FieldName,
      oldValue: record.PreviousValue,
      newValue: record.NewValue
    }));
  }

  // Get market statistics for an area
  async getMarketStats(criteria) {
    // This would typically be a specialized endpoint or aggregation query
    // For now, we'll fetch listings and calculate stats
    const allListings = await this.searchListings({
      ...criteria,
      limit: 1000, // Get more for statistics
      includeStatus: ['Active', 'Pending', 'Sold']
    });

    const stats = {
      totalListings: allListings.total,
      averagePrice: 0,
      medianPrice: 0,
      averageDaysOnMarket: 0,
      averagePricePerSqft: 0,
      inventory: 0,
      priceRanges: {}
    };

    if (allListings.listings.length > 0) {
      const prices = allListings.listings.map(l => l.price.current).sort((a, b) => a - b);
      const daysOnMarket = allListings.listings.map(l => l.status.daysOnMarket);
      const pricesPerSqft = allListings.listings.map(l => l.price.pricePerSqft);

      stats.averagePrice = prices.reduce((a, b) => a + b) / prices.length;
      stats.medianPrice = prices[Math.floor(prices.length / 2)];
      stats.averageDaysOnMarket = daysOnMarket.reduce((a, b) => a + b) / daysOnMarket.length;
      stats.averagePricePerSqft = pricesPerSqft.reduce((a, b) => a + b) / pricesPerSqft.length;

      // Calculate price ranges
      const ranges = [
        { min: 0, max: 500000, label: 'Under $500K' },
        { min: 500000, max: 1000000, label: '$500K-$1M' },
        { min: 1000000, max: 2000000, label: '$1M-$2M' },
        { min: 2000000, max: 5000000, label: '$2M-$5M' },
        { min: 5000000, max: Infinity, label: '$5M+' }
      ];

      ranges.forEach(range => {
        const count = prices.filter(p => p >= range.min && p < range.max).length;
        stats.priceRanges[range.label] = count;
      });
    }

    return stats;
  }

  // Get comparable sales
  async getComparables(property, radius = 0.5) {
    const criteria = {
      latitude: property.coordinates.latitude,
      longitude: property.coordinates.longitude,
      radius: radius,
      propertyType: property.property.type,
      minBedrooms: property.property.bedrooms - 1,
      maxBedrooms: property.property.bedrooms + 1,
      minSqft: property.property.sqft * 0.8,
      maxSqft: property.property.sqft * 1.2,
      status: 'Sold',
      soldWithinDays: 180
    };

    return this.searchListings(criteria);
  }

  // Build OData filter query from criteria
  buildFilterQuery(criteria) {
    const filters = [];

    if (criteria.city) {
      filters.push(`City eq '${criteria.city}'`);
    }

    if (criteria.minPrice) {
      filters.push(`ListPrice ge ${criteria.minPrice}`);
    }

    if (criteria.maxPrice) {
      filters.push(`ListPrice le ${criteria.maxPrice}`);
    }

    if (criteria.minBedrooms) {
      filters.push(`BedroomsTotal ge ${criteria.minBedrooms}`);
    }

    if (criteria.propertyType) {
      filters.push(`PropertyType eq '${criteria.propertyType}'`);
    }

    if (criteria.status) {
      filters.push(`StandardStatus eq '${criteria.status}'`);
    } else if (criteria.includeStatus) {
      const statusFilters = criteria.includeStatus.map(s => `StandardStatus eq '${s}'`);
      filters.push(`(${statusFilters.join(' or ')})`);
    }

    if (criteria.latitude && criteria.longitude && criteria.radius) {
      // Approximate bounding box for geo search
      const lat = parseFloat(criteria.latitude);
      const lon = parseFloat(criteria.longitude);
      const radiusDegrees = criteria.radius / 69; // Rough conversion miles to degrees
      
      filters.push(`Latitude ge ${lat - radiusDegrees}`);
      filters.push(`Latitude le ${lat + radiusDegrees}`);
      filters.push(`Longitude ge ${lon - radiusDegrees}`);
      filters.push(`Longitude le ${lon + radiusDegrees}`);
    }

    if (criteria.daysOnMarket) {
      filters.push(`DaysOnMarket le ${criteria.daysOnMarket}`);
    }

    if (criteria.soldWithinDays) {
      const date = new Date();
      date.setDate(date.getDate() - criteria.soldWithinDays);
      filters.push(`CloseDate ge ${date.toISOString()}`);
    }

    return filters.join(' and ');
  }

  // Get agent's listings
  async getAgentListings(agentId) {
    const params = {
      '$filter': `ListAgentKey eq '${agentId}'`,
      '$orderby': 'ListingContractDate desc'
    };

    return this.get(API_ENDPOINTS.mls.listings, params, CACHE_TTL.listings);
  }

  // Get office listings  
  async getOfficeListings(officeId) {
    const params = {
      '$filter': `ListOfficeKey eq '${officeId}'`,
      '$orderby': 'ListPrice desc'
    };

    return this.get(API_ENDPOINTS.mls.listings, params, CACHE_TTL.listings);
  }

  // Subscribe to listing updates (WebSocket or webhook)
  async subscribeToUpdates(criteria, callback) {
    // This would typically set up a WebSocket connection or webhook
    // For now, we'll simulate with polling
    const pollInterval = 60000; // 1 minute
    
    const checkForUpdates = async () => {
      try {
        const listings = await this.searchListings(criteria);
        callback(listings);
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Initial check
    checkForUpdates();
    
    // Set up polling
    const intervalId = setInterval(checkForUpdates, pollInterval);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
  }
}

// Create singleton instance
const mlsService = new MLSService();

export default mlsService;