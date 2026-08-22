"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cities_controller_1 = require("../controllers/cities.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get('/', cities_controller_1.searchCities);
exports.default = router;
