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
   * Render standings table HTML
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

    let html = `
      <div class="${className}" style="border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; overflow: hidden;">
        <div style="padding: 16px 24px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0;">${title}</h3>
        </div>
        <div style="padding: 16px 24px; overflow-x: auto;">
          <table style="width: 100%; min-width: 800px; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 12px 12px 12px 0; font-weight: 600;">#</th>
                <th style="text-align: left; padding: 12px; font-weight: 600;">Team</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">GP</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">W</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">L</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">T</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">PTS</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">WIN%</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">PF</th>
                <th style="text-align: right; padding: 12px; font-weight: 600;">PA</th>
                <th style="text-align: right; padding: 12px 0 12px 12px; font-weight: 600;">DIFF</th>
              </tr>
            </thead>
            <tbody>
    `;

    standings.forEach((row, idx) => {
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

      html += `
        <tr style="border-bottom: ${idx < standings.length - 1 ? '1px solid #f3f4f6' : 'none'};">
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
          <td style="padding: 12px; text-align: right;">${row.gamesPlayed ?? 0}</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">${row.wins ?? 0}</td>
          <td style="padding: 12px; text-align: right;">${row.losses ?? 0}</td>
          <td style="padding: 12px; text-align: right;">${row.ties ?? 0}</td>
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
