export const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doshbox API",
      description: "This is Doshbox API Swagger documentation",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "This is the Doshbox API server",
      },
    ],
    components: {
      schemas: {
        GoogleOrganizationUser: {
          type: "object",
          required: [
            "sub",
            "name",
            "email",
            "email_verified",
            "picture",
            "contact_phone",
            "contact_email",
          ],
          properties: {
            sub: {
              type: "string",
              description:
                "this is the google account unique identifier provided by the google oauth",
            },
            name: {
              type: "string",
              description:
                "this is the google account username provided by the google oauth",
            },
            email: {
              type: "string",
              description:
                "this is the google account email provided by the google oauth",
            },
            email_verified: {
              type: "string",
              description:
                "this is the google account email verificatin status provided by the google oauth",
            },
            picture: {
              type: "string",
              description:
                "this is the google account picture provided by the google oauth",
            },
            contact_phone: {
              type: "string",
              description:
                "this is the organization's contact phone number to be provided by the user after google account verification and access",
            },
            contact_email: {
              type: "string",
              description:
                "this is the organization's contact email address to be provided by the user after google account verification and access",
            },
          },
        },
        GoogleOrganizationAccess: {
          type: "object",
          required: ["sub", "name", "email", "email_verified", "picture"],
          properties: {
            sub: {
              type: "string",
              description:
                "this is the google account unique identifier provided by the google oauth",
            },
            name: {
              type: "string",
              description:
                "this is the google account username provided by the google oauth",
            },
            email: {
              type: "string",
              description:
                "this is the google account email provided by the google oauth",
            },
            email_verified: {
              type: "string",
              description:
                "this is the google account email verificatin status provided by the google oauth",
            },
            picture: {
              type: "string",
              description:
                "this is the google account picture provided by the google oauth",
            },
          },
        },
        GoogleAuthorizedurl: {
          type: "object",
          required: ["authorizeUrl"],
          properties: {
            authorizeUrl: {
              type: "string",
              description:
                "this is the google authorized url generated from the google oauth api ",
            },
          },
        },
      },
      responses: {
        400: {
          description: "Please provide all required field",
          contents: "application/json",
        },
        401: {
          description: "Google user not verified",
          contents: "application/json",
        },
        409: {
          description: "User with email already exist",
          contents: "application/json",
        },
        200: {
          description: "Google AuthorizedUrl successful gotten",
          contents: "application/json",
        },
      },
    },
  },
  apis: [
    "./src/modules/authentication/organizationUserAuth/googleOrganizationUserAuth.route.ts",
  ],
};
