const { Signal } = require("micro-signals");
const Node = require("./node");
const chalk = require("chalk");
const WebSocket = require("ws");

// const websocket = {
//   fn: o => {
//     const socket = new WebSocket(o.url);
//     socket.on("message", processMessage)
//     return processMessage
//   },
//   inports: ["url"]
// }

// const buffer = {
//   fn: o => {
//     o.socket.on("message", data => {
//       // update("A", { x: parseFloat(data) })
//       console.log(data)
//     });
//   },
//   inports: ["socket"]
// }

const delayedAdd = {
  fn: o =>
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(o.x + o.y), 500);
    }),
  inports: ["x", "y"]
};

const add = {
  fn: o => o.x + o.y,
  inports: ["x", "y"]
};

const sub = {
  fn: o => o.a - o.b,
  inports: ["a", "b"]
};

const log = {
  fn: o => {
    console.log(o.a);
    return o.a;
  },
  inports: ["a"]
};

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
    // run(id);
  };

  function removeNode(id) {
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

  return {
    addNode,
    removeNode,
    nodes,
    run,
    update
  };
}

const g = Graph();

g.addNode("B", sub, { a: "$A", b: 50 });
g.addNode("C", add, { x: 2, y: 2 });
g.addNode("D", add, { x: "$C", y: "$B" });
g.addNode("E", add, { x: "$B", y: 11.43 });
g.addNode("A", add, { x: 4, y: 5 });

// addNode("W", websocket, { url: "wss://tweetstorm.patternx.cc" })
// addNode("BU", buffer, { socket: "$W" })

// run all leaf nodes
Object.keys(g.nodes)
  // find all nodes where the input value does not begin with $
  .filter(nodeName =>
    Object.values(g.nodes[nodeName].input).every(input => input[0] !== "$")
  )
  .map(node => {
    console.log(chalk.grey("RUNNING"), node);
    g.run(node);
  });

setTimeout(() => {
  g.addNode("F", add, { x: "$D", y: "$A" });
  g.removeNode("D");

  console.log(
    Object.keys(g.nodes).map(key => {
      const node = g.nodes[key];
      return [node.id, node.input, node.output];
    })
  );
}, 1000);

// setInterval(() => g.update("C", { x: parseInt(Math.random() * 4) }), 100);
// setInterval(() => update("A", { x: parseInt(Math.random()*4) }), 250)
// setInterval(() => update("B", { b: parseInt(Math.random()*4) }), 320)
