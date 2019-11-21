import { RankedReportData } from 'source/types';
import { Stats } from 'browserslist';
import getBaseStats from './getBaseStats';
import semver from 'semver';

const browserVersionRegex = /(?:(^\D+?)$|(^\D+?)((?:\d\.?){1,3}$))/;

const adobeBrowserslistBrowserMap: { [name: string]: string } = {
  'Google Chrome': 'chrome',
  'Mozilla Firefox': 'firefox',
  'Microsoft Internet Explorer': 'ie',
  'Microsoft Edge': 'edge',
  Safari: 'safari',
  'Chrome Mobile': 'and_chr',
  'Yandex.Browser': 'chrome',
  'Samsung Browser': 'samsung',
  Opera: 'opera',
  'Mobile Safari': 'ios_saf',
  'UC Browser': 'and_uc',
  'Opera Mobile': 'op_mob',
  QQBrowser: 'and_qq',
  'Coc Coc Browser': 'chrome',
  'Internet Explorer Mobile': 'ie_mob',
  'Opera Mini': 'op_mini',
  'BlackBerry Browser': 'bb',
  'MQQ Browser': 'and_qq',
};

// TODO: Add range matching.
/**
 * Cascades the specificity of a semver version against an array of possible values.
 *
 * @remarks
 * Does x.x.x exist, then x.x then x.
 * Deliberately returns null to signify an invalid version rather than a non existing one.
 *
 * @param version - The semver version to cascade.
 * @param possibleVersions - The possible version to cascade within.
 * @returns Matched version or null.
 */
export function findVersion(
  version: string,
  possibleVersions: string[]
): string | null {
  const semvers = possibleVersions
    .map((possible) => possible.split('-').join(' - '))
    .reverse();
  for (const current of semvers) {
    const satisfies = semver.satisfies(
      semver.coerce(version) ?? version,
      current
    );
    if (satisfies) {
      return current.split(' - ').join('-');
    }
  }
  return null;
}

/**
 * Get the latest version of a browser.
 *
 * @param browser - Version to release data mapping for a browser.
 * @returns Latest version or undefined.
 */
export function getLatestVersion(browser: {
  [version: string]: number;
}): string | undefined {
  return Object.keys(browser).sort((a, b) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (aNum === NaN) {
      return -1;
    } else if (bNum === NaN) {
      return 1;
    }
    return bNum - aNum;
  })[0];
}

/**
 * Extracts the browser name and version from a given string.
 *
 * @param raw - Raw broweser/version string.
 * @param allStats - All possible stats.
 * @returns Extracted browser and version.
 */
export function getBrowserVersion(
  raw: string,
  allStats: Stats
): { browser: string; version?: string } | undefined {
  let match;
  if ((match = browserVersionRegex.exec(raw)) !== null) {
    let [, browser1, browser2, version]: (string | undefined | null)[] = match;
    let browser: string | undefined = browser2 || browser1;
    if (browser) {
      // Strip (unkown version) from browser if it exists.
      if (browser.includes('(unknown version)')) {
        browser = browser.replace('(unknown version)', '');
        version = undefined;
      }
      // Make sure they are not empty strings.
      browser = browser.trim() || undefined;
      version = version?.trim() || undefined;
      if (browser) {
        // Map to browserslist equivalent.
        browser = adobeBrowserslistBrowserMap[browser];
        if (browser && allStats.hasOwnProperty(browser)) {
          // Safari 0.8.2 use latest.
          // https://helpx.adobe.com/uk/analytics/kb/Why-is-latest-version-of-Safari-reported-as-0-8-2-Adobe-Analytics.html
          if (browser === 'safari' && version === '0.8.2') {
            version = getLatestVersion(allStats[browser]);
          } else if (version) {
            // try match the version to the browserslist base versions.
            version = findVersion(version, Object.keys(allStats[browser]));
          }
          // No version use latest
          if (!version) {
            version = getLatestVersion(allStats[browser]);
          }

          // null signifies we have a version but it does not map to browserslist base versions.
          // so ignore it.
          if (version !== null) {
            return {
              browser,
              version,
            };
          }
        }
      }
    }
  }
}

/**
 * Transforms analytics data to the browserslist statistics format.
 *
 * @param response - The response from Adobe Analytics.
 * @returns Browserslist statistics data.
 */
export default function transformAnalyticsResponse(
  response: RankedReportData
): Stats {
  const total =
    response.summaryData.filteredTotals?.[0] ||
    response.summaryData.totals?.[0];
  return response.rows.reduce((acc, cur): Stats => {
    const views = cur.data?.[0];
    if (cur.value && views) {
      const { browser, version } = getBrowserVersion(cur.value, acc) || {};
      if (browser && version) {
        acc[browser][version] += views / total;
      }
    }
    return acc;
  }, getBaseStats());
}
