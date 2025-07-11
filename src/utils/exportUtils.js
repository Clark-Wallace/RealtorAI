// Export utilities for analytics data

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const generateShareableLink = (data) => {
  // In a real app, this would upload data to a server and return a shareable URL
  // For now, we'll create a data URI that can be copied
  const jsonData = JSON.stringify(data);
  const encoded = btoa(jsonData);
  
  // Truncate if too long for URL
  if (encoded.length > 2000) {
    return null; // Too large for URL sharing
  }
  
  return `${window.location.origin}?data=${encoded}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

export const formatClientReport = (client, feedbackData, properties) => {
  const clientFeedback = feedbackData.filter(f => f.clientId === client.id);
  
  return {
    clientInfo: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      budget: `$${client.budget.min.toLocaleString()} - $${client.budget.max.toLocaleString()}`,
      preferredContact: client.preferredContact
    },
    summary: {
      totalShowings: clientFeedback.length,
      avgRating: (clientFeedback.reduce((sum, f) => sum + f.rating, 0) / clientFeedback.length).toFixed(1),
      highInterestProperties: clientFeedback.filter(f => f.interestLevel === 'high' || f.interestLevel === 'very high').length
    },
    preferences: {
      likes: clientFeedback.flatMap(f => f.likes).reduce((acc, like) => {
        acc[like] = (acc[like] || 0) + 1;
        return acc;
      }, {}),
      dislikes: clientFeedback.flatMap(f => f.dislikes).reduce((acc, dislike) => {
        acc[dislike] = (acc[dislike] || 0) + 1;
        return acc;
      }, {})
    },
    showingHistory: clientFeedback.map(f => {
      const property = properties.find(p => p.id === f.propertyId);
      return {
        date: new Date(f.timestamp).toLocaleDateString(),
        property: property?.address || 'Unknown',
        price: property ? `$${property.price.toLocaleString()}` : 'N/A',
        rating: f.rating,
        interestLevel: f.interestLevel,
        priceOpinion: f.priceOpinion
      };
    })
  };
};

export const formatPropertyReport = (property, feedbackData, clients) => {
  const propertyFeedback = feedbackData.filter(f => f.propertyId === property.id);
  
  return {
    propertyInfo: {
      address: property.address,
      type: property.type,
      price: `$${property.price.toLocaleString()}`,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft.toLocaleString(),
      yearBuilt: property.yearBuilt,
      listingDate: new Date(property.listingDate).toLocaleDateString(),
      daysOnMarket: Math.floor((Date.now() - new Date(property.listingDate)) / (1000 * 60 * 60 * 24))
    },
    summary: {
      totalShowings: propertyFeedback.length,
      uniqueViewers: new Set(propertyFeedback.map(f => f.clientId)).size,
      avgRating: (propertyFeedback.reduce((sum, f) => sum + f.rating, 0) / propertyFeedback.length).toFixed(1),
      highInterest: propertyFeedback.filter(f => f.interestLevel === 'high' || f.interestLevel === 'very high').length
    },
    feedback: {
      likes: propertyFeedback.flatMap(f => f.likes).reduce((acc, like) => {
        acc[like] = (acc[like] || 0) + 1;
        return acc;
      }, {}),
      dislikes: propertyFeedback.flatMap(f => f.dislikes).reduce((acc, dislike) => {
        acc[dislike] = (acc[dislike] || 0) + 1;
        return acc;
      }, {})
    },
    viewingHistory: propertyFeedback.map(f => {
      const client = clients.find(c => c.id === f.clientId);
      return {
        date: new Date(f.timestamp).toLocaleDateString(),
        client: client?.name || 'Unknown',
        rating: f.rating,
        interestLevel: f.interestLevel,
        priceOpinion: f.priceOpinion,
        likes: f.likes.join(', '),
        dislikes: f.dislikes.join(', ')
      };
    })
  };
};