import getBrowsersListStats from '../index';
import * as getAnalyticsResponse from '../library/getAnalyticsResponse';
import mockBrowserReport from '../__specs__/browser-report';

jest
  .spyOn(getAnalyticsResponse, 'default')
  .mockImplementation(async () => mockBrowserReport);

test('hello world', async () => {
  await expect(
    getBrowsersListStats({
      rsid: '---rsid---',
      globalId: '---global-id---',
      clientId: '---client-id---',
      technicalAccountId: '---technical-account-id---',
      orgId: '---org-id---',
      clientSecret: '---client-secret---',
      privateKey: '---private-key---',
    })
  ).resolves.toMatchSnapshot();
});
