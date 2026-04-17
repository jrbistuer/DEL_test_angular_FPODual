import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pedido } from '../../models/interfaces';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth';
import { Header } from "../../shared/components/header/header";
import { PedidoCard } from '../../shared/components/pedido-card/pedido-card';
import { TranslateDirective } from "@ngx-translate/core";
import {MatInputModule, MatLabel} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, Header, PedidoCard, TranslateDirective,
    MatFormFieldModule, MatInputModule, MatLabel, MatCheckboxModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  
  private fb = inject(FormBuilder);
  pedidoService = inject(PedidoService);
  authService = inject(AuthService);
  router = inject(Router);

  submitted = signal(false);
  loading = signal(false);

  count = signal(0);
  doubled = computed(() => this.count() * 2);
  total = computed(() => this.count() + this.doubled());

  pedidoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    precio: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    stock: [''],
    descripcion: [''],
    cantidad: [0],
  });

  increment() {
    this.count.update(v => v + 1);
  }

  decrement() {
    this.count.update(v => v - 1);
  }

  addPedido() {
    this.loading.set(true);
    this.submitted.set(true);
    if (this.pedidoForm.invalid) {
      this.loading.set(false);
      return;
    }
    const { nombre, precio, fecha, stock, descripcion, cantidad } = this.pedidoForm.value;
    const pedido: Pedido = {
      nombre,
      precio: Number(precio),
      fecha: new Date(fecha),
      stock: Boolean(stock),
      descripcion: descripcion,
      cantidad: cantidad,
    };
    this.pedidoService.setPedido(pedido);
    this.pedidoForm.reset();
    this.submitted.set(false);
    this.loading.set(false);
  }

  eliminarItem(index: number) {
    console.log('Eliminar pedido en la página home en index:', index);
  }

  editarItem(index: number) {
    console.log('Editar pedido en la página home en index:', index);
  }

}
