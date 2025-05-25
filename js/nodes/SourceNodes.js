import Node from '../core/Node.js';

export class IpsosSourceNode extends Node {
  constructor(id, x, y) {
    super(id, 'IpsosSourceNode', x, y);
    this.outputs.set('cantitate', 0);
    this.parameters.set('cantitate_kg', 100);
  }
  execute() {
    const c = parseFloat(this.getParameter('cantitate_kg')) || 100;
    this.outputs.set('cantitate', c);
    return `Ipsos: ${c} kg generat`;
  }
}

export class WaterSourceNode extends Node {
  constructor(id, x, y) {
    super(id, 'WaterSourceNode', x, y);
    this.outputs.set('cantitate', 0);
    this.parameters.set('cantitate_l', 30);
  }
  execute() {
    const c = parseFloat(this.getParameter('cantitate_l')) || 30;
    this.outputs.set('cantitate', c);
    return `Apă: ${c} L generată`;
  }
}

export class AdditiveSourceNode extends Node {
  constructor(id, x, y) {
    super(id, 'AdditiveSourceNode', x, y);
    this.outputs.set('cantitate', 0);
    this.parameters.set('cantitate_kg', 2);
  }
  execute() {
    const c = parseFloat(this.getParameter('cantitate_kg')) || 2;
    this.outputs.set('cantitate', c);
    return `Aditivi: ${c} kg generați`;
  }
}
