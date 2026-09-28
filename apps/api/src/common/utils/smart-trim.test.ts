import { smartTrim } from './smart-trim.js';

describe('smartTrim', () => {
  it('should trim the string correctly', () => {
    const str = 'The quick brown fox jumps over the lazy dog';
    const length = 20;
    const delim = ' ';
    const appendix = '...';
    const result = smartTrim(str, length, delim, appendix);
    expect(result).toBe('The quick brown fox...');
  });
  it("should return the original string if it's shorter than the length", () => {
    const str = 'Short string';
    const length = 20;
    const delim = ' ';
    const appendix = '...';
    const result = smartTrim(str, length, delim, appendix);
    expect(result).toBe(str);
  });
  it('should handle strings with no delimiters correctly', () => {
    const str = 'Thequickbrownfoxjumpsoverthelazydog';
    const length = 20;
    const delim = ' ';
    const appendix = '...';
    const result = smartTrim(str, length, delim, appendix);
    expect(result).toBe('Thequickbrownfoxjump...');
  });
  it('should handle strings where the last delimiter is exactly at the trim point', () => {
    const str = 'The quick brown fox jumps over the lazy dog';
    const length = 19;
    const delim = ' ';
    const appendix = '...';
    const result = smartTrim(str, length, delim, appendix);
    expect(result).toBe('The quick brown fox...');
  });
  it('should handle strings where the last delimiter is before the trim point', () => {
    const str = 'The quick brown fox jumps over the lazy dog';
    const length = 22;
    const delim = ' ';
    const appendix = '...';
    const result = smartTrim(str, length, delim, appendix);
    expect(result).toBe('The quick brown fox...');
  });
});
