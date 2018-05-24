export default function mergeAdd() {
  return (request, data, { result, key = null }) => {
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
