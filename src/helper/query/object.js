import defaults from 'lodash-es/defaults';
import filterPermission from '../filter/permission';

export default function queryObject(queries, options = {}) {
  options = defaults({}, options, {
    config: {},
    permission: `${options.object}.${options.object}`,
    type: 'data'
  });

  return Object.assign({}, queries, {
    config: options.config,
    permission: filterPermission(options.permission),
    type: options.type
  });
}
