# RealtorAI API Specification

## Overview
RealtorAI provides a standardized REST API and webhook system for seamless integration with real estate CRMs. This document outlines the API endpoints, data formats, and integration patterns.

## Base URL
```
https://api.realtorai.com/v1
```

## Authentication
RealtorAI supports multiple authentication methods:

### API Key Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

### OAuth 2.0
- Authorization URL: `https://auth.realtorai.com/oauth/authorize`
- Token URL: `https://auth.realtorai.com/oauth/token`
- Scopes: `read:clients`, `write:clients`, `read:properties`, `write:properties`, `read:feedback`, `write:feedback`

## Standard Data Models

### Client Object
```json
{
  "id": "string",
  "external_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "budget": {
    "min": "number",
    "max": "number",
    "currency": "string"
  },
  "preferred_contact": "email|phone|text",
  "tags": ["string"],
  "custom_fields": {},
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Property Object
```json
{
  "id": "string",
  "external_id": "string",
  "address": "string",
  "price": "number",
  "bedrooms": "number",
  "bathrooms": "number",
  "sqft": "number",
  "type": "string",
  "features": ["string"],
  "listing_date": "ISO8601",
  "status": "active|pending|sold",
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "custom_fields": {},
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Feedback Object
```json
{
  "id": "string",
  "client_id": "string",
  "property_id": "string",
  "rating": "number",
  "interest_level": "low|medium|high|very_high",
  "price_opinion": "overpriced|fair|good_deal|unsure",
  "likes": ["string"],
  "dislikes": ["string"],
  "showing_duration": "number",
  "realtor_notes": "string",
  "transcript": "string",
  "has_voice_recording": "boolean",
  "ai_confidence": "number",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

## API Endpoints

### Clients

#### List Clients
```http
GET /clients
```

Query Parameters:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50, max: 200)
- `search` (string): Search by name, email, or phone
- `tags` (array): Filter by tags
- `updated_since` (ISO8601): Filter by last update

#### Get Client
```http
GET /clients/:id
```

#### Create Client
```http
POST /clients
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "budget": {
    "min": 500000,
    "max": 800000
  }
}
```

#### Update Client
```http
PUT /clients/:id
PATCH /clients/:id
```

#### Delete Client
```http
DELETE /clients/:id
```

### Properties

#### List Properties
```http
GET /properties
```

Query Parameters:
- `page`, `limit`, `search` (same as clients)
- `min_price`, `max_price` (number): Price range
- `bedrooms` (integer): Minimum bedrooms
- `bathrooms` (number): Minimum bathrooms
- `type` (string): Property type
- `status` (string): active|pending|sold

#### Bulk Operations

#### Bulk Import
```http
POST /bulk/import
Content-Type: application/json

{
  "type": "clients|properties",
  "data": [/* array of objects */],
  "update_existing": true,
  "match_field": "email|external_id"
}
```

#### Bulk Export
```http
POST /bulk/export
Content-Type: application/json

{
  "type": "clients|properties|feedback",
  "format": "json|csv",
  "filters": {},
  "fields": ["field1", "field2"]
}
```

### Webhooks

#### Register Webhook
```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-crm.com/webhook",
  "events": ["client.created", "client.updated", "feedback.created"],
  "secret": "your-webhook-secret"
}
```

#### Webhook Events
- `client.created`
- `client.updated`
- `client.deleted`
- `property.created`
- `property.updated`
- `property.deleted`
- `feedback.created`
- `feedback.updated`

#### Webhook Payload
```json
{
  "event": "client.created",
  "timestamp": "ISO8601",
  "data": {/* Client/Property/Feedback object */},
  "signature": "HMAC-SHA256 signature"
}
```

## CRM-Specific Mappings

### Salesforce
```javascript
{
  "clients": {
    "object": "Contact",
    "fields": {
      "name": "Name",
      "email": "Email",
      "phone": "Phone",
      "budget_min": "Budget_Min__c",
      "budget_max": "Budget_Max__c"
    }
  },
  "properties": {
    "object": "Property__c",
    "fields": {
      "address": "Address__c",
      "price": "Price__c"
    }
  }
}
```

### Follow Up Boss
```javascript
{
  "clients": {
    "endpoint": "/people",
    "fields": {
      "name": "name",
      "email": "emails[0].value",
      "phone": "phones[0].value",
      "budget_min": "customFields.budget_min"
    }
  }
}
```

## Integration Patterns

### 1. Real-time Sync (Webhooks)
```javascript
// Your CRM sends updates to RealtorAI
POST https://api.realtorai.com/v1/webhooks/incoming
{
  "source": "salesforce",
  "event": "contact.updated",
  "data": {/* Salesforce Contact */}
}
```

### 2. Scheduled Sync
```javascript
// Periodic sync job
GET https://api.realtorai.com/v1/sync/status
POST https://api.realtorai.com/v1/sync/trigger
```

### 3. On-demand Sync
```javascript
// User-triggered sync
POST https://api.realtorai.com/v1/sync/clients
POST https://api.realtorai.com/v1/sync/properties
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email",
    "request_id": "req_12345"
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid API key or token
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `CONFLICT`: Duplicate resource
- `SERVER_ERROR`: Internal server error

## Rate Limits
- 1000 requests per hour per API key
- 100 requests per minute for bulk operations
- Webhook delivery: 10 retries with exponential backoff

## SDK Support

### JavaScript/Node.js
```javascript
import { RealtorAI } from '@realtorai/sdk';

const client = new RealtorAI({
  apiKey: 'YOUR_API_KEY'
});

// Sync clients
const clients = await client.clients.list();
const newClient = await client.clients.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### Python
```python
from realtorai import RealtorAI

client = RealtorAI(api_key='YOUR_API_KEY')

# Sync properties
properties = client.properties.list(
    min_price=500000,
    max_price=1000000
)
```

## Zapier Integration
RealtorAI provides native Zapier integration with:
- Triggers: New Client, New Feedback, Property Viewed
- Actions: Create Client, Create Property, Record Feedback

## Make.com (Integromat) Integration
Pre-built modules for:
- Watch New Feedback
- Create/Update Client
- Search Properties
- Bulk Import/Export