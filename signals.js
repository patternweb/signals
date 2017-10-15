const {Signal} = require('micro-signals');
const signal = new Signal();

const addFn = o => o.a+o.b
const subFn = o => o.a-o.b

function Node(id, fn, initialParams={}) {
  this.id = id
  this.implementation = fn
  this.inputs = initialParams
  this._attachFn = this.generator(this.inputs)
  this._attachFn.next()
}
Node.prototype.generator = function*(initialParams) {
  while(true) {
    this.inputs = {...this.inputs, ...yield}
  }
}
Node.prototype.attach = function(params) {
  const res = this._attachFn.next(params)
  return this
}
Node.prototype.run = function () {
  if (this.inputs.a && this.inputs.b) {
    return this.implementation(this.inputs)
  }
}

const n = new Node("add", addFn, {a: 2})
console.log(n.run())
console.log(n.attach({b: 4}))
console.log(n.run())

const functions = {}

const node = (id, fn, ob) => {
  functions[id] = () => fn(ob)
  Object.values(ob).forEach(param => {
    signal.filter(payload => "$"+payload[0] === param).add(payload => {
      console.log(`ran ${payload[0]} - now ${id} will run because of $${payload[0]}>${id}`)
      run(id)
    })
  })
  run(id)
}

node("C", addFn, {a:2,b:2})
node("B", subFn, {a:"$A",b:3})
node("A", addFn, {a:10,b:5})
node("D", addFn, {a:"$C",b:"$B"})

function run(id) {
  console.log("RUNNING " + id)
  signal.dispatch([id, functions[id]()])
}

// run("$A")
// run("$C")
