import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

/** REST controller exposing CRUD endpoints for the User resource. */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Returns the list of all users. */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** Returns a single user identified by its id. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /** Creates a new user and returns the created document. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /** Applies a partial update to an existing user and returns the updated document. */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /** Deletes the user with the given id. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
