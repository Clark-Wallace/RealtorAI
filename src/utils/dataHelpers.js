// Helper functions for data manipulation and formatting

export const formatPrice = (price) => {
  if (typeof price === 'string' && price.startsWith('$')) {
    return price;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export const calculateDaysOnMarket = (listingDate) => {
  const listing = new Date(listingDate);
  const today = new Date();
  const diffTime = Math.abs(today - listing);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getRatingColor = (rating) => {
  if (rating >= 4) return 'text-green-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

export const getInterestLevelColor = (level) => {
  switch (level) {
    case 'very high':
      return 'bg-green-100 text-green-800';
    case 'high':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriceOpinionIcon = (opinion) => {
  switch (opinion) {
    case 'too high':
      return '📈';
    case 'slightly high':
      return '📊';
    case 'fair':
      return '✅';
    case 'good deal':
      return '💰';
    case 'great deal':
      return '🎯';
    default:
      return '❓';
  }
};

export const sortByDate = (array, dateField = 'timestamp', ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const groupFeedbackByMonth = (feedbackArray) => {
  const grouped = feedbackArray.reduce((acc, feedback) => {
    const date = new Date(feedback.timestamp);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(feedback);
    
    return acc;
  }, {});
  
  return grouped;
};