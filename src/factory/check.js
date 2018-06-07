import { Selector } from '@scola/rest';
import { filterData, mergeCheck } from '../helper';

export default function createCheck(child, ...parents) {
  const workers = [];
  let parent = null;
  let worker = null;

  for (let i = 0; i < parents.length; i += 1) {
    parent = parents[i];
    worker = new Selector();

    workers[i] = parent.setup(worker);
    workers[i].setDecide(child.getDecide());
    workers[i].setFilter(filterData());
    workers[i].setMerge(mergeCheck(parent.merge, worker));

    if (parent.where) {
      worker.where(parent.where, parent.index);
    }
  }

  workers[workers.length] = child;

  for (let i = 1; i < workers.length; i += 1) {
    workers[i - 1].connect(workers[i]);
  }

  return [workers.shift(), workers.pop()];
}
