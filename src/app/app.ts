import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallBannerComponent } from './components/pwa-install-banner.component';
import { PwaInstallService } from './services/pwa-install.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('lambda');

  constructor(private pwaInstallService: PwaInstallService) {}

  ngOnInit() {
    // El servicio se inicializa automáticamente al inyectarse
    console.log('App initialized - PWA install service active');
  }
}
