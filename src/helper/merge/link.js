export default function mergeLink(structure) {
  const fields = structure.view && structure.view.link ?
    structure.view.link[0].fields.map((field) => field.name) : [];

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
