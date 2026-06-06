import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { Role } from '@prisma/client';

export const getPermissions = async (req: Request, res: Response) => {
  const permissions = await prisma.rolePermission.findMany();
  res.status(200).json({
    success: true,
    data: permissions
  });
};

export const updatePermission = async (req: Request, res: Response) => {
  const { role } = req.params;
  const { features } = req.body;

  const updated = await prisma.rolePermission.upsert({
    where: { role: role as Role },
    update: { features },
    create: { role: role as Role, features }
  });

  res.status(200).json({
    success: true,
    data: updated
  });
};
