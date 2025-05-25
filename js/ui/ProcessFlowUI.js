import ProcessFlow from '../core/ProcessFlow.js';
import ProcessFlowExecutor from '../core/ProcessFlowExecutor.js';
import NodeFactory from '../factory/NodeFactory.js';
import ConnectionSVG from './ConnectionSVG.js';
import { bindGlobal, bindCanvas } from './EventHandlers.js';

export default class ProcessFlowUI {
  constructor(canvasId = 'canvas') {
    this.processFlow = new ProcessFlow();
    this.canvas = document.getElementById(canvasId);
    this.connSVG = new ConnectionSVG(this.canvas);
    this.connSVG.onDelete = conn => this.deleteConnection(conn);
    this.nextNodeId = 1;
    this.selectedNode = null;
    this.isDragging = false;
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.isConnecting = false;
    this.connectionStart = null;

    bindGlobal(this);
    bindCanvas(this);
    this._bindUIButtons();
    this.updateStatus();
    this.addLog('', 'clear');
  }

  _bindUIButtons() {
    document.querySelectorAll('.node-button').forEach(btn =>
      btn.addEventListener('click', e => this.createNode(e.target.dataset.nodeType))
    );
    document.getElementById('runBtn').addEventListener('click', () => this.executeProcess());
    document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
  }

  createNode(type, x = null, y = null) {
    if (x === null) x = Math.random() * (this.canvas.offsetWidth - 250) + 50;
    if (y === null) y = Math.random() * (this.canvas.offsetHeight - 180) + 50;
    const id = `node_${this.nextNodeId++}`;
    const node = NodeFactory.createNode(type, id, x, y);
    this.processFlow.addNode(node);
    this._renderNode(node);
    this.updateStatus();
    this.addLog(`➕ Adăugat: ${NodeFactory.getNodeDisplayName(type)}`, 'info');
  }

  _renderNode(node) {
    const el = document.createElement('div');
    el.className = 'node';
    el.id = node.id;
    el.style.left = node.x + 'px';
    el.style.top = node.y + 'px';

    const displayName = NodeFactory.getNodeDisplayName(node.type);
    const paramsDef = NodeFactory.getNodeParameters(node.type);
    let paramsHTML = '';
    
    paramsDef.forEach(p => {
      // Ia valoarea curenta din nod (care poate fi schimbata de user)
      const currentValue = node.getParameter(p.name) ?? p.default;
      
      paramsHTML += `
        <div class="parameter">
          <label>${p.label}:</label>
          <input type="${p.type}" 
                 value="${currentValue}"
                 data-param-name="${p.name}"
                 data-node-id="${node.id}"
                 class="parameter-input"
                 onclick="event.stopPropagation()"
                 onchange="window.ui.updateNodeParameter('${node.id}', '${p.name}', this.value)"
                 oninput="window.ui.updateNodeParameter('${node.id}', '${p.name}', this.value)">
        </div>`;
    });

    const inPorts = node.getInputPorts();
    const outPorts = node.getOutputPorts();
    let inHTML = '', outHTML = '';
    
    inPorts.forEach(port => {
      // Afisează și valoarea curenta a input-ului
      const currentInputValue = node.getInputValue(port) || 0;
      inHTML += `
        <div class="port-container input-port-container">
          <div class="port input-port"
               data-node-id="${node.id}"
               data-port="${port}"
               data-port-type="input"
               title="Valoare: ${currentInputValue}"></div>
          <span class="port-label">${port}</span>
        </div>`;
    });
    
    outPorts.forEach(port => {
      // Afiseaza si valoarea curenta a output-ului
      const currentOutputValue = node.getOutputValue(port) || 0;
      outHTML += `
        <div class="port-container output-port-container">
          <span class="port-label">${port}</span>
          <div class="port output-port"
               data-node-id="${node.id}"
               data-port="${port}"
               data-port-type="output"
               title="Valoare: ${currentOutputValue}"></div>
        </div>`;
    });

    el.innerHTML = `
      <div class="node-header">
        ${displayName}
        <div class="node-id-badge">${node.id}</div>
      </div>
      <div class="node-content">
        ${paramsHTML}
      </div>
      ${(inPorts.length || outPorts.length) ? `
        <div class="node-ports">
          <div class="input-ports">${inHTML}</div>
          <div class="output-ports">${outHTML}</div>
        </div>` : ''}
    `;

    this._attachNodeListeners(el, node);
    this.canvas.appendChild(el);
    this.redrawAllConnections();
  }

  _attachNodeListeners(el, node) {
    el.addEventListener('click', e => {
      if (!e.target.classList.contains('port')) {
        e.stopPropagation();
        this.clearSelection();
        this.selectedNode = node;
        el.classList.add('selected');
      }
    });

    el.addEventListener('mousedown', e => {
      if (e.target.classList.contains('port') || e.target.tagName === 'INPUT') return;
      this.isDragging = true;
      this.draggedNode = node;
      const rect = this.canvas.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left - node.x;
      this.dragOffset.y = e.clientY - rect.top - node.y;
      el.classList.add('dragging');
      e.preventDefault();
    });

    el.addEventListener('dblclick', e => {
      if (!e.target.classList.contains('port')) {
        e.stopPropagation();
        this.deleteNode(node.id);
      }
    });

    el.querySelectorAll('.port').forEach(portEl => {
      portEl.addEventListener('mousedown', e => {
        e.stopPropagation(); e.preventDefault();
        const portType = portEl.getAttribute('data-port-type');
        const nodeId = portEl.getAttribute('data-node-id');
        const portName = portEl.getAttribute('data-port');
        if (portType === 'output') {
          this.startConnection(portEl, nodeId, portName);
        }
      });

      portEl.addEventListener('mouseenter', () => {
        const portType = portEl.getAttribute('data-port-type');
        if (portType === 'output' && !this.isConnecting) {
          portEl.style.transform = 'scale(1.3)';
          portEl.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.4)';
        } else if (portType === 'input' && this.isConnecting) {
          portEl.style.transform = 'scale(1.3)';
          portEl.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.4)';
        }
      });
      portEl.addEventListener('mouseleave', () => {
        if (!portEl.classList.contains('connecting')) {
          portEl.style.transform = '';
          portEl.style.boxShadow = '';
        }
      });
    });
  }

  startConnection(portEl, nodeId, portName) {
    this.isConnecting = true;
    this.connectionStart = { element: portEl, nodeId, portName };
    portEl.classList.add('connecting');
    portEl.style.backgroundColor = '#f39c12';
    portEl.style.transform = 'scale(1.4)';
    portEl.style.boxShadow = '0 0 0 4px rgba(243, 156, 18, 0.6)';
    document.querySelectorAll('.input-port').forEach(inputPort => {
      if (inputPort.getAttribute('data-node-id') !== nodeId) {
        inputPort.style.backgroundColor = '#27ae60';
        inputPort.style.transform = 'scale(1.2)';
        inputPort.style.boxShadow = '0 0 0 3px rgba(39, 174, 96, 0.5)';
      }
    });
    this.createDragLine();
    this.addLog('🔗 Trage linia către un cerc verde pentru conectare...', 'info');
  }

  createDragLine() {
    this.dragLine = document.createElementNS('http://www.w3.org/2000/svg','path');
    this.dragLine.setAttribute('stroke', '#f39c12');
    this.dragLine.setAttribute('stroke-width', '4');
    this.dragLine.setAttribute('fill', 'none');
    this.dragLine.setAttribute('stroke-dasharray', '8,4');
    this.dragLine.setAttribute('opacity', '0.8');
    this.connSVG.svg.appendChild(this.dragLine);
  }

  updateDragLine(mouseX, mouseY) {
    if (!this.dragLine || !this.connectionStart) return;
    const startPort = this.connectionStart.element;
    const startRect = startPort.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    const x1 = startRect.left - canvasRect.left + startRect.width/2;
    const y1 = startRect.top  - canvasRect.top  + startRect.height/2;
    const x2 = mouseX - canvasRect.left;
    const y2 = mouseY - canvasRect.top;
    const dx = x2 - x1;
    const curve = Math.abs(dx)*0.4;
    const pathData = `M ${x1} ${y1} C ${x1+curve} ${y1}, ${x2-curve} ${y2}, ${x2} ${y2}`;
    this.dragLine.setAttribute('d', pathData);
  }

  handleGlobalMouseMove(e) {
    if (this.isDragging && this.draggedNode) {
      const rect = this.canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left - this.dragOffset.x;
      const newY = e.clientY - rect.top  - this.dragOffset.y;
      this.draggedNode.x = Math.max(0, Math.min(newX, this.canvas.offsetWidth-250));
      this.draggedNode.y = Math.max(0, Math.min(newY, this.canvas.offsetHeight-180));
      const el = document.getElementById(this.draggedNode.id);
      if (el) {
        el.style.left = this.draggedNode.x + 'px';
        el.style.top  = this.draggedNode.y + 'px';
      }
      this.redrawAllConnections();
    } else if (this.isConnecting) {
      this.updateDragLine(e.clientX, e.clientY);
    }
  }

  handleGlobalMouseUp(e) {
    if (this.isDragging && this.draggedNode) {
      document.getElementById(this.draggedNode.id)?.classList.remove('dragging');
      this.isDragging = false;
      this.draggedNode = null;
    } else if (this.isConnecting) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target?.classList.contains('input-port')) {
        const toNodeId = target.getAttribute('data-node-id');
        const toPort   = target.getAttribute('data-port');
        if (toNodeId !== this.connectionStart.nodeId) {
          this.completeConnection(toNodeId, toPort);
        } else {
          this.addLog('❌ Nu poți conecta un nod la el însuși', 'error');
          this.cancelConnection();
        }
      } else {
        this.addLog('📍 Linia trebuie să se termine pe un cerc verde', 'info');
        this.cancelConnection();
      }
    }
  }

  completeConnection(toNodeId, toPort) {
    const { nodeId: fromNodeId, portName: fromPort } = this.connectionStart;
    const exists = this.processFlow.connections.some(c => c.toNodeId===toNodeId && c.toPort===toPort);
    if (exists) this.addLog('⚠️ Portul este deja conectat. Conexiunea va fi înlocuită.', 'info');
    this.processFlow.addConnection(fromNodeId, fromPort, toNodeId, toPort);
    this.redrawAllConnections();
    this.updateStatus();
    const fromName = NodeFactory.getNodeDisplayName(this.processFlow.getNode(fromNodeId).type);
    const toName   = NodeFactory.getNodeDisplayName(this.processFlow.getNode(toNodeId).type);
    this.addLog(`✅ Conectat: ${fromName}.${fromPort} → ${toName}.${toPort}`, 'success');
    this.cancelConnection();
  }

  cancelConnection() {
    this.isConnecting = false;
    if (this.connectionStart?.element) {
      const p = this.connectionStart.element;
      p.classList.remove('connecting');
      p.style.backgroundColor = '';
      p.style.transform = '';
      p.style.boxShadow = '';
    }
    document.querySelectorAll('.input-port').forEach(port => {
      port.style.backgroundColor = '';
      port.style.transform = '';
      port.style.boxShadow = '';
    });
    if (this.dragLine) {
      this.dragLine.remove();
      this.dragLine = null;
    }
    this.connectionStart = null;
  }

  redrawAllConnections() {
    this.connSVG.draw(this.processFlow.connections);
  }

  deleteNode(nodeId) {
    document.getElementById(nodeId)?.remove();
    this.processFlow.removeNode(nodeId);
    this.redrawAllConnections();
    this.updateStatus();
    this.addLog('🗑️ Nod șters', 'info');
  }

  deleteConnection(conn) {
    this.processFlow.connections = this.processFlow.connections.filter(c =>
      !(c.fromNodeId === conn.fromNodeId &&
        c.fromPort   === conn.fromPort &&
        c.toNodeId   === conn.toNodeId &&
        c.toPort     === conn.toPort)
    );

    this.redrawAllConnections();

    this.updateStatus();
    this.addLog('🗑️ Conexiune ștearsă', 'info');
  }

  //Executie asincrona cu delay real
  async executeProcess() {
    //Sincronizeaza parametrii din UI în noduri inainte de executie
    this.syncUIParametersToNodes();

    //Toate nodurile si liniile devin rosii
    document.querySelectorAll('.node').forEach(el => {
      el.style.borderColor = 'red';
      el.style.boxShadow = '';
      el.classList.remove('executing', 'completed', 'error');
    });
    this.connSVG.svg.querySelectorAll('path').forEach(p => {
      p.setAttribute('stroke', 'red');
    });

    //Curatare jurnal si reset stare noduri
    this.addLog('', 'clear');
    for (const node of this.processFlow.nodes.values()) {
      node.executionState = 'ready';
    }

    //Callback functions pentru UI updates
    const onNodeStart = (node) => {
      const el = document.getElementById(node.id);
      if (el) {
        el.style.borderColor = 'orange';
        el.classList.add('executing');
      }
      
      if (node.type === 'MixingNode') {
        const timpul = node.getParameter('timp_amestecare') || 5;
        this.addLog(`⏳ Amestecarea va dura ${timpul} secunde...`, 'info');
      }
    };

    const onNodeComplete = (node, result) => {
      const el = document.getElementById(node.id);
      if (el) {
        el.style.borderColor = 'green';
        el.classList.remove('executing');
        el.classList.add('completed');
      }

      // Liniile care pleaca din acest nod devin verzi
      this.connSVG.svg
        .querySelectorAll(`path[data-from-node="${node.id}"]`)
        .forEach(p => p.setAttribute('stroke', 'green'));

      this.addLog(result, 'success');
      
      // Actualizează tooltip-urile cu noile valori
      this.updatePortTooltips(node.id);
    };

    try {
      //Ruleaza executorul asincron
      const logs = await ProcessFlowExecutor.execute(
        this.processFlow, 
        onNodeStart, 
        onNodeComplete
      );

      //Actualizeaza status-ul final și tooltip-urile
      this.updateStatus();
      this.updateAllPortTooltips();
      
    } catch (error) {
      this.addLog(`❌ Eroare în execuție: ${error.message}`, 'error');
    }
  }

  clearAll() {
    this.canvas.innerHTML = '';
    this.processFlow = new ProcessFlow();
    this.connSVG = new ConnectionSVG(this.canvas);
    this.connSVG.onDelete = conn => this.deleteConnection(conn);
    this.nextNodeId = 1;
    this.updateStatus();
    this.addLog('','clear');
  }

  updateNodeParameter(nodeId, paramName, value) {
    const node = this.processFlow.getNode(nodeId);
    if (!node) return;

    // Actualizeaza parametrul în nod
    node.setParameter(paramName, value);
    
    this.addLog(`⚙️ ${node.type} - ${paramName}: ${value}`, 'info');
    
    // Actualizeaza tooltip-urile porturilor cu noile valori
    this.updatePortTooltips(nodeId);
  }

  //Sincronizeaza toate parametrii din UI în noduri
  syncUIParametersToNodes() {
    document.querySelectorAll('.parameter-input').forEach(input => {
      const nodeId = input.getAttribute('data-node-id');
      const paramName = input.getAttribute('data-param-name');
      const value = input.value;
      
      const node = this.processFlow.getNode(nodeId);
      if (node) {
        node.setParameter(paramName, value);
      }
    });
    
    this.addLog('🔄 Parametrii sincronizați din interfață', 'info');
  }

  //Actualizeaza tooltip-urile porturilor cu valorile curente
  updatePortTooltips(nodeId) {
    const node = this.processFlow.getNode(nodeId);
    if (!node) return;

    const nodeEl = document.getElementById(nodeId);
    if (!nodeEl) return;

    // Actualizeaza input ports
    nodeEl.querySelectorAll('.input-port').forEach(portEl => {
      const portName = portEl.getAttribute('data-port');
      const value = node.getInputValue(portName) || 0;
      portEl.setAttribute('title', `Input: ${portName} = ${value}`);
    });

    // Actualizeaza output ports  
    nodeEl.querySelectorAll('.output-port').forEach(portEl => {
      const portName = portEl.getAttribute('data-port');
      const value = node.getOutputValue(portName) || 0;
      portEl.setAttribute('title', `Output: ${portName} = ${value}`);
    });
  }

  //Actualizeaza toate tooltip-urile după executie
  updateAllPortTooltips() {
    for (const node of this.processFlow.nodes.values()) {
      this.updatePortTooltips(node.id);
    }
  }

  //Metoda pentru a reseta toti parametrii la valorile default
  resetAllParametersToDefault() {
    for (const node of this.processFlow.nodes.values()) {
      const paramsDef = NodeFactory.getNodeParameters(node.type);
      paramsDef.forEach(paramDef => {
        node.setParameter(paramDef.name, paramDef.default);
      });
    }
    
    // Re-render toate nodurile cu noile valori
    this.clearCanvas();
    for (const node of this.processFlow.nodes.values()) {
      this._renderNode(node);
    }
    this.redrawAllConnections();
    
    this.addLog('🔄 Toate parametrii resetați la valorile default', 'info');
  }

  //Curata doar nodurile din canvas
  clearCanvas() {
    document.querySelectorAll('.node').forEach(el => el.remove());
  }

  updateStatus() {
    document.getElementById('nodeCount').textContent = `Noduri: ${this.processFlow.nodes.size}`;
    document.getElementById('connectionCount').textContent = `Conexiuni: ${this.processFlow.connections.length}`;
    document.getElementById('status').textContent = this.processFlow.nodes.size
      ? 'Flux configurat - Pregătit pentru execuție'
      : 'Pregătit pentru configurare';
  }

  addLog(message, type = 'info') {
    const logContent = document.getElementById('logContent');
    if (type === 'clear') {
      logContent.innerHTML = '<div class="log-entry log-info">🚀 Sistem pornit. Adaugă noduri pentru a începe...</div>';
      return;
    }
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    while (logContent.children.length > 50) logContent.removeChild(logContent.firstChild);
  }

  clearSelection() {
    document.querySelectorAll('.node.selected').forEach(el => el.classList.remove('selected'));
  }
}
