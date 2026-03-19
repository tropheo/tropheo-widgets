import { TropheoWidgets, ApiClient } from '@tropheo/core';
import type {
  TropheoWidgetsConfig,
  StandingsWidgetConfig,
  StandingRow,
  LeaderboardWidgetConfig,
  LeaderboardEntry,
  Facet,
  SortKey,
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
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
    team: 'Team',
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
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
    team: 'Equipo',
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
   * Render a standings table into a DOM element
   */
  async renderStandings(config: StandingsWidgetConfig): Promise<void> {
    const container = this.getContainer(config.container);
    if (!container) {
      throw new Error('Container element not found');
    }

    const lang: Language = config.lang || 'en';
    const t = translations[lang];

    // Show loading state
    container.innerHTML = `<div style="padding: 20px; text-align: center;">${t.loadingStandings}</div>`;

    try {
      // Fetch data - the API will determine the scope based on the event's eventRole
      const response = await this.client.getStandings(config.eventId);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load standings');
      }

      const { event, standings } = response.data;

      // Use event name as title if no custom title provided
      const title = config.title || `${event.name} - Standings`;

      // Render table
      this.renderStandingsTable(container, standings, title, config, lang);
    } catch (error) {
      container.innerHTML = `<div style="padding: 20px; color: #ef4444;">${t.error}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }</div>`;
    }
  }

  /**
   * Render a leaderboard table into a DOM element
   */
  async renderLeaderboard(config: LeaderboardWidgetConfig): Promise<void> {
    const container = this.getContainer(config.container);
    if (!container) {
      throw new Error('Container element not found');
    }

    const lang: Language = config.lang || 'en';
    const t = translations[lang];

    // Show loading state
    container.innerHTML = `<div style="padding: 20px; text-align: center;">${t.loadingLeaderboard}</div>`;

    try {
      const mode = config.mode || 'athletes';
      const sort = config.sort || this.getDefaultSort(config.facet);
      const limit = config.limit || 50;

      const response = await this.client.getLeaderboard(
        config.eventId,
        config.scopeType,
        config.sport,
        config.facet,
        mode,
        sort,
        limit
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load leaderboard');
      }

      const { event, data } = response.data;

      // Use event name as title if no custom title provided
      const title = config.title || `${event.name} - ${this.getStatLabel(config.facet)} Leaders`;

      // Render table
      this.renderLeaderboardTable(container, data, title, config, event.name, lang);
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
    lang: Language = 'en'
  ): string {
    const gbMap = this.computeGamesBehind(rows);
    const t = translations[lang];

    let html = `
      <table style="width: 100%; min-width: 800px; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <th style="text-align: left; padding: 12px 12px 12px 0; font-weight: 600;">#</th>
            <th style="text-align: left; padding: 12px; font-weight: 600;">${t.team}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.gp}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.w}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.l}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.t}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.gb}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.pts}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.winPct}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.pf}</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">${t.pa}</th>
            <th style="text-align: right; padding: 12px 0 12px 12px; font-weight: 600;">${t.diff}</th>
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
      const diffColor = diff >= 0 ? '#10b981' : '#ef4444';
      const gb = gbMap.get(idx);

      html += `
        <tr style="border-bottom: ${idx < rows.length - 1 ? '1px solid #f3f4f6' : 'none'};">
          <td style="padding: 12px 12px 12px 0; color: #6b7280; font-weight: 500;">${startRank + idx}</td>
          <td style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${
                avatarUrl
                  ? `<img src="${avatarUrl}" alt="${name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
                  : `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #6b7280;">${initials}</div>`
              }
              <span style="font-weight: 500;">${name}</span>
            </div>
          </td>
          <td style="padding: 12px; text-align: right;">${row.gamesPlayed ?? 0}</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${row.wins ?? 0}</td>
          <td style="padding: 12px; text-align: right;">${row.losses ?? 0}</td>
          <td style="padding: 12px; text-align: right;">${row.ties ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: #6b7280;">
            ${gb !== null && gb !== undefined ? gb.toFixed(1) : '—'}
          </td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${row.points ?? 0}</td>
          <td style="padding: 12px; text-align: right; color: #6b7280;">${winPct.toFixed(3)}</td>
          <td style="padding: 12px; text-align: right;">${row.pointsFor ?? 0}</td>
          <td style="padding: 12px; text-align: right;">${row.pointsAgainst ?? 0}</td>
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
    lang: Language = 'en'
  ): void {
    const className = config.className || '';
    const t = translations[lang];

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
            <h4 style="font-weight: 600; font-size: 14px; color: #6b7280; margin: 0 0 12px 0;">
              ${groupLabel}
            </h4>
          </div>
        `;
      }

      // Add the table for this group
      groupsHtml += `
        <div style="overflow-x: auto; margin-bottom: ${groupLabel ? '32px' : '0'};">
          ${this.renderSingleTable(groupRows, startRank, lang)}
        </div>
      `;
    });

    const html = `
      <div class="${className}" style="border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${title}</h3>
        </div>
        <div style="padding: 16px 24px;">
          ${groupsHtml}
        </div>
        
        <!-- Footer -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
          <!-- Powered by Tropheo -->
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: #6b7280;">
              ${t.poweredBy} <span style="font-weight: 600; color: #374151;">Tropheo</span>
            </span>
          </div>
          
          <!-- Ver en Tropheo button -->
          <a href="${config.eventUrl || config.baseUrl || 'https://app.tropheo.mx'}/events/${config.eventId}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: #ffffff; background-color: #3b82f6; border: none; border-radius: 6px; text-decoration: none; cursor: pointer; transition: background-color 0.2s;"
             onmouseover="this.style.backgroundColor='#2563eb'"
             onmouseout="this.style.backgroundColor='#3b82f6'">
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
   * Render leaderboard table HTML
   */
  /**
   * Render leaderboard table HTML
   */
  private renderLeaderboardTable(
    container: HTMLElement,
    data: LeaderboardEntry[],
    title: string,
    config: LeaderboardWidgetConfig,
    eventName: string,
    lang: Language = 'en'
  ): void {
    const className = config.className || '';
    const mode = config.mode || 'athletes';
    const columns = this.getColumnsForFacet(config.facet);
    const t = translations[lang];

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

    let tableRows = '';
    data.forEach((entry, idx) => {
      const name =
        mode === 'athletes'
          ? entry.athlete?.name || '—'
          : entry.roster?.name || entry.organization?.name || '—';
      const avatarUrl =
        mode === 'athletes' ? entry.athlete?.profilePicture : entry.organization?.profilePicture;
      const initials = name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      tableRows += `
        <tr style="border-bottom: ${idx < data.length - 1 ? '1px solid #f3f4f6' : 'none'};">
          <td style="padding: 12px 12px 12px 0; color: #6b7280; font-weight: 500;">${idx + 1}</td>
          <td style="padding: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${
                avatarUrl
                  ? `<img src="${avatarUrl}" alt="${name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
                  : `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #6b7280;">${initials}</div>`
              }
              <span style="font-weight: 500;">${name}</span>
            </div>
          </td>
          <td style="padding: 12px; text-align: right;">${entry.gamesPlayed || 0}</td>
          ${columns.map((col) => `<td style="padding: 12px; text-align: right; font-weight: 500;">${this.getStatValue(entry, col)}</td>`).join('')}
        </tr>
      `;
    });

    const html = `
      <div class="${className}" style="border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #e5e7eb; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0; color: #ffffff;">${title}</h3>
          <p style="font-size: 12px; margin: 4px 0 0 0; color: rgba(255, 255, 255, 0.9);">
            ${eventName} · ${mode === 'athletes' ? 'Athletes' : 'Teams'} · ${this.getStatLabel(config.facet)}
          </p>
        </div>
        <div style="overflow-x: auto; padding: 16px 24px;">
          <table style="width: 100%; min-width: 600px; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 12px 12px 12px 0; font-weight: 600;">#</th>
                <th style="text-align: left; padding: 12px; font-weight: 600; min-width: 200px;">
                  ${mode === 'athletes' ? 'Athlete' : 'Team'}
                </th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">GP</th>
                ${columns.map((col) => `<th style="text-align: right; padding: 12px; font-weight: 600;">${this.getStatLabel(col)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        
        <!-- Footer -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 11px; color: #6b7280;">
              ${t.poweredBy} <span style="font-weight: 600; color: #374151;">Tropheo</span>
            </span>
          </div>
          
          <a href="${config.eventUrl || config.baseUrl || 'https://app.tropheo.mx'}/events/${config.eventId}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: #ffffff; background-color: #3b82f6; border: none; border-radius: 6px; text-decoration: none; cursor: pointer; transition: background-color 0.2s;"
             onmouseover="this.style.backgroundColor='#2563eb'"
             onmouseout="this.style.backgroundColor='#3b82f6'">
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
