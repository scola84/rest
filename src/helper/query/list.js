import defaults from 'lodash-es/defaults';
import filterPermission from '../filter/permission';

export default function queryList(queries, options = {}) {
  options = defaults({}, options, {
    permission: `${options.name}.self`
  });

  return Object.assign({}, queries, {
    permission: filterPermission(options.permission)
  });
}
