const map = {
  list: {
    DELETE: 'del',
    GET: 'list',
    POST: 'add'
  },
  object: {
    DELETE: 'del',
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
