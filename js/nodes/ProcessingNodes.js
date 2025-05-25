import Node from '../core/Node.js';

export class MixingNode extends Node {
  constructor(id, x, y) {
    super(id, 'MixingNode', x, y);
    this.inputs.set('ipsos', 0);
    this.inputs.set('apa', 0);
    this.inputs.set('aditivi', 0);
    this.outputs.set('amestec', 0);
    this.parameters.set('timp_amestecare', 5); 
  }

  async execute() {
    const ips = this.getInputValue('ipsos') || 0;
    const ap = this.getInputValue('apa') || 0;
    const ad = this.getInputValue('aditivi') || 0;
    const timpul_secunde = parseFloat(this.getParameter('timp_amestecare')) || 5;
    
    
    const mix = ips + ap + ad;
    const startMessage = `🔄 Începe amestecarea: ${ips}kg ipsos + ${ap}L apă + ${ad}kg aditivi (${timpul_secunde}s)`;

    await new Promise(resolve => setTimeout(resolve, timpul_secunde * 1000));
    
    this.outputs.set('amestec', mix);
    
    return `✅ Amestecare completă: ${mix}kg amestec (după ${timpul_secunde}s)`;
  }
}


export class FormingNode extends Node {
  constructor(id, x, y) {
    super(id, 'FormingNode', x, y);
    this.inputs.set('amestec', 0);
    this.outputs.set('placi_crude', 0);
    this.parameters.set('greutate_placa', 12.5);
  }
  execute() {
    const am = this.getInputValue('amestec') || 0;
    const g  = parseFloat(this.getParameter('greutate_placa')) || 12.5;
    const n  = Math.floor(am / g);
    this.outputs.set('placi_crude', n);
    return `Formare: ${am}kg amestec → ${n} plăci crude (${g}kg/placă)`;
  }
}

export class DryingNode extends Node {
  constructor(id, x, y) {
    super(id, 'DryingNode', x, y);
    this.inputs.set('placi_crude', 0);
    this.outputs.set('placi_finite', 0);
    this.parameters.set('eficienta', 0.95);
  }
  execute() {
    const pc = this.getInputValue('placi_crude') || 0;
    const e  = parseFloat(this.getParameter('eficienta')) || 0.95;
    const pf = Math.floor(pc * e);
    this.outputs.set('placi_finite', pf);
    return `Uscare: ${pc} plăci crude → ${pf} plăci finite (eficiență ${(e*100).toFixed(1)}%)`;
  }
}
