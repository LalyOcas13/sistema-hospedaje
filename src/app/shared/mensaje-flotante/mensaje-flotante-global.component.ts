import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MensajeFlotanteService, MensajeFlotanteRequest } from './mensaje-flotante.service';
import { MensajeFlotanteComponent } from './mensaje-flotante.component';

@Component({
  selector: 'app-mensaje-flotante-global',
  standalone: false,
  templateUrl: './mensaje-flotante-global.component.html',
  styleUrls: ['./mensaje-flotante-global.component.css']
})
export class MensajeFlotanteGlobalComponent implements OnInit, OnDestroy {
  visible = false;
  data: MensajeFlotanteRequest = {
    titulo: '',
    mensaje: '',
    tipo: 'info',
    textoAceptar: 'Aceptar',
    textoCancelar: 'Cancelar'
  };
  
  private mensajeSubscription: Subscription | null = null;
  private currentId: string = '';

  constructor(private mensajeService: MensajeFlotanteService) {}

  ngOnInit(): void {
    this.mensajeSubscription = this.mensajeService.mensaje$.subscribe((mensaje) => {
      this.data = mensaje;
      this.currentId = mensaje.id || '';
      this.visible = true;
    });
  }

  ngOnDestroy(): void {
    if (this.mensajeSubscription) {
      this.mensajeSubscription.unsubscribe();
    }
  }

  onAceptar(): void {
    this.mensajeService.enviarRespuesta(this.currentId, 'aceptar');
    this.visible = false;
  }

  onCancelar(): void {
    this.mensajeService.enviarRespuesta(this.currentId, 'cancelar');
    this.visible = false;
  }

  onCerrar(): void {
    this.mensajeService.enviarRespuesta(this.currentId, 'cancelar');
    this.visible = false;
  }
}
