import swaggerJSDOC from "swagger-jsdoc";

const organizationUserSchemaProps = {
  sub: {
    type: "string",
    description:
      "this is the google account unique identifier provided by the google oauth",
  },
  organization_name: {
    type: "string",
    description:
      "this is the google account username provided by the google oauth",
  },
  organization_email: {
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
  contact_number: {
    type: "string",
    description:
      "this is the organization's contact phone number to be provided by the user after google account verification and access",
  },
  contact_email: {
    type: "string",
    description:
      "this is the organization's contact email address to be provided by the user after google account verification and access",
  },
  password: {
    type: "string",
    description: "organization account password",
  },
  password_confirmation: {
    type: "string",
    description: "organization account password",
  },
  role: {
    type: "string",
    description: "kind of user, can either be org or g-org",
  },
};

const options = {
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
        GoogleOrganizationAccess: {
          type: "object",
          required: [
            "sub",
            "organization_name",
            "organization_email",
            "email_verified",
            "picture",
          ],
          properties: organizationUserSchemaProps,
        },
        GoogleOrganizationUserCreate: {
          type: "object",
          required: [
            "sub",
            "organization_name",
            "organization_email",
            "email_verified",
            "picture",
            "contact_number",
            "contact_email",
          ],
          properties: organizationUserSchemaProps,
        },
        OrganizationUserSignup: {
          type: "object",
          required: [
            "organization_name",
            "organization_email",
            "contact_email",
            "contact_number",
            "password",
            "password_confirmation",
          ],
          properties: organizationUserSchemaProps,
        },
        OrganizationUserLogin: {
          type: "object",
          required: ["organization_email", "password"],
          properties: organizationUserSchemaProps,
        },
        OrganizationUserForgotPassword: {
          type: "object",
          required: ["organization_email"],
          properties: {
            organization_email: {
              type: "string",
              description: "Organization Email",
            },
          },
        },
        OrganizationUserResetPassword: {
          type: "object",
          required: ["password", "password_Confirmation"],
          properties: {
            password: {
              type: "string",
              description: "Organization Old Password",
            },
            password_Confirmation: {
              type: "string",
              description: "Organization New Passsword",
            },
          },
        },
        GoogleIndividualUser: {
          type: "object",
          required: ["sub", "name", "email", "email_verified", "picture"],
          properties: {
            sub: {
              type: "string",
              description:
                "This is the google account unique identifier (id) provided by the google oauth",
            },
            name: {
              type: "string",
              description:
                "This is the  username provided by the google oauth from the google account",
            },
            email: {
              type: "string",
              description:
                "This is the  email provided by the google oauth from the google account",
            },
            email_verified: {
              type: "string",
              description:
                "This is the  email verificatin status provided by the google oauth google account",
            },
            picture: {
              type: "string",
              description:
                "This is the picture provided by the google oauth google account",
            },
          },
        },
        IndividualUserSignup: {
          type: "object",
          required: ["email", "password", "phoneNumber", "confirmPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
              deault: "example@example.com",
              description: "User's email addess",
            },
            phoneNumber: {
              type: "string",
              format: "phoneNumber",
              description: "User's phone number",
              default: "+11234567890",
            },
            password: {
              type: "string",
              format: "password",
              description: "User's password",
              default: "examplePassword",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              description: "confirm password",
              default: "examplePassword",
            },
          },
        },
        IndividualUserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              default: "example@gmail.com",
              description: "User's email address",
            },
            password: {
              type: "string",
              format: "password",
              default: "examplePassword",
              description: "User's password",
            },
          },
        },
        IndividualUserForgotPassword: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              default: "example@gmail.com",
              description: "User's email address",
            },
          },
        },
        IndividualUserResetPassword: {
          type: "object",
          required: ["password", "confirmPassword"],
          properties: {
            password: {
              type: "string",
              format: "password",
              default: "examplePassword",
              description: "User's password",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              default: "examplePassword",
              description: "confirm password",
            },
          },
        },
        IndividualUserRefreshAccessToken: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              default: "example",
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
        201: {
          description: "User successfully created",
          content: {
            "application/json": {},
          },
        },
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: "apikey",
          in: "header",
          name: "Authorization",
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: [
    "build/modules/authentication/organizationUserAuth/googleOrganizationUser/googleOrganizationUserAuth.route.ts",
    "build/modules/authentication/organizationUserAuth/organizationUser/organizationAuth.route.ts",
    "build/modules/authentication/individualUserAuth/individualUser/individualAuth.route.ts",
    "build/modules/authentication/individualUserAuth/googleIndividualUser/googleIndividualUserAuth.route.ts",
  ],
};

const prodSpec = swaggerJSDOC(options);

export default prodSpec;
