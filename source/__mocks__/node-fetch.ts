const { FetchError } = require.requireActual('node-fetch');

import mockBrowserReport from '../__specs__/browser-report';

const fetch = jest.fn(
  async (): Promise<object> => ({
    json: async (): Promise<object> => {
      return mockBrowserReport;
    },
    ok: true,
  })
);

export { FetchError };

export default fetch;
