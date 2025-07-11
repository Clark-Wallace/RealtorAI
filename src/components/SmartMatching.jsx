import { useState, useMemo } from 'react';
import { 
  Sparkles, Users, Home, TrendingUp, Target, 
  ChevronRight, Search, Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { getTopMatches, getInterestedClients } from '../utils/matchingAlgorithm';
import { formatPrice } from '../utils/dataHelpers';

const SmartMatching = () => {
  const { clients, properties, feedbackData } = useData();
  const [activeTab, setActiveTab] = useState('clientMatches'); // clientMatches or propertyMatches
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [minScore, setMinScore] = useState(50);

  // Get matches for selected client
  const clientMatches = useMemo(() => {
    if (!selectedClient) return [];
    const client = clients.find(c => c.id === parseInt(selectedClient));
    if (!client) return [];
    
    return getTopMatches(client, properties, feedbackData, 10)
      .filter(match => match.match.score >= minScore);
  }, [selectedClient, properties, feedbackData, clients, minScore]);

  // Get interested clients for selected property
  const propertyMatches = useMemo(() => {
    if (!selectedProperty) return [];
    const property = properties.find(p => p.id === parseInt(selectedProperty));
    if (!property) return [];
    
    return getInterestedClients(property, clients, feedbackData, 10)
      .filter(match => match.match.score >= minScore);
  }, [selectedProperty, clients, feedbackData, properties, minScore]);

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 55) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 85) return '🎯';
    if (score >= 70) return '⭐';
    if (score >= 55) return '👍';
    return '🤔';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-purple-600" size={32} />
          Smart Property Matching
        </h1>
        <p className="text-gray-600 mt-2">
          AI-powered matching based on client preferences and feedback history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('clientMatches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'clientMatches'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users size={18} />
          Match Properties to Client
        </button>
        <button
          onClick={() => setActiveTab('propertyMatches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            activeTab === 'propertyMatches'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Home size={18} />
          Find Clients for Property
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Selector */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {activeTab === 'clientMatches' ? 'Select Client' : 'Select Property'}
            </label>
            {activeTab === 'clientMatches' ? (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - Budget: {formatPrice(client.budget.min)} - {formatPrice(client.budget.max)}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Choose a property...</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.address} - {formatPrice(property.price)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Score Filter */}
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Match Score
            </label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={0}>Show All</option>
              <option value={40}>40% and above</option>
              <option value={55}>55% and above</option>
              <option value={70}>70% and above</option>
              <option value={85}>85% and above</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {activeTab === 'clientMatches' && selectedClient && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Property Matches ({clientMatches.length} found)
          </h3>
          
          {clientMatches.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Target size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No properties match the selected criteria.</p>
              <p className="text-sm text-gray-500 mt-2">Try lowering the minimum match score.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {clientMatches.map(({ property, match }) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{property.address}</h4>
                      <p className="text-xl font-bold text-green-600 mt-1">{formatPrice(property.price)}</p>
                      <p className="text-sm text-gray-600">
                        {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft.toLocaleString()} sqft
                      </p>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreColor(match.score)}`}>
                        <span className="text-2xl">{getScoreIcon(match.score)}</span>
                      </div>
                      <p className="text-sm font-bold mt-2">{match.score}%</p>
                      <p className="text-xs text-gray-600">{match.recommendation}</p>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {match.reasons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Why it's a match:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.reasons.map((reason, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mismatches */}
                  {match.mismatches.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Considerations:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.mismatches.map((mismatch, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            ⚠ {mismatch}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                    View Property Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'propertyMatches' && selectedProperty && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Potentially Interested Clients ({propertyMatches.length} found)
          </h3>
          
          {propertyMatches.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No clients match the selected criteria.</p>
              <p className="text-sm text-gray-500 mt-2">Try lowering the minimum match score.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {propertyMatches.map(({ client, match }) => (
                <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                      <p className="text-sm text-gray-600">{client.email} • {client.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Budget: {formatPrice(client.budget.min)} - {formatPrice(client.budget.max)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreColor(match.score)}`}>
                        <span className="text-2xl">{getScoreIcon(match.score)}</span>
                      </div>
                      <p className="text-sm font-bold mt-2">{match.score}%</p>
                      <p className="text-xs text-gray-600">{match.recommendation}</p>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {match.reasons.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Why they might be interested:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.reasons.map((reason, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mismatches */}
                  {match.mismatches.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Potential concerns:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.mismatches.map((mismatch, index) => (
                          <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            ⚠ {mismatch}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Feedback Stats */}
                  <div className="mt-3 pt-3 border-t flex gap-4 text-sm text-gray-600">
                    <span>Showings: {feedbackData.filter(f => f.clientId === client.id).length}</span>
                    <span>Preferred contact: {client.preferredContact || 'Email'}</span>
                  </div>

                  <button className="mt-4 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                    View Client Profile
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'clientMatches' && !selectedClient) || 
        (activeTab === 'propertyMatches' && !selectedProperty)) && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Sparkles size={48} className="mx-auto text-purple-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'clientMatches' 
              ? 'Select a client to find matching properties'
              : 'Select a property to find interested clients'}
          </h3>
          <p className="text-gray-600">
            Our AI analyzes feedback history, preferences, and behavior patterns to find the best matches.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartMatching;