import { useState, useMemo } from 'react';
import { 
  User, TrendingUp, Heart, AlertCircle, Clock, Search,
  ChevronRight, ThumbsUp, ThumbsDown, Calendar, Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';

const ClientInsights = () => {
  const { clients, feedbackData, properties } = useData();
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, mostFeedback, name

  // Get client statistics
  const clientStats = useMemo(() => {
    return clients.map(client => {
      const clientFeedback = feedbackData.filter(f => f.clientId === client.id);
      
      // Aggregate preferences
      const allLikes = clientFeedback.flatMap(f => f.likes || []);
      const allDislikes = clientFeedback.flatMap(f => f.dislikes || []);
      
      // Count frequency
      const likeFrequency = allLikes.reduce((acc, like) => {
        acc[like] = (acc[like] || 0) + 1;
        return acc;
      }, {});
      
      const dislikeFrequency = allDislikes.reduce((acc, dislike) => {
        acc[dislike] = (acc[dislike] || 0) + 1;
        return acc;
      }, {});
      
      // Get top preferences
      const topLikes = Object.entries(likeFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count }));
      
      const topDislikes = Object.entries(dislikeFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count }));
      
      // Calculate average ratings
      const avgRating = clientFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / 
        (clientFeedback.length || 1);
      
      // Get showing history
      const showingHistory = clientFeedback.map(f => ({
        propertyId: f.propertyId,
        date: f.timestamp,
        rating: f.rating,
        interestLevel: f.interestLevel
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return {
        ...client,
        feedbackCount: clientFeedback.length,
        topLikes,
        topDislikes,
        avgRating: avgRating.toFixed(1),
        showingHistory,
        lastActive: clientFeedback.length > 0 
          ? new Date(Math.max(...clientFeedback.map(f => new Date(f.timestamp))))
          : null
      };
    });
  }, [clients, feedbackData]);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clientStats.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    switch (sortBy) {
      case 'mostFeedback':
        return filtered.sort((a, b) => b.feedbackCount - a.feedbackCount);
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
      default:
        return filtered.sort((a, b) => {
          if (!a.lastActive) return 1;
          if (!b.lastActive) return -1;
          return b.lastActive - a.lastActive;
        });
    }
  }, [clientStats, searchTerm, sortBy]);

  const getPropertyDetails = (propertyId) => {
    return properties.find(p => p.id === propertyId);
  };

  const getInterestColor = (level) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-yellow-700 bg-yellow-100',
      high: 'text-green-700 bg-green-100',
      'very high': 'text-purple-700 bg-purple-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-blue-600" size={28} />
            Client Insights
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="mostFeedback">Most Feedback</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-gray-900">All Clients</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredClients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedClient?.id === client.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        {client.feedbackCount} showings
                      </span>
                      {client.avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Heart size={14} className="text-red-400" />
                          {client.avgRating}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="space-y-6">
              {/* Client Header */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedClient.name}</h3>
                    <p className="text-gray-600">{selectedClient.email} • {selectedClient.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Budget: ${selectedClient.budget.min.toLocaleString()} - ${selectedClient.budget.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{selectedClient.feedbackCount}</div>
                    <div className="text-sm text-gray-600">Total Showings</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{selectedClient.avgRating}</div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{selectedClient.topLikes.length}</div>
                    <div className="text-xs text-gray-600">Preferences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{selectedClient.topDislikes.length}</div>
                    <div className="text-xs text-gray-600">Concerns</div>
                  </div>
                </div>
              </div>

              {/* Preferences Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Likes */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <ThumbsUp className="text-green-500" size={20} />
                    Top Preferences
                  </h4>
                  <div className="space-y-3">
                    {selectedClient.topLikes.length > 0 ? (
                      selectedClient.topLikes.map((like, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{like.feature}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(like.count / selectedClient.feedbackCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-green-600 w-12 text-right">
                              {like.count}×
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No preferences recorded yet</p>
                    )}
                  </div>
                </div>

                {/* Top Dislikes */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <ThumbsDown className="text-red-500" size={20} />
                    Top Concerns
                  </h4>
                  <div className="space-y-3">
                    {selectedClient.topDislikes.length > 0 ? (
                      selectedClient.topDislikes.map((dislike, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{dislike.feature}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(dislike.count / selectedClient.feedbackCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-red-600 w-12 text-right">
                              {dislike.count}×
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No concerns recorded yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Showing History */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="text-purple-500" size={20} />
                  Showing History
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedClient.showingHistory.map((showing, index) => {
                    const property = getPropertyDetails(showing.propertyId);
                    if (!property) return null;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{property.address}</h5>
                          <p className="text-sm text-gray-600">
                            {new Date(showing.date).toLocaleDateString()} • 
                            Rating: {showing.rating}/5
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInterestColor(showing.interestLevel)}`}>
                          {showing.interestLevel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Client</h3>
              <p className="text-gray-600">Choose a client from the list to view their insights and preferences</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInsights;