/**
 * Gets the request body to send to the Adobe analytics API.
 *
 * @param rsid - Adobe resource ID.
 * @returns Request body.
 */
export function getRequestBody(rsid: string): object {
  return {
    rsid,
    globalFilters: [
      {
        type: 'dateRange',
        dateRange: '2019-10-01T00:00:00.000/2019-11-01T00:00:00.000',
      },
    ],
    metricContainer: {
      metrics: [
        {
          columnId: '0',
          id: 'metrics/visitors',
        },
      ],
    },
    dimension: 'variables/browser',
    settings: {
      countRepeatInstances: true,
      limit: 50,
      page: 0,
      nonesBehavior: 'return-nones',
    },
    statistics: {
      functions: ['col-max', 'col-min'],
    },
  };
}
