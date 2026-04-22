import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pedido, PedidoDocument } from './pedido.schema';
import { CreatePedidoDto } from './create-pedido.dto';
import { UpdatePedidoDto } from './update-pedido.dto';

/** Service providing CRUD operations for the Pedido resource. */
@Injectable()
export class PedidosService {
  constructor(
    @InjectModel(Pedido.name) private readonly pedidoModel: Model<PedidoDocument>,
  ) {}

  /** Returns all pedidos from the database. */
  async findAll(): Promise<PedidoDocument[]> {
    return this.pedidoModel.find().exec();
  }

  /** Returns a single pedido by its MongoDB ObjectId. */
  async findOne(id: string): Promise<PedidoDocument> {
    const pedido = await this.pedidoModel.findById(id).exec();
    if (!pedido) throw new NotFoundException(`Pedido ${id} not found`);
    return pedido;
  }

  /** Creates and persists a new pedido from the supplied DTO. */
  async create(dto: CreatePedidoDto): Promise<PedidoDocument> {
    const created = new this.pedidoModel(dto);
    return created.save();
  }

  /** Applies a partial update to an existing pedido; throws if not found. */
  async update(id: string, dto: UpdatePedidoDto): Promise<PedidoDocument> {
    const updated = await this.pedidoModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Pedido ${id} not found`);
    return updated;
  }

  /** Deletes a pedido by id; throws if not found. */
  async remove(id: string): Promise<void> {
    const deleted = await this.pedidoModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Pedido ${id} not found`);
  }
}
