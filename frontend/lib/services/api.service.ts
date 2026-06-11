import apiClient from '../api-client';

export const userService = {
  getAll: async () => {
    const response = await apiClient.get('/api/users');
    return response.data.data;
  },
  create: async (userData: any) => {
    const response = await apiClient.post('/api/users', userData);
    return response.data.data;
  },
  updateRole: async (id: string, role: string) => {
    const response = await apiClient.patch(`/api/users/${id}/role`, { role });
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};

let getMyPromise: Promise<any> | null = null;

export const applicationService = {
  getAll: async () => {
    const response = await apiClient.get('/api/applications');
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data.data;
  },
  getMy: async () => {
    if (getMyPromise) return getMyPromise;

    getMyPromise = apiClient.get('/api/applications/my')
      .then(response => {
        getMyPromise = null;
        return response.data.data;
      })
      .catch(error => {
        getMyPromise = null;
        throw error;
      });

    return getMyPromise;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/applications', data);
    return response.data.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/applications/${id}`, data);
    return response.data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/applications/${id}/status`, { status });
    return response.data.data;
  },
  updateNotes: async (id: string, notes: string) => {
    const response = await apiClient.patch(`/api/applications/${id}/notes`, { notes });
    return response.data.data;
  },
  updateStep: async (id: string, currentStepId: string) => {
    const response = await apiClient.patch(`/api/applications/${id}/step`, { currentStepId });
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/applications/${id}`);
    return response.data;
  },
};

export const applicationPageContentService = {
  get: async (pageKey = 'application') => {
    const response = await apiClient.get(`/api/application-page-content/${pageKey}`);
    return response.data.data;
  },
  update: async (pageKey = 'application', data: any) => {
    const response = await apiClient.put(`/api/application-page-content/${pageKey}`, data);
    return response.data.data;
  },
};

let getMyInterviewPromise: Promise<any> | null = null;
let getAvailableSlotsPromise: Promise<any> | null = null;

export const interviewService = {
  getAll: async () => {
    const response = await apiClient.get('/api/interviews');
    return response.data.data || response.data;
  },
  getMy: async () => {
    if (getMyInterviewPromise) return getMyInterviewPromise;

    getMyInterviewPromise = apiClient.get('/api/interviews/my')
      .then(response => {
        getMyInterviewPromise = null;
        return response.data.data || response.data;
      })
      .catch(error => {
        getMyInterviewPromise = null;
        throw error;
      });

    return getMyInterviewPromise;
  },
  schedule: async (data: any) => {
    const response = await apiClient.post('/api/interviews', data);
    return response.data.data || response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/interviews/${id}`);
    return response.data;
  },
  // New Slot based endpoints
  getAvailability: async () => {
    const response = await apiClient.get('/api/interviews/availability');
    return response.data;
  },
  updateAvailability: async (availability: any[]) => {
    const response = await apiClient.post('/api/interviews/availability', { availability });
    return response.data;
  },
  getAvailableSlots: async () => {
    if (getAvailableSlotsPromise) return getAvailableSlotsPromise;

    getAvailableSlotsPromise = apiClient.get('/api/interviews/slots/available')
      .then(response => {
        getAvailableSlotsPromise = null;
        return response.data;
      })
      .catch(error => {
        getAvailableSlotsPromise = null;
        throw error;
      });

    return getAvailableSlotsPromise;
  },
  generateSlots: async (startDate: string, endDate: string, bufferTime: number = 0) => {
    const response = await apiClient.post('/api/interviews/slots/generate', { startDate, endDate, bufferTime });
    return response.data;
  },
  addManualSlot: async (startTime: string, endTime: string) => {
    const response = await apiClient.post('/api/interviews/slots/manual', { startTime, endTime });
    return response.data;
  },

  bookSlot: async (slotId: string, applicationId: string) => {
    const response = await apiClient.post('/api/interviews/slots/book', { slotId, applicationId });
    return response.data;
  },
  getAdminSlots: async () => {
    const response = await apiClient.get('/api/interviews/slots/admin');
    return response.data;
  },
  updateSlotLink: async (id: string, meetLink: string) => {
    const response = await apiClient.patch(`/api/interviews/slots/${id}/link`, { meetLink });
    return response.data;
  },
  deleteSlot: async (id: string) => {
    const response = await apiClient.delete(`/api/interviews/slots/${id}`);
    return response.data;
  },
  updateStatus: async (id: string, status: 'COMPLETED' | 'REJECTED') => {
    const response = await apiClient.patch(`/api/interviews/${id}/status`, { status });
    return response.data;
  },
};

export const documentTemplateService = {
  getAll: async () => {
    const response = await apiClient.get('/api/document-templates');
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/document-templates/${id}`);
    return response.data.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    variables: string[];
    category?: string;
  }) => {
    const response = await apiClient.post('/api/document-templates', data);
    return response.data.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/document-templates/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/document-templates/${id}`);
    return response.data;
  },
};

let getWorkflowPromise: Promise<any> | null = null;

export const workflowService = {
  get: async () => {
    if (getWorkflowPromise) return getWorkflowPromise;

    getWorkflowPromise = apiClient.get('/api/workflow')
      .then(response => {
        getWorkflowPromise = null;
        return response.data.data;
      })
      .catch(error => {
        getWorkflowPromise = null;
        throw error;
      });

    return getWorkflowPromise;
  },
  update: async (data: any) => {
    const response = await apiClient.put('/api/workflow', data);
    return response.data.data;
  },
};

export const activityService = {
  getRecent: async () => {
    const response = await apiClient.get('/api/activity');
    return response.data.data;
  }
};

export const notificationService = {
  getAll: async () => {
    const response = await apiClient.get('/api/notifications');
    return response.data.data;
  },
  markRead: async (id: string) => {
    const response = await apiClient.patch(`/api/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await apiClient.patch('/api/notifications/read-all');
    return response.data;
  }
};

let getDashboardPromise: Promise<any> | null = null;
let getWorkflowStatsPromise: Promise<any> | null = null;

export const analyticsService = {
  getDashboard: async () => {
    if (getDashboardPromise) return getDashboardPromise;

    getDashboardPromise = apiClient.get('/api/analytics/dashboard')
      .then(response => {
        getDashboardPromise = null;
        return response.data.data;
      })
      .catch(error => {
        getDashboardPromise = null;
        throw error;
      });

    return getDashboardPromise;
  },
  getWorkflow: async () => {
    if (getWorkflowStatsPromise) return getWorkflowStatsPromise;

    getWorkflowStatsPromise = apiClient.get('/api/analytics/workflow')
      .then(response => {
        getWorkflowStatsPromise = null;
        return response.data.data;
      })
      .catch(error => {
        getWorkflowStatsPromise = null;
        throw error;
      });

    return getWorkflowStatsPromise;
  }
};

export const permissionService = {
  getAll: async () => {
    const response = await apiClient.get('/api/permissions');
    return response.data.data;
  },
  update: async (role: string, features: string[]) => {
    const response = await apiClient.put(`/api/permissions/${role}`, { features });
    return response.data.data;
  }
};

export const documentService = {
  getAll: async () => {
    const response = await apiClient.get('/api/documents');
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/documents', data);
    return response.data.data;
  },
  updateStatus: async (id: string, status: string, remarks?: string) => {
    const response = await apiClient.patch(`/api/documents/${id}/status`, { status, remarks });
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/documents/${id}`);
    return response.data;
  }
};

export const paymentService = {
  submit: async (data: any) => {
    const response = await apiClient.post('/api/payments/submit', data);
    return response.data.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/api/payments');
    return response.data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/payments/${id}/status`, { status });
    return response.data.data;
  },
};

export const uploadService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }
};

export const hotelService = {
  getAll: async () => {
    const response = await apiClient.get('/api/hotels');
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/hotels', data);
    return response.data.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/hotels/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/hotels/${id}`);
    return response.data;
  },
  getCandidates: async () => {
    const response = await apiClient.get('/api/hotels/candidates');
    return response.data.data;
  },
  assign: async (data: { hotelId: string; applicationId: string; checkIn: string; checkOut: string }) => {
    const response = await apiClient.post('/api/hotels/assign', data);
    return response.data.data;
  },
  getMyAssignment: async () => {
    const response = await apiClient.get('/api/hotels/my-assignment');
    return response.data.data;
  },
  respondToAssignment: async (response: 'ACCEPTED' | 'DECLINED', note?: string) => {
    const res = await apiClient.post('/api/hotels/respond', { response, note });
    return res.data.data;
  },
};

export const workPermitService = {
  getMyWorkPermit: async () => {
    const response = await apiClient.get('/api/workpermit/my');
    return response.data.data;
  },
  getAllWorkPermits: async () => {
    const response = await apiClient.get('/api/workpermit');
    return response.data.data;
  },
  uploadWorkPermit: async (data: { applicationId: string; documentUrl: string; notes?: string }) => {
    const response = await apiClient.post('/api/workpermit/upload', data);
    return response.data.data;
  },
};

export const visaService = {
  getAvailableSlots: async () => {
    const response = await apiClient.get('/api/visa/available');
    return response.data.data;
  },
  bookSlot: async (slotId: string) => {
    const response = await apiClient.post('/api/visa/book', { slotId });
    return response.data.data;
  },
  getMySlot: async () => {
    const response = await apiClient.get('/api/visa/my');
    return response.data.data;
  },
  // Admin
  getAllSlots: async () => {
    const response = await apiClient.get('/api/visa');
    return response.data.data;
  },
  createSlot: async (data: { startTime: string; endTime: string; capacity?: number; documentUrl?: string; notes?: string }) => {
    const response = await apiClient.post('/api/visa', data);
    return response.data.data;
  },
  uploadDocument: async (data: { documentUrl: string; slotId?: string }) => {
    const response = await apiClient.post('/api/visa/document', data);
    return response.data.data;
  },
  approveSlot: async (id: string) => {
    const response = await apiClient.post(`/api/visa/${id}/approve`);
    return response.data;
  },
  rejectSlot: async (id: string) => {
    const response = await apiClient.post(`/api/visa/${id}/reject`);
    return response.data;
  },
  deleteSlot: async (id: string) => {
    const response = await apiClient.delete(`/api/visa/${id}`);
    return response.data;
  },
  generateSlots: async (startDate: string, endDate: string, bufferTime: number, availability: any[]) => {
    const response = await apiClient.post('/api/visa/slots/generate', { startDate, endDate, bufferTime, availability });
    return response.data;
  },
};

export const travelService = {
  getMyDocuments: async () => {
    const response = await apiClient.get('/api/travel/my');
    return response.data.data;
  },
  // Admin
  getAllDocuments: async () => {
    const response = await apiClient.get('/api/travel');
    return response.data.data;
  },
  uploadDocument: async (data: { applicationId: string; name: string; url: string }) => {
    const response = await apiClient.post('/api/travel/upload', data);
    return response.data.data;
  },
  publishDocuments: async (applicationId: string) => {
    const response = await apiClient.post('/api/travel/publish', { applicationId });
    return response.data;
  },
  deleteDocument: async (id: string) => {
    const response = await apiClient.delete(`/api/travel/${id}`);
    return response.data;
  },
};

