import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import { useMoveProspect } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import type { Prospect, PipelineStageDef } from '@/types'

interface Props {
  prospects: Prospect[]
  stages: PipelineStageDef[]
  onAdd: (stage: string) => void
}

export default function KanbanBoard({ prospects, stages, onAdd }: Props) {
  const moveProspect = useMoveProspect()
  const { toast } = useToast()

  const byStage: Record<string, Prospect[]> = {}
  for (const s of stages) byStage[s.label] = []
  for (const p of prospects) {
    if (byStage[p.stage]) byStage[p.stage].push(p)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const newStage = result.destination.droppableId
    const oldStage = result.source.droppableId
    if (newStage === oldStage && result.source.index === result.destination.index) return

    moveProspect.mutate(
      { id: result.draggableId, stage: newStage },
      {
        onSuccess: () => toast(`Déplacé vers "${newStage}"`),
        onError: () => toast('Erreur lors du déplacement', 'error'),
      }
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.label}
            stage={stage.label}
            color={stage.color}
            prospects={byStage[stage.label] ?? []}
            onAdd={onAdd}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
