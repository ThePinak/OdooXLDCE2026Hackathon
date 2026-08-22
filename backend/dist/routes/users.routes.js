"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all user routes
router.use(auth_middleware_1.authenticateToken);
router.get('/me', auth_controller_1.getMe);
router.patch('/me', auth_controller_1.updateMe);
exports.default = router;
