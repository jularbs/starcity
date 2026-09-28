export const smartTrim = (
  str: string,
  length: number,
  delim: string,
  appendix: string,
) => {
  if (str.length <= length) return str;

  let trimmedStr = str.slice(0, length + delim.length);

  const lastDelimIndex = trimmedStr.lastIndexOf(delim);
  if (lastDelimIndex >= 0) {
    trimmedStr = trimmedStr.slice(0, lastDelimIndex);
  } else {
    trimmedStr = str.slice(0, length);
  }

  if (trimmedStr) trimmedStr += appendix;

  return trimmedStr;
};
