import * as moduleUnderTest from '../index';

test('hello world', () => {
  expect(moduleUnderTest.default()).toBe('Hello World!');
});
