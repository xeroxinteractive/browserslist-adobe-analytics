import { RankedReportData } from 'source/types';
import { Stats } from 'browserslist';
import { agents } from 'caniuse-lite';
import getBaseStats from './getBaseStats';

console.log(agents);

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
export function cascadeSemver(
  version: string,
  possibleVersions: string[]
): string | null {
  const versionParts = version.split('.');
  while (versionParts.length) {
    const currentVersion = versionParts.join('.');
    if (possibleVersions.includes(currentVersion)) {
      return currentVersion;
    }
    versionParts.pop();
  }
  return null;
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
        browser = adobeBrowserslistBrowserMap[browser];
        if (browser && allStats.hasOwnProperty(browser)) {
          if (version) {
            version = cascadeSemver(version, Object.keys(allStats[browser]));
          }
          // TODO: Map Safari 0.8.2 and no version to latest.
          // https://helpx.adobe.com/uk/analytics/kb/Why-is-latest-version-of-Safari-reported-as-0-8-2-Adobe-Analytics.html
          // Map to browserslist equivalent.
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
