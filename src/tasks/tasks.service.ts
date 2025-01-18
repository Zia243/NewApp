import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Get task completion summary grouped by status (e.g., To Do, In Progress, Completed).
   */
  async getTaskCompletionSummary() {
    const cacheKey = 'task-summary';
    try {
      // Check cache
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        return {
          success: true,
          message: 'Data fetched successfully from cache.',
          data: JSON.parse(cachedData as string),
        };
      }

      // Fetch data from the database
      const summary = await this.taskModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Cache the result for 10 minutes
      await this.cacheManager.set(cacheKey, JSON.stringify(summary));

      return {
        success: true,
        message: 'Data fetched successfully from database and cached.',
        data: summary,
      };
    } catch (error) {
      console.error('Error fetching task completion summary:', error);
      return {
        success: false,
        message: 'Failed to fetch task completion summary.',
        error: error.message,
      };
    }
  }

  /**
   * Get user performance report grouped by task status.
   */
  async getUserPerformance(userId: string) {
    const cacheKey = `user-performance-${userId}`;
    // console.log('userId', userId);

    try {
      // Check cache
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        return {
          success: true,
          message: 'Data fetched successfully from cache.',
          data: JSON.parse(cachedData as string),
        };
      }

      const performance = await this.taskModel.aggregate([
        {
          $match: {
            assignedTo: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]);

      // Cache the result for 10 minutes
      await this.cacheManager.set(cacheKey, JSON.stringify(performance));

      return {
        success: true,
        message: 'Data fetched successfully from database and cached.',
        data: performance,
      };
    } catch (error) {
      console.error(
        `Error fetching user performance for userId ${userId}:`,
        error,
      );
      return {
        success: false,
        message: 'Failed to fetch user performance.',
        error: error.message,
      };
    }
  }

  /**
   * Get overdue tasks summary grouped by project.
   */
  async getOverdueTasksSummary() {
    const now = new Date();
    const cacheKey = 'overdue_tasks_summary';

    try {
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        return {
          success: true,
          message: 'Data fetched successfully from cache.',
          data: JSON.parse(cachedData as string),
        };
      }

      const overdueTasksSummary = await this.taskModel.aggregate([
        // Match overdue tasks
        { $match: { dueDate: { $lt: now }, status: { $ne: 'Completed' } } },

        // Group by projectId and collect task IDs
        {
          $group: {
            _id: '$projectId',
            overdueTaskIds: { $push: '$_id' },
            count: { $sum: 1 },
          },
        },

        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'projectDetails',
          },
        },

        { $unwind: '$projectDetails' },

        // Project the final output
        {
          $project: {
            _id: 1, // Project ID
            overdueTaskIds: 1, // List of overdue task IDs
            count: 1, // Total count of overdue tasks
            projectName: '$projectDetails.name', // Project name
          },
        },
      ]);

      await this.cacheManager.set(
        cacheKey,
        JSON.stringify(overdueTasksSummary),
      );

      return { success: true, data: overdueTasksSummary };
    } catch (error) {
      console.error('Error fetching overdue tasks summary:', error);
      return { success: false, error: 'Unable to fetch overdue tasks summary' };
    }
  }

  /**
   * Get Project Task Summary with Members' Contribution
   */
  async getProjectTaskSummaryByTaskMember(projectId: string, query: any) {
    const { status, assignedTo, page = 1, limit = 10 } = query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const matchFilter: any = {
      projectId: new mongoose.Types.ObjectId(projectId),
    };

    if (status) {
      matchFilter.status = status;
    }

    if (assignedTo) {
      matchFilter.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    const cacheKey = `projectTaskSummary_${projectId}_${JSON.stringify(query)}`;

    try {
      // Check cache first
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        return {
          success: true,
          message: 'Data fetched successfully from cache.',
          data: cachedData,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
          },
        };
      }

      // Aggregation pipeline
      const pipeline: PipelineStage[] = [
        // Match tasks based on filters
        { $match: matchFilter },

        // Facet: Group tasks by status and calculate member contributions
        {
          $facet: {
            taskSummary: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
              { $sort: { _id: 1 } }, // Sort by status
            ],
            memberContributions: [
              {
                $group: {
                  _id: '$assignedTo',
                  completedTasks: {
                    $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
                  },
                  totalTasks: { $sum: 1 },
                },
              },
              {
                $lookup: {
                  from: 'users', 
                  localField: '_id',
                  foreignField: '_id',
                  as: 'memberDetails',
                },
              },
              {
                $unwind: {
                  path: '$memberDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  completedTasks: 1,
                  totalTasks: 1,
                  memberDetails: {
                    name: '$memberDetails.name',
                    email: '$memberDetails.email',
                  },
                },
              },
              { $sort: { completedTasks: -1 } }, // Sort by completed tasks
            ],
          },
        },

        // Pagination for the overall result
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber },
      ];

      // Execute aggregation
      const result = await this.taskModel.aggregate(pipeline).exec();
      await this.cacheManager.set(cacheKey, result);

      return {
        success: true,
        message: 'Data fetched successfully.',
        data: result,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
        },
      };
    } catch (error) {
      console.error('Error fetching project task summary:', error);
      return { success: false, error: 'Unable to fetch project task summary' };
    }
  }
}
