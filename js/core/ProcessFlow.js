export default class ProcessFlow {
  constructor() {
    this.nodes = new Map();
    this.connections = [];
  }

  addNode(node) { this.nodes.set(node.id, node); }
  removeNode(id) {
    this.connections = this.connections.filter(c => c.fromNodeId !== id && c.toNodeId !== id);
    this.nodes.delete(id);
  }
  getNode(id) { return this.nodes.get(id); }

  addConnection(fromNodeId, fromPort, toNodeId, toPort) {
    this.connections = this.connections.filter(c => !(c.toNodeId===toNodeId && c.toPort===toPort));
    this.connections.push({ fromNodeId, fromPort, toNodeId, toPort });
  }

  getNodesAfter(executed) {
    if (!executed || executed.size===0) {
      const deps = new Set(this.connections.map(c => c.toNodeId));
      return new Set([...this.nodes.values()].filter(n => !deps.has(n.id)));
    }
    const done = new Set([...executed].map(n => n.id));
    const ready = new Set();
    for (const node of this.nodes.values()) {
      if (done.has(node.id)) continue;
      const deps = this.connections.filter(c => c.toNodeId===node.id).map(c => c.fromNodeId);
      if (deps.every(d => done.has(d))) ready.add(node);
    }
    return ready;
  }

  transferData() {
    for (const {fromNodeId, fromPort, toNodeId, toPort} of this.connections) {
      const src = this.getNode(fromNodeId);
      const dst = this.getNode(toNodeId);
      dst.setInputValue(toPort, src.getOutputValue(fromPort));
    }
  }
}
