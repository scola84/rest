export default function mergeAdd(virtual) {
  return (request, data, { result, key }) => {
    if (virtual && key) {
      request.virtual = request.virtual || [];
      request.virtual.push(key.name);
    }

    if (key === null || Number(result.insertId) === 0) {
      return {
        data: {}
      };
    }

    return {
      data: {
        [key.name]: result.insertId
      }
    };
  };
}
