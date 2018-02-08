export default function mergeCheck() {
  return (request, data, { result }) => {
    if (result.length === 0) {
      throw new Error('403 Forbidden modification');
    }

    return data;
  };
}
