// Public Records API Service Implementation
import { ApiClient } from './client';
import { API_ENDPOINTS, CACHE_TTL } from './config';

class PublicRecordsService extends ApiClient {
  constructor() {
    super('publicRecords');
    this.baseUrl = API_ENDPOINTS.publicRecords.baseUrl;
  }

  // Get property assessment data
  async getPropertyAssessment(address, parcelNumber = null) {
    const params = parcelNumber 
      ? { parcel: parcelNumber }
      : { address: address };

    const response = await this.get(
      API_ENDPOINTS.publicRecords.assessor,
      params,
      CACHE_TTL.publicRecords
    );

    return {
      parcelNumber: response.parcelNumber,
      owner: {
        name: response.ownerName,
        mailingAddress: response.ownerMailingAddress,
        occupancy: response.ownerOccupied ? 'Owner' : 'Non-Owner'
      },
      property: {
        address: response.propertyAddress,
        legalDescription: response.legalDescription,
        landUse: response.landUseCode,
        zoning: response.zoning,
        neighborhood: response.neighborhoodCode
      },
      assessment: {
        year: response.assessmentYear,
        totalValue: response.totalAssessedValue,
        landValue: response.landAssessedValue,
        improvementValue: response.improvementAssessedValue,
        exemptions: response.exemptions || [],
        taxableValue: response.taxableValue
      },
      building: {
        yearBuilt: response.yearBuilt,
        effectiveYear: response.effectiveYearBuilt,
        bedrooms: response.bedrooms,
        bathrooms: response.bathrooms,
        rooms: response.totalRooms,
        sqft: response.buildingArea,
        stories: response.stories,
        construction: response.constructionType,
        condition: response.condition,
        quality: response.qualityGrade
      },
      lot: {
        size: response.lotSize,
        sizeUnit: response.lotSizeUnit,
        frontage: response.frontage,
        depth: response.depth,
        shape: response.lotShape,
        topography: response.topography
      },
      features: {
        heating: response.heatingType,
        cooling: response.coolingType,
        fireplace: response.fireplaces,
        pool: response.pool,
        garage: response.garageType,
        garageSpaces: response.garageSpaces,
        basement: response.basementType,
        basementFinished: response.basementFinishedArea
      },
      lastUpdated: response.lastUpdated
    };
  }

  // Get property deed/sales history
  async getPropertyDeeds(address, parcelNumber = null) {
    const params = parcelNumber 
      ? { parcel: parcelNumber }
      : { address: address };

    const response = await this.get(
      API_ENDPOINTS.publicRecords.deeds,
      params,
      CACHE_TTL.publicRecords
    );

    return response.deeds.map(deed => ({
      recordingDate: deed.recordingDate,
      documentType: deed.documentType,
      documentNumber: deed.documentNumber,
      book: deed.book,
      page: deed.page,
      grantor: deed.grantor, // Seller
      grantee: deed.grantee, // Buyer
      salePrice: deed.salePrice,
      saleDate: deed.saleDate,
      transferTax: deed.transferTax,
      loanAmount: deed.loanAmount,
      lender: deed.lender,
      saleType: this.categorizeSaleType(deed),
      pricePerSqft: deed.salePrice && response.buildingArea 
        ? Math.round(deed.salePrice / response.buildingArea)
        : null
    }));
  }

  // Get property tax history
  async getPropertyTaxHistory(address, parcelNumber = null) {
    const params = parcelNumber 
      ? { parcel: parcelNumber }
      : { address: address };

    const response = await this.get(
      API_ENDPOINTS.publicRecords.tax,
      params,
      CACHE_TTL.publicRecords
    );

    return {
      currentYear: response.currentTaxYear,
      taxBill: {
        total: response.totalTaxAmount,
        breakdown: {
          county: response.countyTax,
          city: response.cityTax,
          school: response.schoolTax,
          special: response.specialAssessments
        },
        exemptions: response.exemptions,
        netTax: response.netTaxAmount
      },
      paymentStatus: {
        isPaid: response.isPaid,
        paidDate: response.paidDate,
        delinquent: response.isDelinquent,
        delinquentAmount: response.delinquentAmount
      },
      history: response.taxHistory.map(year => ({
        year: year.taxYear,
        assessedValue: year.assessedValue,
        taxAmount: year.taxAmount,
        taxRate: year.taxRate,
        paid: year.isPaid,
        paidDate: year.paidDate
      })),
      taxRate: response.currentTaxRate,
      millage: response.millageBreakdown
    };
  }

  // Get building permits
  async getBuildingPermits(address, parcelNumber = null) {
    const params = parcelNumber 
      ? { parcel: parcelNumber }
      : { address: address };

    const response = await this.get(
      API_ENDPOINTS.publicRecords.permits,
      params,
      CACHE_TTL.publicRecords
    );

    return response.permits.map(permit => ({
      permitNumber: permit.permitNumber,
      type: permit.permitType,
      subType: permit.permitSubType,
      description: permit.description,
      issuedDate: permit.issuedDate,
      expirationDate: permit.expirationDate,
      completedDate: permit.completedDate,
      status: permit.status,
      contractor: {
        name: permit.contractorName,
        license: permit.contractorLicense,
        phone: permit.contractorPhone
      },
      cost: {
        estimated: permit.estimatedCost,
        actual: permit.actualCost,
        fee: permit.permitFee
      },
      inspections: permit.inspections?.map(insp => ({
        type: insp.inspectionType,
        date: insp.inspectionDate,
        result: insp.result,
        inspector: insp.inspector
      })) || []
    }));
  }

  // Get comparable sales from public records
  async getComparableSales(property, radius = 0.5, months = 12) {
    const params = {
      latitude: property.latitude,
      longitude: property.longitude,
      radius: radius,
      months: months,
      bedrooms_min: property.bedrooms - 1,
      bedrooms_max: property.bedrooms + 1,
      sqft_min: property.sqft * 0.8,
      sqft_max: property.sqft * 1.2,
      property_type: property.propertyType
    };

    const response = await this.get(
      `${API_ENDPOINTS.publicRecords.deeds}/comparables`,
      params,
      CACHE_TTL.propertyDetails
    );

    return response.comparables.map(comp => ({
      address: comp.address,
      distance: comp.distance,
      saleDate: comp.saleDate,
      salePrice: comp.salePrice,
      pricePerSqft: comp.pricePerSqft,
      property: {
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        sqft: comp.sqft,
        yearBuilt: comp.yearBuilt,
        lotSize: comp.lotSize
      },
      similarity: {
        score: comp.similarityScore,
        factors: comp.similarityFactors
      },
      daysOnMarket: comp.daysOnMarket,
      adjustedPrice: this.calculateAdjustedPrice(comp, property)
    }));
  }

  // Get foreclosure data
  async getForeclosureData(county, limit = 100) {
    const params = {
      county: county,
      status: 'active',
      limit: limit,
      sort: 'auction_date'
    };

    const response = await this.get(
      '/foreclosures',
      params,
      CACHE_TTL.listings
    );

    return response.foreclosures.map(fc => ({
      caseNumber: fc.caseNumber,
      address: fc.propertyAddress,
      parcelNumber: fc.parcelNumber,
      status: fc.foreclosureStatus,
      auctionDate: fc.auctionDate,
      auctionLocation: fc.auctionLocation,
      openingBid: fc.openingBid,
      estimatedValue: fc.estimatedValue,
      loanBalance: fc.loanBalance,
      plaintiff: fc.plaintiff,
      defendants: fc.defendants,
      attorney: fc.attorneyInfo,
      propertyDetails: {
        bedrooms: fc.bedrooms,
        bathrooms: fc.bathrooms,
        sqft: fc.sqft,
        yearBuilt: fc.yearBuilt
      }
    }));
  }

  // Get liens and encumbrances
  async getLiens(address, parcelNumber = null) {
    const params = parcelNumber 
      ? { parcel: parcelNumber }
      : { address: address };

    const response = await this.get(
      '/liens',
      params,
      CACHE_TTL.publicRecords
    );

    return {
      mortgages: response.mortgages?.map(m => ({
        lender: m.lender,
        amount: m.amount,
        recordDate: m.recordDate,
        type: m.mortgageType,
        position: m.position
      })) || [],
      taxLiens: response.taxLiens?.map(l => ({
        authority: l.authority,
        amount: l.amount,
        recordDate: l.recordDate,
        status: l.status
      })) || [],
      mechanicsLiens: response.mechanicsLiens?.map(l => ({
        claimant: l.claimant,
        amount: l.amount,
        recordDate: l.recordDate,
        description: l.description
      })) || [],
      judgments: response.judgments?.map(j => ({
        creditor: j.creditor,
        amount: j.amount,
        recordDate: j.recordDate,
        caseNumber: j.caseNumber
      })) || [],
      total: response.totalLienAmount
    };
  }

  // Helper function to categorize sale type
  categorizeSaleType(deed) {
    if (deed.documentType.toLowerCase().includes('foreclosure')) {
      return 'Foreclosure';
    } else if (deed.documentType.toLowerCase().includes('quit')) {
      return 'Quit Claim';
    } else if (deed.salePrice === 0 || deed.salePrice < 1000) {
      return 'Non-Arms Length';
    } else if (deed.documentType.toLowerCase().includes('warranty')) {
      return 'Warranty Deed';
    } else {
      return 'Standard Sale';
    }
  }

  // Calculate adjusted price for comparables
  calculateAdjustedPrice(comparable, subject) {
    let adjustedPrice = comparable.salePrice;
    
    // Size adjustment ($50 per sqft difference)
    const sizeDiff = subject.sqft - comparable.sqft;
    adjustedPrice += sizeDiff * 50;
    
    // Age adjustment ($2000 per year difference)
    const ageDiff = comparable.yearBuilt - subject.yearBuilt;
    adjustedPrice += ageDiff * 2000;
    
    // Bedroom adjustment ($10,000 per bedroom)
    const bedDiff = subject.bedrooms - comparable.bedrooms;
    adjustedPrice += bedDiff * 10000;
    
    // Bathroom adjustment ($5,000 per bathroom)
    const bathDiff = subject.bathrooms - comparable.bathrooms;
    adjustedPrice += bathDiff * 5000;
    
    // Time adjustment (0.5% per month)
    const monthsDiff = Math.floor(
      (new Date() - new Date(comparable.saleDate)) / (1000 * 60 * 60 * 24 * 30)
    );
    adjustedPrice *= (1 + (0.005 * monthsDiff));
    
    return Math.round(adjustedPrice);
  }

  // Get neighborhood statistics from public records
  async getNeighborhoodStats(neighborhood, county) {
    const params = {
      neighborhood: neighborhood,
      county: county
    };

    const response = await this.get(
      '/neighborhood/stats',
      params,
      CACHE_TTL.demographics
    );

    return {
      propertyCount: response.totalProperties,
      averageValue: response.averageAssessedValue,
      medianValue: response.medianAssessedValue,
      averageAge: response.averageYearBuilt,
      ownerOccupiedRate: response.ownerOccupiedPercentage,
      averageTaxBill: response.averageTaxAmount,
      propertyTypes: response.propertyTypeBreakdown,
      valueDistribution: response.valueRanges,
      recentSales: {
        count: response.salesCount,
        averagePrice: response.averageSalePrice,
        averageDom: response.averageDaysOnMarket
      }
    };
  }
}

// Create singleton instance
const publicRecordsService = new PublicRecordsService();

export default publicRecordsService;