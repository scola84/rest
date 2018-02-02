const map = {
  list: {
    DELETE: 'delete',
    GET: 'list',
    POST: 'add'
  },
  object: {
    GET: 'view',
    PUT: 'edit'
  }
};

export default function filterPermission(base) {
  return (type) => {
    return (request) => {
      return request.user.may(base + '.' + map[type][request.method]);
    };
  };
}
