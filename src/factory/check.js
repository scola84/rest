import { Selector } from '@scola/rest';

export default function createCheck(child, ...parents) {
  const workers = [];
  let parent = null;
  let worker = null;

  for (let i = 0; i < parents.length; i += 1) {
    parent = parents[i];
    worker = new Selector({
      merge: (request, data, { result }) => {
        if (result.length !== (request.body.count || 1)) {
          throw new Error('403 Modification not allowed');
        }

        return data;
      }
    });

    workers[i] = parent.setup(worker);

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
