"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureGuest = exports.ensureAuth = void 0;
const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect('/');
    }
};
exports.ensureAuth = ensureAuth;
const ensureGuest = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect('/log');
    }
};
exports.ensureGuest = ensureGuest;
