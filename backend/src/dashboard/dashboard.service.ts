import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pedido, PedidoDocument } from '../pedidos/pedido.schema';

/** Shape returned by getSummary. */
export interface DashboardSummary {
  totalPedidos: number;
  totalRevenue: number;
  averagePrecio: number;
  stockDisponible: number;
  sinStock: number;
  pedidosPorMes: Array<{ month: string; count: number; revenue: number }>;
}

/** Service that computes aggregated statistics over the Pedido collection. */
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Pedido.name)
    private readonly pedidoModel: Model<PedidoDocument>,
  ) {}

  /** Runs a $facet aggregation to return totals and a monthly breakdown in one query. */
  async getSummary(): Promise<DashboardSummary> {
    type FacetResult = [
      {
        totals: Array<{
          totalPedidos: number;
          totalRevenue: number;
          averagePrecio: number;
          stockDisponible: number;
          sinStock: number;
        }>;
        porMes: Array<{ _id: { year: number; month: number }; count: number; revenue: number }>;
      },
    ];

    const [result] = await this.pedidoModel
      .aggregate<FacetResult[0]>([
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalPedidos: { $sum: 1 },
                  // Use cantidad when present, default to 1 unit when absent
                  totalRevenue: {
                    $sum: {
                      $multiply: [
                        '$precio',
                        { $ifNull: ['$cantidad', 1] },
                      ],
                    },
                  },
                  averagePrecio: { $avg: '$precio' },
                  stockDisponible: {
                    $sum: { $cond: [{ $eq: ['$stock', true] }, 1, 0] },
                  },
                  sinStock: {
                    $sum: { $cond: [{ $eq: ['$stock', false] }, 1, 0] },
                  },
                },
              },
            ],
            porMes: [
              {
                $group: {
                  _id: {
                    year: { $year: '$fecha' },
                    month: { $month: '$fecha' },
                  },
                  count: { $sum: 1 },
                  revenue: {
                    $sum: {
                      $multiply: [
                        '$precio',
                        { $ifNull: ['$cantidad', 1] },
                      ],
                    },
                  },
                },
              },
              { $sort: { '_id.year': 1, '_id.month': 1 } },
            ],
          },
        },
      ])
      .exec();

    const totals = result.totals[0] ?? {
      totalPedidos: 0,
      totalRevenue: 0,
      averagePrecio: 0,
      stockDisponible: 0,
      sinStock: 0,
    };

    // Format month as "YYYY-MM" for easy consumption by the frontend
    const pedidosPorMes = result.porMes.map((m) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      count: m.count,
      revenue: m.revenue,
    }));

    return {
      totalPedidos: totals.totalPedidos,
      totalRevenue: totals.totalRevenue,
      averagePrecio: totals.averagePrecio,
      stockDisponible: totals.stockDisponible,
      sinStock: totals.sinStock,
      pedidosPorMes,
    };
  }
}
