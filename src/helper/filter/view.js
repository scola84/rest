export default function filterView() {
  return (request) => {
    return {
      id: request.params.slice(1)
    };
  };
}
