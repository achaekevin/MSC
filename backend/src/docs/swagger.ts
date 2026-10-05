export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Mwancha Senior Community (MSC) Public & Admin API',
    version: '1.0.0',
    description: `
### Production API for Mwancha Senior Community (MSC)
Dedicated to the dignity, care, health, and rights protection of vulnerable older persons in Kenya.

#### Architectural Principles:
* **Source of Truth:** Governed strictly by the official MSC profile. Unverified facts are flagged as \`[CLIENT APPROVAL REQUIRED]\`.
* **Content Approval Workflow:** Content undergoes a 5-stage lifecycle:
  \`DRAFT\` &rarr; \`IN_REVIEW\` &rarr; \`CHANGES_REQUESTED\` &rarr; \`APPROVED\` &rarr; \`PUBLISHED\`
* **Publication Safety:** Public endpoints expose **ONLY** content with \`status = PUBLISHED\` and \`deletedAt = NULL\`.
* **Fiduciary Integrity:** No payment details or bank accounts are displayed until official board accreditation.
    `,
    contact: {
      name: 'MSC Engineering Team',
      email: 'info@mwanchasenior.org'
    }
  },
  servers: [
    { url: 'http://localhost:5000/api/v1', description: 'Local Development Server' },
    { url: 'https://staging-api.mwanchasenior.org/api/v1', description: 'Staging Environment' },
    { url: 'https://api.mwanchasenior.org/api/v1', description: 'Production Environment' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request' },
              details: { type: 'object' }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Service health and database probe',
        tags: ['System'],
        responses: {
          '200': { description: 'Service is operational' },
          '503': { description: 'Database connectivity degraded' }
        }
      }
    },
    '/organization': {
      get: {
        summary: 'Get published organizational profile',
        tags: ['Organization'],
        responses: {
          '200': { description: 'Official verified MSC organizational details' }
        }
      }
    },
    '/programs': {
      get: {
        summary: 'List published community care programs',
        tags: ['Programs'],
        responses: {
          '200': { description: 'Array of published programs' }
        }
      }
    },
    '/programs/{slug}': {
      get: {
        summary: 'Get single program details by slug',
        tags: ['Programs'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Program details with activities and objectives' },
          '404': { description: 'Program not found or unpublished' }
        }
      }
    },
    '/news': {
      get: {
        summary: 'List published news and stories',
        tags: ['News'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'category', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Paginated news articles' }
        }
      }
    },
    '/news/{slug}': {
      get: {
        summary: 'Get news article by slug',
        tags: ['News'],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'News article body and metadata' },
          '404': { description: 'Article not found' }
        }
      }
    },
    '/events': {
      get: {
        summary: 'List published community outreach events',
        tags: ['Events'],
        responses: {
          '200': { description: 'Array of published events' }
        }
      }
    },
    '/impact': {
      get: {
        summary: 'List verified impact statistics',
        tags: ['Impact'],
        responses: {
          '200': { description: 'Verified metrics matching official profile' }
        }
      }
    },
    '/team': {
      get: {
        summary: 'List organizational leadership structure and team',
        tags: ['Team'],
        responses: {
          '200': { description: 'Approved team member profiles' }
        }
      }
    },
    '/gallery': {
      get: {
        summary: 'List approved community media gallery items',
        tags: ['Gallery'],
        responses: {
          '200': { description: 'Gallery visuals with safeguarding confirmation' }
        }
      }
    },
    '/donations/config': {
      get: {
        summary: 'Get authorized donation channels',
        tags: ['Donations'],
        responses: {
          '200': { description: 'Fiduciary donation channels and status notices' }
        }
      }
    },
    '/contact': {
      post: {
        summary: 'Submit public inquiry to MSC Secretariat',
        tags: ['Forms'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'subject', 'message', 'consent'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' },
                  consent: { type: 'boolean', default: true }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Inquiry successfully logged and acknowledged' },
          '422': { description: 'Validation failed' }
        }
      }
    },
    '/volunteers/apply': {
      post: {
        summary: 'Submit grassroots volunteer application',
        tags: ['Forms'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'phone', 'county', 'areaOfInterest', 'availability', 'message', 'consent'],
                properties: {
                  fullName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  county: { type: 'string' },
                  subCounty: { type: 'string' },
                  areaOfInterest: { type: 'string' },
                  availability: { type: 'string' },
                  experience: { type: 'string' },
                  message: { type: 'string' },
                  consent: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Application logged and notification sent' }
        }
      }
    },
    '/partnerships/apply': {
      post: {
        summary: 'Submit institutional partnership proposal',
        tags: ['Forms'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['organizationName', 'contactPerson', 'email', 'phone', 'organizationType', 'partnershipInterests', 'message', 'consent'],
                properties: {
                  organizationName: { type: 'string' },
                  contactPerson: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  organizationType: { type: 'string' },
                  partnershipInterests: { type: 'string' },
                  message: { type: 'string' },
                  website: { type: 'string' },
                  consent: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Proposal submitted for executive review' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Admin login and token issuance',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Authenticated successfully; returns JWT and user profile' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/admin/dashboard': {
      get: {
        summary: 'Aggregated administration dashboard metrics',
        tags: ['Admin Dashboard'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Aggregated counts for content, forms, and recent audits' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/admin/review/pending': {
      get: {
        summary: 'List all content items pending client approval',
        tags: ['Content Approval Workflow'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Pending reviews across programs, news, events, team, impact' }
        }
      }
    }
  }
};
