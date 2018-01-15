export default function filterObjectDeleter(name) {
  return (request) => {
    const query = request.parseUrl().query;

    return {
      [name + '_id']: request.params[1],
      deleted: query.undelete ? null : Date.now()
    };
  };
}
