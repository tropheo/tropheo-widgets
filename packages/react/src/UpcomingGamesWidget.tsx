import React, { useEffect, useState } from 'react';
import type { ApiClient } from '@tropheo/core';
import type { WidgetGame, UpcomingGamesTheme } from '@tropheo/types';

// ─── Translations ─────────────────────────────────────────────────────────────

const translations = {
  en: {
    loading: 'Loading upcoming games…',
    error: 'Error',
    noGames: 'No upcoming or live games at the moment.',
    live: 'LIVE',
    upcoming: 'Upcoming',
    ongoing: 'Live',
    completed: 'Completed',
    vs: 'vs',
    poweredBy: 'Powered by',
    viewOn: 'View on Tropheo',
    upcomingAndLiveGames: 'Upcoming & Live Games',
    viewDetails: 'View details',
  },
  es: {
    loading: 'Cargando partidos próximos…',
    error: 'Error',
    noGames: 'No hay partidos próximos o en vivo en este momento.',
    live: 'EN VIVO',
    upcoming: 'Próximo',
    ongoing: 'En vivo',
    completed: 'Finalizado',
    vs: 'vs',
    poweredBy: 'Desarrollado por',
    viewOn: 'Ver en Tropheo',
    upcomingAndLiveGames: 'Partidos Próximos y En Vivo',
    viewDetails: 'Ver detalles',
  },
};

type Language = 'en' | 'es';
type Translations = (typeof translations)['en'];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface UpcomingGamesWidgetProps {
  /** Authenticated API client from `new TropheoWidgets(config).getClient()`. */
  client: ApiClient;
  /** Root event ID whose upcoming/live games to display. */
  eventId: string;
  /**
   * Optional organization filter — only games where this org participates
   * will be shown. Filtering happens server-side.
   */
  organizationId?: string;
  /** Max games to display. @default 8 */
  limit?: number;
  /** Days ahead to include as "upcoming". @default 7 */
  windowDays?: number;
  /** Custom CSS class for the root element. */
  className?: string;
  /** Base Tropheo URL for deep links. @default 'https://www.tropheo.com' */
  baseUrl?: string;
  /** Language for labels. @default 'en' */
  lang?: 'en' | 'es';
  /** Visual theme overrides. */
  theme?: UpcomingGamesTheme;
  /** Called when data loads successfully, with the game count. */
  onLoad?: (count: number) => void;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = 32,
  bg,
}: {
  src?: string;
  name: string;
  size?: number;
  bg: string;
}) {
  const [errored, setErrored] = useState(false);
  const initial = (name || '?').charAt(0).toUpperCase();

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        color: '#6b7280',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function GameCard({
  game,
  t,
  th,
  baseUrl,
}: {
  game: WidgetGame;
  t: Translations;
  th: Required<UpcomingGamesTheme>;
  baseUrl: string;
}) {
  const { gameInfo, status } = game;
  const isLive = status === 'ongoing';
  const isCompleted = status === 'completed';
  const hasScores = gameInfo != null && gameInfo.homeScore != null && gameInfo.awayScore != null;
  const homeWon = hasScores && Number(gameInfo!.homeScore) > Number(gameInfo!.awayScore);
  const awayWon = hasScores && Number(gameInfo!.awayScore) > Number(gameInfo!.homeScore);

  const cardContent = (
    <div
      style={{
        border: `1px solid ${th.borderColor}`,
        borderRadius: 10,
        background: th.cardBackground,
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
      className="tropheo-game-card"
    >
      {/* Status bar */}
      <div
        style={{
          padding: '6px 12px',
          borderBottom: `1px solid ${th.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {isLive && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 700,
              color: th.liveColor,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: th.liveColor,
                animation: 'tropheo-pulse 1.5s infinite',
              }}
            />
            {t.live}
          </span>
        )}
        {!isLive && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: isCompleted ? th.mutedTextColor : th.upcomingColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {isCompleted ? t.completed : t.upcoming}
          </span>
        )}
        {game.startDate && (
          <span style={{ fontSize: 11, color: th.mutedTextColor, marginLeft: 'auto' }}>
            {new Date(game.startDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
            {' · '}
            {new Date(game.startDate).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Score block */}
      <div style={{ padding: '10px 12px' }}>
        {gameInfo && (gameInfo.homeName || gameInfo.awayName || hasScores) ? (
          <div
            style={{
              background: '#eff6ff',
              borderRadius: 8,
              border: '1px solid #bfdbfe',
              padding: '8px 10px',
            }}
          >
            {/* Away team */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Avatar
                  src={gameInfo.awayImage}
                  name={gameInfo.awayName || 'A'}
                  size={28}
                  bg={th.avatarBackground}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: awayWon ? th.winnerColor : th.textColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 140,
                  }}
                >
                  {gameInfo.awayName || 'Away'}
                </span>
              </div>
              {hasScores && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: awayWon ? th.winnerColor : th.textColor,
                    flexShrink: 0,
                  }}
                >
                  {gameInfo.awayScore}
                </span>
              )}
            </div>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: '4px 0',
              }}
            >
              <div style={{ flex: 1, height: 1, background: '#d1d5db' }} />
              <span
                style={{
                  fontSize: 9,
                  color: '#9ca3af',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {t.vs}
              </span>
              <div style={{ flex: 1, height: 1, background: '#d1d5db' }} />
            </div>

            {/* Home team */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Avatar
                  src={gameInfo.homeImage}
                  name={gameInfo.homeName || 'H'}
                  size={28}
                  bg={th.avatarBackground}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: homeWon ? th.winnerColor : th.textColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 140,
                  }}
                >
                  {gameInfo.homeName || 'Home'}
                </span>
              </div>
              {hasScores && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: homeWon ? th.winnerColor : th.textColor,
                    flexShrink: 0,
                  }}
                >
                  {gameInfo.homeScore}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: th.mutedTextColor,
            }}
          >
            {game.name || 'Game'}
          </p>
        )}
      </div>
    </div>
  );

  if (!game.id) return <div key={game.id}>{cardContent}</div>;

  return (
    <a
      href={`${baseUrl}/events/${game.id}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none' }}
      title={t.viewDetails}
    >
      {cardContent}
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const UpcomingGamesWidget: React.FC<UpcomingGamesWidgetProps> = ({
  client,
  eventId,
  organizationId,
  limit = 8,
  windowDays = 7,
  className = '',
  baseUrl = 'https://www.tropheo.com',
  lang = 'en',
  theme = {},
  onLoad,
}) => {
  const [games, setGames] = useState<WidgetGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang as Language];

  // ── Resolved theme ──────────────────────────────────────────────────────────
  const th: Required<UpcomingGamesTheme> = {
    cardBackground: theme.cardBackground ?? '#ffffff',
    headerBackground: theme.headerBackground ?? '#ffffff',
    titleTextColor: theme.titleTextColor ?? '#111827',
    textColor: theme.textColor ?? '#374151',
    mutedTextColor: theme.mutedTextColor ?? '#6b7280',
    borderColor: theme.borderColor ?? '#fed7aa',
    liveColor: theme.liveColor ?? '#ef4444',
    upcomingColor: theme.upcomingColor ?? '#f97316',
    footerBackground: theme.footerBackground ?? '#f9fafb',
    buttonBackground: theme.buttonBackground ?? '#3b82f6',
    buttonTextColor: theme.buttonTextColor ?? '#ffffff',
    avatarBackground: theme.avatarBackground ?? '#e5e7eb',
    winnerColor: theme.winnerColor ?? '#15803d',
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await client.getSchedule(eventId, organizationId);
        if (cancelled) return;
        if (!res.success || !res.data) {
          setError(res.error || 'Failed to load schedule');
          setLoading(false);
          return;
        }

        const now = new Date();
        const windowEnd = new Date(now);
        windowEnd.setDate(windowEnd.getDate() + windowDays);

        // Filter to upcoming/live within window
        const filtered = res.data.games.filter((g) => {
          if (g.status === 'completed') return false;
          if (g.status === 'ongoing') return true;
          if (!g.startDate) return false;
          const start = new Date(g.startDate);
          return start <= windowEnd;
        });

        // Sort: live first, then by start date asc
        filtered.sort((a, b) => {
          if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
          if (a.status !== 'ongoing' && b.status === 'ongoing') return 1;
          return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
        });

        const sliced = filtered.slice(0, limit);
        setGames(sliced);
        onLoad?.(sliced.length);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, organizationId, limit, windowDays]);

  return (
    <>
      {/* Keyframe for the live pulse dot */}
      <style>{`
        @keyframes tropheo-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .tropheo-game-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
      `}</style>

      <div
        className={`tropheo-upcoming-games ${className}`}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          border: `1px solid ${th.borderColor}`,
          borderRadius: 12,
          overflow: 'hidden',
          background: th.cardBackground,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px',
            background: th.headerBackground,
            borderBottom: `1px solid ${th.borderColor}`,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: th.titleTextColor }}>
            {t.upcomingAndLiveGames}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: 12 }}>
          {loading ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: th.mutedTextColor }}>
              {t.loading}
            </div>
          ) : error ? (
            <div style={{ padding: '16px 0', color: '#ef4444', fontSize: 13 }}>
              {t.error}: {error}
            </div>
          ) : games.length === 0 ? (
            <div style={{ padding: '16px 0', color: th.mutedTextColor, fontSize: 13 }}>
              {t.noGames}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 8,
              }}
            >
              {games.map((game) => (
                <GameCard key={game.id} game={game} t={t} th={th} baseUrl={baseUrl} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: th.footerBackground,
            borderTop: `1px solid ${th.borderColor}`,
          }}
        >
          <span style={{ fontSize: 11, color: th.mutedTextColor }}>
            {t.poweredBy}{' '}
            <a
              href="https://www.tropheo.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: th.mutedTextColor, fontWeight: 700, textDecoration: 'none' }}
            >
              Tropheo
            </a>
          </span>
          <a
            href={`${baseUrl}/events/${eventId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 6,
              background: th.buttonBackground,
              color: th.buttonTextColor,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {t.viewOn} ↗
          </a>
        </div>
      </div>
    </>
  );
};
