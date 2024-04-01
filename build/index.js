"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const dbconn_config_1 = __importDefault(require("./config/dbconn.config"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const app = (0, express_1.default)();
//passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get("/", (req, res) => {
    return res.json({ msg: "welcome to doshbox api" });
});
//middleware and db for sessions setup
// Access MongoDB URL from environment variables
const mongoURI = process.env.DATABASE_URI;
// Check if the MongoDB URL is defined in the environment variables
if (!mongoURI) {
    console.error('MongoDB URI is not defined in the environment variables.');
    process.exit(1); // Exit the process if MongoDB URI is not defined
}
// Configure session middleware with MongoStore
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET_KEY || "",
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({ mongoUrl: mongoURI }),
}));
const PORT = process.env.PORT;
(0, dbconn_config_1.default)()
    .then(() => {
    try {
        console.log("connected to mongoose");
        app.listen(PORT, () => {
            console.log(`server is running on http://localhost:${PORT}`);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        throw new Error(error);
    }
})
    .catch((error) => {
    throw new Error(error);
});
// app.listen(`${PORT}`, () =>{
//     console.log(`listening on port ${PORT}`);
// })
