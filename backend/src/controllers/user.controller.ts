import { Request, Response } from 'express';
import userService from '../services/user.service';
import { Role } from '@prisma/client';

export const getUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json({
    success: true,
    data: users
  });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await userService.updateUserRole(id, role as Role);
  res.status(200).json({
    success: true,
    data: user
  });
};

export const createUser = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
};
