import {IpsosSourceNode,WaterSourceNode,AdditiveSourceNode} from '../nodes/SourceNodes.js';
import {MixingNode,FormingNode,DryingNode} from '../nodes/ProcessingNodes.js';
import {CostCalculationNode,ProfitCalculationNode,EfficiencyNode} from '../nodes/CalculationNodes.js';
import {LogNode,DisplayNode} from '../nodes/OutputNodes.js';

const map = {
  IpsosSourceNode,
  WaterSourceNode,
  AdditiveSourceNode,
  MixingNode,
  FormingNode,
  DryingNode,
  CostCalculationNode,
  ProfitCalculationNode,
  EfficiencyNode,
  LogNode,
  DisplayNode
};

export default class NodeFactory {
  static createNode(type, id, x, y) {
    const Cls = map[type];
    if (!Cls) throw new Error(`Unknown node type: ${type}`);
    return new Cls(id, x, y);
  }

  static getNodeDisplayName(type) {
    return {
      IpsosSourceNode:     '⬜ Sursă ipsos',
      WaterSourceNode:     '💧 Sursă apă',
      AdditiveSourceNode:  '🧪 Sursă aditivi',
      MixingNode:          '🔄 Amestecare',
      FormingNode:         '📋 Formare plăci',
      DryingNode:          '🔥 Uscare',
      CostCalculationNode: '💰 Calcul cost',
      ProfitCalculationNode:'📈 Calcul profit',
      EfficiencyNode:      '⚡ Eficiență',
      LogNode:             '📝 Log',
      DisplayNode:         '📺 Display'
    }[type] || type;
  }

  static getNodeParameters(type) {
    return {
      IpsosSourceNode:    [{ name:'cantitate_kg', label:'Kg', type:'number', default:100 }],
      WaterSourceNode:    [{ name:'cantitate_l', label:'Litri', type:'number', default:30 }],
      AdditiveSourceNode: [{ name:'cantitate_kg', label:'Kg', type:'number', default:2 }],
      MixingNode:         [{ name:'timp_amestecare', label:'Secunde',  type:'number', default:5 }],
      FormingNode:        [{ name:'greutate_placa', label:'Kg/placă', type:'number', default:12.5 }],
      DryingNode:         [{ name:'eficienta', label:'Eficiență',  type:'number', default:0.95 }],
      CostCalculationNode:[
        {name:'pret_ipsos', label:'Lei/kg ipsos', type:'number', default:0.5},
        {name:'pret_apa',   label:'Lei/l apă',    type:'number', default:0.01},
        {name:'pret_aditivi',label:'Lei/kg aditivi',type:'number',default:2.0}
      ],
      ProfitCalculationNode:[{name:'pret_vanzare_placa',label:'Lei/placă',type:'number',default:15.0}],
      EfficiencyNode:      [{name:'capacitate_maxima',label:'Plăci max',type:'number',default:100}],
      LogNode:             [],
      DisplayNode:         [{name:'label',label:'Eticheta',type:'text',default:'Rezultat'}]
    }[type]||[];
  }
}
