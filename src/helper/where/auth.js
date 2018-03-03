export default function whereAuth(object, names = [], owner = false) {
  return (request) => {
    if (request.user.may(object + '.sudo') === true) {
      return null;
    }

    const parents = request.user.getParents();
    const values = [];

    for (let i = 0; i < names.length; i += 1) {
      if (parents[names[i]] && i < names.length - 1) {
        return null;
      }

      values[values.length] = parents[names[i]];
    }

    if (owner === false || values.length === 0) {
      values[values.length] = request.user.getId();
    }

    return values;
  };
}
