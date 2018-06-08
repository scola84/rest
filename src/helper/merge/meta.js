export default function mergeMeta(mayEdit = null) {
  mayEdit = mayEdit === null ? mayEdit : mayEdit();

  return (request, data, { result: [meta] }) => {
    if (mayEdit === null) {
      data.meta = meta;
      return data;
    }

    if (mayEdit(request, { meta }) === false) {
      throw new Error('403 Modification not allowed');
    }

    return request.body.type === 'multipart/form-data' ?
      data : { data };
  };
}
