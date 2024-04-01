"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_google_oauth2_1 = require("passport-google-oauth2");
const User_google_1 = __importDefault(require("../models/User.google"));
function default_1(passport) {
    passport.use(new passport_google_oauth2_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
        passReqToCallback: true,
    }, (_accessToken, _refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // Get the user data from Google 
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: (_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName,
            lastName: (_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName,
            image: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
            email: (_d = profile.emails) === null || _d === void 0 ? void 0 : _d[0].value,
        };
        try {
            // Find the user in our database 
            let user = yield User_google_1.default.findOne({ googleId: profile.id });
            if (user) {
                // If user is present in our database.
                done(null, user);
            }
            else {
                // If user is not present in our database, save user data to database.
                user = yield User_google_1.default.create(newUser);
                done(null, user);
            }
        }
        catch (err) {
            console.error(err);
            done(err, false);
        }
    })));
    // Used to serialize the user for the session
    passport.serializeUser((user, done) => {
        if (user instanceof User_google_1.default && user._id) {
            done(null, user._id.toString());
        }
        else {
            done(new Error('User or user._id is null or undefined'), undefined);
        }
    });
    // Used to deserialize the user
    passport.deserializeUser((id, done) => {
        User_google_1.default.findById(id, (err, user) => {
            done(err, user);
        });
    });
}
exports.default = default_1;
