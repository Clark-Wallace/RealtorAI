import { useState, useEffect } from 'react';
import { 
  Home, TrendingDown, Clock, DollarSign, Users, 
  AlertCircle, ChevronRight, Filter, Eye, Target,
  Award, BarChart3, Calendar, MapPin
} from 'lucide-react';

const CompetitiveIntel = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('days');
  const [selectedListing, setSelectedListing] = useState(null);

  // Mock competitive listings data
  const [listings, setListings] = useState([
    {
      id: 1,
      address: '789 Pine Ridge Dr',
      price: 2950000,
      originalPrice: 2950000,
      priceReductions: 0,
      daysOnMarket: 8,
      status: 'under-contract',
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3200,
      agent: 'Sarah Johnson',
      brokerage: 'Luxury Realty',
      showings: 24,
      insight: 'Priced right, professional photos, virtual tour drove quick sale'
    },
    {
      id: 2,
      address: '456 Oak Manor Ln',
      price: 2650000,
      originalPrice: 3100000,
      priceReductions: 3,
      daysOnMarket: 158,
      status: 'active',
      bedrooms: 5,
      bathrooms: 4,
      sqft: 3800,
      agent: 'Mike Chen',
      brokerage: 'Premier Properties',
      showings: 67,
      insight: 'Overpriced initially, dated kitchen killing deals, needs staging'
    },
    {
      id: 3,
      address: '123 Riverside Ct',
      price: 3200000,
      originalPrice: 3200000,
      priceReductions: 0,
      daysOnMarket: 23,
      status: 'active',
      bedrooms: 4,
      bathrooms: 4,
      sqft: 3500,
      agent: 'Emily Davis',
      brokerage: 'Coastal Elite',
      showings: 18,
      insight: 'New listing, waterfront premium justified, generating interest'
    },
    {
      id: 4,
      address: '567 Hilltop Way',
      price: 2875000,
      originalPrice: 2750000,
      priceReductions: -1,
      daysOnMarket: 3,
      status: 'coming-soon',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3100,
      agent: 'John Smith',
      brokerage: 'Your Brokerage',
      showings: 0,
      insight: 'Strategic coming soon campaign, building buzz before active'
    }
  ]);

  // Calculate price per sqft
  const getPricePerSqft = (listing) => {
    return Math.round(listing.price / listing.sqft);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'under-contract': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'coming-soon': return 'bg-purple-100 text-purple-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Sort listings
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'days': return a.daysOnMarket - b.daysOnMarket;
      case 'price': return b.price - a.price;
      case 'reductions': return b.priceReductions - a.priceReductions;
      case 'showings': return b.showings - a.showings;
      default: return 0;
    }
  });

  // Filter listings
  const filteredListings = sortedListings.filter(listing => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  // Market share analysis
  const getMarketShare = () => {
    const brokerages = {};
    listings.forEach(listing => {
      brokerages[listing.brokerage] = (brokerages[listing.brokerage] || 0) + 1;
    });
    return Object.entries(brokerages)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / listings.length) * 100).toFixed(1)
      }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="text-orange-600" />
          Competitive Intelligence
        </h2>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Listings</option>
            <option value="active">Active</option>
            <option value="under-contract">Under Contract</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="days">Sort by DOM</option>
            <option value="price">Sort by Price</option>
            <option value="reductions">Sort by Reductions</option>
            <option value="showings">Sort by Showings</option>
          </select>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Home className="text-blue-600" size={20} />
            <span className="text-2xl font-bold">{listings.length}</span>
          </div>
          <p className="text-sm text-gray-600">Competing Listings</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-600" size={20} />
            <span className="text-2xl font-bold">
              {Math.round(listings.reduce((sum, l) => sum + l.daysOnMarket, 0) / listings.length)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Avg Days on Market</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-red-600" size={20} />
            <span className="text-2xl font-bold">
              {listings.filter(l => l.priceReductions > 0).length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Price Reductions</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="text-green-600" size={20} />
            <span className="text-2xl font-bold">
              {((listings.filter(l => l.status === 'under-contract').length / listings.length) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Success Rate</p>
        </div>
      </div>

      {/* Competitive Listings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Competitive Listings Analysis</h3>
          
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div 
                key={listing.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedListing(listing.id === selectedListing ? null : listing.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          {listing.address}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                            {listing.status.replace('-', ' ')}
                          </span>
                        </h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <p className="font-medium">
                              ${(listing.price / 1000000).toFixed(2)}M
                              {listing.priceReductions > 0 && (
                                <span className="text-red-600 text-xs ml-1">
                                  ↓ {listing.priceReductions}x
                                </span>
                              )}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">DOM:</span>
                            <p className="font-medium">
                              {listing.daysOnMarket} days
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">$/sqft:</span>
                            <p className="font-medium">
                              ${getPricePerSqft(listing)}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Showings:</span>
                            <p className="font-medium">
                              {listing.showings}
                              <span className="text-xs text-gray-500 ml-1">
                                ({(listing.showings / listing.daysOnMarket).toFixed(1)}/day)
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2">
                          {listing.agent} • {listing.brokerage}
                        </p>
                      </div>
                      
                      <ChevronRight 
                        className={`text-gray-400 transition-transform ${
                          selectedListing === listing.id ? 'rotate-90' : ''
                        }`} 
                        size={20} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {selectedListing === listing.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Competitive Insight
                      </h5>
                      <p className="text-sm text-blue-800">{listing.insight}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Original Price:</span>
                        <p className="font-medium">${(listing.originalPrice / 1000000).toFixed(2)}M</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Price Change:</span>
                        <p className="font-medium text-red-600">
                          {((listing.price - listing.originalPrice) / listing.originalPrice * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Showing Rate:</span>
                        <p className="font-medium">
                          {listing.showings > listing.daysOnMarket * 2 ? 'High' : 
                           listing.showings > listing.daysOnMarket ? 'Moderate' : 'Low'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                        View Full Analysis
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                        Add to Watchlist
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Share Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="text-purple-600" size={20} />
          Market Share by Brokerage
        </h3>
        
        <div className="space-y-3">
          {getMarketShare().map((brokerage, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{brokerage.name}</span>
                  <span className="text-sm text-gray-600">
                    {brokerage.count} listings ({brokerage.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      brokerage.name === 'Your Brokerage' ? 'bg-purple-600' : 'bg-gray-400'
                    }`}
                    style={{ width: `${brokerage.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <h3 className="text-lg font-semibold mb-4 text-orange-900">Strategic Takeaways</h3>
        <ul className="space-y-2 text-sm text-orange-800">
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-0.5">•</span>
            Properties priced correctly are moving in under 30 days - aggressive pricing wins
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-0.5">•</span>
            Listings with 3+ price reductions averaging 150+ DOM - avoid overpricing
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-0.5">•</span>
            Professional photography and virtual tours correlate with 2x showing rate
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 mt-0.5">•</span>
            Coming soon campaigns generating pre-market buzz - consider for premium listings
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CompetitiveIntel;