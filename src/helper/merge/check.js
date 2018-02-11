export default function mergeCheck() {
  return (request, data, { result }) => {
    if (result.length !== (request.body.count || 1)) {
      throw new Error('403 Modification not allowed');
    }

    return data;
  };
}
