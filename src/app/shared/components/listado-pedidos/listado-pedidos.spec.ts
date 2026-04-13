import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPedidos } from './listado-pedidos';

describe('ListadoPedidos', () => {
  let component: ListadoPedidos;
  let fixture: ComponentFixture<ListadoPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPedidos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListadoPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
