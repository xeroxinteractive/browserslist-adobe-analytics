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
 * @param options - Adobe Analytics credential options.
 * @returns Browserslist statistics data.
 */
export default async function getBrowserslistStats(
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
 * @param options - Adobe Analytics credential options and file writing options.
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
