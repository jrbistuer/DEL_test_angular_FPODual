import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** Mongoose document type for Pedido. */
export type PedidoDocument = HydratedDocument<Pedido>;

/** Mongoose schema representing a sales order (pedido). */
@Schema({ timestamps: true })
export class Pedido {
  /** Customer or order name. */
  @Prop({ required: true })
  nombre: string;

  /** Unit price of the order. */
  @Prop({ required: true })
  precio: number;

  /** Date the order was placed. */
  @Prop({ required: true })
  fecha: Date;

  /** Whether stock is available for this order. */
  @Prop({ required: true })
  stock: boolean;

  /** Optional free-text description. */
  @Prop()
  descripcion?: string;

  /** Optional number of units ordered. */
  @Prop()
  cantidad?: number;
}

export const PedidoSchema = SchemaFactory.createForClass(Pedido);

// Index fecha for range queries and stock for availability filters
PedidoSchema.index({ fecha: 1 });
PedidoSchema.index({ stock: 1 });
