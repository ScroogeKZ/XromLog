import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  age?: number;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

let currentUser: User | null = null;
let authToken: string | null = null;

export const auth = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    const data = await response.json();
    
    authToken = data.token;
    currentUser = data.user;
    
    // Store in localStorage
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("current_user", JSON.stringify(data.user));
    
    return data;
  },

  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", { username, password });
    const data = await response.json();
    
    authToken = data.token;
    currentUser = data.user;
    
    // Store in localStorage
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("current_user", JSON.stringify(data.user));
    
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    if (currentUser) return currentUser;
    
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        authToken = token;
        console.log("Current user loaded:", data.user);
        return data.user;
      } else {
        console.log("Auth failed, clearing token");
        this.logout();
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      this.logout();
    }
    
    return null;
  },

  logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
  },

  getToken(): string | null {
    return authToken || localStorage.getItem("auth_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

// Override the default fetch to include auth token
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  const token = auth.getToken();
  
  if (token && typeof input === 'string' && input.startsWith('/api/')) {
    init = init || {};
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`
    };
  }
  
  return originalFetch(input, init);
};
