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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const auth_user_1 = require("../middleware/auth.user");
/**
 * Router for handling authentication related routes.
 */
const router = express_1.default.Router();
router.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport_1.default.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure'
}), (req, res) => {
    res.redirect('/log');
});
router.get('/logout', (req, res) => {
    req.logout(() => { });
    res.redirect('/');
});
router.get('/auth/google/success', (req, res) => {
    res.send('Successfully authenticated with Google.');
});
router.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate with Google.');
});
router.get('/', auth_user_1.ensureGuest, (req, res) => {
    res.render('login');
});
router.get("/log", auth_user_1.ensureAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('index', { userinfo: req.user });
}));
exports.default = router;
