export default function mergeList() {
  return (request, data, { result }) => {
    return {
      data: result,
      meta: data.meta
    };
  };
}
