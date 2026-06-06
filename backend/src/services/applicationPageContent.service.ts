import { prisma } from '../config/db';

const defaultPageContentByPageKey: Record<string, any> = {
  application: {
    pageKey: 'application',
    title: 'Build Your Editorial Profile',
    subtitle: 'Phase 2: Defining your academic and professional coordinates.',
    blocks: [
      {
        id: 'section-personal-credentials',
        type: 'section',
        label: 'Personal Credentials',
        section: 'Personal Credentials',
        column: 'left',
        order: 1,
        enabled: true,
      },
      {
        id: 'full-name',
        type: 'user',
        label: 'Full Legal Name',
        fieldKey: 'fullName',
        valueSource: 'user.fullName',
        section: 'Personal Credentials',
        column: 'left',
        order: 2,
        disabled: true,
      },
      {
        id: 'primary-email',
        type: 'user',
        label: 'Primary Email',
        fieldKey: 'email',
        valueSource: 'user.email',
        section: 'Personal Credentials',
        column: 'left',
        order: 3,
        disabled: true,
      },
      {
        id: 'passport-number',
        type: 'text',
        label: 'Passport Number',
        fieldKey: 'passportNumber',
        placeholder: 'E1234567',
        section: 'Personal Credentials',
        column: 'left',
        order: 4,
        required: false,
      },
      {
        id: 'section-academic-nexus',
        type: 'section',
        label: 'Academic Nexus',
        section: 'Academic Nexus',
        column: 'left',
        order: 5,
        enabled: true,
      },
      {
        id: 'educational-institution',
        type: 'text',
        label: 'Educational Institution',
        fieldKey: 'educationalInstitution',
        placeholder: 'Metropolitan Institute of Technology',
        section: 'Academic Nexus',
        column: 'left',
        order: 6,
        required: false,
      },
      {
        id: 'enrollment-status',
        type: 'select',
        label: 'B.Tech Enrollment Status',
        fieldKey: 'enrollmentStatus',
        options: ['Active Candidate', 'Alumni'],
        defaultValue: 'Active Candidate',
        section: 'Academic Nexus',
        column: 'left',
        order: 7,
      },
      {
        id: 'section-journey-intent',
        type: 'section',
        label: 'Journey Intent',
        section: 'Journey Intent',
        column: 'right',
        order: 8,
        enabled: true,
      },
      {
        id: 'preferred-department',
        type: 'select',
        label: 'Preferred Department',
        fieldKey: 'preferredDepartment',
        options: ['Journalism', 'Digital Media', 'Publishing', 'Content Strategy'],
        section: 'Journey Intent',
        column: 'right',
        order: 9,
      },
      {
        id: 'cgpa',
        type: 'number',
        label: 'CGPA',
        fieldKey: 'cgpa',
        placeholder: '8.5',
        section: 'Academic Nexus',
        column: 'left',
        order: 8,
        required: false,
      },
      {
        id: 'passport-confirmation',
        type: 'checkbox',
        label: 'I confirm I have a valid passport',
        fieldKey: 'passportConfirmed',
        defaultValue: true,
        section: 'Personal Credentials',
        column: 'left',
        order: 9,
        required: true,
      },
      {
        id: 'statement-of-purpose',
        type: 'textarea',
        label: 'Statement of Purpose (250 Words)',
        fieldKey: 'statementOfPurpose',
        placeholder: 'Describe your vision for this editorial internship...',
        description: 'Tell us why this program matters to your editorial journey.',
        section: 'Journey Intent',
        column: 'right',
        order: 10,
        maxWords: 250,
      },
      {
        id: 'preferred-start-date',
        type: 'date',
        label: 'Preferred Start Date',
        fieldKey: 'preferredStartDate',
        section: 'Journey Intent',
        column: 'right',
        order: 11,
        required: false,
      },
    ],
  },
  documents: {
    pageKey: 'documents',
    title: 'The Editorial Compliance',
    subtitle: 'Securely upload your credentials to advance your internship journey. All files are encrypted and verified by our editorial board within 24 hours.',
    blocks: [
      {
        id: 'documents-header',
        type: 'section',
        label: 'Document Repository',
        description: 'Upload the required materials to keep your internship application moving.',
        column: 'left',
        order: 1,
        enabled: true,
      },
      {
        id: 'resume-card',
        type: 'upload',
        label: 'Professional Curriculum Vitae',
        fieldKey: 'RESUME',
        description: 'Highlight your academic achievements and extracurricular contributions. Must include recent experience.',
        placeholder: 'Supported Formats: PDF (Max 5MB)',
        column: 'left',
        order: 2,
        enabled: true,
      },
      {
        id: 'passport-card',
        type: 'upload',
        label: 'Passport Pages',
        fieldKey: 'PASSPORT',
        description: 'Upload the bio-data pages from your passport so we can verify your identity.',
        placeholder: 'PDF / JPG',
        column: 'left',
        order: 3,
        enabled: true,
      },
      {
        id: 'photo-card',
        type: 'upload',
        label: 'Official Photo',
        fieldKey: 'PHOTO',
        description: 'Use a neutral background and make sure your face is clearly visible.',
        placeholder: 'JPG ONLY',
        column: 'left',
        order: 4,
        enabled: true,
      },
      {
        id: 'submission-integrity-header',
        type: 'summary',
        label: 'Submission Integrity',
        description: 'Keep these standards in mind before you finish the upload step.',
        column: 'right',
        order: 5,
        enabled: true,
      },
      {
        id: 'legibility-item',
        type: 'summary-item',
        label: 'LEGIBILITY',
        description: 'Ensure all text and edges are sharp. Scanned documents must be high-resolution.',
        column: 'right',
        order: 6,
        enabled: true,
      },
      {
        id: 'authenticity-item',
        type: 'summary-item',
        label: 'AUTHENTICITY',
        description: 'Files must be original copies. Watermarked or edited documents will be rejected.',
        column: 'right',
        order: 7,
        enabled: true,
      },
      {
        id: 'validity-item',
        type: 'summary-item',
        label: 'VALIDITY',
        description: 'ID and Passports must have at least 6 months validity remaining.',
        column: 'right',
        order: 8,
        enabled: true,
      },
    ],
  },
}

const getDefaultPageContent = (pageKey: string) => {
  const defaultSchema = defaultPageContentByPageKey[pageKey] || defaultPageContentByPageKey.application

  return {
    ...defaultSchema,
    pageKey,
  }
}

class ApplicationPageContentService {
  hasDocumentSchema(content: any) {
    return Array.isArray(content?.blocks) && content.blocks.some((block: any) => block.type === 'upload' || block.type === 'summary-item');
  }

  async getPageContent(pageKey: string) {
    const content = await prisma.applicationPageContent.findUnique({
      where: { pageKey },
    });

    if (content) {
      if (pageKey === 'documents' && !this.hasDocumentSchema(content)) {
        return await this.seedPageContent(pageKey);
      }

      return content;
    }

    return await this.seedPageContent(pageKey);
  }

  async seedPageContent(pageKey: string) {
    const payload = getDefaultPageContent(pageKey);

    return await prisma.applicationPageContent.upsert({
      where: { pageKey },
      update: {
        title: payload.title,
        subtitle: payload.subtitle,
        blocks: payload.blocks,
        isActive: true,
      },
      create: {
        pageKey: payload.pageKey,
        title: payload.title,
        subtitle: payload.subtitle,
        blocks: payload.blocks,
        isActive: true,
      },
    });
  }

  async updatePageContent(pageKey: string, data: any) {
    const fallback = getDefaultPageContent(pageKey);

    return await prisma.applicationPageContent.upsert({
      where: { pageKey },
      update: {
        title: data.title ?? fallback.title,
        subtitle: data.subtitle ?? fallback.subtitle,
        blocks: Array.isArray(data.blocks) ? data.blocks : fallback.blocks,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      },
      create: {
        pageKey,
        title: data.title ?? fallback.title,
        subtitle: data.subtitle ?? fallback.subtitle,
        blocks: Array.isArray(data.blocks) ? data.blocks : fallback.blocks,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      },
    });
  }
}

export default new ApplicationPageContentService();
