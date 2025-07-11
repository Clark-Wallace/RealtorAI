import { useMemo } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

const AnalyticsCharts = ({ feedbackData, properties, clients }) => {
  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const trends = {};
    feedbackData.forEach(feedback => {
      const month = new Date(feedback.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!trends[month]) {
        trends[month] = { count: 0, avgRating: 0, ratings: [] };
      }
      trends[month].count++;
      trends[month].ratings.push(feedback.rating);
    });

    // Calculate average ratings
    Object.keys(trends).forEach(month => {
      const ratings = trends[month].ratings;
      trends[month].avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    });

    return Object.entries(trends).map(([month, data]) => ({
      month,
      showings: data.count,
      avgRating: parseFloat(data.avgRating)
    }));
  }, [feedbackData]);

  // Interest level distribution
  const interestDistribution = useMemo(() => {
    const distribution = {
      low: 0,
      medium: 0,
      high: 0,
      'very high': 0
    };
    feedbackData.forEach(feedback => {
      if (distribution[feedback.interestLevel] !== undefined) {
        distribution[feedback.interestLevel]++;
      }
    });
    return distribution;
  }, [feedbackData]);

  // Top performing properties
  const topProperties = useMemo(() => {
    const propertyScores = {};
    feedbackData.forEach(feedback => {
      if (!propertyScores[feedback.propertyId]) {
        propertyScores[feedback.propertyId] = { 
          totalRating: 0, 
          count: 0, 
          highInterest: 0 
        };
      }
      propertyScores[feedback.propertyId].totalRating += feedback.rating;
      propertyScores[feedback.propertyId].count++;
      if (feedback.interestLevel === 'high' || feedback.interestLevel === 'very high') {
        propertyScores[feedback.propertyId].highInterest++;
      }
    });

    return Object.entries(propertyScores)
      .map(([propertyId, scores]) => {
        const property = properties.find(p => p.id === parseInt(propertyId));
        return {
          propertyId: parseInt(propertyId),
          address: property?.address || 'Unknown',
          avgRating: (scores.totalRating / scores.count).toFixed(1),
          showings: scores.count,
          highInterestRate: ((scores.highInterest / scores.count) * 100).toFixed(0)
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [feedbackData, properties]);

  // Price opinion distribution
  const priceOpinions = useMemo(() => {
    const opinions = {
      'overpriced': 0,
      'fair': 0,
      'good deal': 0,
      'unsure': 0
    };
    feedbackData.forEach(feedback => {
      if (opinions[feedback.priceOpinion] !== undefined) {
        opinions[feedback.priceOpinion]++;
      }
    });
    return opinions;
  }, [feedbackData]);

  const getInterestColor = (level) => {
    const colors = {
      low: '#6B7280',
      medium: '#EAB308',
      high: '#22C55E',
      'very high': '#9333EA'
    };
    return colors[level] || '#6B7280';
  };

  const getPriceOpinionColor = (opinion) => {
    const colors = {
      'overpriced': '#EF4444',
      'fair': '#3B82F6',
      'good deal': '#10B981',
      'unsure': '#6B7280'
    };
    return colors[opinion] || '#6B7280';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={20} />
          Monthly Activity Trends
        </h3>
        <div className="space-y-3">
          {monthlyTrends.slice(-6).map((month, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium w-16">{month.month}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(month.showings / Math.max(...monthlyTrends.map(m => m.showings))) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{month.showings}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">★{month.avgRating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interest Level Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="text-purple-600" size={20} />
          Interest Level Distribution
        </h3>
        <div className="space-y-4">
          {Object.entries(interestDistribution).map(([level, count]) => {
            const percentage = feedbackData.length > 0 
              ? ((count / feedbackData.length) * 100).toFixed(1)
              : 0;
            return (
              <div key={level} className="flex items-center gap-3">
                <div className="w-32">
                  <span className="text-sm font-medium capitalize">{level}</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getInterestColor(level)
                      }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Properties */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="text-green-600" size={20} />
          Top Performing Properties
        </h3>
        <div className="space-y-3">
          {topProperties.map((property, index) => (
            <div key={property.propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{property.address}</p>
                  <p className="text-xs text-gray-600">{property.showings} showings</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">★ {property.avgRating}</p>
                <p className="text-xs text-green-600">{property.highInterestRate}% high interest</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Opinion Analysis */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-orange-600" size={20} />
          Price Opinion Analysis
        </h3>
        <div className="space-y-4">
          {Object.entries(priceOpinions).map(([opinion, count]) => {
            const percentage = feedbackData.length > 0 
              ? ((count / feedbackData.length) * 100).toFixed(1)
              : 0;
            return (
              <div key={opinion} className="flex items-center gap-3">
                <div className="w-24">
                  <span className="text-sm font-medium capitalize">{opinion}</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getPriceOpinionColor(opinion)
                      }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;