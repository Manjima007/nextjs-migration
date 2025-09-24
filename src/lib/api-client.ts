class APIClient {
  private baseURL = '/api';

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('civiclink_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string>),
      },
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    console.log('API Request:', { url, config }); // Debug log

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  auth = {
    login: (email: string, password: string) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (userData: any) =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    getMe: () => this.request('/auth/me'),
  };

  // Issues methods
  issues = {
    getAll: (params: any = {}) => {
      // Convert all parameters to strings for URLSearchParams
      const stringParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>);
      
      const queryString = new URLSearchParams(stringParams).toString();
      return this.request(`/issues${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id: string) => this.request(`/issues/${id}`),

    create: (issueData: any) =>
      this.request('/issues', {
        method: 'POST',
        body: issueData instanceof FormData ? issueData : JSON.stringify(issueData),
      }),

    update: (id: string, updateData: any) =>
      this.request(`/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }),

    addFeedback: (id: string, feedback: any) =>
      this.request(`/issues/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback),
      }),
  };

  // Departments methods
  departments = {
    getAll: () => this.request('/departments'),
    
    getById: (id: string) => this.request(`/departments/${id}`),
  };

  // Users methods
  users = {
    getAll: (params: any = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/users${queryString ? `?${queryString}` : ''}`);
    },

    getById: (id: string) => this.request(`/users/${id}`),

    update: (id: string, userData: any) =>
      this.request(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
      }),
  };

  // Analytics methods
  analytics = {
    getDashboardStats: () => this.request('/analytics/dashboard'),
    
    getIssueStats: (params: any = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/analytics/issues${queryString ? `?${queryString}` : ''}`);
    },
  };
}

export const apiClient = new APIClient();