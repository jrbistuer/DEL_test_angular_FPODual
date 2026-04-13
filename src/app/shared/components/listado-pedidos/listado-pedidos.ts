import { Component, inject, input } from '@angular/core';
import { PedidoService } from '../../../services/pedido.service';

@Component({
  selector: 'app-listado-pedidos',
  imports: [],
  templateUrl: './listado-pedidos.html',
  styleUrl: './listado-pedidos.scss',
})
export class ListadoPedidos {

  titulo = input('');

  pedidoService = inject(PedidoService);  

}
