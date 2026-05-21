import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { userLabel } from '../utils/ids';
import PriorityBadge from './PriorityBadge';
import UserAvatar from './UserAvatar';

const COLUMNS = [
  { id: 'pending', title: 'To Do', status: 'pending', colClass: 'kanban-column--pending' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', colClass: 'kanban-column--in-progress' },
  { id: 'completed', title: 'Done', status: 'completed', colClass: 'kanban-column--completed' },
];

function KanbanCard({ task, isDragging, onEdit }) {
  const overdue = task.isOverdue;
  const assignee = userLabel(task.assignedTo);

  return (
    <div
      className={`kanban-card ${overdue ? 'overdue' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={() => onEdit(task._id)}
      onKeyDown={(e) => e.key === 'Enter' && onEdit(task._id)}
      role="button"
      tabIndex={0}
    >
      <p className="kanban-card-title">{task.title}</p>
      {task.description && <p className="kanban-card-desc">{task.description}</p>}
      <div className="kanban-card-meta">
        <PriorityBadge priority={task.priority} />
        {overdue && <span className="badge overdue-badge">Overdue</span>}
      </div>
      <div className="kanban-card-footer">
        <span className="kanban-assignee" title={assignee}>
          <UserAvatar
            name={assignee === 'Unassigned' ? null : assignee}
            size="sm"
          />
          {assignee}
        </span>
        {task.dueDate && (
          <span className={`kanban-card-due ${overdue ? 'overdue' : ''}`}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableTask({ task, canDrag, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    disabled: !canDrag,
    data: { task, status: task.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...(canDrag ? listeners : {})} {...(canDrag ? attributes : {})}>
      <KanbanCard task={task} isDragging={isDragging} onEdit={onEdit} />
    </div>
  );
}

function KanbanColumn({ column, tasks, canDragTask, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${column.colClass} ${isOver ? 'droppable-over' : ''}`}
    >
      <header className="kanban-column-header">
        <div className="kanban-column-title">
          <span className="kanban-status-dot" />
          <h3>{column.title}</h3>
        </div>
        <span className="kanban-count">{tasks.length}</span>
      </header>
      <div className="kanban-column-body">
        {tasks.length === 0 ? (
          <p className="label-hint" style={{ padding: '12px 4px', textAlign: 'center' }}>
            Drop tasks here
          </p>
        ) : (
          tasks.map((task) => (
            <DraggableTask
              key={task._id}
              task={task}
              canDrag={canDragTask(task)}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, canDragTask, onStatusChange, onEdit }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !active) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    const targetColumn = COLUMNS.find((c) => c.id === over.id);
    const targetStatus = targetColumn?.status;
    if (!targetStatus || targetStatus === task.status) return;

    onStatusChange(task._id, targetStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasksByStatus(col.status)}
            canDragTask={canDragTask}
            onEdit={onEdit}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeTask ? <KanbanCard task={activeTask} isDragging onEdit={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
