
// 
// convenience functions
// 

// 
// $space = filterBy(orgSettings.spaces, 'name', data.space)?.[0]
export const filterBy = (arr, key, value) => {
  return arr.filter((item) => item[key] === value);
};

export const filterFind = (arr, key, value) => {
  return arr.filter((item) => item[key] === value)?.[0] || null;
};