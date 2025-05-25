
import ProcessFlowUI from './ui/ProcessFlowUI.js';

let ui;

window.addEventListener('DOMContentLoaded', () => {
  ui = new ProcessFlowUI('canvas');
  window.ui = ui;

  setTimeout(() => {
    ui.createNode('IpsosSourceNode',  50,  50);  // node_1
    ui.createNode('WaterSourceNode',  50, 230);  // node_2
    ui.createNode('AdditiveSourceNode',50, 410); // node_3
    ui.createNode('MixingNode',       400, 80); // node_4
    ui.createNode('FormingNode',      700, 80); // node_5
    ui.createNode('DryingNode',      1000, 80); // node_6
    ui.createNode('CostCalculationNode', 400, 330); // node_7
    ui.createNode('ProfitCalculationNode',700, 330); // node_8
    ui.createNode('DisplayNode',     1000, 330); // node_9

    setTimeout(() => {
      ui.processFlow.addConnection('node_1', 'cantitate', 'node_4', 'ipsos');
      ui.processFlow.addConnection('node_2', 'cantitate', 'node_4', 'apa');
      ui.processFlow.addConnection('node_3', 'cantitate', 'node_4', 'aditivi');
      ui.processFlow.addConnection('node_4', 'amestec',   'node_5', 'amestec');
      ui.processFlow.addConnection('node_5', 'placi_crude','node_6', 'placi_crude');
      ui.processFlow.addConnection('node_1', 'cantitate', 'node_7', 'ipsos_kg');
      ui.processFlow.addConnection('node_2', 'cantitate', 'node_7', 'apa_l');
      ui.processFlow.addConnection('node_3', 'cantitate', 'node_7', 'aditivi_kg');
      ui.processFlow.addConnection('node_6', 'placi_finite','node_8','placi_finite');
      ui.processFlow.addConnection('node_7', 'cost_total', 'node_8', 'cost_total');
      ui.processFlow.addConnection('node_8', 'profit',     'node_9', 'value');

      ui.redrawAllConnections();
      ui.updateStatus();
    }, 100);
  }, 100);
});
