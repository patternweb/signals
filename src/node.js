const chalk = require("chalk");

function Node(id, fn, initialParams = {}, inports = []) {
  this.id = id;
  this.implementation = fn;
  this.input = initialParams;
  this.inports = inports;
  this.output = undefined;
  this.listeners = [];
  // this._attachFn = this.generator(this.input)
  // this._attachFn.next()
}

// Node.prototype.generator = function*(initialParams) {
//   while(true) {
//     this.input = {...this.input, ...yield}
//   }
// }

Node.prototype.remove = function() {
  while (this.listeners.length > 0) {
    this.listeners.pop().detach();
  }
  console.log(chalk.red("REMOVED"), this.id);
};

Node.prototype.attach = function(params) {
  const prevInput = JSON.stringify(this.input);
  // this._attachFn.next(params)
  this.input = { ...this.input, ...params };
  if (prevInput !== JSON.stringify(this.input)) {
    this.output = undefined;
  }
  return this;
};

Node.prototype.run = function(cb) {
  if (this.output) {
    console.log(chalk.green("CACHED OUTPUT"), this.id);
  } else if (
    this.inports.every(
      inport => this.input[inport] && this.input[inport][0] !== "$"
    )
  ) {
    this.output = this.implementation(this.input);
    console.log(
      chalk.magenta("CALCULATED"),
      this.id,
      "=",
      this.output,
      this.input
    );
    // this._attachFn = this.generator(this.input)
    // this._attachFn.next()
  } else {
    console.log(chalk.yellow("WAITING"), this.id, this.input);
  }
  cb(this.output);
};

module.exports = Node;
