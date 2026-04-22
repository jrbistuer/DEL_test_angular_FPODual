import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Pedido } from '../pedidos/pedido.schema';

/** Builds a mock PedidoModel that stubs the aggregate pipeline. */
function buildPedidoModelMock(aggregateResult: unknown) {
  return {
    aggregate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(aggregateResult),
    }),
  };
}

describe('DashboardService', () => {
  let service: DashboardService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let MockModel: any;

  /** Typical facet result returned by the $facet aggregation stage. */
  const facetResult = [
    {
      totals: [
        {
          totalPedidos: 10,
          totalRevenue: 500,
          averagePrecio: 50,
          stockDisponible: 7,
          sinStock: 3,
        },
      ],
      porMes: [
        { _id: { year: 2024, month: 1 }, count: 4, revenue: 200 },
        { _id: { year: 2024, month: 2 }, count: 6, revenue: 300 },
      ],
    },
  ];

  beforeEach(async () => {
    MockModel = buildPedidoModelMock(facetResult);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Pedido.name), useValue: MockModel },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  // getSummary() must return an object containing all keys expected by the frontend
  it('getSummary() returns correctly shaped object with all required keys', async () => {
    const result = await service.getSummary();

    expect(result).toHaveProperty('totalPedidos', 10);
    expect(result).toHaveProperty('totalRevenue', 500);
    expect(result).toHaveProperty('averagePrecio', 50);
    expect(result).toHaveProperty('stockDisponible', 7);
    expect(result).toHaveProperty('sinStock', 3);
    expect(result).toHaveProperty('pedidosPorMes');
  });

  // Monthly breakdown must be formatted as "YYYY-MM" strings for the frontend chart
  it('getSummary() formats pedidosPorMes months as YYYY-MM strings', async () => {
    const result = await service.getSummary();

    expect(result.pedidosPorMes).toEqual([
      { month: '2024-01', count: 4, revenue: 200 },
      { month: '2024-02', count: 6, revenue: 300 },
    ]);
  });

  // When the collection is empty, totals should default to zeros to avoid undefined
  it('getSummary() returns zero totals when collection is empty', async () => {
    MockModel.aggregate.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce([{ totals: [], porMes: [] }]),
    });

    const result = await service.getSummary();

    expect(result.totalPedidos).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averagePrecio).toBe(0);
    expect(result.stockDisponible).toBe(0);
    expect(result.sinStock).toBe(0);
    expect(result.pedidosPorMes).toEqual([]);
  });

  // Single-digit months must be zero-padded so chart labels are consistent
  it('getSummary() zero-pads single-digit months', async () => {
    MockModel.aggregate.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce([
        {
          totals: [{ totalPedidos: 1, totalRevenue: 10, averagePrecio: 10, stockDisponible: 1, sinStock: 0 }],
          porMes: [{ _id: { year: 2024, month: 9 }, count: 1, revenue: 10 }],
        },
      ]),
    });

    const result = await service.getSummary();

    expect(result.pedidosPorMes[0].month).toBe('2024-09');
  });
});
