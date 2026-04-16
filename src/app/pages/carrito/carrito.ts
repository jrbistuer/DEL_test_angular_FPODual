import { Component, inject } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { Header } from '../../shared/components/header/header';
import { PedidoCard } from '../../shared/components/pedido-card/pedido-card';

@Component({
  selector: 'app-carrito',
  imports: [Header, PedidoCard],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {

  pedidoService = inject(PedidoService);

  eliminarItem(index: number) {
    console.log('Eliminar pedido en la página carrito en index:', index);
  }

  editarItem(index: number) {
    console.log('Editar pedido en la página carrito en index:', index);
  }

}
