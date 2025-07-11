// Smart Client-Property Matching Algorithm

export const calculateMatchScore = (client, property, clientFeedback = []) => {
  let score = 0;
  let reasons = [];
  let mismatches = [];

  // 1. Budget Match (40 points max)
  const budgetScore = calculateBudgetScore(client.budget, property.price);
  score += budgetScore.score;
  if (budgetScore.score > 30) {
    reasons.push(budgetScore.reason);
  } else if (budgetScore.score < 20) {
    mismatches.push(budgetScore.reason);
  }

  // 2. Size Preferences (20 points max)
  const sizeScore = calculateSizeScore(clientFeedback, property);
  score += sizeScore.score;
  if (sizeScore.reason) {
    if (sizeScore.score > 15) {
      reasons.push(sizeScore.reason);
    } else if (sizeScore.score < 10) {
      mismatches.push(sizeScore.reason);
    }
  }

  // 3. Feature Preferences (20 points max)
  const featureScore = calculateFeatureScore(clientFeedback, property);
  score += featureScore.score;
  if (featureScore.matches.length > 0) {
    reasons.push(`Has preferred features: ${featureScore.matches.join(', ')}`);
  }
  if (featureScore.mismatches.length > 0) {
    mismatches.push(`Missing: ${featureScore.mismatches.join(', ')}`);
  }

  // 4. Location/Type Preferences (10 points max)
  const typeScore = calculateTypeScore(clientFeedback, property);
  score += typeScore.score;
  if (typeScore.reason && typeScore.score > 5) {
    reasons.push(typeScore.reason);
  }

  // 5. Historical Interest Patterns (10 points max)
  const interestScore = calculateInterestPatternScore(clientFeedback, property);
  score += interestScore.score;
  if (interestScore.reason && interestScore.score > 5) {
    reasons.push(interestScore.reason);
  }

  return {
    score: Math.round(score),
    percentage: Math.round(score),
    reasons,
    mismatches,
    recommendation: getRecommendation(score)
  };
};

// Budget scoring algorithm
const calculateBudgetScore = (budget, price) => {
  const midBudget = (budget.min + budget.max) / 2;
  const budgetRange = budget.max - budget.min;
  
  if (price >= budget.min && price <= budget.max) {
    // Perfect match within budget
    const distanceFromMid = Math.abs(price - midBudget);
    const percentFromMid = distanceFromMid / (budgetRange / 2);
    const score = 40 - (percentFromMid * 10); // Max 40, min 30 for in-budget
    
    return {
      score,
      reason: price <= midBudget ? 'Well within budget' : 'Within budget range'
    };
  } else if (price < budget.min) {
    // Below budget (might be suspicious or great deal)
    const percentBelow = (budget.min - price) / budget.min;
    const score = Math.max(15, 25 - (percentBelow * 50));
    
    return {
      score,
      reason: percentBelow > 0.2 ? 'Significantly below budget' : 'Below budget - potential opportunity'
    };
  } else {
    // Above budget
    const percentAbove = (price - budget.max) / budget.max;
    const score = Math.max(0, 20 - (percentAbove * 100));
    
    return {
      score,
      reason: percentAbove > 0.1 ? 'Above budget' : 'Slightly above budget'
    };
  }
};

// Size preferences based on feedback history
const calculateSizeScore = (clientFeedback, property) => {
  if (clientFeedback.length === 0) {
    return { score: 10, reason: null }; // Neutral score
  }

  // Extract size preferences from likes/dislikes
  const sizePreferences = extractSizePreferences(clientFeedback);
  
  let score = 10; // Base score
  let reason = null;

  // Bedroom preferences
  if (sizePreferences.minBedrooms && property.bedrooms >= sizePreferences.minBedrooms) {
    score += 5;
    reason = `${property.bedrooms} bedrooms meets preference`;
  } else if (sizePreferences.minBedrooms && property.bedrooms < sizePreferences.minBedrooms) {
    score -= 5;
    reason = `Only ${property.bedrooms} bedrooms`;
  }

  // Square footage preferences
  if (sizePreferences.likesSpaciousness && property.sqft > 2000) {
    score += 5;
    reason = reason ? reason + ', spacious layout' : 'Spacious layout';
  } else if (sizePreferences.dislikesSmallSpaces && property.sqft < 1500) {
    score -= 5;
    reason = reason ? reason + ', may feel small' : 'May feel small';
  }

  return { score: Math.max(0, Math.min(20, score)), reason };
};

// Feature matching algorithm
const calculateFeatureScore = (clientFeedback, property) => {
  const preferredFeatures = extractPreferredFeatures(clientFeedback);
  const dislikedFeatures = extractDislikedFeatures(clientFeedback);
  
  const propertyFeatures = (property.features || []).map(f => f.toLowerCase());
  
  const matches = [];
  const mismatches = [];
  let score = 10; // Base score

  // Check for preferred features
  preferredFeatures.forEach(feature => {
    if (propertyFeatures.some(pf => pf.includes(feature.toLowerCase()))) {
      matches.push(feature);
      score += 2;
    } else if (isImportantFeature(feature)) {
      mismatches.push(feature);
      score -= 1;
    }
  });

  // Check for disliked features
  dislikedFeatures.forEach(feature => {
    if (propertyFeatures.some(pf => pf.includes(feature.toLowerCase()))) {
      mismatches.push(`Has ${feature}`);
      score -= 2;
    }
  });

  return {
    score: Math.max(0, Math.min(20, score)),
    matches,
    mismatches
  };
};

// Property type scoring
const calculateTypeScore = (clientFeedback, property) => {
  const typePreferences = extractTypePreferences(clientFeedback);
  
  if (typePreferences.preferred.length === 0) {
    return { score: 5, reason: null }; // Neutral score
  }

  if (typePreferences.preferred.includes(property.type)) {
    return { score: 10, reason: `Preferred property type: ${property.type}` };
  } else if (typePreferences.avoided.includes(property.type)) {
    return { score: 0, reason: `Not preferred: ${property.type}` };
  }

  return { score: 5, reason: null };
};

// Interest pattern scoring
const calculateInterestPatternScore = (clientFeedback, property) => {
  if (clientFeedback.length < 3) {
    return { score: 5, reason: null }; // Not enough data
  }

  // Analyze what properties the client showed high interest in
  const highInterestProperties = clientFeedback.filter(f => 
    f.interestedLevel === 'high' || f.interestedLevel === 'very high'
  );

  if (highInterestProperties.length === 0) {
    return { score: 5, reason: null };
  }

  // Find common patterns in high-interest properties
  const patterns = analyzePropertyPatterns(highInterestProperties);
  let score = 5;
  let reason = null;

  // Check if this property matches the patterns
  if (patterns.priceRange && 
      property.price >= patterns.priceRange.min && 
      property.price <= patterns.priceRange.max) {
    score += 3;
  }

  if (patterns.avgSize && Math.abs(property.sqft - patterns.avgSize) < 500) {
    score += 2;
    reason = 'Similar to properties client liked';
  }

  return { score, reason };
};

// Helper functions
const extractSizePreferences = (feedback) => {
  const preferences = {
    minBedrooms: null,
    likesSpaciousness: false,
    dislikesSmallSpaces: false
  };

  feedback.forEach(f => {
    // Check likes for size preferences
    f.likes.forEach(like => {
      if (like.toLowerCase().includes('spacious') || 
          like.toLowerCase().includes('large') ||
          like.toLowerCase().includes('open')) {
        preferences.likesSpaciousness = true;
      }
      if (like.match(/(\d+)\s*bed/i)) {
        const beds = parseInt(like.match(/(\d+)\s*bed/i)[1]);
        preferences.minBedrooms = Math.max(preferences.minBedrooms || 0, beds);
      }
    });

    // Check dislikes
    f.dislikes.forEach(dislike => {
      if (dislike.toLowerCase().includes('small') || 
          dislike.toLowerCase().includes('cramped') ||
          dislike.toLowerCase().includes('tiny')) {
        preferences.dislikesSmallSpaces = true;
      }
    });
  });

  return preferences;
};

const extractPreferredFeatures = (feedback) => {
  const featureCounts = {};
  
  feedback.forEach(f => {
    f.likes.forEach(like => {
      const normalized = like.toLowerCase().trim();
      featureCounts[normalized] = (featureCounts[normalized] || 0) + 1;
    });
  });

  // Return features mentioned more than once or in more than 30% of feedback
  return Object.entries(featureCounts)
    .filter(([feature, count]) => count > 1 || count / feedback.length > 0.3)
    .map(([feature]) => feature);
};

const extractDislikedFeatures = (feedback) => {
  const featureCounts = {};
  
  feedback.forEach(f => {
    f.dislikes.forEach(dislike => {
      const normalized = dislike.toLowerCase().trim();
      featureCounts[normalized] = (featureCounts[normalized] || 0) + 1;
    });
  });

  return Object.entries(featureCounts)
    .filter(([feature, count]) => count > 1)
    .map(([feature]) => feature);
};

const extractTypePreferences = (feedback) => {
  const typeCounts = { preferred: {}, avoided: {} };
  
  // This would need actual property data to work properly
  // For now, return empty preferences
  return { preferred: [], avoided: [] };
};

const analyzePropertyPatterns = (highInterestFeedback) => {
  // This would analyze patterns in properties with high interest
  // For now, return basic patterns
  return {
    priceRange: { min: 400000, max: 800000 },
    avgSize: 2000
  };
};

const isImportantFeature = (feature) => {
  const importantFeatures = [
    'garage', 'parking', 'yard', 'pool', 'office', 
    'updated kitchen', 'master suite', 'storage'
  ];
  return importantFeatures.some(imp => 
    feature.toLowerCase().includes(imp)
  );
};

const getRecommendation = (score) => {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 55) return 'Good Match';
  if (score >= 40) return 'Potential Match';
  return 'Weak Match';
};

// Get top property matches for a client
export const getTopMatches = (client, properties, feedbackData, limit = 5) => {
  const clientFeedback = feedbackData.filter(f => f.clientId === client.id);
  
  const scoredProperties = properties.map(property => ({
    property,
    match: calculateMatchScore(client, property, clientFeedback)
  }));

  return scoredProperties
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
};

// Get clients who might be interested in a property
export const getInterestedClients = (property, clients, feedbackData, limit = 5) => {
  const scoredClients = clients.map(client => {
    const clientFeedback = feedbackData.filter(f => f.clientId === client.id);
    return {
      client,
      match: calculateMatchScore(client, property, clientFeedback)
    };
  });

  return scoredClients
    .filter(item => item.match.score >= 50) // Only show reasonable matches
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
};