import { agents } from 'caniuse-lite';
import { Stats } from 'browserslist';

/**
 * Returns browserslist statistics data with all the %'s set to 0.
 *
 * @remarks
 * Uses caniuse-lite data get all the browsers/versions.
 * Inspired by https://github.com/browserslist/browserslist-ga/blob/89a0c2dbf173632938cb1a8de24f9c3a0f4dc876/src/caniuse-agent-data.js
 * @returns Browserslist statistics.
 */
export default function getBaseStats(): Stats {
  const baseStats: Stats = {};
  const out = Object.entries(agents).reduce(
    (stats, [browser, agent]): Stats => {
      if (agent) {
        stats[browser] = Object.entries(agent.release_date)
          .sort((a, b) => {
            if (a[1] === undefined) {
              return -1;
            } else if (b[1] === undefined) {
              return 1;
            } else {
              return b[1] - a[1];
            }
          })
          .reduce((versions, [version]) => {
            versions[version] = 0;
            return versions;
          }, {} as { [version: string]: number });
      }
      return stats;
    },
    baseStats
  );
  return out;
}
