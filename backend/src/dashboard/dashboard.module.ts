import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pedido, PedidoSchema } from '../pedidos/pedido.schema';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

/** Feature module providing aggregated dashboard statistics over the Pedido collection. */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pedido.name, schema: PedidoSchema }]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
