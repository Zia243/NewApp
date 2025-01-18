//FAKE DATA

// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { faker } from '@faker-js/faker';
// import { User, UserDocument } from '../users/schemas/user.schema';
// import { Project, ProjectDocument } from '../projects/schemas/project.schema';
// import { Task, TaskDocument } from '../tasks/schemas/task.schema';

// @Injectable()
// export class SeederService implements OnModuleInit {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<UserDocument>,
//     @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
//     @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
//   ) {}

//   async onModuleInit() {
//     await this.seedUsers(10); // Seed 10 users
//     await this.seedProjects(5); // Seed 5 projects
//     await this.seedTasks(20); // Seed 20 tasks
//   }

//   private async seedUsers(count: number) {
//     const users = [];
//     for (let i = 0; i < count; i++) {
//       users.push({
//         name: faker.name.fullName(),
//         email: faker.internet.email(),
//         password: faker.internet.password(),
//         role: faker.helpers.arrayElement(['Admin', 'Manager', 'Member']),
//         tasks: [], // Initialize tasks as an empty array
//       });
//     }
//     await this.userModel.insertMany(users);
//     console.log(`Seeded ${count} users`);
//   }

//   private async seedProjects(count: number) {
//     const users = await this.userModel.find().exec();
//     const projects = [];
//     for (let i = 0; i < count; i++) {
//       projects.push({
//         name: faker.company.name(),
//         description: faker.lorem.sentence(),
//         members: faker.helpers.arrayElements(users.map((u) => u._id), 3), // Assign up to 3 members
//         tasks: [], // Initialize tasks as an empty array
//       });
//     }
//     await this.projectModel.insertMany(projects);
//     console.log(`Seeded ${count} projects`);
//   }

//   private async seedTasks(count: number) {
//     const users = await this.userModel.find().exec();
//     const projects = await this.projectModel.find().exec();
//     const tasks = [];
//     for (let i = 0; i < count; i++) {
//       const status = faker.helpers.arrayElement(['To Do', 'In Progress', 'Completed']);
//       const dueDate = faker.date.future(); // Generate future dates for tasks
//       const isOverdue = faker.datatype.boolean(); // Randomly make some tasks overdue

//       const task = {
//         title: faker.lorem.words(3),
//         description: faker.lorem.sentence(),
//         status: status,
//         assignedTo: faker.helpers.arrayElement(users)._id,
//         projectId: faker.helpers.arrayElement(projects)._id,
//         dueDate: isOverdue ? faker.date.past() : dueDate, // Some tasks have past due dates
//       };

//       tasks.push(task);
//     }
//     const insertedTasks = await this.taskModel.insertMany(tasks);

//     // Update users and projects with tasks
//     for (const task of insertedTasks) {
//       await this.userModel.findByIdAndUpdate(task.assignedTo, { $push: { tasks: task._id } });
//       await this.projectModel.findByIdAndUpdate(task.projectId, { $push: { tasks: task._id } });
//     }

//     console.log(`Seeded ${count} tasks`);
//   }
// }
