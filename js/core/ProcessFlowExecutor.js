export default class ProcessFlowExecutor {
  static async execute(flow, onNodeStart = null, onNodeComplete = null) {
    const executed = new Set();
    const logs = [];
    let iteration = 0, maxIt = 100;

    logs.push('🚀 Începe execuția procesului...');
    
    while (iteration < maxIt) {
      const batch = flow.getNodesAfter(executed);
      if (batch.size === 0) {
        logs.push('✅ Toate nodurile au fost executate cu succes!');
        break;
      }
      
      logs.push(`📋 Iterația ${iteration+1}: Execută ${batch.size} noduri`);
      const thisRound = new Set();
      
      // Execută nodurile în paralel (sau secvențial pentru demo)
      for (const node of batch) {
        try {
          node.executionState = 'executing';
          
          // Callback pentru UI când începe execuția
          if (onNodeStart) onNodeStart(node);
          
          const res = await node.execute();
          
          node.executionState = 'completed';
          node.lastExecutionTime = new Date();
          logs.push(`✓ ${node.type}: ${res}`);
          thisRound.add(node);
          
          // Callback pentru UI când se completează
          if (onNodeComplete) onNodeComplete(node, res);
          
        } catch (err) {
          node.executionState = 'error';
          logs.push(`❌ ${node.type}: Eroare - ${err.message}`);
        }
      }
      
      thisRound.forEach(n => executed.add(n));
      flow.transferData();
      iteration++;
    }
    
    if (iteration >= maxIt) {
      logs.push('⚠️ Execuția s-a oprit după numărul maxim de iterații');
    }
    
    return logs;
  }
}
