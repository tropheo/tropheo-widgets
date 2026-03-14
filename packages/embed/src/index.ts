import { TropheoWidgets, ApiClient } from '@tropheo/core';
import type { TropheoWidgetsConfig, StandingsWidgetConfig, StandingRow } from '@tropheo/types';

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

    // Show loading state
    container.innerHTML =
      '<div style="padding: 20px; text-align: center;">Loading standings...</div>';

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
      this.renderStandingsTable(container, standings, title, config);
    } catch (error) {
      container.innerHTML = `<div style="padding: 20px; color: #ef4444;">Error: ${
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
  private renderSingleTable(rows: StandingRow[], startRank: number = 1): string {
    const gbMap = this.computeGamesBehind(rows);

    let html = `
      <table style="width: 100%; min-width: 800px; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <th style="text-align: left; padding: 12px 12px 12px 0; font-weight: 600;">#</th>
            <th style="text-align: left; padding: 12px; font-weight: 600;">Team</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">GP</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">W</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">L</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">T</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">GB</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">PTS</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">WIN%</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">PF</th>
            <th style="text-align: right; padding: 12px; font-weight: 600;">PA</th>
            <th style="text-align: right; padding: 12px 0 12px 12px; font-weight: 600;">DIFF</th>
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach((row, idx) => {
      const name = row.participantName || 'Team';
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
    config: StandingsWidgetConfig
  ): void {
    const className = config.className || '';

    if (!standings.length) {
      if (config.showEmptyState) {
        container.innerHTML = `
          <div class="${className}" style="padding: 20px; text-align: center; color: #6b7280;">
            No standings available yet.
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
          ${this.renderSingleTable(groupRows, startRank)}
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
              Powered by <span style="font-weight: 600; color: #374151;">Tropheo</span>
            </span>
          </div>
          
          <!-- Ver en Tropheo button -->
          <a href="${config.eventUrl || config.baseUrl || 'https://app.tropheo.mx'}/events/${config.eventId}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; font-size: 12px; font-weight: 500; color: #ffffff; background-color: #3b82f6; border: none; border-radius: 6px; text-decoration: none; cursor: pointer; transition: background-color 0.2s;"
             onmouseover="this.style.backgroundColor='#2563eb'"
             onmouseout="this.style.backgroundColor='#3b82f6'">
            Ver en Tropheo
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
