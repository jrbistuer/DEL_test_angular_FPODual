import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Mongoose document type for User. */
export type UserDocument = HydratedDocument<User>;

/** Mongoose schema representing an application user. */
@Schema({ timestamps: true })
export class User {
  /** Unique username handle. */
  @Prop({ required: true })
  username: string;

  /** Display name of the user. */
  @Prop({ required: true })
  name: string;

  /** Unique email address used for login. */
  @Prop({ required: true, unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
