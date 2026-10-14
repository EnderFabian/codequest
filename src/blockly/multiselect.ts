import * as Blockly from 'blockly'
import type { Block, BlockSvg, WorkspaceSvg } from 'blockly'

const CLIP_KEY = 'codequest-blockly-clipboard'
const SELECTED_CLASS = 'cq-multi-selected'

type SavedBlock = ReturnType<typeof Blockly.serialization.blocks.save>

function isBackgroundTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  if (target.classList.contains('blocklyMainBackground')) return true
  if (target.classList.contains('blocklyBubbleCanvas')) return false
  // Clic en el SVG del workspace, no sobre un bloque.
  if (target.closest('.blocklyDraggable')) return false
  if (target.classList.contains('blocklyWorkspace') || target.tagName === 'svg') return true
  return target.classList.contains('blocklyBlockCanvas') && !target.closest('.blocklyDraggable')
}

function blockIntersects(
  block: BlockSvg,
  left: number,
  top: number,
  right: number,
  bottom: number,
) {
  const xy = block.getRelativeToSurfaceXY()
  const h = block.height
  const w = block.width
  const bl = xy.x
  const bt = xy.y
  const br = xy.x + w
  const bb = xy.y + h
  return !(br < left || bl > right || bb < top || bt > bottom)
}

function clearHighlight(workspace: WorkspaceSvg) {
  for (const b of workspace.getAllBlocks(false) as BlockSvg[]) {
    b.pathObject.svgPath.classList.remove(SELECTED_CLASS)
  }
}

function highlight(block: BlockSvg, on: boolean) {
  block.pathObject.svgPath.classList.toggle(SELECTED_CLASS, on)
}

function collectCopyRoots(blocks: Block[]): Block[] {
  const set = new Set(blocks)
  // Solo raíces: no guardar un bloque si su padre también está seleccionado.
  return blocks.filter((b) => {
    let p: Block | null = b.getParent()
    while (p) {
      if (set.has(p)) return false
      p = p.getParent()
    }
    return b.type !== 'iniciar'
  })
}

/**
 * Arrastrar en el fondo del workspace selecciona varios bloques;
 * Ctrl/Cmd+C y Ctrl/Cmd+V copian y pegan el grupo.
 */
export function enableWorkspaceMultiselect(workspace: WorkspaceSvg) {
  const selected = new Set<BlockSvg>()
  let marquee: SVGRectElement | null = null
  let start: { x: number; y: number } | null = null
  let dragging = false

  const svg = workspace.getParentSvg()
  const canvas = workspace.getCanvas()

  function syncHighlight() {
    clearHighlight(workspace)
    for (const b of selected) highlight(b, true)
  }

  function setSelection(blocks: BlockSvg[]) {
    selected.clear()
    for (const b of blocks) {
      if (b.type === 'iniciar') continue
      selected.add(b)
    }
    Blockly.common.setSelected(undefined as unknown as Blockly.ISelectable)
    syncHighlight()
  }

  function wsPoint(e: PointerEvent) {
    const metrics = workspace.getMetrics()
    const svgPoint = Blockly.utils.svgMath.screenToWsCoordinates(
      workspace,
      new Blockly.utils.Coordinate(e.clientX, e.clientY),
    )
    return {
      x: svgPoint.x,
      y: svgPoint.y,
      // También guardamos coords de pantalla por si hace falta el rect SVG.
      sx: e.clientX,
      sy: e.clientY,
      scrollX: metrics.viewLeft,
      scrollY: metrics.viewTop,
    }
  }

  function ensureMarquee() {
    if (marquee) return marquee
    marquee = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    marquee.setAttribute('class', 'cq-marquee')
    marquee.setAttribute('fill', 'rgba(77, 150, 255, 0.12)')
    marquee.setAttribute('stroke', '#4d96ff')
    marquee.setAttribute('stroke-width', '2')
    marquee.setAttribute('rx', '8')
    canvas.appendChild(marquee)
    return marquee
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    if (!isBackgroundTarget(e.target)) return
    // Evitar pelear con gestos de Blockly (desplazamiento del lienzo con rueda/medio).
    if (e.altKey || e.shiftKey) return

    dragging = true
    start = wsPoint(e)
    selected.clear()
    syncHighlight()
    const r = ensureMarquee()
    r.setAttribute('x', String(start.x))
    r.setAttribute('y', String(start.y))
    r.setAttribute('width', '0')
    r.setAttribute('height', '0')
    r.style.display = 'block'
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    e.preventDefault()
    e.stopPropagation()
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !start) return
    const p = wsPoint(e)
    const x = Math.min(start.x, p.x)
    const y = Math.min(start.y, p.y)
    const w = Math.abs(p.x - start.x)
    const h = Math.abs(p.y - start.y)
    const r = ensureMarquee()
    r.setAttribute('x', String(x))
    r.setAttribute('y', String(y))
    r.setAttribute('width', String(w))
    r.setAttribute('height', String(h))
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging || !start) return
    dragging = false
    const p = wsPoint(e)
    const left = Math.min(start.x, p.x)
    const top = Math.min(start.y, p.y)
    const right = Math.max(start.x, p.x)
    const bottom = Math.max(start.y, p.y)
    start = null

    if (marquee) marquee.style.display = 'none'

    // Clic simple sin área: limpia selección.
    if (right - left < 8 && bottom - top < 8) {
      selected.clear()
      syncHighlight()
      return
    }

    const hits = (workspace.getAllBlocks(false) as BlockSvg[]).filter((b) =>
      blockIntersects(b, left, top, right, bottom),
    )
    setSelection(hits)
  }

  function copySelected() {
    const roots = collectCopyRoots([...selected])
    if (!roots.length) return false
    const payload: SavedBlock[] = []
    for (const b of roots) {
      const data = Blockly.serialization.blocks.save(b, {
        addCoordinates: true,
        addNextBlocks: true,
        addInputBlocks: true,
      })
      if (data) payload.push(data)
    }
    sessionStorage.setItem(CLIP_KEY, JSON.stringify(payload))
    return true
  }

  function pasteSelected() {
    const raw = sessionStorage.getItem(CLIP_KEY)
    if (!raw) return false
    let payload: SavedBlock[] = []
    try {
      payload = JSON.parse(raw) as SavedBlock[]
    } catch {
      return false
    }
    if (!payload.length) return false

    workspace.setResizesEnabled(false)
    const created: BlockSvg[] = []
    let i = 0
    for (const state of payload) {
      if (!state || state.type === 'iniciar') continue
      const clone = { ...state }
      // Desplazar un poco para que se vea el pegado.
      if (clone.x != null) clone.x += 24 + i * 8
      if (clone.y != null) clone.y += 24 + i * 8
      const block = Blockly.serialization.blocks.append(clone, workspace, {
        recordUndo: true,
      }) as BlockSvg
      created.push(block)
      i += 1
    }
    workspace.setResizesEnabled(true)
    setSelection(created)
    return created.length > 0
  }

  function onKeyDown(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey
    if (!mod) return
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if (e.key === 'c' || e.key === 'C') {
      if (selected.size && copySelected()) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    if (e.key === 'v' || e.key === 'V') {
      if (pasteSelected()) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    if (e.key === 'a' || e.key === 'A') {
      const all = (workspace.getAllBlocks(false) as BlockSvg[]).filter((b) => b.type !== 'iniciar')
      setSelection(all)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  svg.addEventListener('pointerdown', onPointerDown, true)
  svg.addEventListener('pointermove', onPointerMove, true)
  svg.addEventListener('pointerup', onPointerUp, true)
  svg.addEventListener('pointercancel', onPointerUp, true)
  window.addEventListener('keydown', onKeyDown, true)

  return () => {
    svg.removeEventListener('pointerdown', onPointerDown, true)
    svg.removeEventListener('pointermove', onPointerMove, true)
    svg.removeEventListener('pointerup', onPointerUp, true)
    svg.removeEventListener('pointercancel', onPointerUp, true)
    window.removeEventListener('keydown', onKeyDown, true)
    marquee?.remove()
    clearHighlight(workspace)
    selected.clear()
  }
}
