/**
 * Configuration options for TropheoWidgets instance
 */
export interface TropheoWidgetsConfig {
  /**
   * API key for authentication
   */
  apiKey: string;

  /**
   * Base URL of the Tropheo instance
   * @default 'https://api.tropheo.com'
   */
  baseUrl?: string;

  /**
   * Locale for translations
   * @default 'en'
   */
  locale?: string;

  /**
   * Custom theme configuration
   */
  theme?: ThemeConfig;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: string;
}

/**
 * Configuration for standings widget
 */
export interface StandingsWidgetConfig {
  /**
   * Event ID to fetch standings for
   */
  eventId: string;

  /**
   * Event role (POOL, BRACKET_STAGE, DIVISION, TOURNAMENT_ROOT)
   */
  eventRole?: string | null;

  /**
   * Custom title for the standings table
   */
  title?: string;

  /**
   * Show empty state when no standings available
   */
  showEmptyState?: boolean;

  /**
   * Enable admin features (recompute, etc)
   */
  isAdmin?: boolean;

  /**
   * Refresh trigger counter
   */
  refreshTrigger?: number;

  /**
   * Custom CSS class names
   */
  className?: string;

  /**
   * Container element or selector to render into
   */
  container?: HTMLElement | string;

  /**
   * Custom event URL for "Ver en Tropheo" button
   */
  eventUrl?: string;

  /**
   * Base URL for constructing event link (default: https://app.tropheo.mx)
   */
  baseUrl?: string;
}

/**
 * Standing row data
 */
export interface StandingRow {
  id?: string;
  roster?: any;
  organization?: {
    profilePicture?: string;
    profileThumbnail?: string;
    name?: string;
  };
  participantName?: string;
  wins?: number;
  losses?: number;
  ties?: number;
  points?: number;
  gamesPlayed?: number;
  winPercentage?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  pointDifferential?: number;
  groupLabel?: string;
  meta?: {
    tieBreakers?: string[];
    pointsPerWin?: number;
    pointsPerTie?: number;
    pointsPerLoss?: number;
    pointsPerShootoutWin?: number;
    enableShootout?: boolean;
    appliedAt?: string;
  };
}

/**
 * Event data
 */
export interface EventData {
  id: string;
  name: string;
  eventRole: EventRole;
  type?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Standings API response
 */
export interface StandingsResponse {
  event: EventData;
  standings: StandingRow[];
  scope: string;
}

/**
 * Stage standings data
 */
export interface StageStandingsData {
  stage: any;
  rows: StandingRow[];
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Event role types
 */
export type EventRole =
  | 'POOL'
  | 'BRACKET_STAGE'
  | 'DIVISION'
  | 'TOURNAMENT_ROOT'
  | 'GAME'
  | 'GAMEDAY'
  | null;

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
