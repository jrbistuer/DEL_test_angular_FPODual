import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('first-test');

  private translate = inject(TranslateService);

  textoParaMostrar = 'Hola soy un contenido dinámico desde angular';
 
  constructor() {
    this.translate.addLangs(['es', 'ca']);
    this.translate.setFallbackLang('es');
    this.translate.use('es');
  }

}
