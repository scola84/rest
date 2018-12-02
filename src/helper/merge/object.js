import omit from 'lodash-es/omit';
import pick from 'lodash-es/pick';

function omitAndPick(object, options = {}) {
  if (options.omit) {
    object = omit(object, options.omit.split(','));
  }

  if (options.pick) {
    object = pick(object, options.pick.split(','));
  }

  return object;
}

export default function mergeObject(type = 'data', server = {}) {
  return (request, { meta = {} }, { result: [object] }) => {
    if (typeof object === 'undefined') {
      return object;
    }

    const client = {
      meta: request.parseUrl().query.meta,
      data: request.parseUrl().query.data
    };

    const result = {
      meta: client.meta && client.meta.omit === '*' ? {} : meta,
      [type]: client.data && client.data.omit === '*' ? {} : object
    };

    result.meta = omitAndPick(result.meta, server.meta);
    result.meta = omitAndPick(result.meta, client.meta);

    result[type] = omitAndPick(result[type], server.data);
    result[type] = omitAndPick(result[type], client.data);

    return result;
  };
}
