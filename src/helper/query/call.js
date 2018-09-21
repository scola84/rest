import defaults from 'lodash-es/defaults';
import filterPermission from '../filter/permission';

export default function queryCall(queries, options = {}) {
  options = defaults({}, options, {
    check: true,
    config: {},
    permission: `${options.section}.${options.call}`
  });

  return Object.assign({}, queries, {
    check: options.check,
    config: options.config,
    permission: filterPermission(options.permission)
  });
}
