"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stops_controller_1 = require("../controllers/stops.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all stops routes
router.use(auth_middleware_1.authenticateToken);
router.patch('/:id', stops_controller_1.updateStop);
router.delete('/:id', stops_controller_1.deleteStop);
router.post('/:id/activities', stops_controller_1.addActivityToStop);
router.delete('/:id/activities/:activityId', stops_controller_1.removeActivityFromStop);
exports.default = router;
