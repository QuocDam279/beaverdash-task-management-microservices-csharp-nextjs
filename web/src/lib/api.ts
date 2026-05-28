const BASE_URL = "http://localhost:5000/api";

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("beaverdash_token") : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("beaverdash_token");
      localStorage.removeItem("beaverdash_user");
      window.location.href = "/login";
    }
    throw new Error("Phiên làm việc hết hạn.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || errorData.detail || `Yêu cầu thất bại với mã ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, body?: any, options?: RequestInit) => request(endpoint, { 
    ...options, 
    method: "POST", 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  put: (endpoint: string, body?: any, options?: RequestInit) => request(endpoint, { 
    ...options, 
    method: "PUT", 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  patch: (endpoint: string, body?: any, options?: RequestInit) => request(endpoint, { 
    ...options, 
    method: "PATCH", 
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  delete: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "DELETE" }),
};
