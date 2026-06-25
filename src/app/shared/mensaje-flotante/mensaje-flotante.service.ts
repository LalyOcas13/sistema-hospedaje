import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MensajeFlotanteData } from './mensaje-flotante.component';

export interface MensajeFlotanteRequest extends MensajeFlotanteData {
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MensajeFlotanteService {
  private mensajeSubject = new Subject<MensajeFlotanteRequest>();
  private respuestaSubject = new Subject<{ id: string; accion: 'aceptar' | 'cancelar' }>();

  // Observable para mostrar mensajes
  public mensaje$ = this.mensajeSubject.asObservable();
  
  // Observable para recibir respuestas
  public respuesta$ = this.respuestaSubject.asObservable();

  constructor() {}

  // Método para mostrar mensaje de confirmación
  mostrarConfirmacion(mensaje: string, titulo: string = 'Confirmación'): Promise<boolean> {
    return new Promise((resolve) => {
      const id = this.generarId();
      
      const subscription = this.respuesta$.subscribe((respuesta) => {
        if (respuesta.id === id) {
          subscription.unsubscribe();
          resolve(respuesta.accion === 'aceptar');
        }
      });

      this.mensajeSubject.next({
        id,
        titulo,
        mensaje,
        tipo: 'confirmacion',
        textoAceptar: 'Aceptar',
        textoCancelar: 'Cancelar'
      });
    });
  }

  // Método para mostrar mensaje de información
  mostrarInfo(mensaje: string, titulo: string = 'Información'): Promise<void> {
    return new Promise((resolve) => {
      const id = this.generarId();
      
      const subscription = this.respuesta$.subscribe((respuesta) => {
        if (respuesta.id === id) {
          subscription.unsubscribe();
          resolve();
        }
      });

      this.mensajeSubject.next({
        id,
        titulo,
        mensaje,
        tipo: 'info',
        textoAceptar: 'Aceptar'
      });
    });
  }

  // Método para mostrar mensaje de advertencia
  mostrarAdvertencia(mensaje: string, titulo: string = 'Advertencia'): Promise<void> {
    return new Promise((resolve) => {
      const id = this.generarId();
      
      const subscription = this.respuesta$.subscribe((respuesta) => {
        if (respuesta.id === id) {
          subscription.unsubscribe();
          resolve();
        }
      });

      this.mensajeSubject.next({
        id,
        titulo,
        mensaje,
        tipo: 'advertencia',
        textoAceptar: 'Entendido'
      });
    });
  }

  // Método para mostrar mensaje de error
  mostrarError(mensaje: string, titulo: string = 'Error'): Promise<void> {
    return new Promise((resolve) => {
      const id = this.generarId();
      
      const subscription = this.respuesta$.subscribe((respuesta) => {
        if (respuesta.id === id) {
          subscription.unsubscribe();
          resolve();
        }
      });

      this.mensajeSubject.next({
        id,
        titulo,
        mensaje,
        tipo: 'error',
        textoAceptar: 'Cerrar'
      });
    });
  }

  // Método para manejar la respuesta del usuario
  enviarRespuesta(id: string, accion: 'aceptar' | 'cancelar'): void {
    this.respuestaSubject.next({ id, accion });
  }

  // Método personalizado para mensajes complejos
  mostrarMensajePersonalizado(data: MensajeFlotanteRequest): Promise<'aceptar' | 'cancelar'> {
    return new Promise((resolve) => {
      const id = data.id || this.generarId();
      
      const subscription = this.respuesta$.subscribe((respuesta) => {
        if (respuesta.id === id) {
          subscription.unsubscribe();
          resolve(respuesta.accion);
        }
      });

      this.mensajeSubject.next({
        ...data,
        id
      });
    });
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
