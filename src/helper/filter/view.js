export default function filterView() {
  return (request) => {
    return {
      id: request.params[1]
    };
  };
}
