import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
// import { SeederService } from '../seeder/seeder.service';
// import { User, UserSchema } from '../users/schemas/user.schema';
// import { Project, ProjectSchema } from '../projects/schemas/project.schema';
// import { Task, TaskSchema } from '../tasks/schemas/task.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        uri: process.env.MONGO_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    // This all for fake data
    // MongooseModule.forFeature([
    //   { name: User.name, schema: UserSchema },
    //   { name: Project.name, schema: ProjectSchema },
    //   { name: Task.name, schema: TaskSchema },
    // ]),
  ],
  // providers: [SeederService],
  providers: [],
  // exports: [MongooseModule, SeederService],
  exports: [MongooseModule],

})
export class DatabaseModule {}
