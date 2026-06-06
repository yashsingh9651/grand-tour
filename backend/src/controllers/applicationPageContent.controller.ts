import { Request, Response } from 'express';
import applicationPageContentService from '../services/applicationPageContent.service';

class ApplicationPageContentController {
  async getPageContent(req: Request, res: Response) {
    const pageKey = req.params.pageKey || 'application';
    const content = await applicationPageContentService.getPageContent(pageKey);

    res.status(200).json({
      success: true,
      data: content,
    });
  }

  async updatePageContent(req: Request, res: Response) {
    const pageKey = req.params.pageKey || 'application';
    const content = await applicationPageContentService.updatePageContent(pageKey, req.body);

    res.status(200).json({
      success: true,
      data: content,
    });
  }
}

export default new ApplicationPageContentController();
