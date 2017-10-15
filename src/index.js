const { Signal } = require("micro-signals");
const Node = require("./node");
const chalk = require("chalk");

const signal = new Signal();

const nodes = {};

// const delayedAddFn = cb => o => setTimeout(() => cb(o.a + o.b), 1000);
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

const addNode = (id, _fn, ob) => {
  let fn = _fn.fn;
  if (typeof fn({}) === "function") {
    fn = fn(_ => _);
  }
  nodes[id] = nodes[id] || new Node(id, fn, ob, _fn.inports);
  Object.keys(ob).forEach(key => {
    nodes[id].listeners.push(
      signal.filter(payload => "$" + payload[0] === ob[key]).add(payload => {
        nodes[id].attach({ [key]: payload[1] });
        run(id);
      })
    );
    run(ob[key][1]);
    // console.log('running', ob[key])
  });
  run(id);
};

function removeNode(id) {
  signal.dispatch([id, undefined]);
  nodes[id].remove();
  delete nodes[id];
}

function run(id) {
  if (nodes[id]) {
    // console.log("RUNNING " + id)
    nodes[id].run(result => signal.dispatch([id, result]));
  }
}

addNode("C", add, { x: 2, y: 2 });
addNode("D", add, { x: "$C", y: "$B" });
addNode("E", add, { x: "$B", y: 11.43 });
addNode("A", add, { x: 10, y: 5 });
addNode("B", sub, { a: "$A", b: 50 });

// // run all leaf nodes
// Object.keys(nodes)
//   // find all nodes where the input value does not begin with $
//   .filter(nodeName => Object.values(nodes[nodeName].input).every(input => input[0] !== "$"))
//   .map(node => {
//     console.log(chalk.grey("RUNNING"), node);
//     run(node);
//   });

// setTimeout(() => {
//   removeNode("B");
//   console.log(
//     Object.keys(nodes).map(key => {
//       const node = nodes[key];
//       return [node.id, node.input, node.output];
//     })
//   );
// }, 2000);

// const WebSocket = require("ws");
// const socket = new WebSocket("wss://tweetstorm.patternx.cc");
// socket.on("message", data => {
//   nodes["A"].attach({ a: parseFloat(data) });
//   run("A");
// });
