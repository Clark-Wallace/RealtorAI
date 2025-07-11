import { useState, useEffect } from 'react';
import {
  Search, MapPin, Home, Bed, Bath, Square, Calendar,
  Filter, ChevronDown, ExternalLink, Heart, Bell,
  TrendingUp, School, Train, ShoppingBag, Trees,
  X, Loader, CheckCircle, AlertCircle
} from 'lucide-react';
import { propertyService, PropertySearchCriteria, PropertyAlerts } from '../services/propertyIntegration';
import { useData } from '../context/DataContext';

const PropertySearch = () => {
  const { addProperty, clients } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeProviders, setActiveProviders] = useState(['all']);
  const [savedSearches, setSavedSearches] = useState([]);
  
  // Search filters
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    bedsMin: '',
    bedsMax: '',
    bathsMin: '',
    sqftMin: '',
    sqftMax: '',
    propertyTypes: [],
    features: []
  });

  // Property types
  const propertyTypes = [
    'Single Family', 'Condo', 'Townhouse', 'Multi-Family',
    'Land', 'Commercial', 'Apartment'
  ];

  // Common features
  const commonFeatures = [
    'Pool', 'Garage', 'Hardwood Floors', 'Updated Kitchen',
    'Central Air', 'Fireplace', 'Basement', 'Garden',
    'Pet Friendly', 'Parking', 'Gym', 'Concierge'
  ];

  // Load saved searches
  useEffect(() => {
    const saved = localStorage.getItem('propertySearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Search properties
  const searchProperties = async () => {
    if (!searchQuery.trim() && !hasActiveFilters()) return;

    setLoading(true);
    try {
      // Build search criteria
      const criteria = new PropertySearchCriteria()
        .location(searchQuery.split(',')[0]?.trim(), '', '')
        .priceRange(filters.priceMin || 0, filters.priceMax || 999999999)
        .beds(filters.bedsMin || 0, filters.bedsMax || 99)
        .baths(filters.bathsMin || 0)
        .sqft(filters.sqftMin || 0, filters.sqftMax || 999999)
        .propertyTypes(...(filters.propertyTypes.length ? filters.propertyTypes : propertyTypes))
        .features(...filters.features)
        .build();

      // Search across providers
      const results = await propertyService.searchProperties(criteria, activeProviders);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : value !== ''
    );
  };

  // Save search
  const saveSearch = () => {
    const searchName = prompt('Name this search:');
    if (!searchName) return;

    const newSearch = {
      id: Date.now().toString(),
      name: searchName,
      query: searchQuery,
      filters: { ...filters },
      created: new Date().toISOString()
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('propertySearches', JSON.stringify(updated));
  };

  // Create alert for client
  const createAlert = async (clientId) => {
    if (!selectedProperty) return;

    const alerts = new PropertyAlerts();
    const criteria = {
      city: selectedProperty.city,
      priceMax: selectedProperty.price * 1.1,
      bedsMin: selectedProperty.bedrooms,
      propertyTypes: [selectedProperty.type]
    };

    await alerts.createAlert(clientId, criteria, 'daily');
    alert('Alert created! Client will be notified of similar properties.');
  };

  // Add property to system
  const addToSystem = () => {
    if (!selectedProperty) return;

    const propertyData = {
      id: `imported-${Date.now()}`,
      address: selectedProperty.address,
      price: selectedProperty.price,
      bedrooms: selectedProperty.bedrooms,
      bathrooms: selectedProperty.bathrooms,
      sqft: selectedProperty.sqft,
      type: selectedProperty.type,
      features: selectedProperty.features || [],
      yearBuilt: selectedProperty.yearBuilt,
      mlsNumber: selectedProperty.mlsNumber,
      photos: selectedProperty.photos || [],
      coordinates: selectedProperty.coordinates
    };

    addProperty(propertyData);
    alert('Property added to your system!');
    setSelectedProperty(null);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Search className="text-blue-600" size={32} />
          Property Search
        </h1>
        <p className="text-gray-600 mt-2">
          Search properties across multiple MLS feeds and data providers
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchProperties()}
                placeholder="City, State or ZIP code"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
              showFilters || hasActiveFilters()
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Filter size={20} />
            Filters
            {hasActiveFilters() && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v !== '').length}
              </span>
            )}
          </button>
          <button
            onClick={searchProperties}
            disabled={loading || (!searchQuery.trim() && !hasActiveFilters())}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Searching...
              </>
            ) : (
              <>
                <Search size={20} />
                Search
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={filters.bedsMin}
                    onChange={(e) => setFilters({...filters, bedsMin: e.target.value})}
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={filters.bedsMax}
                    onChange={(e) => setFilters({...filters, bedsMax: e.target.value})}
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
                <input
                  type="number"
                  value={filters.bathsMin}
                  onChange={(e) => setFilters({...filters, bathsMin: e.target.value})}
                  placeholder="Any"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              {/* Property Types */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Types</label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const types = filters.propertyTypes.includes(type)
                          ? filters.propertyTypes.filter(t => t !== type)
                          : [...filters.propertyTypes, type];
                        setFilters({...filters, propertyTypes: types});
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        filters.propertyTypes.includes(type)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Square Feet */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={filters.sqftMin}
                    onChange={(e) => setFilters({...filters, sqftMin: e.target.value})}
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={filters.sqftMax}
                    onChange={(e) => setFilters({...filters, sqftMax: e.target.value})}
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
              <div className="flex flex-wrap gap-2">
                {commonFeatures.map(feature => (
                  <button
                    key={feature}
                    onClick={() => {
                      const features = filters.features.includes(feature)
                        ? filters.features.filter(f => f !== feature)
                        : [...filters.features, feature];
                      setFilters({...filters, features});
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      filters.features.includes(feature)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setFilters({
                    priceMin: '',
                    priceMax: '',
                    bedsMin: '',
                    bedsMax: '',
                    bathsMin: '',
                    sqftMin: '',
                    sqftMax: '',
                    propertyTypes: [],
                    features: []
                  });
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
              <button
                onClick={saveSearch}
                disabled={!searchQuery && !hasActiveFilters()}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                Save Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold mb-3">Saved Searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(search => (
              <button
                key={search.id}
                onClick={() => {
                  setSearchQuery(search.query);
                  setFilters(search.filters);
                  searchProperties();
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
              >
                {search.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((property, index) => (
            <div
              key={`${property.source}-${property.id}-${index}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedProperty(property)}
            >
              {/* Property Image */}
              <div className="h-48 bg-gray-200 relative">
                {property.photos && property.photos[0] ? (
                  <img
                    src={property.photos[0]}
                    alt={property.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="text-gray-400" size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                  {property.source}
                </div>
                {property.daysOnMarket !== undefined && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {property.daysOnMarket} days on market
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {formatPrice(property.price)}
                  </h3>
                  <Heart className="text-gray-400 hover:text-red-500" size={20} />
                </div>

                <p className="text-gray-600 mb-3">{property.address}</p>

                <div className="flex gap-4 text-sm text-gray-700 mb-3">
                  <span className="flex items-center gap-1">
                    <Bed size={16} />
                    {property.bedrooms} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath size={16} />
                    {property.bathrooms} baths
                  </span>
                  <span className="flex items-center gap-1">
                    <Square size={16} />
                    {formatNumber(property.sqft)} sqft
                  </span>
                </div>

                {/* Property Scores */}
                {property.scores && (
                  <div className="flex gap-2 text-xs">
                    {property.scores.walkScore && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        Walk: {property.scores.walkScore}
                      </span>
                    )}
                    {property.scores.transitScore && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Transit: {property.scores.transitScore}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Property Details</h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(selectedProperty.price)}
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">{selectedProperty.address}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Type</span>
                      <p className="font-medium">{selectedProperty.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Year Built</span>
                      <p className="font-medium">{selectedProperty.yearBuilt || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">MLS #</span>
                      <p className="font-medium">{selectedProperty.mlsNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Source</span>
                      <p className="font-medium">{selectedProperty.source}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bed className="mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold">{selectedProperty.bedrooms}</p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Bath className="mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold">{selectedProperty.bathrooms}</p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Square className="mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold">{formatNumber(selectedProperty.sqft)}</p>
                      <p className="text-sm text-gray-600">Sq Ft</p>
                    </div>
                  </div>

                  {/* Features */}
                  {selectedProperty.features && selectedProperty.features.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Market Analysis */}
              {selectedProperty.marketAnalysis && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Market Analysis
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Price/sqft</span>
                      <p className="font-medium">
                        {formatPrice(selectedProperty.marketAnalysis.pricePerSqft)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Neighborhood Avg</span>
                      <p className="font-medium">
                        {formatPrice(selectedProperty.marketAnalysis.neighborhoodAvgPrice)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Days on Market</span>
                      <p className="font-medium">
                        {selectedProperty.marketAnalysis.daysOnMarket.this} days
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Market Trend</span>
                      <p className="font-medium capitalize">
                        {selectedProperty.marketAnalysis.marketTrend}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Neighborhood Info */}
              {selectedProperty.neighborhood && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium mb-3">Neighborhood: {selectedProperty.neighborhood.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Median Income</span>
                      <p className="font-medium">
                        {formatPrice(selectedProperty.neighborhood.medianIncome)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Crime Rate</span>
                      <p className="font-medium">{selectedProperty.neighborhood.crimeRate}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">School Rating</span>
                      <p className="font-medium">
                        {selectedProperty.neighborhood.schools.elementary.rating}/10
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nearby Amenities */}
              {selectedProperty.nearbyAmenities && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Nearby Amenities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <ShoppingBag className="text-gray-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium">Grocery Stores</p>
                        {selectedProperty.nearbyAmenities.groceryStores.map((store, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {store.name} - {store.distance}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Train className="text-gray-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium">Public Transit</p>
                        {selectedProperty.nearbyAmenities.transitStops.map((stop, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {stop.type} ({stop.lines.join(', ')}) - {stop.distance}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={addToSystem}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Add to My Properties
                </button>
                <button
                  onClick={() => {
                    const clientId = prompt('Enter client ID for alert:');
                    if (clientId) createAlert(clientId);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <Bell size={20} />
                  Set Alert
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ExternalLink size={20} />
                  View Map
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;