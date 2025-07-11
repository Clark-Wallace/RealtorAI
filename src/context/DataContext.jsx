import React, { createContext, useContext, useState, useEffect } from 'react';
import { clients } from '../data/clients';
import { properties } from '../data/properties';
import { feedbackEntries } from '../data/feedback';

// Create the context
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Data Provider Component
export const DataProvider = ({ children }) => {
  // State for all data
  const [clientsData, setClientsData] = useState(() => {
    const savedClients = localStorage.getItem('realtorAI_clients');
    return savedClients ? JSON.parse(savedClients) : clients;
  });
  
  const [propertiesData, setPropertiesData] = useState(() => {
    const savedProperties = localStorage.getItem('realtorAI_properties');
    return savedProperties ? JSON.parse(savedProperties) : properties;
  });
  
  const [feedbackData, setFeedbackData] = useState(() => {
    const savedFeedback = localStorage.getItem('realtorAI_feedback');
    return savedFeedback ? JSON.parse(savedFeedback) : feedbackEntries;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('realtorAI_clients', JSON.stringify(clientsData));
  }, [clientsData]);

  useEffect(() => {
    localStorage.setItem('realtorAI_properties', JSON.stringify(propertiesData));
  }, [propertiesData]);

  useEffect(() => {
    localStorage.setItem('realtorAI_feedback', JSON.stringify(feedbackData));
  }, [feedbackData]);

  // CRUD Operations for Feedback
  const addFeedback = (newFeedback) => {
    const feedback = {
      ...newFeedback,
      id: feedbackData.length + 1,
      timestamp: new Date().toISOString()
    };
    setFeedbackData([...feedbackData, feedback]);
    return feedback;
  };

  const updateFeedback = (id, updatedFeedback) => {
    setFeedbackData(feedbackData.map(feedback => 
      feedback.id === id ? { ...feedback, ...updatedFeedback } : feedback
    ));
  };

  const deleteFeedback = (id) => {
    setFeedbackData(feedbackData.filter(feedback => feedback.id !== id));
  };

  // Filter functions
  const getFeedbackByClient = (clientId) => {
    return feedbackData.filter(feedback => feedback.clientId === clientId);
  };

  const getFeedbackByProperty = (propertyId) => {
    return feedbackData.filter(feedback => feedback.propertyId === propertyId);
  };

  // Aggregation functions
  const getClientStats = (clientId) => {
    const clientFeedback = getFeedbackByClient(clientId);
    
    return {
      totalProperties: clientFeedback.length,
      averageRating: clientFeedback.length > 0 
        ? clientFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / clientFeedback.length 
        : 0,
      highInterestProperties: clientFeedback.filter(f => f.interestedLevel === 'high' || f.interestedLevel === 'very high').length,
      totalShowingTime: clientFeedback.reduce((sum, f) => sum + (f.showingDuration || 0), 0)
    };
  };

  const getPropertyStats = (propertyId) => {
    const propertyFeedback = getFeedbackByProperty(propertyId);
    const allLikes = propertyFeedback.flatMap(f => f.likes);
    const allDislikes = propertyFeedback.flatMap(f => f.dislikes);
    
    // Count frequency of likes/dislikes
    const likeFrequency = allLikes.reduce((acc, like) => {
      acc[like] = (acc[like] || 0) + 1;
      return acc;
    }, {});

    const dislikeFrequency = allDislikes.reduce((acc, dislike) => {
      acc[dislike] = (acc[dislike] || 0) + 1;
      return acc;
    }, {});

    return {
      totalShowings: propertyFeedback.length,
      averageRating: propertyFeedback.length > 0
        ? propertyFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / propertyFeedback.length
        : 0,
      interestedClients: propertyFeedback.filter(f => f.interestedLevel === 'high' || f.interestedLevel === 'very high').length,
      commonLikes: Object.entries(likeFrequency).sort(([,a], [,b]) => b - a).slice(0, 5),
      commonDislikes: Object.entries(dislikeFrequency).sort(([,a], [,b]) => b - a).slice(0, 5),
      priceOpinions: propertyFeedback.map(f => f.priceOpinion)
    };
  };

  const getOverallStats = () => {
    return {
      totalClients: clientsData.length,
      totalProperties: propertiesData.length,
      totalFeedback: feedbackData.length,
      averageRating: feedbackData.length > 0
        ? feedbackData.reduce((sum, f) => sum + (f.overallRating || 0), 0) / feedbackData.length
        : 0,
      recentFeedback: feedbackData
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    };
  };

  // Search functions
  const searchClients = (query) => {
    const lowerQuery = query.toLowerCase();
    return clientsData.filter(client => 
      client.name.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery) ||
      client.phone.includes(query)
    );
  };

  const searchProperties = (query) => {
    const lowerQuery = query.toLowerCase();
    return propertiesData.filter(property => 
      property.address.toLowerCase().includes(lowerQuery) ||
      property.type?.toLowerCase().includes(lowerQuery)
    );
  };

  // CRUD Operations for Clients
  const addClient = (newClient) => {
    const client = {
      ...newClient,
      id: newClient.id || Date.now(),
      createdAt: newClient.createdAt || new Date().toISOString()
    };
    setClientsData([...clientsData, client]);
    return client;
  };

  const updateClient = (id, updatedClient) => {
    setClientsData(clientsData.map(client => 
      client.id === id ? { ...client, ...updatedClient } : client
    ));
  };

  const deleteClient = (id) => {
    setClientsData(clientsData.filter(client => client.id !== id));
  };

  // CRUD Operations for Properties
  const addProperty = (newProperty) => {
    const property = {
      ...newProperty,
      id: newProperty.id || Date.now(),
      createdAt: newProperty.createdAt || new Date().toISOString()
    };
    setPropertiesData([...propertiesData, property]);
    return property;
  };

  const updateProperty = (id, updatedProperty) => {
    setPropertiesData(propertiesData.map(property => 
      property.id === id ? { ...property, ...updatedProperty } : property
    ));
  };

  const deleteProperty = (id) => {
    setPropertiesData(propertiesData.filter(property => property.id !== id));
  };

  // Context value
  const value = {
    // Data
    clients: clientsData,
    properties: propertiesData,
    feedbackData,
    
    // CRUD operations - Feedback
    addFeedback,
    updateFeedback,
    deleteFeedback,
    
    // CRUD operations - Clients
    addClient,
    updateClient,
    deleteClient,
    
    // CRUD operations - Properties
    addProperty,
    updateProperty,
    deleteProperty,
    
    // Filter functions
    getFeedbackByClient,
    getFeedbackByProperty,
    
    // Aggregation functions
    getClientStats,
    getPropertyStats,
    getOverallStats,
    
    // Search functions
    searchClients,
    searchProperties
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};