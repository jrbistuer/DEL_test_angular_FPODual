import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pedido, PedidoSchema } from './pedido.schema';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';

/** Feature module that registers the Pedido Mongoose model and wires service and controller. */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pedido.name, schema: PedidoSchema }]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
