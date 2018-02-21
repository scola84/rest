export default function mergeLink(structure) {
  const fields = [];

  if (structure.view && structure.view.link) {
    let link = null;

    for (let i = 0; i < structure.view.link.length; i += 1) {
      link = structure.view.link[i];

      for (let j = 0; j < link.fields.length; j += 1) {
        fields[fields.length] = link.fields[j].name;
      }
    }
  }

  return (request, data, { result }) => {
    if (fields.length) {
      const link = new Array(fields.length).fill({});

      for (let i = 0; i < result.length; i += 1) {
        link[fields.indexOf(result[i].name)] = result[i];
      }

      data.link = link;
    } else {
      data.link = result;
    }

    return data;
  };
}
