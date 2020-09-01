// export function getSign(value: number) {
//   if (value === 0) {
//     return 0;
//   }

//   return value / Math.abs(value);
// }

// This is being used in production only
/* istanbul ignore next */
export function random(first: number, second = -first) {
  const min = Math.min(first, second);
  const max = Math.max(first, second);
  return Math.round(Math.random() * (max - min) + min);
}
