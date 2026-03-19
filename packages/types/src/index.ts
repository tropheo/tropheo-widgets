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

  /**
   * Language for text labels (default: 'en')
   */
  lang?: 'en' | 'es';
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

// ============ Leaderboard Types ============

/**
 * Sport types
 */
export type Sport = 'basketball' | 'baseball' | 'softball' | 'soccer';

/**
 * Stats facets by sport
 */
export type Facet = 'basketball' | 'batting' | 'pitching' | 'fielding' | 'soccer' | 'goalkeeping';

/**
 * Scope types for stats aggregation
 */
export type ScopeType = 'TOURNAMENT' | 'DIVISION' | 'STAGE' | 'GAMEDAY';

/**
 * Leaderboard mode (athletes or teams)
 */
export type LeaderboardMode = 'athletes' | 'teams';

/**
 * Sort keys for basketball
 */
export type BasketballSortKey =
  | 'pts'
  | 'reb'
  | 'ast'
  | 'stl'
  | 'blk'
  | 'fg3'
  | 'fg2'
  | 'ft'
  | 'to'
  | 'gamesPlayed';

/**
 * Sort keys for batting
 */
export type BattingSortKey =
  | 'avg'
  | 'ops'
  | 'obp'
  | 'slg'
  | 'h'
  | 'doubles'
  | 'triples'
  | 'hr'
  | 'rbi'
  | 'bb'
  | 'so'
  | 'sb'
  | 'tb'
  | 'ab'
  | 'r'
  | 'gamesPlayed';

/**
 * Sort keys for pitching
 */
export type PitchingSortKey =
  | 'era'
  | 'whip'
  | 'so'
  | 'outs'
  | 'er'
  | 'h'
  | 'bb'
  | 'hr'
  | 'ip'
  | 'gamesPlayed';

/**
 * Sort keys for fielding
 */
export type FieldingSortKey = 'tc' | 'a' | 'po' | 'e' | 'dp' | 'tp' | 'fpct' | 'gamesPlayed';

/**
 * Sort keys for soccer
 */
export type SoccerSortKey =
  | 'g'
  | 'a'
  | 'sh'
  | 'sot'
  | 'yc'
  | 'rc'
  | 'bc'
  | 'min'
  | 'fc'
  | 'fs'
  | 'off'
  | 'shotAcc'
  | 'gamesPlayed';

/**
 * Sort keys for goalkeeping
 */
export type GoalkeepingSortKey =
  | 'sv'
  | 'ga'
  | 'yc'
  | 'rc'
  | 'bc'
  | 'min'
  | 'fc'
  | 'fs'
  | 'savePct'
  | 'gamesPlayed';

/**
 * All possible sort keys
 */
export type SortKey =
  | BasketballSortKey
  | BattingSortKey
  | PitchingSortKey
  | FieldingSortKey
  | SoccerSortKey
  | GoalkeepingSortKey;

/**
 * Sort direction
 */
export type SortDir = 'asc' | 'desc';

/**
 * Stat totals (cumulative stats)
 */
export interface StatTotals {
  // Basketball
  pts?: number;
  reb?: number;
  ast?: number;
  stl?: number;
  blk?: number;
  fg3?: number;
  fg2?: number;
  ft?: number;
  to?: number;
  // Baseball batting
  ab?: number;
  r?: number;
  h?: number;
  doubles?: number;
  triples?: number;
  hr?: number;
  rbi?: number;
  bb?: number;
  so?: number;
  hbp?: number;
  sb?: number;
  cs?: number;
  sf?: number;
  tb?: number;
  // Baseball pitching
  outs?: number;
  er?: number;
  w?: number;
  l?: number;
  sv?: number;
  // Baseball fielding
  a?: number;
  po?: number;
  e?: number;
  dp?: number;
  tp?: number;
  tc?: number;
  // Soccer
  g?: number;
  sh?: number;
  sot?: number;
  yc?: number;
  rc?: number;
  bc?: number;
  min?: number;
  fc?: number;
  fs?: number;
  off?: number;
  // Goalkeeping
  ga?: number;
}

/**
 * Derived stats (calculated stats)
 */
export interface DerivedStats {
  avg?: number | null;
  obp?: number | null;
  slg?: number | null;
  ops?: number | null;
  era?: number | null;
  whip?: number | null;
  tb?: number;
  tc?: number;
  fpct?: number | null;
  shotAcc?: number | null;
  savePct?: number | null;
  ip?: string | null;
}

/**
 * Leaderboard entry (athlete or team)
 */
export interface LeaderboardEntry {
  athleteId?: string;
  rosterId?: string;
  organizationId?: string;
  gamesPlayed: number;
  totals: StatTotals;
  derived: DerivedStats;
  athlete?: { name: string; profilePicture?: string; alias?: string } | null;
  roster?: { name: string; alias?: string } | null;
  organization?: { name: string; profilePicture?: string; alias?: string } | null;
}

/**
 * Leaderboard API response
 */
export interface LeaderboardResponse {
  event: EventData;
  data: LeaderboardEntry[];
  statsEnabled: boolean;
  success: boolean;
}

/**
 * Configuration for leaderboard widget
 */
export interface LeaderboardWidgetConfig {
  /**
   * Event ID to fetch leaderboard for
   */
  eventId: string;

  /**
   * Scope type (TOURNAMENT, DIVISION, STAGE, GAMEDAY)
   */
  scopeType: ScopeType;

  /**
   * Sport type
   */
  sport: Sport;

  /**
   * Stats facet
   */
  facet: Facet;

  /**
   * Leaderboard mode (athletes or teams)
   */
  mode?: LeaderboardMode;

  /**
   * Sort key
   */
  sort?: SortKey;

  /**
   * Maximum number of entries to show
   */
  limit?: number;

  /**
   * Custom title for the leaderboard
   */
  title?: string;

  /**
   * Show empty state when no data available
   */
  showEmptyState?: boolean;

  /**
   * Custom CSS class names
   */
  className?: string;

  /**
   * Container element or selector to render into
   */
  container?: HTMLElement | string;

  /**
   * Custom event URL for links
   */
  eventUrl?: string;

  /**
   * Base URL for constructing event link (default: https://app.tropheo.mx)
   */
  baseUrl?: string;

  /**
   * Language for text labels (default: 'en')
   */
  lang?: 'en' | 'es';
}
