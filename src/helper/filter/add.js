export default function filterAdd() {
  return (request, data, { result }) => {
    return {
      data: { id: result.insertId }
    };
  };
}
