// API service for connecting to the deployed backend
const API_BASE_URL = 'https://argonzassmnt-backend.onrender.com';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Health check
  async getHealth() {
    return this.request('/api/health');
  }

  // Categories
  async getCategories() {
    return this.request('/api/categories');
  }

  // Mentors
  async getMentors() {
    return this.request('/api/mentors');
  }

  async getMentorById(id: string) {
    return this.request(`/api/mentors/${id}`);
  }

  async followMentor(mentorId: string) {
    return this.request(`/api/mentors/${mentorId}/follow`, {
      method: 'POST',
    });
  }

  // Tasks
  async getTasks() {
    return this.request('/api/tasks');
  }

  async getTaskById(id: string) {
    return this.request(`/api/tasks/${id}`);
  }

  async updateTaskProgress(taskId: string, progress: number) {
    return this.request(`/api/tasks/${taskId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
