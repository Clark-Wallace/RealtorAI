import { useState, useMemo } from 'react';
import { 
  Home, TrendingUp, ThumbsUp, ThumbsDown, MapPin, DollarSign,
  Calendar, Search, Filter, BarChart3, Users, Eye
} from 'lucide-react';
import { useData } from '../context/DataContext';

const PropertyAnalytics = () => {
  const { properties, feedbackData, clients } = useData();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState('all'); // all, under500k, 500k-1m, over1m
  const [sortBy, setSortBy] = useState('mostViewed'); // mostViewed, highestRated, mostRecent

  // Get property statistics
  const propertyStats = useMemo(() => {
    return properties.map(property => {
      const propertyFeedback = feedbackData.filter(f => f.propertyId === property.id);
      
      // Aggregate feedback
      const allLikes = propertyFeedback.flatMap(f => f.likes || []);
      const allDislikes = propertyFeedback.flatMap(f => f.dislikes || []);
      
      // Count frequency
      const likeFrequency = allLikes.reduce((acc, like) => {
        acc[like] = (acc[like] || 0) + 1;
        return acc;
      }, {});
      
      const dislikeFrequency = allDislikes.reduce((acc, dislike) => {
        acc[dislike] = (acc[dislike] || 0) + 1;
        return acc;
      }, {});
      
      // Get top features
      const topLikes = Object.entries(likeFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count }));
      
      const topDislikes = Object.entries(dislikeFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count }));
      
      // Calculate metrics
      const avgRating = propertyFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / 
        (propertyFeedback.length || 1);
      
      // Interest level distribution
      const interestLevels = propertyFeedback.reduce((acc, f) => {
        acc[f.interestLevel] = (acc[f.interestLevel] || 0) + 1;
        return acc;
      }, {});
      
      // Get unique viewers
      const uniqueViewers = new Set(propertyFeedback.map(f => f.clientId)).size;
      
      // Get feedback details
      const feedbackDetails = propertyFeedback.map(f => {
        const client = clients.find(c => c.id === f.clientId);
        return {
          clientName: client?.name || 'Unknown',
          rating: f.rating,
          interestLevel: f.interestLevel,
          date: f.timestamp,
          priceOpinion: f.priceOpinion
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return {
        ...property,
        viewCount: propertyFeedback.length,
        uniqueViewers,
        topLikes,
        topDislikes,
        avgRating: avgRating.toFixed(1),
        interestLevels,
        feedbackDetails,
        lastViewed: propertyFeedback.length > 0 
          ? new Date(Math.max(...propertyFeedback.map(f => new Date(f.timestamp))))
          : null
      };
    });
  }, [properties, feedbackData, clients]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = propertyStats.filter(property => {
      // Search filter
      const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Price filter
      let matchesPrice = true;
      switch (filterPrice) {
        case 'under500k':
          matchesPrice = property.price < 500000;
          break;
        case '500k-1m':
          matchesPrice = property.price >= 500000 && property.price <= 1000000;
          break;
        case 'over1m':
          matchesPrice = property.price > 1000000;
          break;
      }
      
      return matchesSearch && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case 'highestRated':
        return filtered.sort((a, b) => b.avgRating - a.avgRating);
      case 'mostRecent':
        return filtered.sort((a, b) => {
          if (!a.lastViewed) return 1;
          if (!b.lastViewed) return -1;
          return b.lastViewed - a.lastViewed;
        });
      case 'mostViewed':
      default:
        return filtered.sort((a, b) => b.viewCount - a.viewCount);
    }
  }, [propertyStats, searchTerm, filterPrice, sortBy]);

  const getInterestColor = (level) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-yellow-700 bg-yellow-100',
      high: 'text-green-700 bg-green-100',
      'very high': 'text-purple-700 bg-purple-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const getPriceOpinionIcon = (opinion) => {
    switch (opinion) {
      case 'overpriced':
        return '📈';
      case 'fair':
        return '✅';
      case 'good deal':
        return '🎯';
      default:
        return '💭';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="text-green-600" size={28} />
            Property Analytics
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {/* Price Filter */}
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="under500k">Under $500K</option>
              <option value="500k-1m">$500K - $1M</option>
              <option value="over1m">Over $1M</option>
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="mostViewed">Most Viewed</option>
              <option value="highestRated">Highest Rated</option>
              <option value="mostRecent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <Home className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Showings</p>
              <p className="text-2xl font-bold text-gray-900">{feedbackData.length}</p>
            </div>
            <Eye className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {(feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length || 0).toFixed(1)}
              </p>
            </div>
            <BarChart3 className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Interest</p>
              <p className="text-2xl font-bold text-gray-900">
                {feedbackData.filter(f => f.interestLevel === 'high' || f.interestLevel === 'very high').length}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map(property => (
          <div
            key={property.id}
            onClick={() => setSelectedProperty(property)}
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              selectedProperty?.id === property.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {/* Property Image */}
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{property.address}</h3>
                <p className="text-white/90 text-sm">{property.type} • ${property.price.toLocaleString()}</p>
              </div>
              {property.viewCount > 0 && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Eye size={14} />
                    {property.viewCount}
                  </span>
                </div>
              )}
            </div>

            {/* Property Stats */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{property.avgRating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{property.uniqueViewers} viewers</span>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.floor((Date.now() - new Date(property.listingDate)) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>

              {/* Interest Distribution */}
              <div className="space-y-2 mb-3">
                <p className="text-sm font-medium text-gray-700">Interest Levels</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(property.interestLevels).map(([level, count]) => (
                    <span key={level} className={`px-2 py-1 rounded-full text-xs font-medium ${getInterestColor(level)}`}>
                      {level}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Features */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">Top Likes</p>
                  <div className="space-y-1">
                    {property.topLikes.slice(0, 2).map((like, index) => (
                      <p key={index} className="text-xs text-gray-600">
                        • {like.feature} ({like.count})
                      </p>
                    ))}
                    {property.topLikes.length === 0 && (
                      <p className="text-xs text-gray-400 italic">None yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-700 mb-1">Top Concerns</p>
                  <div className="space-y-1">
                    {property.topDislikes.slice(0, 2).map((dislike, index) => (
                      <p key={index} className="text-xs text-gray-600">
                        • {dislike.feature} ({dislike.count})
                      </p>
                    ))}
                    {property.topDislikes.length === 0 && (
                      <p className="text-xs text-gray-400 italic">None yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Property View Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">{selectedProperty.address}</h3>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">Property Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Type:</span> {selectedProperty.type}</p>
                    <p><span className="font-medium">Price:</span> ${selectedProperty.price.toLocaleString()}</p>
                    <p><span className="font-medium">Size:</span> {selectedProperty.sqft.toLocaleString()} sqft</p>
                    <p><span className="font-medium">Bedrooms:</span> {selectedProperty.bedrooms}</p>
                    <p><span className="font-medium">Bathrooms:</span> {selectedProperty.bathrooms}</p>
                    <p><span className="font-medium">Year Built:</span> {selectedProperty.yearBuilt}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Viewing Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Total Showings:</span> {selectedProperty.viewCount}</p>
                    <p><span className="font-medium">Unique Viewers:</span> {selectedProperty.uniqueViewers}</p>
                    <p><span className="font-medium">Average Rating:</span> {selectedProperty.avgRating}/5</p>
                    <p><span className="font-medium">Days on Market:</span> {Math.floor((Date.now() - new Date(selectedProperty.listingDate)) / (1000 * 60 * 60 * 24))}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ThumbsUp className="text-green-500" size={18} />
                    Most Liked Features
                  </h4>
                  <div className="space-y-2">
                    {selectedProperty.topLikes.map((like, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{like.feature}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(like.count / selectedProperty.viewCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-green-600 w-8 text-right">
                            {like.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ThumbsDown className="text-red-500" size={18} />
                    Common Concerns
                  </h4>
                  <div className="space-y-2">
                    {selectedProperty.topDislikes.map((dislike, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{dislike.feature}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(dislike.count / selectedProperty.viewCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-red-600 w-8 text-right">
                            {dislike.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Feedback */}
              <div>
                <h4 className="font-semibold mb-3">Recent Feedback</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedProperty.feedbackDetails.map((feedback, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{feedback.clientName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(feedback.date).toLocaleDateString()} • 
                            Rating: {feedback.rating}/5 • 
                            {getPriceOpinionIcon(feedback.priceOpinion)} {feedback.priceOpinion}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInterestColor(feedback.interestLevel)}`}>
                          {feedback.interestLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyAnalytics;