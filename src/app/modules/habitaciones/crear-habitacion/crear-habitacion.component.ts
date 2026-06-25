import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MensajeFlotanteService } from '../../../shared/mensaje-flotante/mensaje-flotante.service';

export interface Habitacion {
  id: number;
  numero: string;
  tipo: string;
  precio: number;
  estado: 'disponible' | 'ocupada' | 'reservada' | 'mantenimiento';
  capacidad?: number;
  descripcion?: string;
  piso?: number;
}

@Component({
  selector: 'app-crear-habitacion',
  standalone: false,
  templateUrl: './crear-habitacion.component.html',
  styleUrl: './crear-habitacion.component.css'
})
export class CrearHabitacionComponent implements OnInit {
  habitacionForm: FormGroup;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private mensajeFlotanteService: MensajeFlotanteService
  ) {
    this.habitacionForm = this.fb.group({
      numero: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      tipo: ['', Validators.required],
      piso: ['', Validators.required],
      capacidad: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      estado: ['disponible', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  guardarHabitacion(): void {
    if (this.habitacionForm.invalid) {
      this.habitacionForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // Simular guardado
    setTimeout(() => {
      const nuevaHabitacion: Habitacion = {
        id: Date.now(), // ID temporal
        ...this.habitacionForm.value,
        piso: Number(this.habitacionForm.value.piso)
      };

      console.log('Nueva habitación creada:', nuevaHabitacion);
      
      // Aquí iría la lógica para guardar en el backend
      this.mensajeFlotanteService.mostrarInfo(
        '¡Habitación creada exitosamente!',
        'Creación Completada'
      );
      
      this.cargando = false;
      this.router.navigate(['/habitaciones']);
    }, 1500);
  }

  volver(): void {
    this.router.navigate(['/habitaciones']);
  }

  // Getters para validaciones
  get numero() { return this.habitacionForm.get('numero'); }
  get tipo() { return this.habitacionForm.get('tipo'); }
  get piso() { return this.habitacionForm.get('piso'); }
  get capacidad() { return this.habitacionForm.get('capacidad'); }
  get precio() { return this.habitacionForm.get('precio'); }
  get estado() { return this.habitacionForm.get('estado'); }
  get descripcion() { return this.habitacionForm.get('descripcion'); }
}
