import { Filter } from './pipe.pipe';

describe('Filter', () => {
  it('create an instance', () => {
    const pipe = new Filter();
    expect(pipe).toBeTruthy();
  });
});
