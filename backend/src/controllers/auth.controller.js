"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.login = exports.signup = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
});
const signup = async (req, res) => {
    try {
        const { name, email, password } = signupSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: { name, email, passwordHash },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        return res.status(201).json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        return res.status(200).json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        // req.user is set by auth middleware
        return res.status(200).json(req.user);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { name } = updateProfileSchema.parse(req.body);
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: { name },
            select: { id: true, email: true, name: true }
        });
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateMe = updateMe;
//# sourceMappingURL=auth.controller.js.map