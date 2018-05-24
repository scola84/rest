export default function mergeEdit() {
  return (request, data) => {
    return {
      meta: {
        id: data.id
      }
    };
  };
}
