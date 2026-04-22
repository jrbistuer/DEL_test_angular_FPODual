import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/** Minimal stub for UsersService — returns controlled values without real DB. */
const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  // Controller must not transform or filter the service result
  it('findAll() delegates to service.findAll()', async () => {
    const expected = [{ username: 'jdoe' }];
    mockUsersService.findAll.mockResolvedValueOnce(expected);

    const result = await controller.findAll();

    expect(result).toBe(expected);
    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
  });

  // Controller must forward the id parameter unchanged
  it('findOne(id) delegates to service.findOne(id)', async () => {
    const doc = { _id: 'u1', username: 'jdoe' };
    mockUsersService.findOne.mockResolvedValueOnce(doc);

    const result = await controller.findOne('u1');

    expect(result).toBe(doc);
    expect(mockUsersService.findOne).toHaveBeenCalledWith('u1');
  });

  // Controller must forward the DTO to the service without alteration
  it('create(dto) delegates to service.create(dto)', async () => {
    const dto = { username: 'jdoe', name: 'John Doe', email: 'jdoe@example.com' };
    const created = { _id: 'u1', ...dto };
    mockUsersService.create.mockResolvedValueOnce(created);

    const result = await controller.create(dto as never);

    expect(result).toBe(created);
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  // Controller must pass both id and DTO to the service
  it('update(id, dto) delegates to service.update(id, dto)', async () => {
    const dto = { name: 'Updated' };
    const updated = { _id: 'u1', ...dto };
    mockUsersService.update.mockResolvedValueOnce(updated);

    const result = await controller.update('u1', dto as never);

    expect(result).toBe(updated);
    expect(mockUsersService.update).toHaveBeenCalledWith('u1', dto);
  });

  // Controller must forward the id and relay the service void return
  it('remove(id) delegates to service.remove(id)', async () => {
    mockUsersService.remove.mockResolvedValueOnce(undefined);

    await controller.remove('u1');

    expect(mockUsersService.remove).toHaveBeenCalledWith('u1');
  });
});
