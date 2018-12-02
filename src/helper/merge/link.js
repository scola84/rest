function mergeFields(request, data, fields, names, result, options = {}) {
  const link = [];

  const omit = options.omit ? options.omit.split(',') : null;
  const pick = options.pick ? options.pick.split(',') : null;

  let field = null;
  let index = null;
  let mayRole = null;
  let mayScope = null;
  let row = null;
  let value = null;

  for (let i = 0; i < names.length; i += 1) {
    link[i] = { name: names[i] };
  }

  for (let i = 0; i < result.length; i += 1) {
    row = result[i];

    index = names.indexOf(row.name);
    field = fields[index];
    value = result[i];

    if (omit !== null) {
      value = omit.indexOf(row.name) === -1 ? result[i] : link[index];
    }

    if (pick !== null) {
      value = pick.indexOf(row.name) > -1 ? result[i] : link[index];
    }

    mayRole = request.user.may([
      field.edit.permission + '.list',
      field.edit.permission + '.view',
    ]);

    mayScope = field.permission ?
      request.user.may(field.permission, request, data) :
      true;

    link[index] = mayRole && mayScope ? value : link[index];
  }

  return link;
}

export default function mergeLink(structure) {
  const fields = [];
  const names = [];

  if (structure.view && structure.view.link) {
    let link = null;

    for (let i = 0; i < structure.view.link.length; i += 1) {
      link = structure.view.link[i];

      for (let j = 0; j < link.fields.length; j += 1) {
        fields[fields.length] = link.fields[j];
        names[names.length] = link.fields[j].name;
      }
    }
  }

  return (request, data, { result }) => {
    const client = {
      link: request.parseUrl().query.link
    };

    data.link = client.link && client.link.omit === '*' ?
      ([]) :
      mergeFields(request, data, fields, names, result, client.link);

    return data;
  };
}
