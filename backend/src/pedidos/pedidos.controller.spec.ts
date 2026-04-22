import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

/** Minimal stub for PedidosService — returns controlled values without real DB. */
const mockPedidosService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PedidosController', () => {
  let controller: PedidosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [{ provide: PedidosService, useValue: mockPedidosService }],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
  });

  afterEach(() => jest.clearAllMocks());

  // Controller must not transform or filter the service result
  it('findAll() delegates to service.findAll()', async () => {
    const expected = [{ nombre: 'A' }];
    mockPedidosService.findAll.mockResolvedValueOnce(expected);

    const result = await controller.findAll();

    expect(result).toBe(expected);
    expect(mockPedidosService.findAll).toHaveBeenCalledTimes(1);
  });

  // Controller must forward the id parameter unchanged
  it('findOne(id) delegates to service.findOne(id)', async () => {
    const doc = { _id: '1', nombre: 'A' };
    mockPedidosService.findOne.mockResolvedValueOnce(doc);

    const result = await controller.findOne('1');

    expect(result).toBe(doc);
    expect(mockPedidosService.findOne).toHaveBeenCalledWith('1');
  });

  // Controller must forward the DTO to the service without alteration
  it('create(dto) delegates to service.create(dto)', async () => {
    const dto = { nombre: 'New', precio: 5, fecha: '2024-01-01', stock: true };
    const created = { _id: 'x', ...dto };
    mockPedidosService.create.mockResolvedValueOnce(created);

    const result = await controller.create(dto as never);

    expect(result).toBe(created);
    expect(mockPedidosService.create).toHaveBeenCalledWith(dto);
  });

  // Controller must pass both id and DTO to the service
  it('update(id, dto) delegates to service.update(id, dto)', async () => {
    const dto = { nombre: 'Updated' };
    const updated = { _id: '1', ...dto };
    mockPedidosService.update.mockResolvedValueOnce(updated);

    const result = await controller.update('1', dto as never);

    expect(result).toBe(updated);
    expect(mockPedidosService.update).toHaveBeenCalledWith('1', dto);
  });

  // Controller must forward the id and relay the service void return
  it('remove(id) delegates to service.remove(id)', async () => {
    mockPedidosService.remove.mockResolvedValueOnce(undefined);

    await controller.remove('1');

    expect(mockPedidosService.remove).toHaveBeenCalledWith('1');
  });
});
