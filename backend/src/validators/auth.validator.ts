import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const registerSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('STUDENT', 'TEAM', 'ADMIN', 'SUPER_ADMIN', 'TEAM_MEMBER', 'MARKETING', 'HR').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Middleware to validate requests against a schema
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      res.status(400);
      throw new Error(`Validation Error: ${errorMessage}`);
    }
    next();
  };
};
