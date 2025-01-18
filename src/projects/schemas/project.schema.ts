
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  members: string[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }])
  tasks: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
