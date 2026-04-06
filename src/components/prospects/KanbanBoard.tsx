import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import { PIPELINE_STAGES } from '@/lib/constants'
import { useMoveProspect } from '@/hooks/useProspects'
import { useToast } from '@/components/common/Toast'
import type { PipelineStage, Prospect } from '@/types'

interface Props {
  prospects: Prospect[]
  onAdd: (stage: PipelineStage) => void
}

export default function KanbanBoard({ prospects, onAdd }: Props) {
  const moveProspect = useMoveProspect()
  const { toast } = useToast()

  const byStage = PIPELINE_STAGES.reduce<Record<PipelineStage, Prospect[]>>(
    (acc, stage) => ({ ...acc, [stage]: prospects.filter((p) => p.stage === stage) }),
    {} as Record<PipelineStage, Prospect[]>
  )

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const newStage = result.destination.droppableId as PipelineStage
    const oldStage = result.source.droppableId as PipelineStage
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
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            prospects={byStage[stage]}
            onAdd={onAdd}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
