"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const share_controller_1 = require("../controllers/share.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public endpoint, no auth middleware needed
router.get('/:slug', share_controller_1.getSharedTrip);
// Protected endpoint, requires auth to copy a trip
router.post('/:slug/copy', auth_middleware_1.authenticateToken, share_controller_1.copySharedTrip);
exports.default = router;
