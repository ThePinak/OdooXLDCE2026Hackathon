"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trips_controller_1 = require("../controllers/trips.controller");
const stops_controller_1 = require("../controllers/stops.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all trips routes
router.use(auth_middleware_1.authenticateToken);
router.post('/', trips_controller_1.createTrip);
router.get('/', trips_controller_1.getTrips);
router.get('/:id', trips_controller_1.getTripById);
router.patch('/:id', trips_controller_1.updateTrip);
router.delete('/:id', trips_controller_1.deleteTrip);
router.post('/:tripId/stops', stops_controller_1.createStop);
exports.default = router;
