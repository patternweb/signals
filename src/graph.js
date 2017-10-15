const { Signal } = require("micro-signals");
const Node = require("./node");
const chalk = require("chalk");

function Graph() {
  const signal = new Signal();

  const nodes = {};

  const addNode = (id, _fn, ob) => {
    if (nodes[id]) throw Error("Node already exists with that ID");
    nodes[id] = nodes[id] || new Node(id, _fn.fn, ob, _fn.inports);
    Object.keys(ob).forEach(key => {
      nodes[id].listeners.push(
        signal.filter(payload => "$" + payload[0] === ob[key]).add(payload => {
          nodes[id].update({ [key]: payload[1] });
          run(id);
        })
      );
      run(ob[key][1]);
      // console.log('running', ob[key])
    });
    // can remove, but probably needs intialRun() otherwise
    run(id, true);
  };

  function removeNode(id) {
    if (!nodes[id]) throw Error("Node doesn't exist");
    console.log(`REMOVING $${id}`);
    signal.dispatch([id, undefined]);
    nodes[id].remove();
    delete nodes[id];
  }

  function run(id, exists = false) {
    if (exists || nodes[id]) {
      // console.log("RUNNING " + id)
      nodes[id].run(result => signal.dispatch([id, result]));
    }
  }

  function update(id, params) {
    if (nodes[id]) {
      nodes[id].update(params);
      run(id, true);
    }
  }

  function initialRun() {
    // run all leaf nodes
    Object.keys(nodes)
      // find all nodes where the input value does not begin with $
      .filter(nodeName =>
        Object.values(nodes[nodeName].input).every(input => input[0] !== "$")
      )
      .map(node => {
        console.log(chalk.grey("RUNNING"), node);
        run(node, true);
      });
  }

  return {
    addNode,
    removeNode,
    nodes,
    run,
    update,
    initialRun
  };
}

module.exports = Graph;
