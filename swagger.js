
import "dotenv/config";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "API Gestion des tâches",
            version: "1.0.0",
            description: "Documentation de mon API REST"
        },

        servers: [
            {
                url: process.env.RENDER_EXTERNAL_URL || "http://localhost:3000",
                description: "Serveur actuel"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
