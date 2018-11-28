import { Selector } from '@scola/rest';
import { mergeCheck } from '../helper';

export default function createCheck(child, ...parents) {
  const workers = [];
  let parent = null;

  for (let i = 0; i < parents.length; i += 1) {
    parent = parents[i];

    workers[i] = new Selector({
      decide: child.getDecide(),
      id: parent.id,
      merge: mergeCheck(parent)
    });

    workers[i] = parent.setup(workers[i], {
      del,
      limit,
      link,
      list,
      object
    });
  }

  workers[workers.length] = child;

  for (let i = 1; i < workers.length; i += 1) {
    workers[i - 1].connect(workers[i]);
  }

  return [workers.shift(), workers.pop()];
}

function del(viewer) {
  return viewer.where({
    required: false,
    value: (request, { data }) => {
      return data.action === 'delete' ? 'NULL' : null;
    }
  }, 0);
}

function link(viewer) {
  return viewer.where({
    value: (request) => {
      return [request.params[2]];
    }
  }, 1);
}

function limit(viewer) {
  const key = viewer.getKey().name;

  return viewer.limit((request, { data }) => {
    return {
      offset: 0,
      count: data[key].length
    };
  });
}

function list(viewer) {
  const key = viewer.getKey().name;

  return viewer.where({
    operator: 'IN',
    value: (request, { data }) => {
      request.body.count = data[key].length;
      return [data[key]];
    }
  }, 1);
}

function object(viewer) {
  const key = viewer.getKey().name;

  return viewer.where({
    value: (request, { data }) => {
      return data[key];
    }
  }, 1);
}
