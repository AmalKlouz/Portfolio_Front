// src/app/app.config.ts
import { Routes } from '@angular/router';
import { routes } from './app-routing.module';

export const AppConfig = {
  routes: routes,
  // tu peux ajouter d'autres configurations globales ici
  appName: 'Portfolio',
  apiUrl: 'http://localhost:9000/api'
};
