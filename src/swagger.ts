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

// swagger documentation for google authentication for individual signup
export const option = {
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
        description: "This is the server Doshbox API",
      },
    ],
    components: {
      schemas: {
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
        GoogleIndividualAccess: {
          type: "object",
          required: ["sub", "name", "email", "email_verified", "picture"],
          properties: {
            sub: {
              type: "string",
              description:
                "This is the unique identifier(id) provided by the google oauth from the user's google account",
            },
            name: {
              type: "string",
              description:
                "This is the username provided by the google oauth from the user's google account",
            },
            email: {
              type: "string",
              description:
                "This is the email provided by the google oauth from the user's google account",
            },
            email_verified: {
              type: "string",
              description:
                "This is the email verificatin status provided by the google oauth from the user's google account",
            },
            picture: {
              type: "string",
              description:
                "This is the picture provided by the google oauth from the user's google account",
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
                "This is the google authorized url generated from the google oauth api ",
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
    "./src/modules/authentication/individualUserAuth/googleIndividualUserAuth.route.ts",
  ],
};

// swagger documentation for  organization authentication

export const opt = {
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
        description: "This is the server Doshbox API",
      },
    ],
    components: {
      schemas: {
        OrganizationUser: {
          type: "object",
          required: ["name", "email", "org_Email", "password"],
          properties: {
            name: {
              type: "string",
              description: "This is the username provided by the organization",
            },
            org_Email: {
              type: "string",
              description: "Organization email",
            },
            email: {
              type: "string",
              description: "User's Email",
            },
            password: {
              type: "string",
              description: "Organization Password",
            },
          },
        },
      },
      responses: {
        "400": {
          description: "Please provide all required fields",
          content: {
            "application/json": {},
          },
        },
        "401": {
          description: "User not found",
          content: {
            "application/json": {},
          },
        },
        "409": {
          description: "User with email already exists",
          content: {
            "application/json": {},
          },
        },
        "201": {
          description: "Organization successfully created",
          content: {
            "application/json": {},
          },
        },
      },
    },
    paths: {
      "/login": {
        post: {
          tags: ["Login"],
          summary: "Logs in a user",
          operationId: "loginUser",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OrganizationLogin",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {},
              },
            },
            "400": {
              description: "Please provide correct details",
              content: {
                "application/json": {},
              },
            },
            "401": {
              description: "User not found",
              content: {
                "application/json": {},
              },
            },
          },
        },
      },
      "/forgotpassword": {
        post: {
          tags: ["Forgot Password"],
          summary: "Initiate password reset process",
          operationId: "forgotPassword",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ForgotPassword",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Email sent successfully",
              content: {
                "application/json": {},
              },
            },
            "401": {
              description: "User not found",
              content: {
                "application/json": {},
              },
            },
          },
        },
      },
      "/resetPassword": {
        post: {
          tags: ["Reset Password"],
          summary: "Reset user's password",
          operationId: "resetPassword",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResetPassword",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Password reset successful",
              content: {
                "application/json": {},
              },
            },
            "400": {
              description: "Please provide all required fields",
              content: {
                "application/json": {},
              },
            },
          },
        },
      },
    },
    apis: [
      "./src/modules/authentication/organizationUserAuth/organizationAuth.route.ts",
    ],
  },
};

//  swagger documentation for  individual authentication
export const opts = {
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
        description: "This is the server Doshbox API",
      },
    ],
    components: {
      schemas: {
        OrganizationUser: {
          type: "object",
          required: ["email", "phoneNumber", "password"],
          properties: {
            email: {
              type: "string",
              description: "Organization email",
            },
            phoneNumber: {
              type: "string",
              description: "User's Email",
            },
            password: {
              type: "string",
              description: "Organization Password",
            },
          },
        },
      },
      responses: {
        "400": {
          description: "Please provide all required fields",
          content: {
            "application/json": {},
          },
        },
        "401": {
          description: "User not found",
          content: {
            "application/json": {},
          },
        },
        "409": {
          description: "User with email already exists",
          content: {
            "application/json": {},
          },
        },
        "201": {
          description: "Individual successfully created",
          content: {
            "application/json": {},
          },
        },
      },
    },
    apis: [
      "./src/modules/authentication/individualUserAuth/individualAuth.route.ts",
    ],
  },
};
