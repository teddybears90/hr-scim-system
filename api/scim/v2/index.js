// File: /api/scim/v2/index.js

export default async function handler(req, res) {
  const { url } = req;

  if (url.endsWith('/ServiceProviderConfig')) {
    return res.status(200).json({
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
      patch: { supported: true },
      bulk: { supported: false },
      filter: { supported: true, maxResults: 200 },
      changePassword: { supported: false },
      sort: { supported: false },
      etag: { supported: false },
      authenticationSchemes: [{
        type: "oauthbearertoken",
        name: "OAuth Bearer Token",
        description: "Authentication using the OAuth Bearer Token Scheme",
        specUri: "http://www.rfc-editor.org/info/rfc6750",
        primary: true
      }],
      meta: {
        location: `${req.headers.host}/api/scim/v2/ServiceProviderConfig`,
        resourceType: "ServiceProviderConfig"
      }
    });
  }

  if (url.endsWith('/ResourceTypes')) {
    return res.status(200).json({
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:ResourceType"],
      Resources: [
        {
          id: "User",
          name: "User",
          endpoint: "/Users",
          description: "User Account",
          schema: "urn:ietf:params:scim:schemas:core:2.0:User",
          schemaExtensions: [],
          meta: {
            resourceType: "ResourceType",
            location: `${req.headers.host}/api/scim/v2/ResourceTypes/User`
          }
        }
      ]
    });
  }

  if (url.endsWith('/Schemas')) {
    return res.status(200).json({
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:Schema"],
      Resources: [
        {
          id: "urn:ietf:params:scim:schemas:core:2.0:User",
          name: "User",
          description: "SCIM core schema for Users",
          attributes: [
            { name: "userName", type: "string", multiValued: false, required: true },
            { name: "name", type: "complex", multiValued: false, required: true },
            { name: "emails", type: "complex", multiValued: true, required: false },
            { name: "externalId", type: "string", multiValued: false, required: false },
            { name: "active", type: "boolean", multiValued: false, required: false }
          ],
          meta: {
            resourceType: "Schema",
            location: `${req.headers.host}/api/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User`
          }
        }
      ]
    });
  }

  return res.status(404).json({ error: 'Not Found' });
}
