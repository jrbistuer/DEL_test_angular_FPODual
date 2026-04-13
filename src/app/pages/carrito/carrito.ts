import { Component, inject } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { ListadoPedidos } from '../../shared/components/listado-pedidos/listado-pedidos';

@Component({
  selector: 'app-carrito',
  imports: [ListadoPedidos],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {

  pedidoService = inject(PedidoService);

}
