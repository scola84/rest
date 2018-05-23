export default function mergeAdd() {
  return (request, data, { result }) => {
    return {
      data: {
        id: result.insertId
      }
    };
  };
}
