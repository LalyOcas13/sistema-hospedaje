import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MensajeFlotanteData {
  titulo: string;
  mensaje: string;
  tipo: 'confirmacion' | 'info' | 'advertencia' | 'error';
  textoAceptar?: string;
  textoCancelar?: string;
}

@Component({
  selector: 'app-mensaje-flotante',
  standalone: false,
  templateUrl: './mensaje-flotante.component.html',
  styleUrls: ['./mensaje-flotante.component.css']
})
export class MensajeFlotanteComponent {
  @Input() visible = false;
  @Input() data: MensajeFlotanteData = {
    titulo: '',
    mensaje: '',
    tipo: 'info',
    textoAceptar: 'Aceptar',
    textoCancelar: 'Cancelar'
  };

  @Output() aceptar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  constructor() {}

  onAceptar(): void {
    this.aceptar.emit();
    this.cerrar.emit();
  }

  onCancelar(): void {
    this.cancelar.emit();
    this.cerrar.emit();
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  get iconoTipo(): string {
    switch (this.data.tipo) {
      case 'confirmacion':
        return '❓';
      case 'info':
        return 'ℹ️';
      case 'advertencia':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  }
}
