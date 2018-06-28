export default function mergeObject(type = 'data') {
  return (request, data, { result: [object] }) => {
    if (typeof object === 'undefined') {
      return object;
    }

    return {
      meta: data.meta,
      [type]: object
    };
  };
}
