import pick from 'lodash-es/pick';

const map = {
  add: 'POST',
  clr: 'DELETE',
  del: 'DELETE',
  edit: 'PUT',
  list: 'GET',
  patch: 'PATCH',
  view: 'GET'
};

export default function filterOptions(filterPermission) {
  return (request) => {
    const options = {};
    const keys = Object.keys(request.structure);

    let key = null;
    let method = null;

    for (let i = 0; i < keys.length; i += 1) {
      key = keys[i];
      method = map[key];

      if (typeof request.structure[key] !== 'undefined') {
        if (filterPermission({ method, user: request.user }) === true) {
          options[method] = pick(request.structure[key], ['form', 'query']);
        }
      }
    }

    return options;
  };
}
