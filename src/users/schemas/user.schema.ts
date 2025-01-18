import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['Admin', 'Manager', 'Member'] })
  role: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }])
  tasks: string[];
}

// Declare the schema first
export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if the password is not modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password
  next();
});
