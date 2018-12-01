import defaults from 'lodash-es/defaults';
import filterPermission from '../filter/permission';

export default function queryObject(queries, options = {}) {
  options = defaults({}, options, {
    check: true,
    omit: options.omit,
    permission: `${options.object}.${options.object}`,
    type: 'data'
  });

  return Object.assign({}, queries, {
    check: options.check,
    omit: options.omit,
    permission: filterPermission(options.permission),
    type: options.type
  });
}
