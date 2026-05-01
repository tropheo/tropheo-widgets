import { TropheoWidgets, ApiClient } from '@tropheo/core';
import type {
  TropheoWidgetsConfig,
  StandingsWidgetConfig,
  StandingRow,
  LeaderboardWidgetConfig,
  LeaderboardEntry,
  Facet,
  SortKey,
  Sport,
  ScopeType,
  LeaderboardMode,
  EventRole,
  StandingsTheme,
} from '@tropheo/types';

/**
 * Translations for embed widgets
 */
const translations = {
  en: {
    loadingStandings: 'Loading standings...',
    loadingLeaderboard: 'Loading leaderboard...',
    error: 'Error',
    noStandings: 'No standings available yet.',
    noStats: 'No stats available yet.',
    statsDisabled: 'Stats are not enabled for this event.',
    athlete: 'Athlete',
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
    team: 'Team',
    divisionStandings: 'Division Standings',
    athletes: 'Athletes',
    teams: 'Teams',
    batting: 'Batting',
    pitching: 'Pitching',
    fielding: 'Fielding',
    soccerFacet: 'Soccer',
    goalkeeping: 'Goalkeeping',
    // Stats header abbreviations (keep same for both languages as they're standard)
    gp: 'GP',
    w: 'W',
    l: 'L',
    t: 'T',
    gb: 'GB',
    pts: 'PTS',
    winPct: 'WIN%',
    pf: 'PF',
    pa: 'PA',
    diff: 'DIFF',
  },
  es: {
    loadingStandings: 'Cargando posiciones...',
    loadingLeaderboard: 'Cargando tabla de líderes...',
    error: 'Error',
    noStandings: 'No hay posiciones disponibles aún.',
    noStats: 'No hay estadísticas disponibles aún.',
    statsDisabled: 'Las estadísticas no están habilitadas para este evento.',
    athlete: 'Atleta',
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
    team: 'Equipo',
    divisionStandings: 'Posiciones de División',
    athletes: 'Atletas',
    teams: 'Equipos',
    batting: 'Bateo',
    pitching: 'Pitcheo',
    fielding: 'Fildeo',
    soccerFacet: 'Fútbol',
    goalkeeping: 'Porteros',
    // Stats header abbreviations (keep same for both languages as they're standard)
    gp: 'PJ',
    w: 'G',
    l: 'P',
    t: 'E',
    gb: 'JD',
    pts: 'PTS',
    winPct: '% VIC',
    pf: 'PF',
    pa: 'PC',
    diff: 'DIF',
  },
};

type Language = 'en' | 'es';

/**
 * Embed script for loading Tropheo Widgets via vanilla JavaScript
 * Can be loaded via <script> tag and used without any build tools
 */

// Declare global namespace
declare global {
  interface Window {
    TropheoWidgets: typeof TropheoWidgets;
    TropheoEmbed: typeof TropheoEmbed;
  }
}

/**
 * TropheoEmbed class for vanilla JS usage
 */
export class TropheoEmbed {
  private widgets: TropheoWidgets;
  private client: ApiClient;

  constructor(config: TropheoWidgetsConfig) {
    this.widgets = new TropheoWidgets(config);
    this.client = this.widgets.getClient();
  }

  /**
   * Render a standings table into a DOM element.
   * Automatically handles hierarchical loading for DIVISION / TOURNAMENT_ROOT / SEASON / LEAGUE.
   */
  async renderStandings(config: StandingsWidgetConfig): Promise<void> {
    const container = this.getContainer(config.container);
    if (!container) {
      throw new Error('Container element not found');
    }

    const lang: Language = config.lang || 'en';
    const t = translations[lang];

    // ── Resolved theme (defaults preserved when not overridden) ────────────────
    const th = {
      tableBackground: config.theme?.tableBackground ?? '#ffffff',
      columnHeaderColor: config.theme?.columnHeaderColor ?? '#374151',
      rowTextColor: config.theme?.rowTextColor ?? '#374151',
      rowBorderColor: config.theme?.rowBorderColor ?? '#f3f4f6',
      borderColor: config.theme?.borderColor ?? '#e5e7eb',
      footerBackground: config.theme?.footerBackground ?? '#f9fafb',
      buttonBackground: config.theme?.buttonBackground ?? '#3b82f6',
      buttonTextColor: config.theme?.buttonTextColor ?? '#ffffff',
      positiveColor: config.theme?.positiveColor ?? '#10b981',
      negativeColor: config.theme?.negativeColor ?? '#ef4444',
    };

    // Show loading state
    container.innerHTML = `<div style="padding: 20px; text-align: center;">${t.loadingStandings}</div>`;

    try {
      // Fetch data — the API uses the event's eventRole to determine default scope
      const response = await this.client.getStandings(config.eventId);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load standings');
      }

      const { event, standings } = response.data;

      // eventRole from config overrides what the API returns
      const eventRole = (config.eventRole as string | null) ?? event.eventRole;
      const title = config.title || event.name;

      const isDivisionOrRoot =
        eventRole === 'DIVISION' ||
        eventRole === 'TOURNAMENT_ROOT' ||
        eventRole === 'SEASON' ||
        eventRole === 'LEAGUE';

      if (isDivisionOrRoot) {
        await this.loadAndRenderHierarchical(
          container,
          event,
          eventRole,
          title,
          config,
          lang,
          th,
          standings
        );
      } else {
        this.renderStandingsTable(container, standings, title, config, lang, th);
      }
    } catch (error) {
      container.innerHTML = `<div style="padding: 20px; color: #ef4444;">${t.error}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }</div>`;
    }
  }

  /**
   * Load and render hierarchical standings for DIVISION / TOURNAMENT_ROOT / SEASON / LEAGUE events.
   * Mirrors the logic in packages/react/src/StandingsTable.tsx (loadStandings isMobileMode branch).
   */
  private async loadAndRenderHierarchical(
    container: HTMLElement,
    event: any,
    eventRole: string | null,
    title: string,
    config: StandingsWidgetConfig,
    lang: Language,
    th: Required<Omit<StandingsTheme, never>>,
    fallbackStandings: any[] = []
  ): Promise<void> {
    const t = translations[lang];

    // 1. Fetch direct sub-events
    const subEventsRes = await this.client.getSubEvents(event.id);
    const subEventsData = subEventsRes.success && subEventsRes.data ? subEventsRes.data : [];
    const regularSubEvents = subEventsData.filter((e: any) => !e.isCategory);

    let stageEvents = regularSubEvents.filter((e: any) =>
      ['POOL', 'BRACKET_STAGE'].includes(e.eventRole || '')
    );

    // 2. For root-like roles with no direct stages, look under division children
    if (
      (eventRole === 'TOURNAMENT_ROOT' || eventRole === 'SEASON' || eventRole === 'LEAGUE') &&
      stageEvents.length === 0
    ) {
      const divisions = regularSubEvents.filter((e: any) => e.eventRole === 'DIVISION');
      const divisionChildren = await Promise.all(
        divisions.map(async (div: any) => {
          const divId = div.id || div._id;
          if (!divId) return [];
          const res = await this.client.getSubEvents(divId);
          return res.success && res.data ? res.data : [];
        })
      );
      stageEvents = divisionChildren
        .flat()
        .filter((e: any) => !e.isCategory && ['POOL', 'BRACKET_STAGE'].includes(e.eventRole || ''));
    }

    // 3. Load standings for each stage in parallel
    const stageResults = await Promise.all(
      stageEvents.map(async (stage: any) => {
        const stageId = stage.id || stage._id;
        if (!stageId) return null;
        const scope = stage.eventRole === 'POOL' ? 'POOL' : 'BRACKET';
        const res = await this.client.getStandings(stageId, scope);
        if (res.success && res.data) {
          return { stage, rows: (res.data.standings || res.data) as any[] };
        }
        return null;
      })
    );
    const validStages = stageResults.filter(Boolean) as Array<{ stage: any; rows: any[] }>;

    // 4. Load division + overall standings in parallel
    const [divRes, overallRes] = await Promise.all([
      this.client.getStandings(event.id, 'DIVISION'),
      this.client.getStandings(event.id, 'OVERALL'),
    ]);
    const divRows = divRes.success && divRes.data ? divRes.data.standings || [] : [];
    const overallRows =
      overallRes.success && overallRes.data ? overallRes.data.standings || [] : [];
    let summaryRows = divRows.length > 0 ? divRows : overallRows;

    // Fallback: if both DIVISION and OVERALL return empty AND no stages were found,
    // call without scope so the backend auto-expands SEASON/LEAGUE to child POOL standings.
    if (summaryRows.length === 0 && validStages.length === 0) {
      const fallbackRes = await this.client.getStandings(event.id);
      if (fallbackRes.success && fallbackRes.data) {
        summaryRows = fallbackRes.data.standings || [];
      }
    }

    // 5. Render hierarchical HTML
    const className = config.className || '';
    const finalEventUrl =
      config.eventUrl || `${config.baseUrl || 'https://www.tropheo.com'}/events/${config.eventId}`;

    const hasContent = validStages.some((e) => e.rows.length > 0) || summaryRows.length > 0;
    if (!hasContent) {
      // Fallback: use the standings returned by the initial getStandings call (no scope param)
      if (fallbackStandings && fallbackStandings.length > 0) {
        this.renderStandingsTable(container, fallbackStandings, title, config, lang, th);
        return;
      }
      container.innerHTML = config.showEmptyState
        ? `<div class="${className}" style="padding: 20px; text-align: center; color: #6b7280;">${t.noStandings}</div>`
        : '';
      return;
    }

    let stagesHtml = '';
    for (const entry of validStages) {
      if (!entry.rows.length) continue;
      const stageName = entry.stage.name || entry.stage.eventRole || 'Stage';
      stagesHtml += `
        <details open style="margin-bottom: 16px;">
          <summary style="
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 16px; border: 1px solid ${th.borderColor}; border-radius: 8px;
            background: ${th.footerBackground}; cursor: pointer; font-weight: 500; list-style: none;
            user-select: none; color: ${th.rowTextColor};
          ">${stageName}</summary>
          <div style="overflow-x: auto; margin-top: 8px;">
            ${this.renderSingleTable(entry.rows as any, 1, lang, th)}
          </div>
        </details>
      `;
    }

    if (summaryRows.length > 0) {
      stagesHtml += `
        <div style="margin-top: ${validStages.length > 0 ? '24px' : '0'};">
          <h4 style="font-weight: 600; margin-bottom: 12px; font-size: 14px; color: ${th.columnHeaderColor};">
            ${t.divisionStandings}
          </h4>
          <div style="overflow-x: auto;">
            ${this.renderSingleTable(summaryRows as any, 1, lang, th)}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="${className}" style="border: 1px solid ${th.borderColor}; border-radius: 8px; background-color: ${th.tableBackground}; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid ${th.borderColor};">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0; color: ${th.rowTextColor};">${title}</h3>
        </div>
        <div style="padding: 16px 24px;">
          ${stagesHtml}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid ${th.borderColor}; background-color: ${th.footerBackground};">
          <span style="font-size: 11px; color: #6b7280;">
            ${t.poweredBy} <span style="font-weight: 600; color: ${th.rowTextColor};">Tropheo</span>
          </span>
          <a href="${finalEventUrl}" target="_blank" rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: ${th.buttonTextColor}; background-color: ${th.buttonBackground}; border: none; border-radius: 6px; text-decoration: none; cursor: pointer;"
             onmouseover="this.style.opacity='0.85'"
             onmouseout="this.style.opacity='1'">
            ${t.viewOn}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Map event role to ScopeType
   */
  private mapEventRoleToScopeType(role: EventRole | string | null | undefined): ScopeType {
    switch (role) {
      case 'POOL':
      case 'BRACKET_STAGE':
        return 'STAGE';
      case 'DIVISION':
        return 'DIVISION';
      case 'GAMEDAY':
        return 'GAMEDAY';
      default:
        return 'TOURNAMENT';
    }
  }

  /**
   * Map sport to its default facet
   */
  private mapSportToDefaultFacet(sport: Sport): Facet {
    switch (sport) {
      case 'basketball':
        return 'basketball';
      case 'baseball':
      case 'softball':
        return 'batting';
      case 'soccer':
        return 'soccer';
      default:
        return 'basketball';
    }
  }

  /**
   * Get facet tab definitions for a sport (null = single facet)
   */
  private getFacetTabDefs(
    sport: Sport | null,
    t: (typeof translations)['en']
  ): Array<{ key: Facet; label: string }> | null {
    switch (sport) {
      case 'baseball':
      case 'softball':
        return [
          { key: 'batting', label: t.batting },
          { key: 'pitching', label: t.pitching },
          { key: 'fielding', label: t.fielding },
        ];
      case 'soccer':
        return [
          { key: 'soccer', label: t.soccerFacet },
          { key: 'goalkeeping', label: t.goalkeeping },
        ];
      default:
        return null;
    }
  }

  /**
   * Render a leaderboard table into a DOM element
   */
  /**
   * Render a leaderboard table into a DOM element.
   * scopeType, sport, and facet are optional — auto-detected from the event if not provided.
   * Renders interactive facet tabs (for baseball/softball/soccer) and mode tabs (Athletes/Teams).
   */
  async renderLeaderboard(config: LeaderboardWidgetConfig): Promise<void> {
    const container = this.getContainer(config.container);
    if (!container) {
      throw new Error('Container element not found');
    }

    const lang: Language = config.lang || 'en';
    const t = translations[lang];
    const className = config.className || '';
    const baseUrl = config.baseUrl || 'https://www.tropheo.com';
    const eventUrl = config.eventUrl || `${baseUrl}/events/${config.eventId}`;

    // ── Resolved theme (defaults preserved when not overridden) ─────────────
    const th = {
      headerBackground:
        config.theme?.headerBackground ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      headerTextColor: config.theme?.headerTextColor ?? '#ffffff',
      activeTabColor: config.theme?.activeTabColor ?? '#3b82f6',
      inactiveTabColor: config.theme?.inactiveTabColor ?? '#6b7280',
      tableBackground: config.theme?.tableBackground ?? '#ffffff',
      columnHeaderColor: config.theme?.columnHeaderColor ?? '#374151',
      rowTextColor: config.theme?.rowTextColor ?? '#374151',
      rowBorderColor: config.theme?.rowBorderColor ?? '#f3f4f6',
      borderColor: config.theme?.borderColor ?? '#e5e7eb',
      footerBackground: config.theme?.footerBackground ?? '#f9fafb',
      buttonBackground: config.theme?.buttonBackground ?? '#3b82f6',
      buttonTextColor: config.theme?.buttonTextColor ?? '#ffffff',
      avatarBackground: config.theme?.avatarBackground ?? '#e5e7eb',
    };

    container.innerHTML = `<div style="padding: 20px; text-align: center;">${t.loadingLeaderboard}</div>`;

    try {
      // 1. Resolve scopeType + sport (from props or API)
      let resolvedScopeType: ScopeType | undefined = config.scopeType;
      let resolvedSport: Sport | undefined = config.sport;

      if (!resolvedScopeType || !resolvedSport) {
        const eventRes = await this.client.getStandings(config.eventId);
        if (eventRes.success && eventRes.data?.event) {
          const event = eventRes.data.event;
          resolvedScopeType = resolvedScopeType || this.mapEventRoleToScopeType(event.eventRole);
          const rawSport = (event as any).sport || (event as any).sports;
          const firstSport = Array.isArray(rawSport) ? rawSport[0] : rawSport;
          resolvedSport = resolvedSport || (firstSport as Sport) || undefined;
        }
      }

      // Final fallbacks — scopeType defaults to TOURNAMENT, sport to basketball
      if (!resolvedScopeType) resolvedScopeType = 'TOURNAMENT';
      if (!resolvedSport) resolvedSport = 'basketball';

      // 2. Mutable tab state (closures capture these)
      const defaultFacet: Facet = config.facet || this.mapSportToDefaultFacet(resolvedSport);
      let activeFacet: Facet = defaultFacet;
      // Lock mode to athletes when filtering by organization (teams tab won't be shown)
      let activeMode: LeaderboardMode = config.filterByOrganizationId
        ? 'athletes'
        : config.mode || 'athletes';

      const facetTabDefs = this.getFacetTabDefs(resolvedSport, t);

      // 3. Render shell
      const title = config.title || 'Leaderboard';

      const tabStyle = (isActive: boolean) =>
        `padding: 10px 16px; font-size: 13px; font-weight: ${isActive ? 600 : 500}; border: none; background: none; cursor: pointer; border-bottom: ${isActive ? `2px solid ${th.activeTabColor}` : '2px solid transparent'}; color: ${isActive ? th.activeTabColor : th.inactiveTabColor}; margin-bottom: -1px; outline: none;`;

      const renderFacetTabsHtml = (): string => {
        if (!facetTabDefs || facetTabDefs.length <= 1) return '';
        return `
          <div style="display: flex; padding: 0 24px; border-bottom: 1px solid ${th.rowBorderColor};">
            ${facetTabDefs
              .map(
                (tab) =>
                  `<button data-facet="${tab.key}" style="${tabStyle(tab.key === activeFacet)}">${tab.label}</button>`
              )
              .join('')}
          </div>`;
      };

      const renderModeTabsHtml = (): string => {
        // When filtering by organization, hide Teams tab entirely
        if (config.filterByOrganizationId) {
          return `<div style="display: flex; padding: 0 24px;">
            <button data-mode="athletes" style="${tabStyle(true)}">${t.athletes}</button>
          </div>`;
        }
        return `
        <div style="display: flex; padding: 0 24px;">
          <button data-mode="athletes" style="${tabStyle(activeMode === 'athletes')}">${t.athletes}</button>
          <button data-mode="teams" style="${tabStyle(activeMode === 'teams')}">${t.teams}</button>
        </div>`;
      };

      container.innerHTML = `
        <div class="${className}" style="border: 1px solid ${th.borderColor}; border-radius: 8px; background-color: ${th.tableBackground}; overflow: hidden;">
          <div style="padding: 16px 24px; border-bottom: 1px solid ${th.borderColor}; background: ${th.headerBackground};">
            <h3 style="font-size: 18px; font-weight: 600; margin: 0; color: ${th.headerTextColor};">${title}</h3>
            <p data-subtitle style="font-size: 12px; margin: 4px 0 0 0; color: ${th.headerTextColor}; opacity: 0.9;"></p>
          </div>
          <div data-tab-bar style="display: flex; flex-direction: column; border-bottom: 1px solid ${th.borderColor};">
            ${renderFacetTabsHtml()}
            ${renderModeTabsHtml()}
          </div>
          <div data-leaderboard-content></div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid ${th.borderColor}; background-color: ${th.footerBackground};">
            <span style="font-size: 11px; color: ${th.inactiveTabColor};">
              ${t.poweredBy} <span style="font-weight: 600; color: ${th.rowTextColor};">Tropheo</span>
            </span>
            <a href="${eventUrl}" target="_blank" rel="noopener noreferrer"
               style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: ${th.buttonTextColor}; background-color: ${th.buttonBackground}; border: none; border-radius: 6px; text-decoration: none; cursor: pointer;"
               onmouseover="this.style.opacity='0.85'"
               onmouseout="this.style.opacity='1'">
              ${t.viewOn}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      `;

      const contentEl = container.querySelector<HTMLElement>('[data-leaderboard-content]')!;
      const subtitleEl = container.querySelector<HTMLElement>('[data-subtitle]')!;
      const tabBar = container.querySelector<HTMLElement>('[data-tab-bar]')!;

      // 4. Update tab button visual styles after state change
      const updateTabStyles = () => {
        container.querySelectorAll<HTMLButtonElement>('[data-facet]').forEach((btn) => {
          const isActive = btn.getAttribute('data-facet') === activeFacet;
          btn.style.borderBottom = isActive
            ? `2px solid ${th.activeTabColor}`
            : '2px solid transparent';
          btn.style.color = isActive ? th.activeTabColor : th.inactiveTabColor;
          btn.style.fontWeight = isActive ? '600' : '500';
        });
        container.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((btn) => {
          const isActive = btn.getAttribute('data-mode') === activeMode;
          btn.style.borderBottom = isActive
            ? `2px solid ${th.activeTabColor}`
            : '2px solid transparent';
          btn.style.color = isActive ? th.activeTabColor : th.inactiveTabColor;
          btn.style.fontWeight = isActive ? '600' : '500';
        });
      };

      // 5. Fetch data and render table into content element
      const loadAndRender = async () => {
        contentEl.innerHTML = `<div style="padding: 20px; text-align: center;">${t.loadingLeaderboard}</div>`;
        try {
          const sort = config.sort || this.getDefaultSort(activeFacet);
          const limit = config.limit || 50;

          const response = await this.client.getLeaderboard(
            config.eventId,
            resolvedScopeType!,
            resolvedSport!,
            activeFacet,
            activeMode,
            sort,
            limit
          );

          if (!response.success || !response.data) {
            throw new Error(response.error || 'Failed to load leaderboard');
          }

          const { event, data: leaderboardData, statsEnabled } = response.data;

          // Client-side filter by organization when filterByOrganizationId is set
          const filteredData = config.filterByOrganizationId
            ? leaderboardData.filter(
                (e: LeaderboardEntry) => e.organizationId === config.filterByOrganizationId
              )
            : leaderboardData;

          if (subtitleEl) {
            subtitleEl.textContent = `${event.name} · ${activeMode === 'athletes' ? t.athlete : t.team} · ${this.getStatLabel(activeFacet)}`;
          }

          if (!statsEnabled && !filteredData.length) {
            contentEl.innerHTML = config.showEmptyState
              ? `<div style="padding: 20px; text-align: center; color: #6b7280;">${t.statsDisabled}</div>`
              : '';
            return;
          }

          if (!filteredData.length) {
            contentEl.innerHTML = config.showEmptyState
              ? `<div style="padding: 20px; text-align: center; color: #6b7280;">${t.noStats}</div>`
              : '';
            return;
          }

          this.renderLeaderboardTable(
            contentEl,
            filteredData,
            config,
            lang,
            activeFacet,
            activeMode
          );
        } catch (err) {
          contentEl.innerHTML = `<div style="padding: 20px; color: #ef4444;">${t.error}: ${err instanceof Error ? err.message : 'Unknown error'}</div>`;
        }
      };

      // 6. Tab click via event delegation
      tabBar.addEventListener('click', async (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-facet],[data-mode]');
        if (!btn) return;
        const facetAttr = btn.getAttribute('data-facet');
        const modeAttr = btn.getAttribute('data-mode');
        if (facetAttr) activeFacet = facetAttr as Facet;
        if (modeAttr) activeMode = modeAttr as LeaderboardMode;
        updateTabStyles();
        await loadAndRender();
      });

      // 7. Initial load
      await loadAndRender();
    } catch (error) {
      container.innerHTML = `<div style="padding: 20px; color: #ef4444;">${t.error}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }</div>`;
    }
  }

  /**
   * Compute games behind for standings
   */
  private computeGamesBehind(standings: StandingRow[]): Map<number, number | null> {
    const result = new Map<number, number | null>();
    if (!standings?.length) return result;

    const leader = standings[0];
    const leaderW = leader.wins ?? 0;
    const leaderL = leader.losses ?? 0;

    standings.forEach((row, idx) => {
      const w = row.wins ?? 0;
      const l = row.losses ?? 0;
      const gb = (leaderW - w + l - leaderL) / 2;
      result.set(idx, gb <= 0 ? null : Math.round(gb * 10) / 10);
    });

    return result;
  }

  /**
   * Render a single standings table
   */
  /**
   * Render a single standings table
   */
  private renderSingleTable(
    rows: StandingRow[],
    startRank: number = 1,
    lang: Language = 'en',
    th: Required<Omit<StandingsTheme, never>>
  ): string {
    const gbMap = this.computeGamesBehind(rows);
    const t = translations[lang];

    let html = `
      <table style="width: 100%; min-width: 800px; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid ${th.borderColor};">
            <th style="text-align: left; padding: 12px 12px 12px 0; font-weight: 600; color: ${th.columnHeaderColor};">#</th>
            <th style="text-align: left; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.team}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.gp}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.w}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.l}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.t}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.gb}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.pts}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.winPct}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.pf}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.pa}</th>
            <th style="text-align: right; padding: 12px 0 12px 12px; font-weight: 600; color: ${th.columnHeaderColor};">${t.diff}</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach((row, idx) => {
      const name = row.participantName || t.team;
      const avatarUrl = row.organization?.profilePicture || row.organization?.profileThumbnail;
      const initials = name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const winPct = row.winPercentage ?? 0;
      const diff = row.pointDifferential ?? 0;
      const diffColor = diff >= 0 ? th.positiveColor : th.negativeColor;
      const gb = gbMap.get(idx);

      html += `
        <tr style="border-bottom: ${idx < rows.length - 1 ? `1px solid ${th.rowBorderColor}` : 'none'};">
          <td style="padding: 12px 12px 12px 0; color: #6b7280; font-weight: 500;">${startRank + idx}</td>
          <td style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${
                avatarUrl
                  ? `<img src="${avatarUrl}" alt="${name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
                  : `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #6b7280;">${initials}</div>`
              }
              <span style="font-weight: 500; color: ${th.rowTextColor};">${name}</span>
            </div>
          </td>
          <td style="padding: 12px; text-align: right; color: ${th.rowTextColor};">${row.gamesPlayed ?? 0}</td>
          <td style="padding: 12px; text-align: right; font-weight: 600; color: ${th.rowTextColor};">${row.wins ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: ${th.rowTextColor};">${row.losses ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: ${th.rowTextColor};">${row.ties ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: #6b7280;">
            ${gb !== null && gb !== undefined ? gb.toFixed(1) : '—'}
          </td>
          <td style="padding: 12px; text-align: right; font-weight: 600; color: ${th.rowTextColor};">${row.points ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: #6b7280;">${winPct.toFixed(3)}</td>
          <td style="padding: 12px; text-align: right; color: ${th.rowTextColor};">${row.pointsFor ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: ${th.rowTextColor};">${row.pointsAgainst ?? 0}</td>
          <td style="padding: 12px 0 12px 12px; text-align: right; color: ${diffColor};">
            ${diff >= 0 ? '+' : ''}${diff}
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  }

  /**
   * Render standings table HTML with grouping support
   */
  private renderStandingsTable(
    container: HTMLElement,
    standings: StandingRow[],
    title: string,
    config: StandingsWidgetConfig,
    lang: Language = 'en',
    th: Required<Omit<StandingsTheme, never>>
  ): void {
    const className = config.className || '';
    const t = translations[lang];
    const finalEventUrl =
      config.eventUrl || `${config.baseUrl || 'https://www.tropheo.com'}/events/${config.eventId}`;

    if (!standings.length) {
      if (config.showEmptyState) {
        container.innerHTML = `
          <div class="${className}" style="padding: 20px; text-align: center; color: #6b7280;">
            ${t.noStandings}
          </div>
        `;
      } else {
        container.innerHTML = '';
      }
      return;
    }

    // Group standings by groupLabel
    const byGroup = new Map<string, StandingRow[]>();
    for (const row of standings) {
      const label = ((row as any).groupLabel || '').trim() || '\0';
      if (!byGroup.has(label)) {
        byGroup.set(label, []);
      }
      byGroup.get(label)!.push(row);
    }

    const groups = Array.from(byGroup.entries()).map(([label, groupRows]) => ({
      groupLabel: label === '\0' ? null : label,
      rows: groupRows,
    }));

    // Calculate starting rank for each group
    let cumulativeRank = 1;
    let groupsHtml = '';

    groups.forEach(({ groupLabel, rows: groupRows }) => {
      const startRank = cumulativeRank;
      cumulativeRank += groupRows.length;

      // Add group header if there's a label
      if (groupLabel) {
        groupsHtml += `
          <div style="margin-bottom: 12px;">
            <h4 style="font-weight: 600; font-size: 14px; color: ${th.columnHeaderColor}; margin: 0 0 12px 0;">
              ${groupLabel}
            </h4>
          </div>
        `;
      }

      // Add the table for this group
      groupsHtml += `
        <div style="overflow-x: auto; margin-bottom: ${groupLabel ? '32px' : '0'};">
          ${this.renderSingleTable(groupRows, startRank, lang, th)}
        </div>
      `;
    });

    const html = `
      <div class="${className}" style="border: 1px solid ${th.borderColor}; border-radius: 8px; background-color: ${th.tableBackground}; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid ${th.borderColor};">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0; color: ${th.rowTextColor};">${title}</h3>
        </div>
        <div style="padding: 16px 24px;">
          ${groupsHtml}
        </div>
        
        <!-- Footer -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid ${th.borderColor}; background-color: ${th.footerBackground};">
          <!-- Powered by Tropheo -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: #6b7280;">
              ${t.poweredBy} <span style="font-weight: 600; color: ${th.rowTextColor};">Tropheo</span>
            </span>
          </div>
          
          <!-- Ver en Tropheo button -->
          <a href="${finalEventUrl}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: ${th.buttonTextColor}; background-color: ${th.buttonBackground}; border: none; border-radius: 6px; text-decoration: none; cursor: pointer;"
             onmouseover="this.style.opacity='0.85'"
             onmouseout="this.style.opacity='1'">
            ${t.viewOn}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Get stat label for display
   */
  private getStatLabel(key: string): string {
    const labels: Record<string, string> = {
      basketball: 'Basketball',
      batting: 'Batting',
      pitching: 'Pitching',
      fielding: 'Fielding',
      soccer: 'Soccer',
      goalkeeping: 'Goalkeeping',
      pts: 'PTS',
      reb: 'REB',
      ast: 'AST',
      stl: 'STL',
      blk: 'BLK',
      fg3: '3PM',
      fg2: '2PM',
      ft: 'FTM',
      to: 'TO',
      avg: 'AVG',
      ops: 'OPS',
      obp: 'OBP',
      slg: 'SLG',
      h: 'H',
      doubles: '2B',
      triples: '3B',
      hr: 'HR',
      rbi: 'RBI',
      bb: 'BB',
      so: 'SO',
      sb: 'SB',
      tb: 'TB',
      ab: 'AB',
      r: 'R',
      era: 'ERA',
      whip: 'WHIP',
      ip: 'IP',
      outs: 'OUTS',
      er: 'ER',
      w: 'W',
      l: 'L',
      sv: 'SV',
      tc: 'TC',
      a: 'A',
      po: 'PO',
      e: 'E',
      dp: 'DP',
      tp: 'TP',
      fpct: 'FPCT',
      g: 'G',
      sh: 'SH',
      sot: 'SOT',
      yc: 'YC',
      rc: 'RC',
      bc: 'BC',
      min: 'MIN',
      fc: 'FC',
      fs: 'FS',
      off: 'OFF',
      shotAcc: 'SH%',
      ga: 'GA',
      savePct: 'SV%',
      gamesPlayed: 'GP',
    };
    return labels[key] || key.toUpperCase();
  }

  /**
   * Get default sort for facet
   */
  private getDefaultSort(facet: Facet): SortKey {
    switch (facet) {
      case 'basketball':
        return 'pts';
      case 'batting':
        return 'h';
      case 'pitching':
        return 'outs';
      case 'fielding':
        return 'tc';
      case 'soccer':
        return 'g';
      case 'goalkeeping':
        return 'sv';
      default:
        return 'gamesPlayed';
    }
  }

  /**
   * Get columns for facet
   */
  private getColumnsForFacet(facet: Facet): string[] {
    switch (facet) {
      case 'basketball':
        return ['pts', 'reb', 'ast', 'stl', 'blk', 'fg3', 'to'];
      case 'batting':
        return ['avg', 'h', 'hr', 'rbi', 'bb', 'so', 'ops'];
      case 'pitching':
        return ['era', 'ip', 'so', 'bb', 'whip', 'w', 'l'];
      case 'fielding':
        return ['tc', 'po', 'a', 'e', 'fpct', 'dp'];
      case 'soccer':
        return ['g', 'a', 'sh', 'sot', 'shotAcc', 'yc', 'rc'];
      case 'goalkeeping':
        return ['sv', 'ga', 'savePct', 'min'];
      default:
        return [];
    }
  }

  /**
   * Get stat value from entry
   */
  private getStatValue(entry: LeaderboardEntry, key: string): string {
    const totals = entry.totals;
    const derived = entry.derived;

    // Check derived stats first
    if (key in derived) {
      const val = (derived as any)[key];
      if (val === null || val === undefined) return '—';

      // Format percentages with 3 decimals
      if (key === 'avg' || key === 'obp' || key === 'slg' || key === 'fpct' || key === 'savePct') {
        return val.toFixed(3);
      }
      // Format rates with 2 decimals
      if (key === 'era' || key === 'whip' || key === 'ops' || key === 'shotAcc') {
        return val.toFixed(2);
      }
      return String(val);
    }

    // Check totals
    if (key in totals) {
      const val = (totals as any)[key];
      return val !== undefined && val !== null ? String(val) : '0';
    }

    // Special case for gamesPlayed
    if (key === 'gamesPlayed') {
      return String(entry.gamesPlayed || 0);
    }

    return '—';
  }

  /**
   * Render leaderboard table HTML with interactive column sorting.
   * activeFacet and activeMode override config values when provided (used by tab switching).
   */
  private renderLeaderboardTable(
    container: HTMLElement,
    data: LeaderboardEntry[],
    config: LeaderboardWidgetConfig,
    lang: Language = 'en',
    activeFacet?: Facet,
    activeMode?: LeaderboardMode
  ): void {
    const className = config.className || '';
    const mode = activeMode || config.mode || 'athletes';
    const facet = activeFacet || config.facet || ('basketball' as Facet);
    const columns = this.getColumnsForFacet(facet);
    const t = translations[lang];

    // Resolved theme for table rows/headers (outer shell handles header/footer/tabs)
    const th = {
      columnHeaderColor: config.theme?.columnHeaderColor ?? '#374151',
      rowTextColor: config.theme?.rowTextColor ?? '#374151',
      rowBorderColor: config.theme?.rowBorderColor ?? '#f3f4f6',
      borderColor: config.theme?.borderColor ?? '#e5e7eb',
      inactiveTabColor: config.theme?.inactiveTabColor ?? '#6b7280',
      avatarBackground: config.theme?.avatarBackground ?? '#e5e7eb',
    };

    if (!data.length) {
      if (config.showEmptyState) {
        container.innerHTML = `
          <div class="${className}" style="padding: 20px; text-align: center; color: #6b7280;">
            ${t.noStats}
          </div>
        `;
      } else {
        container.innerHTML = '';
      }
      return;
    }

    // Closure-based sort state enables re-sorting without re-fetching
    let sortKey = String(config.sort ?? this.getDefaultSort(facet));
    let sortDir: 'asc' | 'desc' = 'desc';

    const sortEntries = (key: string, dir: 'asc' | 'desc'): LeaderboardEntry[] =>
      [...data].sort((a, b) => {
        const av = this.getStatValue(a, key);
        const bv = this.getStatValue(b, key);
        const an = parseFloat(av);
        const bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) return dir === 'desc' ? bn - an : an - bn;
        if (av === '—') return 1;
        if (bv === '—') return -1;
        return dir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
      });

    const renderRows = (entries: LeaderboardEntry[], activeSortKey: string): string =>
      entries
        .map((entry, idx) => {
          const name =
            mode === 'athletes'
              ? entry.athlete?.name || '—'
              : entry.roster?.name || entry.organization?.name || '—';
          const avatarUrl =
            mode === 'athletes'
              ? entry.athlete?.profilePicture
              : entry.organization?.profilePicture;
          const initials = name
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return `
            <tr style="border-bottom: ${idx < entries.length - 1 ? `1px solid ${th.rowBorderColor}` : 'none'};">
              <td style="padding: 12px 12px 12px 0; color: ${th.inactiveTabColor}; font-weight: 500;">${idx + 1}</td>
              <td style="padding: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${
                    avatarUrl
                      ? `<img src="${avatarUrl}" alt="${name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
                      : `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${th.avatarBackground}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: ${th.inactiveTabColor};">${initials}</div>`
                  }
                  <span style="font-weight: 500; color: ${th.rowTextColor};">${name}</span>
                </div>
              </td>
              <td style="padding: 12px; text-align: right; color: ${th.rowTextColor};">${entry.gamesPlayed || 0}</td>
              ${columns
                .map(
                  (col) =>
                    `<td style="padding: 12px; text-align: right; font-weight: ${col === activeSortKey ? 700 : 500}; color: ${th.rowTextColor};">${this.getStatValue(entry, col)}</td>`
                )
                .join('')}
            </tr>
          `;
        })
        .join('');

    const renderHeaderCells = (activeSortKey: string, dir: 'asc' | 'desc'): string =>
      columns
        .map(
          (col) =>
            `<th data-sort-key="${col}" style="text-align: right; padding: 12px; font-weight: 600; cursor: pointer; user-select: none; white-space: nowrap; color: ${th.columnHeaderColor};">${this.getStatLabel(col)}${col === activeSortKey ? (dir === 'desc' ? ' ↓' : ' ↑') : ''}</th>`
        )
        .join('');

    const sorted = sortEntries(sortKey, sortDir);

    // Render just the table area (header + footer are in the outer shell)
    const html = `
      <div style="overflow-x: auto; padding: 16px 24px;">
        <table style="width: 100%; min-width: 600px; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 1px solid ${th.borderColor};">
              <th style="text-align: left; padding: 12px 12px 12px 0; font-weight: 600; color: ${th.columnHeaderColor};">#</th>
              <th style="text-align: left; padding: 12px; font-weight: 600; min-width: 200px; color: ${th.columnHeaderColor};">
                ${mode === 'athletes' ? t.athlete : t.team}
              </th>
              <th style="text-align: right; padding: 12px; font-weight: 600; color: ${th.columnHeaderColor};">GP</th>
              ${renderHeaderCells(sortKey, sortDir)}
            </tr>
          </thead>
          <tbody>
            ${renderRows(sorted, sortKey)}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    // Attach interactive sort handlers after rendering
    const tbody = container.querySelector('tbody');
    const ths = container.querySelectorAll<HTMLTableCellElement>('th[data-sort-key]');
    if (!tbody || !ths.length) return;

    ths.forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort-key')!;
        if (sortKey === key) {
          sortDir = sortDir === 'desc' ? 'asc' : 'desc';
        } else {
          sortKey = key;
          sortDir = 'desc';
        }
        const newSorted = sortEntries(sortKey, sortDir);
        tbody.innerHTML = renderRows(newSorted, sortKey);
        // Update sort indicators on all column headers
        ths.forEach((header) => {
          const hKey = header.getAttribute('data-sort-key')!;
          header.textContent = `${this.getStatLabel(hKey)}${
            hKey === sortKey ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''
          }`;
        });
      });
    });
  }

  /**
   * Render stats (alias for renderLeaderboard — simpler name)
   */
  async renderStats(config: LeaderboardWidgetConfig): Promise<void> {
    return this.renderLeaderboard(config);
  }

  /**
   * Get container element from string selector or HTMLElement
   */
  private getContainer(container?: HTMLElement | string): HTMLElement | null {
    if (!container) return null;
    if (typeof container === 'string') {
      return document.querySelector(container);
    }
    return container;
  }
}

// Auto-initialize when script is loaded
if (typeof window !== 'undefined') {
  window.TropheoWidgets = TropheoWidgets;
  window.TropheoEmbed = TropheoEmbed;
}

export default TropheoEmbed;
