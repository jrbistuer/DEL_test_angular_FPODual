import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from "../../shared/components/header/header";

@Component({
  selector: 'app-about',
  imports: [RouterLink, Header],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})

export class About {

}
