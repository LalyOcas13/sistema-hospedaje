import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-debug-panel',
  standalone: false,
  template: `
    <div class="debug-panel" style="position: fixed; top: 10px; right: 10px; background: #2c3e50; color: white; padding: 15px; border-radius: 8px; z-index: 9999; font-family: monospace; font-size: 12px; min-width: 200px;">
      <h4 style="margin: 0 0 10px 0; color: #3498db;">🔍 Debug Panel</h4>
      
      <div style="margin-bottom: 10px;">
        <strong>👥 Clientes:</strong> {{ clientesCount }}
      </div>
      
      <div style="margin-bottom: 10px;">
        <strong>🏨 Habitaciones:</strong> {{ habitacionesCount }}
      </div>
      
      <div style="margin-bottom: 10px;">
        <strong>📅 Reservas:</strong> {{ reservasCount }}
      </div>
      
      <div style="margin-top: 15px; display: flex; gap: 5px; flex-wrap: wrap;">
        <button (click)="verDatos()" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">
          Ver Datos
        </button>
        <button (click)="limpiarDatos()" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">
          Limpiar
        </button>
      </div>
      
      <div style="margin-top: 10px; font-size: 10px; color: #95a5a6;">
        💾 Datos persistentes en localStorage
      </div>
    </div>
  `,
  styles: []
})
export class DebugPanelComponent implements OnInit {
  
  clientesCount = 0;
  habitacionesCount = 0;
  reservasCount = 0;

  constructor(private localStorageService: LocalStorageService) {}

  ngOnInit(): void {
    this.actualizarContadores();
    
    // Actualizar contadores cada 5 segundos
    setInterval(() => {
      this.actualizarContadores();
    }, 5000);
  }

  private actualizarContadores(): void {
    this.clientesCount = this.localStorageService.getClientes().length;
    this.habitacionesCount = this.localStorageService.getHabitaciones().length;
    this.reservasCount = this.localStorageService.getReservas().length;
  }

  verDatos(): void {
    this.localStorageService.verDatos();
  }

  limpiarDatos(): void {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos?')) {
      this.localStorageService.limpiarDatos();
      this.actualizarContadores();
    }
  }
}
