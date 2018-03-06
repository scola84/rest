import defaults from 'lodash-es/defaults';
import filterPermission from '../filter/permission';

export default function queryList(queries, options = {}) {
  options = defaults({}, options, {
    check: true,
    config: {},
    permission: `${options.object}.${options.object}`
  });

  return Object.assign({}, queries, {
    check: options.check,
    config: options.config,
    permission: filterPermission(options.permission)
  });
}
