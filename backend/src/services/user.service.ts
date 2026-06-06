import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

class UserService {
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateUserRole(id: string, role: Role) {
    return await prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async createUser(userData: any) {
    const { email, password, firstName, lastName, role, whatsapp, dateOfBirth, address, city, state, pincode } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as Role,
        whatsapp,
        dateOfBirth,
        address,
        city,
        state,
        pincode,
      },
    });
  }

  async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: data.profileImage,
        whatsapp: data.whatsapp,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

export default new UserService();
