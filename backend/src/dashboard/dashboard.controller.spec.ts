import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/** Minimal stub for DashboardService. */
const mockDashboardService = {
  getSummary: jest.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => jest.clearAllMocks());

  // Controller must relay the service result without transformation
  it('getSummary() delegates to service.getSummary()', async () => {
    const summary = {
      totalPedidos: 5,
      totalRevenue: 250,
      averagePrecio: 50,
      stockDisponible: 3,
      sinStock: 2,
      pedidosPorMes: [],
    };
    mockDashboardService.getSummary.mockResolvedValueOnce(summary);

    const result = await controller.getSummary();

    expect(result).toBe(summary);
    expect(mockDashboardService.getSummary).toHaveBeenCalledTimes(1);
  });
});
