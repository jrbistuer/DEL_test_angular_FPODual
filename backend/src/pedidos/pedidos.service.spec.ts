import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { Pedido } from './pedido.schema';

/** Factory that builds a chainable Mongoose mock for PedidoModel. */
function buildPedidoModelMock(overrides: Record<string, unknown> = {}) {
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
    ...overrides,
  });

  return { MockModel, mockExec, mockQuery };
}

describe('PedidosService', () => {
  let service: PedidosService;
  let mockExec: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let MockModel: any;

  beforeEach(async () => {
    const built = buildPedidoModelMock();
    MockModel = built.MockModel;
    mockExec = built.mockExec;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: getModelToken(Pedido.name), useValue: MockModel },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  afterEach(() => jest.clearAllMocks());

  // Confirms the happy path returns whatever the model resolves
  it('findAll() returns array from mock', async () => {
    const expected = [{ nombre: 'Test' }];
    mockExec.mockResolvedValueOnce(expected);

    const result = await service.findAll();

    expect(result).toBe(expected);
    expect(MockModel.find).toHaveBeenCalled();
  });

  // Confirms findOne resolves to the document when it exists
  it('findOne(id) returns single document', async () => {
    const id = 'abc123';
    const doc = { _id: id, nombre: 'Test' };
    mockExec.mockResolvedValueOnce(doc);

    const result = await service.findOne(id);

    expect(result).toBe(doc);
    expect(MockModel.findById).toHaveBeenCalledWith(id);
  });

  // Missing document must surface as a 404 — not a silent null
  it('findOne(id) throws NotFoundException when document not found', async () => {
    mockExec.mockResolvedValueOnce(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  // create() must call the model constructor and persist with .save()
  it('create(dto) calls model constructor and .save()', async () => {
    const dto = { nombre: 'New', precio: 10, fecha: new Date(), stock: true };
    const saveMock = jest.fn().mockResolvedValueOnce({ ...dto, _id: 'new1' });
    MockModel.mockImplementationOnce(() => ({ ...dto, save: saveMock }));

    await service.create(dto as never);

    expect(MockModel).toHaveBeenCalledWith(dto);
    expect(saveMock).toHaveBeenCalled();
  });

  // update() must always request the updated document back from Mongo
  it('update(id, dto) calls findByIdAndUpdate with { new: true }', async () => {
    const id = 'abc';
    const dto = { nombre: 'Updated' };
    const updated = { _id: id, ...dto };
    mockExec.mockResolvedValueOnce(updated);

    const result = await service.update(id, dto as never);

    expect(result).toBe(updated);
    expect(MockModel.findByIdAndUpdate).toHaveBeenCalledWith(id, dto, { new: true });
  });

  // Missing document on update must surface as a 404
  it('update(id, dto) throws NotFoundException when not found', async () => {
    mockExec.mockResolvedValueOnce(null);

    await expect(service.update('missing', {} as never)).rejects.toThrow(NotFoundException);
  });

  // remove() must call findByIdAndDelete to clean up the record
  it('remove(id) calls findByIdAndDelete', async () => {
    const id = 'abc';
    mockExec.mockResolvedValueOnce({ _id: id });

    await service.remove(id);

    expect(MockModel.findByIdAndDelete).toHaveBeenCalledWith(id);
  });

  // Deleting a non-existent document must throw, not silently succeed
  it('remove(id) throws NotFoundException when not found', async () => {
    mockExec.mockResolvedValueOnce(null);

    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
