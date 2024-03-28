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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.verifyOTP = exports.generateOTP = exports.individualUserLogin = exports.verifyIndividualUserEmail = exports.individualUserRegistration = void 0;
const individualUserRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.individualUserRegistration = individualUserRegistration;
const verifyIndividualUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.verifyIndividualUserEmail = verifyIndividualUserEmail;
const individualUserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.individualUserLogin = individualUserLogin;
const generateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.generateOTP = generateOTP;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.verifyOTP = verifyOTP;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.resetPassword = resetPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.logout = logout;
