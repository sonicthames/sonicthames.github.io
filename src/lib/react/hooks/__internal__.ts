/**
 * @internal
 * Taken straight from React
 * https://github.com/facebook/react/blob/master/packages/shared/objectIs.js
 */
function is(x: any, y: any) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y) // eslint-disable-line no-self-compare
  );
}

/**
 * @internal
 * Taken straight from React
 * https://github.com/facebook/react/blob/c59c3dfe554dafb64864f3bbcfff6ffe51f32275/packages/react-reconciler/src/ReactFiberHooks.new.js
 * Removed __DEV__ check
 */
export function areHookInputsEqual(
  nextDeps: ReadonlyArray<unknown>,
  prevDeps: ReadonlyArray<unknown> | null
) {
  if (prevDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
