export default function mergeLinkSelector(name, create = false) {
  return (request, data, list) => {
    const value = list[0];

    if (value) {
      value.count = list.length;
    }

    if (create === false) {
      data[name] = value;
      return data;
    }

    return {
      [name]: value
    };
  };
}
