export default function filterRoleChecker(name, sub) {
  return (request) => {
    if (request.method === 'GET') {
      return request.user.may(name + '.' + sub + '.read');
    }

    return request.user.may(name + '.' + sub + '.write');
  };
}
