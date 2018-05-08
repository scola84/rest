export default function mergeResult() {
  return (request, data, result) => {
    return request.body.type === 'multipart/form-data' ?
      result : { data: result };
  };
}
