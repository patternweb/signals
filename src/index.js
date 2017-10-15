const nodes = require("./nodes");
const Graph = require("./graph");

const g = Graph();

g.addNode("D", nodes.add, { x: "$C", y: "$B" });
g.addNode("E", nodes.add, { x: "$B", y: 11.43 });
g.addNode("A", nodes.add, { x: 4, y: 5 });
g.addNode("B", nodes.sub, { a: "$A", b: 50 });
g.addNode("C", nodes.add, { x: 2, y: 2 });

// g.removeNode("C");

// addNode("W", websocket, { url: "wss://tweetstorm.patternx.cc" })
// addNode("BU", buffer, { socket: "$W" })

// g.initialRun();

setTimeout(() => {
  // g.addNode("F", nodes.add, { x: "$D", y: "$A" });
  // g.removeNode("D");

  console.log(
    Object.keys(g.nodes).map(key => {
      const node = g.nodes[key];
      return [node.id, node.input, node.output];
    })
  );
}, 100);

setInterval(() => g.update("C", { x: parseInt(Math.random() * 4) }), 100);
// setInterval(() => update("A", { x: parseInt(Math.random()*4) }), 250)
// setInterval(() => update("B", { b: parseInt(Math.random()*4) }), 320)
