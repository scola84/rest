export default function mergeAdd() {
  return (request, data, { result }) => {
    return {
      meta: {
        id: result.insertId
      }
    };
  };
}
