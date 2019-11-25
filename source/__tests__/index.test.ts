jest.mock('util');

import * as getAnalyticsResponse from '../library/getAnalyticsResponse';
import mockBrowserReport from '../__specs__/browser-report';
import mockOptions from '../__specs__/options';
import MockDate from 'mockdate';
import getBaseStats from '../library/getBaseStats';
import * as util from 'util';
import { mocked } from 'ts-jest/utils';

const mockWriteFile = jest.fn();
mocked(util).promisify.mockImplementation(() => mockWriteFile);

import { getBrowserslistStats, writeBrowserslistStats } from '../index';

MockDate.set('2019-11-01T00:00:00.000');

const originalProcessCwd = process.cwd;
const mockProcessCwd = jest.fn(() => '/cwd/path');

beforeAll(() => {
  process.cwd = mockProcessCwd;
});

afterAll(() => {
  process.cwd = originalProcessCwd;
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest
  .spyOn(getAnalyticsResponse, 'default')
  .mockImplementation(async () => mockBrowserReport);

describe('getBrowserslistStats', () => {
  test('default options', async () => {
    await expect(getBrowserslistStats(mockOptions)).resolves.toMatchSnapshot();
  });
});

type GenericStats = {
  [browser: string]: {
    [version: string]: any;
  };
};

describe('writeBrowserslistStats', () => {
  let genericStats: GenericStats;
  beforeAll(() => {
    genericStats = Object.entries(getBaseStats()).reduce(
      (browsers, [key, value]) => {
        browsers[key] = Object.keys(value).reduce((versions, cur) => {
          versions[cur] = expect.any(Number);
          return versions;
        }, {} as { [version: string]: number });
        return browsers;
      },
      {} as GenericStats
    );
  });

  test('default options', async () => {
    await writeBrowserslistStats(mockOptions);
    expect(mockWriteFile.mock.calls[0][0]).toBe(
      '/cwd/path/browserslist-stats.json'
    );
    expect(mockWriteFile.mock.calls[0][1]).toEqual(genericStats);
  });

  test('cwd', async () => {
    await writeBrowserslistStats({ ...mockOptions, cwd: '/new/cwd' });
    expect(mockWriteFile.mock.calls[0][0]).toBe(
      '/new/cwd/browserslist-stats.json'
    );
    expect(mockWriteFile.mock.calls[0][1]).toEqual(genericStats);
  });

  test('filename', async () => {
    await writeBrowserslistStats({ ...mockOptions, filename: '/stats.jsonc' });
    expect(mockWriteFile.mock.calls[0][0]).toBe('/cwd/path/stats.jsonc');
    expect(mockWriteFile.mock.calls[0][1]).toEqual(genericStats);
  });

  test('cwd + filename', async () => {
    await writeBrowserslistStats({
      ...mockOptions,
      filename: '/stats.jsonc',
      cwd: '/new/cwd',
    });
    expect(mockWriteFile.mock.calls[0][0]).toBe('/new/cwd/stats.jsonc');
    expect(mockWriteFile.mock.calls[0][1]).toEqual(genericStats);
  });
});
