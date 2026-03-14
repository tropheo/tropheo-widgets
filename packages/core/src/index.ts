import type {
  TropheoWidgetsConfig,
  // StandingRow,
  StandingsResponse,
  HttpMethod,
  ApiResponse,
} from '@tropheo/types';

/**
 * HTTP Client for making authenticated requests to Tropheo API
 */
export class ApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.tropheo.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Make an authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    method: HttpMethod = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      };

      const options: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Fetch standings for an event
   * Returns both the event information and standings
   */
  async getStandings(eventId: string, scope?: string): Promise<ApiResponse<StandingsResponse>> {
    const scopeParam = scope ? `?scope=${encodeURIComponent(scope)}` : '';
    return this.request<StandingsResponse>(`/api/widgets/standings/${eventId}${scopeParam}`);
  }

  /**
   * Fetch sub-events (stages) for an event
   */
  async getSubEvents(parentEventId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/widgets/events?parentEventId=${parentEventId}`);
  }

  /**
   * Recompute standings (admin only)
   */
  async recomputeStandings(
    eventId: string,
    config: {
      tieBreakers?: string[];
      pointsPerWin?: number;
      pointsPerTie?: number;
      pointsPerLoss?: number;
      pointsPerShootoutWin?: number;
      enableShootout?: boolean;
      persistSettings?: boolean;
      recomputeChildren?: boolean;
    }
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/api/widgets/standings/${eventId}/recompute`,
      'POST',
      config
    );
  }
}

/**
 * Main TropheoWidgets class
 */
export class TropheoWidgets {
  private config: Required<TropheoWidgetsConfig>;
  private client: ApiClient;

  constructor(config: TropheoWidgetsConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.tropheo.com',
      locale: config.locale || 'en',
      theme: config.theme || {},
    };

    this.client = new ApiClient(this.config.apiKey, this.config.baseUrl);
  }

  /**
   * Get API client instance
   */
  getClient(): ApiClient {
    return this.client;
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<TropheoWidgetsConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<TropheoWidgetsConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };

    if (updates.apiKey || updates.baseUrl) {
      this.client = new ApiClient(
        updates.apiKey || this.config.apiKey,
        updates.baseUrl || this.config.baseUrl
      );
    }
  }
}

export default TropheoWidgets;
