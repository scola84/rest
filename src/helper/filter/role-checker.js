const map = {
  DELETE: 'del',
  GET: 'view',
  POST: 'add',
  PUT: 'edit'
};

export default function filterRoleChecker(name, sub) {
  return (request) => {
    return request.user.may(name + '.' + sub + '.' + map[request.method]);
  };
}
