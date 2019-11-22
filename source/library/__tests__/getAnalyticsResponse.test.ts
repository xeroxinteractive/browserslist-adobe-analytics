import { mocked } from 'ts-jest/utils';
import nodeFetch, { Response } from 'node-fetch';
import authenticate from '@adobe/jwt-auth';
import mockBrowserReport from '../../__specs__/browser-report';
import mockOptions from '../../__specs__/options';
import MockDate from 'mockdate';
// eslint-disable-next-line jest/no-mocks-import
import { FetchError } from '../../__mocks__/node-fetch';

import getAnalyticsResponse from '../getAnalyticsResponse';
import { ResponseError } from '../../types';

const mockFetch = mocked(nodeFetch, true);
const mockAuthenticate = mocked(authenticate, true);
MockDate.set('2019-11-01T00:00:00.000');
const mockConsoleError = jest.fn();

let originalConsoleError: typeof console.error;
beforeAll(() => {
  originalConsoleError = console.error;
  console.error = mockConsoleError;
});

afterAll(() => {
  console.error = originalConsoleError;
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('normal behaviour', async () => {
  await expect(getAnalyticsResponse(mockOptions)).resolves.toEqual(
    mockBrowserReport
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch.mock.calls[0]).toMatchSnapshot();
  expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate).toHaveBeenCalledWith({
    ...mockOptions,
    metaScopes: ['ent_analytics_bulk_ingest_sdk'],
  });
});

test('HTTP error', async () => {
  mockFetch.mockImplementation(
    async (): Promise<Response> =>
      (({
        json: async (): Promise<Response> => {
          return undefined as any;
        },
        ok: false,
        statusText: 'Forbidden',
        status: 403,
      } as Partial<Response>) as Response)
  );
  await expect(getAnalyticsResponse(mockOptions)).resolves.toBeUndefined();
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate).toHaveBeenCalledWith({
    ...mockOptions,
    metaScopes: ['ent_analytics_bulk_ingest_sdk'],
  });
  expect(mockConsoleError).toHaveBeenCalledWith(
    new ResponseError('Forbidden', 403)
  );
});

test('Fetch error', async () => {
  const mockFetchError = new FetchError('---message---', '---type---');
  mockFetch.mockImplementation(
    async (): Promise<Response> =>
      (({
        json: async (): Promise<Response> => {
          throw mockFetchError;
        },
        ok: true,
      } as Partial<Response>) as Response)
  );
  await expect(getAnalyticsResponse(mockOptions)).resolves.toBeUndefined();
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate).toHaveBeenCalledTimes(1);
  expect(mockAuthenticate).toHaveBeenCalledWith({
    ...mockOptions,
    metaScopes: ['ent_analytics_bulk_ingest_sdk'],
  });
  expect(mockConsoleError).toHaveBeenCalledWith(mockFetchError);
});
