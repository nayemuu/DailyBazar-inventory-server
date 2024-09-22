// export const replaceMongoIdInArray = (array) => {
//   const mappedArray = array
//     .map((item) => ({
//       id: item._id.toString(),
//       ...item,
//     }))
//     .map(({ _id, ...rest }) => rest);

//   return mappedArray;
// };

export const replaceMongoIdInArray = (array) => {
  // Helper function to recursively replace _id with id in an object
  const replaceIds = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(replaceIds);
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((item, key) => {
        const value = obj[key];
        if (key === "_id") {
          item["id"] = value.toString();
        } else {
          item[key] = replaceIds(value);
        }
        return item;
      }, {});
    }
    return obj;
  };

  return array.map(replaceIds);
};

export const replaceMongoIdInObject = (obj) => {
  const { _id, ...updatedObj } = { ...obj, id: obj._id.toString() };
  return updatedObj;
};
