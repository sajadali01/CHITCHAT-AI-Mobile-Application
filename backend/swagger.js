/**
 * swagger.js
 * 
 * Generates and serves Swagger API documentation for ChitChat AI backend.
 */

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChitChat AI Backend API',
      version: '1.0.0',
      description: 'API documentation for ChitChat AI backend',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};


const swaggerSpec = swaggerJSDoc(options);

/**
 * Registers Swagger UI middleware on /api-docs
 * @param {Express} app - The Express application
 */
function swaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ Swagger docs available at http://localhost:5000/api-docs');
}

module.exports = swaggerDocs;
