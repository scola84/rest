export default function mergeResult() {
  return (request, data, result) => {
    return { data: result };
  };
}
