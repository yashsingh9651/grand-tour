import { Request, Response } from 'express';
import emailTemplateService from '../services/emailTemplate.service';

class EmailTemplateController {
  async getTemplates(req: Request, res: Response) {
    const templates = await emailTemplateService.getTemplates();
    res.json(templates);
  }

  async getTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const template = await emailTemplateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  }

  async createTemplate(req: Request, res: Response) {
    const template = await emailTemplateService.createTemplate(req.body);
    res.status(201).json(template);
  }

  async updateTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const template = await emailTemplateService.updateTemplate(id, req.body);
    res.json(template);
  }

  async deleteTemplate(req: Request, res: Response) {
    const { id } = req.params;
    await emailTemplateService.deleteTemplate(id);
    res.status(204).send();
  }

  async seedTemplates(req: Request, res: Response) {
    await emailTemplateService.seedTemplates();
    res.json({ message: 'Default templates seeded successfully' });
  }
}

export default new EmailTemplateController();
