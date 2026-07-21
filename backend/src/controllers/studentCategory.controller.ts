import { Request, Response } from 'express';
import studentCategoryService from '../services/studentCategory.service';
import activityService from '../services/activity.service';

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await studentCategoryService.getAll();
  res.status(200).json({ success: true, data: categories });
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await studentCategoryService.getById(id);
  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found' });
    return;
  }
  res.status(200).json({ success: true, data: category });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description, color, pricing } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: 'Category name is required' });
    return;
  }
  const category = await studentCategoryService.create({ name, description, color, pricing });

  await activityService.log(
    `Admin created student category: ${category.name}`,
    'ADMIN_CREATE_CATEGORY',
    undefined,
    (req as any).user?.id
  );

  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, color, pricing, isActive } = req.body;
  const category = await studentCategoryService.update(id, { name, description, color, pricing, isActive });

  await activityService.log(
    `Admin updated student category: ${category.name}`,
    'ADMIN_UPDATE_CATEGORY',
    undefined,
    (req as any).user?.id
  );

  res.status(200).json({ success: true, data: category });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  await studentCategoryService.remove(id);

  await activityService.log(
    `Admin deleted student category ID: ${id}`,
    'ADMIN_DELETE_CATEGORY',
    undefined,
    (req as any).user?.id
  );

  res.status(200).json({ success: true, message: 'Category deleted successfully' });
};
