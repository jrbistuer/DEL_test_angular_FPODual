import { Component, inject, input, output } from '@angular/core';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/interfaces';

@Component({
  selector: 'app-pedido-card',
  imports: [],
  templateUrl: './pedido-card.html',
  styleUrl: './pedido-card.scss',
})
export class PedidoCard {

  item = input<Pedido>();
  $index = input<number>();

  onELiminarCLicked = output<number>();
  onEditarCLicked = output<number>();

  pedidoService = inject(PedidoService);  

  eliminarPedido(index: number) {
    this.onELiminarCLicked.emit(index);
  }

  editarPedido(index: number) {
    this.onEditarCLicked.emit(index);
  }

}
