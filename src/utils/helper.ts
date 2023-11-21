export const snakeCase = (value: string) => {
  if (value) {
    return value
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word: string) => word.toLowerCase())
      .join("_");
  }
};

export const generateUID = (length: number | null = null) => {
  const result = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
  return length !== null ? result.slice(0, length) : result;
};
