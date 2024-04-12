const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: "Individual User API",
            version: "1.0.0",
            description: "API for managing individual user accounts",
        },
        servers:[
            {
                url: "http://localhost:5000",
                description: "Local server",
            }
        ],
        components:{
            schemas:{
                Individual:{
                    type: "object",
                    required: ["email", "password", "phoneNumber"],
                    properties:{
                        email:{ 
                            type: "string",
                            format: "email",
                            deault: "example@example.com",
                            description: "User's email addess"
                        },
                        password:{
                            type: "string",
                            format: "password",
                            description: "User's password",
                            default: "examplePassword"
                        },
                        phoneNumber:{
                            type: "string",
                            format: "phoneNumber",
                            description: "User's phone number",
                            default: "+11234567890"
                        }
                    }
                },
                OTP:{
                    type: "object",
                    required: ["token", 'email'],
                    properties:{
                        token:{
                            type: "string",
                            description: "Otp token",
                            default: "12345"
                        },
                        email:{
                            type: "string",
                            description: "User's email address",
                            default: "user@gmail.com"
                        }
                    }
                },
            },

            responses:{
                200:{
                    description: "success",
                    content: "application/json"
                },
                400:{
                    description: "Bad Request",
                    content: "application/json"
                },
                404:{
                    description: "Request Not Found",
                    content: "application/json"
                },
                403:{
                    description: "Unauthorized Request",
                    content: "application/json"
                },
                500:{
                    description: "Internal server error",
                    content: "application/json"
                },
            },
            securitySchemes: {
                ApiKeyAuth:{
                    type: "apikey",
                    in: "header",
                    name: "Authorization",
                }
            }
        },
        security:[{
            ApiKeyAuth:[],
        }]
    },
    apis:["./src/modules/authentication/individualUserAuth/individualAuth.route.ts"]
}

module.exports = options;
