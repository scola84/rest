const map = {
  call: {
    POST: 'call'
  },
  list: {
    DELETE: 'del',
    GET: 'list',
    POST: 'add',
    PUT: 'edit'
  },
  object: {
    DELETE: 'del',
    GET: 'view',
    PATCH: 'edit',
    PUT: 'edit'
  }
};

export default function filterPermission(base) {
  return (type) => {
    return (request) => {
      return request.method === 'OPTIONS' ? true :
        request.user.may(base + '.' + map[type][request.method]);
    };
  };
}
