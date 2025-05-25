import Node from '../core/Node.js';

export class CostCalculationNode extends Node {
  constructor(id, x, y) {
    super(id, 'CostCalculationNode', x, y);
    this.inputs.set('ipsos_kg', 0);
    this.inputs.set('apa_l', 0);
    this.inputs.set('aditivi_kg', 0);
    this.outputs.set('cost_total', 0);
    this.parameters.set('pret_ipsos', 0.5);
    this.parameters.set('pret_apa', 0.01);
    this.parameters.set('pret_aditivi', 2.0);
  }
  execute() {
    const i = this.getInputValue('ipsos_kg');
    const a = this.getInputValue('apa_l');
    const d = this.getInputValue('aditivi_kg');
    const pi = parseFloat(this.getParameter('pret_ipsos')) || 0.5;
    const pa = parseFloat(this.getParameter('pret_apa')) || 0.01;
    const pd = parseFloat(this.getParameter('pret_aditivi'))|| 2.0;
    const cost = i*pi + a*pa + d*pd;
    this.outputs.set('cost_total', cost);
    return `Cost: ${cost.toFixed(2)} lei (Ipsos: ${(i*pi).toFixed(2)}, Apă: ${(a*pa).toFixed(2)}, Aditivi: ${(d*pd).toFixed(2)})`;
  }
}

export class ProfitCalculationNode extends Node {
  constructor(id, x, y) {
    super(id, 'ProfitCalculationNode', x, y);
    this.inputs.set('cost_total', 0);
    this.inputs.set('placi_finite', 0);
    this.outputs.set('venituri', 0);
    this.outputs.set('profit', 0);
    this.parameters.set('pret_vanzare_placa', 15.0);
  }
  execute() {
    const cost = this.getInputValue('cost_total');
    const pf   = this.getInputValue('placi_finite');
    const pv   = parseFloat(this.getParameter('pret_vanzare_placa'))||15.0;
    const venituri = pf * pv;
    const profit   = venituri - cost;
    this.outputs.set('venituri', venituri);
    this.outputs.set('profit', profit);
    return `Profit: ${profit.toFixed(2)} lei (Venituri: ${venituri.toFixed(2)} - Cost: ${cost.toFixed(2)})`;
  }
}

export class EfficiencyNode extends Node {
  constructor(id, x, y) {
    super(id, 'EfficiencyNode', x, y);
    this.inputs.set('placi_finite', 0);
    this.inputs.set('amestec_total', 0);
    this.outputs.set('eficienta_generala', 0);
    this.parameters.set('capacitate_maxima', 100);
  }
  execute() {
    const pf = this.getInputValue('placi_finite');
    const at = this.getInputValue('amestec_total');
    const cap = parseFloat(this.getParameter('capacitate_maxima')) || 100;
    const eff = at > 0 ? (pf * 12.5) / at : 0;
    this.outputs.set('eficienta_generala', eff);
    const util = pf / cap;
    return `Eficiență: ${(eff*100).toFixed(1)}% material, ${(util*100).toFixed(1)}% capacitate`;
  }
}
