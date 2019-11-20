import getBaseStats from '../getBaseStats';

test('expected data', () => {
  expect(getBaseStats()).toMatchSnapshot();
});

test('version order', () => {
  const stats = getBaseStats();
  for (const [browser, versions] of Object.entries(stats)) {
    expect(Object.keys(versions)).toMatchSnapshot(browser);
  }
});
