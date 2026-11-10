// Tiny classname combiner: filters out falsy values and joins with a
// space. Used by every component in components/ui and features/ so
// variant/size/state class logic reads the same way everywhere,
// instead of each file re-implementing its own array.join(' ').
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
