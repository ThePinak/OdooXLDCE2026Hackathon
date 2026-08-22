import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMe: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMe: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map