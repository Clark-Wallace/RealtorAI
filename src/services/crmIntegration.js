// CRM Integration Service
// Provides a unified interface for integrating with various real estate CRMs

class CRMIntegrationService {
  constructor() {
    this.adapters = new Map();
    this.webhooks = new Map();
  }

  // Register a CRM adapter
  registerAdapter(crmType, adapter) {
    this.adapters.set(crmType, adapter);
  }

  // Get available CRMs
  getAvailableCRMs() {
    return Array.from(this.adapters.keys()).map(key => ({
      id: key,
      name: this.adapters.get(key).name,
      logo: this.adapters.get(key).logo,
      features: this.adapters.get(key).features
    }));
  }

  // Generic sync method
  async sync(crmType, config, dataType = 'all') {
    const adapter = this.adapters.get(crmType);
    if (!adapter) {
      throw new Error(`CRM adapter for ${crmType} not found`);
    }

    const syncResult = {
      clients: { added: 0, updated: 0, errors: [] },
      properties: { added: 0, updated: 0, errors: [] },
      feedback: { added: 0, updated: 0, errors: [] }
    };

    try {
      // Authenticate
      await adapter.authenticate(config);

      // Sync based on dataType
      if (dataType === 'all' || dataType === 'clients') {
        syncResult.clients = await adapter.syncClients();
      }

      if (dataType === 'all' || dataType === 'properties') {
        syncResult.properties = await adapter.syncProperties();
      }

      if (dataType === 'all' || dataType === 'feedback') {
        syncResult.feedback = await adapter.syncFeedback();
      }

      return syncResult;
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  // Setup webhook for real-time updates
  async setupWebhook(crmType, config, callbackUrl) {
    const adapter = this.adapters.get(crmType);
    if (!adapter) {
      throw new Error(`CRM adapter for ${crmType} not found`);
    }

    if (!adapter.supportsWebhooks) {
      throw new Error(`${crmType} does not support webhooks`);
    }

    const webhookId = await adapter.registerWebhook(config, callbackUrl);
    this.webhooks.set(crmType, webhookId);
    return webhookId;
  }
}

// Base CRM Adapter class
export class CRMAdapter {
  constructor(name, features = []) {
    this.name = name;
    this.features = features;
    this.authenticated = false;
  }

  async authenticate(config) {
    throw new Error('authenticate() must be implemented by adapter');
  }

  async syncClients() {
    throw new Error('syncClients() must be implemented by adapter');
  }

  async syncProperties() {
    throw new Error('syncProperties() must be implemented by adapter');
  }

  async syncFeedback() {
    throw new Error('syncFeedback() must be implemented by adapter');
  }

  // Transform external data to our format
  transformClient(externalClient) {
    // Override in specific adapters
    return {
      name: externalClient.name || `${externalClient.firstName} ${externalClient.lastName}`,
      email: externalClient.email,
      phone: externalClient.phone,
      budget: {
        min: externalClient.budgetMin || 0,
        max: externalClient.budgetMax || 1000000
      },
      preferredContact: externalClient.preferredContact || 'email',
      externalId: externalClient.id,
      source: this.name
    };
  }

  transformProperty(externalProperty) {
    // Override in specific adapters
    return {
      address: externalProperty.address,
      price: externalProperty.price,
      bedrooms: externalProperty.bedrooms,
      bathrooms: externalProperty.bathrooms,
      sqft: externalProperty.sqft,
      type: externalProperty.propertyType,
      listingDate: externalProperty.listingDate,
      externalId: externalProperty.id,
      source: this.name
    };
  }
}

// Salesforce Adapter
export class SalesforceAdapter extends CRMAdapter {
  constructor() {
    super('Salesforce', ['oauth2', 'webhooks', 'bulk-import', 'bi-directional']);
    this.apiVersion = 'v59.0';
  }

  async authenticate(config) {
    // In production, implement OAuth2 flow
    // For now, simulate authentication
    this.accessToken = config.accessToken;
    this.instanceUrl = config.instanceUrl;
    this.authenticated = true;
    return true;
  }

  async syncClients() {
    if (!this.authenticated) throw new Error('Not authenticated');

    // In production, make actual API calls
    // Simulated response
    const response = await this.makeAPICall('/services/data/v59.0/query', {
      q: "SELECT Id, Name, Email, Phone, Budget_Min__c, Budget_Max__c FROM Contact WHERE Type = 'Client'"
    });

    const result = { added: 0, updated: 0, errors: [] };
    
    // Transform and process each client
    for (const record of response.records || []) {
      try {
        const client = this.transformClient({
          id: record.Id,
          name: record.Name,
          email: record.Email,
          phone: record.Phone,
          budgetMin: record.Budget_Min__c,
          budgetMax: record.Budget_Max__c
        });
        
        // Check if exists and update or add
        result.added++;
      } catch (error) {
        result.errors.push({ id: record.Id, error: error.message });
      }
    }

    return result;
  }

  async makeAPICall(endpoint, params) {
    // Simulate API call
    return {
      records: [
        {
          Id: 'SF001',
          Name: 'John Doe',
          Email: 'john@example.com',
          Phone: '555-0123',
          Budget_Min__c: 500000,
          Budget_Max__c: 800000
        }
      ]
    };
  }
}

// Follow Up Boss Adapter
export class FollowUpBossAdapter extends CRMAdapter {
  constructor() {
    super('Follow Up Boss', ['api-key', 'webhooks', 'tags', 'custom-fields']);
  }

  async authenticate(config) {
    this.apiKey = config.apiKey;
    this.authenticated = true;
    return true;
  }

  async syncClients() {
    if (!this.authenticated) throw new Error('Not authenticated');

    // Follow Up Boss uses RESTful API
    const response = await fetch('https://api.followupboss.com/v1/people', {
      headers: {
        'Authorization': `Basic ${btoa(this.apiKey + ':')}`
      }
    });

    const data = await response.json();
    const result = { added: 0, updated: 0, errors: [] };

    for (const person of data.people || []) {
      if (person.tags?.includes('client')) {
        try {
          const client = this.transformClient({
            id: person.id,
            firstName: person.firstName,
            lastName: person.lastName,
            email: person.emails?.[0]?.value,
            phone: person.phones?.[0]?.value,
            budgetMin: person.customFields?.budget_min,
            budgetMax: person.customFields?.budget_max
          });
          
          result.added++;
        } catch (error) {
          result.errors.push({ id: person.id, error: error.message });
        }
      }
    }

    return result;
  }
}

// Export singleton instance
export const crmService = new CRMIntegrationService();

// Register adapters
crmService.registerAdapter('salesforce', new SalesforceAdapter());
crmService.registerAdapter('followupboss', new FollowUpBossAdapter());

// Standard field mappings for common CRMs
export const CRM_FIELD_MAPPINGS = {
  salesforce: {
    client: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      budgetMin: 'Budget_Min__c',
      budgetMax: 'Budget_Max__c',
      preferredContact: 'Preferred_Contact_Method__c',
      notes: 'Description'
    },
    property: {
      address: 'Property_Address__c',
      price: 'Price__c',
      bedrooms: 'Bedrooms__c',
      bathrooms: 'Bathrooms__c',
      sqft: 'Square_Feet__c',
      type: 'Property_Type__c'
    },
    feedback: {
      rating: 'Rating__c',
      interestLevel: 'Interest_Level__c',
      likes: 'Positive_Features__c',
      dislikes: 'Negative_Features__c',
      notes: 'Realtor_Notes__c'
    }
  },
  followupboss: {
    client: {
      name: ['firstName', 'lastName'],
      email: 'emails[0].value',
      phone: 'phones[0].value',
      budgetMin: 'customFields.budget_min',
      budgetMax: 'customFields.budget_max',
      notes: 'note'
    }
  }
};

// Webhook handler
export const handleCRMWebhook = async (crmType, eventType, data) => {
  const adapter = crmService.adapters.get(crmType);
  if (!adapter) {
    throw new Error(`Unknown CRM type: ${crmType}`);
  }

  switch (eventType) {
    case 'client.created':
    case 'client.updated':
      const client = adapter.transformClient(data);
      // Update local database
      return { type: 'client', action: eventType, data: client };
      
    case 'property.created':
    case 'property.updated':
      const property = adapter.transformProperty(data);
      return { type: 'property', action: eventType, data: property };
      
    default:
      console.log(`Unhandled webhook event: ${eventType}`);
  }
};