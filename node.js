function Node(id, fn, initialParams={}) {
  this.id = id
  this.implementation = fn
  this.inputs = initialParams
  this.output = undefined
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
  return new Promise((resolve, reject) => {
    if (this.inputs.a && this.inputs.b) {
      this.output = this.implementation(this.inputs)
      resolve(this.output)
    } else {
      reject(this.id + JSON.stringify(this.inputs))
    }
  })
}

module.exports = Node
