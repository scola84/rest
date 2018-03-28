export default function whereAuth(object, names = []) {
  return (request) => {
    if (request.user.may(object + '.sudo') === true) {
      return null;
    }

    const parents = request.user.getParents();

    for (let i = 0; i < names.length; i += 1) {
      if (parents[names[i]]) {
        return i < names.length - 1 ? null : [parents[names[i]]];
      }
    }

    return null;
  };
}
