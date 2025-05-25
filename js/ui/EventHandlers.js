// evenimente globale & canvas
export function bindGlobal(ui) {
  document.addEventListener('mousemove', e => ui.handleGlobalMouseMove(e));
  document.addEventListener('mouseup',   e => ui.handleGlobalMouseUp(e));
}

export function bindCanvas(ui) {
  ui.canvas.addEventListener('click', e => {
    if (e.target === ui.canvas) {
      ui.cancelConnection();
      ui.clearSelection();
    }
  });
  ui.canvas.addEventListener('contextmenu', e => e.preventDefault());
}
