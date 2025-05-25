export default class ConnectionSVG {
  constructor(canvas) {
    this.canvas = canvas;
    this.svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    Object.assign(this.svg.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    });
    this.canvas.appendChild(this.svg);
  }

  

  clear() {
    this.svg.querySelectorAll('path').forEach(p => p.remove());
  }


   
  draw(connections) {
    this.clear();
    const canvasRect = this.canvas.getBoundingClientRect();

    connections.forEach(conn => {
      const fromNodeEl = document.getElementById(conn.fromNodeId);
      const toNodeEl   = document.getElementById(conn.toNodeId);
      if (!fromNodeEl || !toNodeEl) return;

      const fromPort = fromNodeEl.querySelector(
        `[data-port="${conn.fromPort}"][data-port-type="output"]`
      );
      const toPort   = toNodeEl.querySelector(
        `[data-port="${conn.toPort}"][data-port-type="input"]`
      );
      if (!fromPort || !toPort) return;

      const fromRect = fromPort.getBoundingClientRect();
      const toRect   = toPort.getBoundingClientRect();

      const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
      const y1 = fromRect.top  - canvasRect.top  + fromRect.height / 2;
      const x2 = toRect.left   - canvasRect.left + toRect.width / 2;
      const y2 = toRect.top    - canvasRect.top  + toRect.height / 2;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.hypot(dx, dy);
      const curve = Math.min(distance * 0.4, 150);

      let pathData;
      if (dx > 0) {
        // left-to-right
        pathData = `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`;
      } else {
        // right-to-left
        const midX = x1 + dx / 2;
        const offsetY = Math.abs(dy) > 50 ? dy / 2 : (dy > 0 ? 60 : -60);
        pathData = `
          M ${x1} ${y1}
          C ${x1 + 80} ${y1}, ${midX} ${y1 + offsetY}, ${midX} ${y1 + offsetY}
          S ${x2 - 80} ${y2}, ${x2} ${y2}
        `;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', pathData.trim());
      path.setAttribute('stroke', '#3498db');
      path.setAttribute('stroke-width', '4');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.9');
      path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
      path.style.cursor = 'pointer';
      path.style.pointerEvents = 'stroke';

      // dubbel-click pentru ștergere
      path.addEventListener('dblclick', e => {
        e.stopPropagation();
        if (typeof this.onDelete === 'function') {
          this.onDelete(conn);
        }
      });

      // hover effects
      path.addEventListener('mouseenter', () => {
        path.setAttribute('stroke', '#e74c3c');
        path.setAttribute('opacity', '1');
      });
      path.addEventListener('mouseleave', () => {
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('opacity', '0.9');
      });

      this.svg.appendChild(path);
      path.setAttribute('data-from-node', conn.fromNodeId);
      path.setAttribute('data-to-node',   conn.toNodeId);

      // colorează porturile conectate
      fromPort.classList.add('connected');
      toPort.classList.add('connected');
      fromPort.style.backgroundColor = '#3498db';
      fromPort.style.borderColor = '#3498db';
      toPort.style.backgroundColor = '#27ae60';
      toPort.style.borderColor = '#27ae60';
    });
  }
}
