// Functions exported here will be stringified in order to be injected on the DSL
// Don't reference anything from these functions that is not JS Standard Library
// Uppercase is not allowed in the function names

export const bool = (x: number) => x > 0.5;

export const cap = (x: number, a: number, b: number) => {
  const min = a < b ? a : b;
  const max = a < b ? b : a;
  return x * (max - min) + min;
};
