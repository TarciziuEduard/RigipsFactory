
export default class Node {
  constructor(id, type, x = 0, y = 0) {
    this.id = id; this.type = type;
    this.x = x; this.y = y;
    this.inputs = new Map();
    this.outputs = new Map();
    this.parameters = new Map();
    this.executionState = 'ready';
    this.lastExecutionTime = null;
  }

  execute() {
    throw new Error('Execute method must be implemented');
  }

  getInputPorts() { return [...this.inputs.keys()]; }
  getOutputPorts() { return [...this.outputs.keys()]; }
  setInputValue(name, value) { if (this.inputs.has(name)) this.inputs.set(name, value); }
  getInputValue(name) { return this.inputs.get(name); }
  getOutputValue(name) { return this.outputs.get(name); }
  setParameter(name, value) { this.parameters.set(name, value); }
  getParameter(name) { return this.parameters.get(name); }
}
