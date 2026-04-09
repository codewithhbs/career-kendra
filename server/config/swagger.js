const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS Backend API",
      version: "1.0.0",
      description: "HRMS Backend API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5001",
      },
    ],
  },

  apis: ["./src/swagger/*.js"], // ✅ docs folder scan
};

module.exports = swaggerJSDoc(options);
