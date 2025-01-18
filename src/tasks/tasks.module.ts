import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtMiddleware } from '../auth/jwt.middleware';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), // Register Task schema
    AuthModule, // Import AuthModule to use AuthService
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware) // Apply the middleware
      .forRoutes({ path: 'tasks', method: RequestMethod.ALL }); // Protect all routes under '/tasks'
  }
}
