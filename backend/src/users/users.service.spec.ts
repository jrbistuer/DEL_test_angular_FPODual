import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';

/** Factory that builds a chainable Mongoose mock for UserModel. */
function buildUserModelMock() {
  const mockExec = jest.fn();
  const mockQuery = { exec: mockExec };

  const MockModel = jest.fn().mockImplementation((dto: unknown) => ({
    ...dto as object,
    save: jest.fn(),
  }));

  Object.assign(MockModel, {
    find: jest.fn().mockReturnValue(mockQuery),
    findById: jest.fn().mockReturnValue(mockQuery),
    findByIdAndUpdate: jest.fn().mockReturnValue(mockQuery),
    findByIdAndDelete: jest.fn().mockReturnValue(mockQuery),
  });

  return { MockModel, mockExec };
}

describe('UsersService', () => {
  let service: UsersService;
  let mockExec: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let MockModel: any;

  beforeEach(async () => {
    const built = buildUserModelMock();
    MockModel = built.MockModel;
    mockExec = built.mockExec;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: MockModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  // Confirms the happy path returns whatever the model resolves
  it('findAll() returns array from mock', async () => {
    const expected = [{ username: 'jdoe' }];
    mockExec.mockResolvedValueOnce(expected);

    const result = await service.findAll();

    expect(result).toBe(expected);
    expect(MockModel.find).toHaveBeenCalled();
  });

  // Confirms findOne resolves to the document when it exists
  it('findOne(id) returns single document', async () => {
    const id = 'u1';
    const doc = { _id: id, username: 'jdoe' };
    mockExec.mockResolvedValueOnce(doc);

    const result = await service.findOne(id);

    expect(result).toBe(doc);
    expect(MockModel.findById).toHaveBeenCalledWith(id);
  });

  // Missing user must surface as a 404 — not a silent null
  it('findOne(id) throws NotFoundException when document not found', async () => {
    mockExec.mockResolvedValueOnce(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  // create() must call the model constructor and persist with .save()
  it('create(dto) calls model constructor and .save()', async () => {
    const dto = { username: 'jdoe', name: 'John Doe', email: 'jdoe@example.com' };
    const saveMock = jest.fn().mockResolvedValueOnce({ ...dto, _id: 'new1' });
    MockModel.mockImplementationOnce(() => ({ ...dto, save: saveMock }));

    await service.create(dto as never);

    expect(MockModel).toHaveBeenCalledWith(dto);
    expect(saveMock).toHaveBeenCalled();
  });

  // Duplicate email in MongoDB must produce a 409 Conflict, not a 500
  it('create(dto) throws ConflictException when MongoDB error code 11000 is thrown', async () => {
    const saveMock = jest.fn().mockRejectedValueOnce({ code: 11000 });
    MockModel.mockImplementationOnce(() => ({ save: saveMock }));

    await expect(
      service.create({ username: 'dup', name: 'Dup', email: 'dup@example.com' } as never),
    ).rejects.toThrow(ConflictException);
  });

  // Non-duplicate errors must propagate unchanged so nothing is swallowed
  it('create(dto) rethrows non-duplicate errors', async () => {
    const genericError = new Error('network error');
    const saveMock = jest.fn().mockRejectedValueOnce(genericError);
    MockModel.mockImplementationOnce(() => ({ save: saveMock }));

    await expect(
      service.create({ username: 'u', name: 'U', email: 'u@example.com' } as never),
    ).rejects.toThrow('network error');
  });

  // update() must request the updated document back from Mongo
  it('update(id, dto) calls findByIdAndUpdate with { new: true }', async () => {
    const id = 'u1';
    const dto = { name: 'Updated Name' };
    const updated = { _id: id, ...dto };
    mockExec.mockResolvedValueOnce(updated);

    const result = await service.update(id, dto as never);

    expect(result).toBe(updated);
    expect(MockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, dto, { new: true });
  });

  // Missing user on update must surface as a 404
  it('update(id, dto) throws NotFoundException when not found', async () => {
    mockExec.mockResolvedValueOnce(null);

    await expect(service.update('missing', {} as never)).rejects.toThrow(NotFoundException);
  });

  // remove() must call findByIdAndDelete to clean up the record
  it('remove(id) calls findByIdAndDelete', async () => {
    const id = 'u1';
    mockExec.mockResolvedValueOnce({ _id: id });

    await service.remove(id);

    expect(MockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
  });

  // Deleting a non-existent user must throw, not silently succeed
  it('remove(id) throws NotFoundException when not found', async () => {
    mockExec.mockResolvedValueOnce(null);

    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
