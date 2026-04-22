import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

/** Service providing CRUD operations for the User resource. */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Returns all users from the database. */
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  /** Returns a single user by its MongoDB ObjectId. */
  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** Creates and persists a new user; throws ConflictException on duplicate email. */
  async create(dto: CreateUserDto): Promise<UserDocument> {
    try {
      const created = new this.userModel(dto);
      return await created.save();
    } catch (err: unknown) {
      // MongoDB duplicate key error code
      if (this.isDuplicateKeyError(err)) {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  /** Applies a partial update to an existing user; throws if not found. */
  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`User ${id} not found`);
    return updated;
  }

  /** Deletes a user by id; throws if not found. */
  async remove(id: string): Promise<void> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`User ${id} not found`);
  }

  /** Checks whether an error is a MongoDB duplicate key error (code 11000). */
  private isDuplicateKeyError(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    );
  }
}
