import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Producto {
  nombre: string;
  detalle: string;
  precio: number;
  cantidad: number;
  estado: string;
  codigoBarras?: string;
}

@Component({
  selector: 'app-agregar-producto-modal',
  standalone: false,
  templateUrl: './agregar-producto-modal.component.html',
  styleUrl: './agregar-producto-modal.component.css'
})
export class AgregarProductoModalComponent {
  
  @Input() isVisible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() nuevoProducto: any = {};
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProducto = new EventEmitter<Producto>();

  tiposDocumento = ['DNI', 'Pasaporte', 'Carnet de Extranjería'];
  nacionalidades = ['Peruana', 'Venezolana', 'Colombiana', 'Argentina', 'Chilena', 'Ecuatoriana'];
  tiposVehiculo = ['Automóvil', 'Motocicleta', 'Camioneta', 'Van', 'Bus'];

  constructor() { }

  onCloseModal(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  onSaveProducto(): void {
    if (this.validateForm()) {
      this.saveProducto.emit({ ...this.nuevoProducto });
      this.resetForm();
    }
  }

  private validateForm(): boolean {
    return this.nuevoProducto.nombre.trim() !== '' &&
           this.nuevoProducto.detalle.trim() !== '' &&
           this.nuevoProducto.precio > 0 &&
           this.nuevoProducto.cantidad > 0;
  }

  private resetForm(): void {
    this.nuevoProducto = {
      nombre: '',
      detalle: '',
      precio: 0,
      cantidad: 1,
      estado: 'Activo',
      codigoBarras: ''
    };
  }
}
