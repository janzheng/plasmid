
/* 

  taken from here: https://www.youtube.com/watch?v=-vjNAyL2JCQ 

  what this does is override a store's update method with a new one that takes a side effect function, to do whatever you want with the new value.

*/


export const overridable = (store, onChange ) => {
  const update = (updater, sideEffect) =>
    store.update((curr) => {
      const next = updater (curr);
      let res = next;
      if (onChange) {
        res = onChange({ curr, next });
      }

      sideEffect?.(res);
      return res;
  });

  const set = (curr) => {
    update(() => curr)
  };

  return {
    ...store, update, set
  }
}