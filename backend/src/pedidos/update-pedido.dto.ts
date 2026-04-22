import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';

/** DTO for partially updating an existing Pedido. */
export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {}
