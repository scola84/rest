export default function mergeLinkSelector(name, create = false) {
  return (request, data, list) => {
    if (create === false) {
      data[name] = list[0];
      return data;
    }

    return {
      [name]: list[0]
    };
  };
}
