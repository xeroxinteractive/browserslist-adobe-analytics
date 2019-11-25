import { BaseOptions, WriteOptions } from './types';
import getAnalyticsResponse from './library/getAnalyticsResponse';
import transformAnalyticsResponse from './library/transformAnalyticsResponse';
import { join } from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

/**
 * Pulls browser data from Adobe Analytics and
 * returns it in the browserslist statistics format.
 *
 * @param options - Options to use for getting the analytics data.
 * @returns Browserslist statistics data.
 */
export async function getBrowserslistStats(
  options: BaseOptions
): Promise<object | undefined> {
  const response = await getAnalyticsResponse(options);
  if (response) {
    return transformAnalyticsResponse(response);
  }
}

/**
 * Pulls browser data from Adobe Anayltics and
 * writes it to file in the browserslist statistics format.
 *
 * @param options - Options to ue for getting the analytics data and writing to file.
 */
export async function writeBrowserslistStats(
  options: WriteOptions
): Promise<void> {
  const stats = await getBrowserslistStats(options);
  const filePath = join(
    options.cwd || process.cwd(),
    options.filename || 'browserslist-stats.json'
  );
  await writeFile(filePath, stats);
}
