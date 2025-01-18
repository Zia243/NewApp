import { Controller, Get, Param, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('get-task-completion-summary')
  getTaskCompletionSummary() {
    return this.tasksService.getTaskCompletionSummary();
  }

  @Get('get-user-performance/:userId')
  getUserPerformance(@Param('userId') userId: string) {
    return this.tasksService.getUserPerformance(userId);
  }

  @Get('get-overdue-tasks-summary')
  getOverdueTasksSummary() {
    return this.tasksService.getOverdueTasksSummary();
  }

  @Get('get-project-tasks-member/:projectId')
  getProjectTaskSummaryByTaskMember(
    @Param('projectId') projectId: string, // Accept projectId as a route parameter
    @Query() query: any, // Accept query parameters
  ) {
    return this.tasksService.getProjectTaskSummaryByTaskMember(
      projectId,
      query,
    );
  }
}
