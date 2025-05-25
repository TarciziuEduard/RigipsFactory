import Node from '../core/Node.js';

export class LogNode extends Node {
  constructor(id, x, y) {
    super(id, 'LogNode', x, y);
    this.inputs.set('message', '');
  }
  execute() {
    const msg = this.getInputValue('message') || 'Log node executed';
    console.log(`[LOG] ${msg}`);
    return `Logged: ${msg}`;
  }
}

export class DisplayNode extends Node {
  constructor(id, x, y) {
    super(id, 'DisplayNode', x, y);
    this.inputs.set('value', 0);
    this.parameters.set('label', 'Rezultat');
  }
  execute() {
    const v = this.getInputValue('value');
    const l = this.getParameter('label');
    return `${l}: ${typeof v==='number'? v.toFixed(2): v}`;
  }
}
