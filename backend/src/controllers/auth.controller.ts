import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors?.[0]?.message || zodError.issues?.[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors?.[0]?.message || zodError.issues?.[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is set by auth middleware
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { name } = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: { id: true, email: true, name: true }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      return res.status(400).json({ message: zodError.errors?.[0]?.message || zodError.issues?.[0]?.message || 'Validation error' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: {
        stops: {
          include: {
            city: true,
            activities: { include: { activity: true } }
          }
        }
      }
    });

    let totalBudget = 0;
    const countries = new Set();

    trips.forEach((trip: any) => {
      totalBudget += (trip.flightCost || 0) + (trip.accommodationCost || 0) + (trip.miscCost || 0);
      trip.stops.forEach((stop: any) => {
        countries.add(stop.city.country);
        stop.activities.forEach((act: any) => {
          totalBudget += act.activity.cost;
        });
      });
    });

    return res.status(200).json({
      totalTrips: trips.length,
      countriesVisited: countries.size,
      totalBudget: totalBudget
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
