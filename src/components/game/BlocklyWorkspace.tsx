import * as Blockly from 'blockly'
import * as En from 'blockly/msg/en'
import { useEffect, useRef } from 'react'
import { buildToolbox, ensureBlocksDefined } from '../../blockly/blocks'
import { enableWorkspaceMultiselect } from '../../blockly/multiselect'
import { ensureIniciarBlock, getIniciarBlock } from '../../blockly/serialize'
import type { BlockType } from '../../game/types'

type Props = {
  availableBlocks: BlockType[]
  onReady?: (workspace: Blockly.WorkspaceSvg) => void
  onDispose?: () => void
}

Blockly.setLocale(En as unknown as { [key: string]: string })

// Tema con la fuente y los colores de CodeQuest.
const THEME = Blockly.Theme.defineTheme('codequest', {
  name: 'codequest',
  base: Blockly.Themes.Classic,
  fontStyle: { family: 'Nunito, ui-rounded, system-ui, sans-serif', weight: '800', size: 14 },
  componentStyles: {
    workspaceBackgroundColour: '#fbfcff',
    toolboxBackgroundColour: '#eef3fb',
    flyoutBackgroundColour: '#eef3fb',
    flyoutOpacity: 1,
    scrollbarColour: '#cdd8ea',
    insertionMarkerColour: '#4d96ff',
  },
})

export function BlocklyWorkspace({ availableBlocks, onReady, onDispose }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onReady)
  const onDisposeRef = useRef(onDispose)
  onReadyRef.current = onReady
  onDisposeRef.current = onDispose

  useEffect(() => {
    if (!hostRef.current) return
    ensureBlocksDefined()

    const workspace = Blockly.inject(hostRef.current, {
      toolbox: buildToolbox(availableBlocks),
      trashcan: true,
      scrollbars: true,
      move: { scrollbars: true, drag: true, wheel: true },
      grid: { spacing: 24, length: 2, colour: '#E2E8F2', snap: true },
      zoom: { controls: true, wheel: false, startScale: 1.05, maxScale: 1.5, minScale: 0.6 },
      renderer: 'zelos',
      theme: THEME,
      // Íconos y sonidos de Blockly servidos desde la app (sin depender de internet).
      media: `${import.meta.env.BASE_URL}blockly-media/`,
    })

    ensureIniciarBlock(workspace)
    onReadyRef.current?.(workspace)
    ;(window as unknown as { __cqWorkspace?: Blockly.WorkspaceSvg }).__cqWorkspace = workspace

    const disposeMultiselect = enableWorkspaceMultiselect(workspace)

    const resize = () => Blockly.svgResize(workspace)
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(hostRef.current)
    window.addEventListener('resize', resize)

    const listener = workspace.addChangeListener((event) => {
      if (event.type === Blockly.Events.BLOCK_DELETE && !getIniciarBlock(workspace)) {
        ensureIniciarBlock(workspace)
      }
    })

    return () => {
      disposeMultiselect()
      workspace.removeChangeListener(listener)
      ro.disconnect()
      window.removeEventListener('resize', resize)
      workspace.dispose()
      onDisposeRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableBlocks.join('|')])

  return (
    <div
      ref={hostRef}
      className="cq-blockly h-[min(70vh,620px)] min-h-[480px] w-full overflow-hidden rounded-3xl border-[3px] border-[#e6edf8] bg-surface shadow-[inset_0_2px_8px_rgba(46,70,140,0.06)]"
      aria-label="Área de bloques de programación"
    />
  )
}
