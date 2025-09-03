// API 설정 및 유틸리티 함수들
import { Clan, Player, Match, Contest, Grade, MatchUpDateRequest } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 디버깅용 로그
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      // 네트워크 오류 시 더 구체적인 에러 메시지 제공
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      }
      throw error;
    }
  }

  // GET 요청
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST 요청
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 요청
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스
export const apiClient = new ApiClient(API_BASE_URL);

// 각 도메인별 API 함수들
export const clanApi = {
  getAll: (includeDeleted: boolean = false) => {
    const endpoint = includeDeleted ? '/clans?includeDeleted=true' : '/clans';
    return apiClient.get<PaginatedResponse<Clan>>(endpoint).then(response => ({
      ...response,
      data: response.data.content
    }));
  },
  getById: (id: number) => {
    return apiClient.get<Clan>(`/clans/${id}`);
  },
  create: (data: Partial<Clan>) => apiClient.post<Clan>('/clans', data),
  update: (id: number, data: Partial<Clan>) => apiClient.put<Clan>(`/clans/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/clans/${id}`),
};

export const playerApi = {
  getAll: (searchCondition: { nickname?: string; grade?: string } = {}, includeDeleted: boolean = false, page: number = 0, size?: number, sorts: Array<{ field: string; direction: 'asc' | 'desc' }> = []) => {
    const params = new URLSearchParams({
      page: page.toString()
    });
    if (size !== undefined) {
      params.append('size', size.toString());
    }
    if (includeDeleted) {
      params.append('includeDeleted', 'true');
    }
    // SearchCondition 파라미터 추가
    if (searchCondition.nickname && searchCondition.nickname.trim()) {
      params.append('nickname', searchCondition.nickname.trim());
    }
    if (searchCondition.grade && searchCondition.grade.trim()) {
      params.append('grade', searchCondition.grade.trim());
    }
    // 다중 정렬 지원: sort=field1,direction1&sort=field2,direction2
    sorts.forEach(sort => {
      params.append('sort', `${sort.field},${sort.direction}`);
    });
    
    return apiClient.get<PaginatedResponse<Player>>(`/players?${params.toString()}`);
  },

  getById: (id: number) => {
    return apiClient.get<Player>(`/players/${id}`);
  },
  create: (data: Partial<Player> & { gradeId?: number }) => {
    return apiClient.post<Player>('/players', data);
  },
  update: (id: number, data: Partial<Player> & { gradeId?: number }) => {
    return apiClient.put<Player>(`/players/${id}`, data);
  },
  delete: (id: number) => {
    return apiClient.delete<void>(`/players/${id}`);
  },
};

export const matchApi = {
  getAll: (sorts: Array<{ field: string; direction: 'asc' | 'desc' }> = []) => {
    const params = new URLSearchParams();
    sorts.forEach(sort => {
      params.append('sort', `${sort.field},${sort.direction}`);
    });
    const url = sorts.length > 0 ? `/matches?${params.toString()}` : '/matches';
    return apiClient.get<PaginatedResponse<Match>>(url).then(response => ({
      ...response,
      data: response.data.content
    }));
  },
  getById: (id: number) => apiClient.get<Match>(`/matches/${id}`),
  create: (data: Partial<Match>) => apiClient.post<Match>('/matches', data),
  update: (id: number, data: Partial<MatchUpDateRequest>) => apiClient.put<Match>(`/matches/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/matches/${id}`),
};

export const contestApi = {
  getAll: () => apiClient.get<PaginatedResponse<Contest>>('/contests').then(response => ({
    ...response,
    data: response.data.content
  })),
  getById: (id: number) => apiClient.get<Contest>(`/contests/${id}`),
  create: (data: Partial<Contest>) => apiClient.post<Contest>('/contests', data),
  update: (id: number, data: Partial<Contest>) => apiClient.put<Contest>(`/contests/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/contests/${id}`),
};

export const gradeApi = {
  getAll: (includeDeleted: boolean = false, page: number = 0, size?: number) => {
    const params = new URLSearchParams({
      page: page.toString()
    });
    if (size !== undefined) {
      params.append('size', size.toString());
    }
    if (includeDeleted) {
      params.append('includeDeleted', 'true');
    }
    
    return apiClient.get<PaginatedResponse<Grade>>(`/grades?${params.toString()}`);
  },
  getById: (id: number) => apiClient.get<Grade>(`/grades/${id}`),
  create: (data: Partial<Grade>) => {
    return apiClient.post<Grade>('/grades', data);
  },
  update: (id: number, data: Partial<Grade>) => {
    return apiClient.put<Grade>(`/grades/${id}`, data);
  },
  delete: (id: number) => {
    return apiClient.delete<void>(`/grades/${id}`);
  },
};