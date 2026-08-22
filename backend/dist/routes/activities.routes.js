"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activities_controller_1 = require("../controllers/activities.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware
router.use(auth_middleware_1.authenticateToken);
router.get('/', activities_controller_1.searchActivities);
exports.default = router;
