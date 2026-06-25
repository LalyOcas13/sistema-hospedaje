import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-editar-habitacion',
  standalone: false,
  templateUrl: './editar-habitacion.component.html',
  styleUrl: './editar-habitacion.component.css'
})
export class EditarHabitacionComponent implements OnInit {
  habitacionForm: FormGroup;
  cargando: boolean = false;
  habitacionId: number | null = null;
  habitacionActual: Habitacion | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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
    // Obtener el ID de la habitación de la ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.habitacionId = Number(id);
        this.cargarHabitacion();
      }
    });
  }

  cargarHabitacion(): void {
    try {
      // Cargar datos reales desde localStorage (donde se guardan las habitaciones)
      const habitacionesGuardadas = localStorage.getItem('habitaciones');
      let habitaciones: any[] = [];
      
      if (habitacionesGuardadas) {
        habitaciones = JSON.parse(habitacionesGuardadas);
      } else {
        // Si no hay datos en localStorage, usar datos por defecto
        habitaciones = [
          { id_habitacion: 101, numero: '101', tipo_habitacion: 'Individual', precio: 50, estado: 'disponible', capacidad: 1, piso: 1, descripcion: 'Habitación individual con vista al jardín' },
          { id_habitacion: 102, numero: '102', tipo_habitacion: 'Doble', precio: 80, estado: 'disponible', capacidad: 2, piso: 1, descripcion: 'Habitación doble con balcón' },
          { id_habitacion: 201, numero: '201', tipo_habitacion: 'Doble', precio: 90, estado: 'disponible', capacidad: 2, piso: 2, descripcion: 'Habitación doble en segundo piso' },
          { id_habitacion: 202, numero: '202', tipo_habitacion: 'Individual', precio: 55, estado: 'disponible', capacidad: 1, piso: 2, descripcion: 'Habitación individual tranquila' },
          { id_habitacion: 301, numero: '301', tipo_habitacion: 'Matrimonial', precio: 150, estado: 'reservada', capacidad: 2, piso: 3, descripcion: 'Suite presidencial con jacuzzi' }
        ];
      }

      const habitacion = habitaciones.find(h => h.id_habitacion === this.habitacionId);
      if (habitacion) {
        // Convertir al formato del formulario
        const habitacionFormateada = {
          id: habitacion.id_habitacion,
          numero: habitacion.numero,
          tipo: habitacion.tipo_habitacion,
          precio: habitacion.precio,
          estado: habitacion.estado,
          capacidad: habitacion.capacidad,
          piso: habitacion.piso,
          descripcion: habitacion.descripcion
        };
        
        this.habitacionActual = habitacionFormateada;
        this.habitacionForm.patchValue(habitacionFormateada);
      } else {
        this.mensajeFlotanteService.mostrarError(
          'Habitación no encontrada en el sistema',
          'Error de Búsqueda'
        );
        this.router.navigate(['/habitaciones']);
      }
    } catch (error) {
      this.mensajeFlotanteService.mostrarError(
        'Error al cargar los datos de la habitación',
        'Error de Carga'
      );
      this.router.navigate(['/habitaciones']);
    }
  }

  actualizarHabitacion(): void {
    if (this.habitacionForm.invalid) {
      this.habitacionForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // Simular actualización
    setTimeout(() => {
      const habitacionActualizada: Habitacion = {
        id: this.habitacionId!,
        ...this.habitacionForm.value,
        piso: Number(this.habitacionForm.value.piso)
      };

      
      // Guardar en localStorage
      try {
        // Obtener habitaciones actuales
        const habitacionesGuardadas = localStorage.getItem('habitaciones');
        let habitaciones: any[] = [];
        
        if (habitacionesGuardadas) {
          habitaciones = JSON.parse(habitacionesGuardadas);
        } else {
          // Si no hay datos, usar los datos por defecto
          habitaciones = [
            { id_habitacion: 101, numero: '101', tipo_habitacion: 'Individual', precio: 50, estado: 'disponible', capacidad: 1, piso: 1, descripcion: 'Habitación individual con vista al jardín' },
            { id_habitacion: 102, numero: '102', tipo_habitacion: 'Doble', precio: 80, estado: 'disponible', capacidad: 2, piso: 1, descripcion: 'Habitación doble con balcón' },
            { id_habitacion: 201, numero: '201', tipo_habitacion: 'Doble', precio: 90, estado: 'disponible', capacidad: 2, piso: 2, descripcion: 'Habitación doble en segundo piso' },
            { id_habitacion: 202, numero: '202', tipo_habitacion: 'Individual', precio: 55, estado: 'disponible', capacidad: 1, piso: 2, descripcion: 'Habitación individual tranquila' },
            { id_habitacion: 301, numero: '301', tipo_habitacion: 'Matrimonial', precio: 150, estado: 'reservada', capacidad: 2, piso: 3, descripcion: 'Suite presidencial con jacuzzi' }
          ];
        }

        // Encontrar y actualizar la habitación
        const index = habitaciones.findIndex(h => h.id_habitacion === this.habitacionId);
        if (index !== -1) {
          // Convertir al formato que se guarda en localStorage
          habitaciones[index] = {
            id_habitacion: habitacionActualizada.id,
            numero: habitacionActualizada.numero,
            tipo_habitacion: habitacionActualizada.tipo,
            precio: habitacionActualizada.precio,
            estado: habitacionActualizada.estado,
            capacidad: habitacionActualizada.capacidad,
            piso: habitacionActualizada.piso,
            descripcion: habitacionActualizada.descripcion
          };
          
          // Guardar en localStorage
          localStorage.setItem('habitaciones', JSON.stringify(habitaciones));
          }
      } catch (error) {
      }
      
      this.mensajeFlotanteService.mostrarInfo(
        '¡Habitación actualizada exitosamente!',
        'Actualización Completada'
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
