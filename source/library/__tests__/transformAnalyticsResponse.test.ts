import {
  /*transfromAnalyticsResponse,*/ findVersion,
  // getBrowserVersion,
  // getLatestVersion,
} from '../transformAnalyticsResponse';

describe('findVersion', () => {
  test('major', () => {
    expect(findVersion('8', ['8'])).toBe('8');
    expect(findVersion('8', ['8.0'])).toBe('8.0');
    expect(findVersion('8.0', ['8'])).toBe('8');
    expect(findVersion('8.0', ['8.0'])).toBe('8.0');
    expect(findVersion('8', ['9'])).toBeNull();
    expect(findVersion('8.0', ['9'])).toBeNull();
    expect(findVersion('8.0', ['9.0'])).toBeNull();
  });

  test('minor', () => {
    expect(findVersion('8.1', ['8.1'])).toBe('8.1');
    expect(findVersion('8.1', ['8'])).toBe('8');
    expect(findVersion('8', ['8.1'])).toBe('8.1');
    expect(findVersion('8.1', ['8.7'])).toBe('8.7');
  });

  test('patch', () => {
    expect(findVersion('8.2.1', ['8.2.1'])).toBe('8.2.1');
    expect(findVersion('8.2.1', ['8.2'])).toBe('8.2');
    expect(findVersion('8.2.1', ['8'])).toBe('8');
    expect(findVersion('8.2', ['8.2.1'])).toBe('8.2.1');
    expect(findVersion('8', ['8.2.1'])).toBe('8.2.1');
    expect(findVersion('8.2.2', ['8.2.1'])).toBe('8.2.1');
    expect(findVersion('8.3.5', ['8.6.2'])).toBe('8.6.2');
  });

  test('cascade', () => {
    expect(findVersion('8.2', ['8', '8.1', '8.2.1', '7.5', '7'])).toBe('8.2.1');
    expect(findVersion('8.1.1', ['8', '8.1', '8.2.1', '7.5', '7'])).toBe('8.1');
  });
});

describe('getBrowserVersion', () => {});

describe('getLatestVersion', () => {});

describe('transformAnalyticsResponse', () => {});
