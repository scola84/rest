export default function filterObjectResolver(name) {
  return (request, data) => {
    return {
      [name + '_id']: data.object[name + '_id']
    };
  };
}
