export default function whereAuth(object, names = [], type = 'id') {
  return (request) => {
    if (request.user.may(object + '.sudo') === true) {
      return type === 'scope' ? 'write' : null;
    }

    let name = null;
    let parent = null;
    let scope = null;

    for (let i = 0; i < names.length; i += 1) {
      name = names[i];
      parent = request.user.getParentId(name);
      scope = request.user.getParentScope(name);

      if (parent.length > 0) {
        if (i < names.length - 1) {
          return null;
        }

        if (type === 'scope') {
          return scope;
        }

        return [parent];
      }
    }

    return null;
  };
}
