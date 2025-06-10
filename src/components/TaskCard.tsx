import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CO2Indicator } from './CO2Indicator';
import { Button } from './ui/button';
import {TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES, type Task} from '../types';
import { formatDate } from '../lib/utils';
import { Calendar, User, Clock, Edit, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const taskTypeInfo = TASK_TYPES[task.type];
  const priorityInfo = TASK_PRIORITIES[task.priority];
  const statusInfo = TASK_STATUSES[task.status];

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Card className={`transition-shadow hover:shadow-md ${isOverdue ? 'border-red-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
          <Badge variant="outline" className={priorityInfo.color}>
            {priorityInfo.label}
          </Badge>
          <Badge variant="secondary">
            {taskTypeInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{task.assignee.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {formatDate(new Date(task.dueDate))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{task.estimatedHours}h estimées</span>
          </div>

          <div className="flex items-center gap-2">
            <CO2Indicator co2Amount={task.co2Emissions} />
          </div>
        </div>

        {task.actualHours > 0 && (
          <div className="text-sm text-muted-foreground">
            Temps réel: {task.actualHours}h
          </div>
        )}

        {onStatusChange && (
          <div className="flex gap-2 pt-2">
            {Object.entries(TASK_STATUSES).map(([status, info]) => (
              <Button
                key={status}
                variant={task.status === status ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusChange(task.id, status as Task['status'])}
                className="text-xs"
              >
                {info.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
