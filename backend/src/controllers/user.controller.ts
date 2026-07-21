import { Request, Response } from 'express';
import userService from '../services/user.service';
import activityService from '../services/activity.service';
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

  await activityService.log(
    `Admin updated user role of ${user.firstName} to ${role}`,
    'ADMIN_UPDATE_USER_ROLE',
    undefined,
    (req as any).user?.id
  );

  res.status(200).json({
    success: true,
    data: user
  });
};

export const createUser = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  await activityService.log(
    `Admin created user: ${user.firstName} ${user.lastName} (${user.email})`,
    'ADMIN_CREATE_USER',
    undefined,
    (req as any).user?.id
  );

  res.status(201).json({
    success: true,
    data: user
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id);

  await activityService.log(
    `Admin deleted user ID: ${id}`,
    'ADMIN_DELETE_USER',
    undefined,
    (req as any).user?.id
  );

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.toggleUserStatus(id);

  await activityService.log(
    `Admin toggled status of user ${user.firstName} (Active: ${user.isActive})`,
    'ADMIN_TOGGLE_USER_STATUS',
    undefined,
    (req as any).user?.id
  );

  res.status(200).json({
    success: true,
    data: user,
    message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`
  });
};

