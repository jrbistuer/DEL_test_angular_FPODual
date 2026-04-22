import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './create-pedido.dto';
import { UpdatePedidoDto } from './update-pedido.dto';

/** REST controller exposing CRUD endpoints for the Pedido resource. */
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  /** Returns the list of all pedidos. */
  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  /** Returns a single pedido identified by its id. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidosService.findOne(id);
  }

  /** Creates a new pedido and returns the created document. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  /** Applies a partial update to an existing pedido and returns the updated document. */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.pedidosService.update(id, dto);
  }

  /** Deletes the pedido with the given id. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }
}
