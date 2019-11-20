import authorize, { JWTAuthConfig } from '@adobe/jwt-auth';
import { BaseOptions, ResponseError, RankedReportData } from '../types';
import fetch from 'node-fetch';
import { getRequestBody } from './getRequestBody';

/**
 * Pulls browser data from Adobe Analytics.
 *
 * @param options - Adobe Analytics credential options.
 * @returns Browser data.
 */
export default async function getAnalyticsResponse(
  options: BaseOptions
): Promise<RankedReportData | undefined> {
  const { rsid, ...jwt } = options;
  const config: JWTAuthConfig = {
    ...jwt,
    metaScopes: ['ent_analytics_bulk_ingest_sdk'],
  };
  try {
    const { access_token } = await authorize(config);
    const response = await fetch(
      `https://analytics.adobe.io/api/${options.globalId}/reports`,
      {
        method: 'post',
        body: JSON.stringify(getRequestBody(rsid)),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
          'x-proxy-global-company-id': jwt.globalId,
          'x-api-key': jwt.clientId,
        },
      }
    );
    if (!response.ok) {
      throw new ResponseError(response.statusText, response.status);
    }
    return response.json();
  } catch (e) {
    console.error(e);
  }
}
