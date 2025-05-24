"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = void 0;
const session_model_1 = require("../modules/sessions/session.model");
async function createSession(userId, userAgent, role) {
    const session = await session_model_1.Session.create({ user: userId, userAgent, role });
    return session.toJSON();
}
exports.createSession = createSession;
