import { Request, Response } from 'express';
import documentTemplateService from '../services/documentTemplate.service';

class DocumentTemplateController {
  async getAll(req: Request, res: Response) {
    const templates = await documentTemplateService.getAll();
    res.json({ success: true, data: templates });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const template = await documentTemplateService.getById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, data: template });
  }

  async create(req: Request, res: Response) {
    const { name, description, fileUrl, fileName, variables, category } = req.body;

    if (!name || !fileUrl || !fileName) {
      return res.status(400).json({ success: false, message: 'name, fileUrl, and fileName are required' });
    }

    const template = await documentTemplateService.create({
      name,
      description,
      fileUrl,
      fileName,
      variables: variables || [],
      category
    });

    res.status(201).json({ success: true, data: template });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const template = await documentTemplateService.update(id, req.body);
    res.json({ success: true, data: template });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await documentTemplateService.delete(id);
    res.json({ success: true, message: 'Template deleted successfully' });
  }
}

export default new DocumentTemplateController();
