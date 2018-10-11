import defaults from 'lodash-es/defaults';
import filterPermission from '../filter/permission';

export default function queryCall(queries, options = {}) {
  options = defaults({}, options, {
    check: true,
    permission: `${options.call}.${options.call}`
  });

  return Object.assign({}, queries, {
    check: options.check,
    permission: filterPermission(options.permission)
  });
}
