import { Request, Response } from 'express';
import notificationService from '../services/notification.service';
import logger from '../utils/logger';

export const submitContactForm = async (req: Request, res: Response) => {
  const { name, email, phone, city, college, program, message, businessName, contactPerson, position, country, positions } = req.body;

  try {
    const isPartner = Boolean(businessName || contactPerson || positions);
    const title = isPartner ? `🤝 New Partnership Request: ${businessName || contactPerson}` : `📩 New Contact Enquiry from ${name || email}`;
    const details = isPartner
      ? `Business: ${businessName}\nContact: ${contactPerson} (${position || 'N/A'})\nEmail: ${email} | Phone: ${phone}\nLocation: ${city || ''}, ${country || 'France'}\nPositions Needed: ${positions || 'N/A'}\nMessage: ${message || 'N/A'}`
      : `Name: ${name}\nEmail: ${email} | Phone: ${phone}\nCity: ${city || 'N/A'} | College: ${college || 'N/A'}\nProgram: ${program || 'N/A'}\nMessage: ${message || 'N/A'}`;

    await notificationService.notifyAdmin(
      title,
      details,
      'INFO',
      { email, phone, type: isPartner ? 'PARTNER_LEAD' : 'CONTACT_LEAD' }
    );

    logger.info(`Public form submission received: ${title}`);
    return res.status(200).json({ success: true, message: 'Enquiry submitted successfully! Our team will reach out to you within 24-48 hours.' });
  } catch (error) {
    logger.error('Error submitting contact form:', error);
    return res.status(500).json({ success: false, message: 'Failed to process enquiry' });
  }
};
