import getBrowsersListStats from '../index';
import * as getAnalyticsResponse from '../library/getAnalyticsResponse';
import mockBrowserReport from '../__specs__/browser-report';
import mockOptions from '../__specs__/options';
import MockDate from 'mockdate';

MockDate.set('2019-11-01T00:00:00.000');

jest
  .spyOn(getAnalyticsResponse, 'default')
  .mockImplementation(async () => mockBrowserReport);

test('getBrowsersListStats', async () => {
  await expect(getBrowsersListStats(mockOptions)).resolves.toMatchSnapshot();
});
