import { Component, OnInit } from '@angular/core';
import { MensajeFlotanteService } from '../../shared/mensaje-flotante/mensaje-flotante.service';

// Importar interfaces desde el modelo compartido
interface Producto {
  id: number;
  nombre: string;
  detalle: string;
  precio: number;
  cantidad: number;
  estado: string;
  codigoBarras?: string;
}

@Component({
  selector: 'app-registro-consumo',
  standalone: false,
  templateUrl: './registro-consumo.component.html',
  styleUrl: './registro-consumo.component.css'
})
export class RegistroConsumoComponent implements OnInit {
  
  currentUser: any;
  userName = 'Laly Melissa Ocas Vasquez';
  pageSize = 10;
  searchTerm = '';
  currentPage = 1;
  showModal: boolean = false;
  isEditMode: boolean = false;
  productoEditando: Producto | null = null;
  nuevoProducto: Partial<Producto> = {
    nombre: '',
    detalle: '',
    precio: 0,
    cantidad: 0,
    estado: 'Activo',
    codigoBarras: ''
  };
  
  // Datos de ejemplo para la tabla
  productos: Producto[] = [
    { id: 1, nombre: 'Agua Life', detalle: '250 ML', precio: 3.0, cantidad: 30, estado: 'Activo', codigoBarras: '7501051234567' },
    { id: 2, nombre: 'Cigarrillos', detalle: '10 UNID', precio: 3.5, cantidad: 40, estado: 'Activo', codigoBarras: '7798123456789' },
    { id: 3, nombre: 'Shammpo GH', detalle: '200 ML', precio: 2.5, cantidad: 20, estado: 'Activo', codigoBarras: '7702030456789' },
    { id: 4, nombre: 'Refresco Pocmas', detalle: '350 ML', precio: 1.5, cantidad: 18, estado: 'Activo', codigoBarras: '7756078901234' }
  ];

  filteredProductos = [...this.productos];

  constructor(private mensajeFlotanteService: MensajeFlotanteService) { }

  ngOnInit(): void {
    this.currentUser = { name: this.userName };
    this.filterProductos();
  }

  
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.filterProductos();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.filterProductos();
  }

  filterProductos(): void {
    if (!this.searchTerm) {
      this.filteredProductos = [...this.productos];
    } else {
      this.filteredProductos = this.productos.filter(producto =>
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        producto.detalle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  agregarProducto(): void {
    this.showModal = true;
  }

  hideModal(): void {
    this.showModal = false;
  }

  onProductoGuardado(producto: any): void {
    if (this.isEditMode && this.productoEditando) {
      // Modo edición: actualizar producto existente
      const index = this.productos.findIndex(p => p.id === this.productoEditando!.id);
      if (index > -1) {
        this.productos[index] = {
          ...this.productos[index],
          ...producto
        };
        console.log('✅ Producto actualizado:', this.productos[index]);
      }
    } else {
      // Modo creación: agregar nuevo producto
      const nuevoId = Math.max(...this.productos.map(p => p.id)) + 1;
      this.productos.push({
        id: nuevoId,
        ...producto
      });
      console.log('✅ Producto creado:', producto);
    }
    
    this.filterProductos();
    this.hideModal();
    this.resetForm();
  }

  private resetForm(): void {
    this.isEditMode = false;
    this.productoEditando = null;
    this.nuevoProducto = {
      nombre: '',
      detalle: '',
      precio: 0,
      cantidad: 0,
      estado: 'Activo',
      codigoBarras: ''
    };
  }

  editarProducto(id: number): void {
    console.log('Editar producto:', id);
    
    // Buscar el producto a editar
    const producto = this.productos.find(p => p.id === id);
    if (!producto) {
      this.mensajeFlotanteService.mostrarError(
        'Producto no encontrado',
        'Error'
      );
      return;
    }
    
    // Activar modo edición
    this.isEditMode = true;
    this.productoEditando = producto;
    
    // Cargar datos en el formulario
    this.nuevoProducto = {
      nombre: producto.nombre,
      detalle: producto.detalle,
      precio: producto.precio,
      cantidad: producto.cantidad,
      estado: producto.estado,
      codigoBarras: producto.codigoBarras || ''
    };
    
    // Mostrar modal de edición
    this.showModal = true;
  }

  async eliminarProducto(id: number): Promise<void> {
    // Buscar el producto a eliminar
    const producto = this.productos.find(p => p.id === id);
    if (!producto) {
      this.mensajeFlotanteService.mostrarError(
        'Producto no encontrado',
        'Error'
      );
      return;
    }
    
    // Confirmar eliminación
    const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
      `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`,
      'Eliminar Producto'
    );
    
    if (confirmado) {
      // Eliminar producto del array
      const index = this.productos.findIndex(p => p.id === id);
      if (index > -1) {
        this.productos.splice(index, 1);
        console.log('✅ Producto eliminado:', producto);
        
        // Actualizar lista filtrada
        this.filterProductos();
        
        // Si la página actual no tiene productos, ir a la página anterior
        const totalPages = Math.ceil(this.filteredProductos.length / this.pageSize);
        if (this.currentPage > totalPages && totalPages > 0) {
          this.currentPage = totalPages;
        }
      }
    }
  }

  cambiarPagina(pagina: number): void {
    this.currentPage = pagina;
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredProductos.length / this.pageSize);
  }

  getPaginatedProductos(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredProductos.slice(startIndex, endIndex);
  }

  // Métodos para la paginación (compatibles con usuarios)
  get totalPages(): number {
    return Math.ceil(this.filteredProductos.length / this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Métodos para los botones de acción
  guardarCambios(): void {
    console.log('Guardar cambios en consumo');
  }

  cancelar(): void {
    console.log('Cancelar operación');
  }

  actualizarEstado(producto: any): void {
    console.log('Estado actualizado:', producto.nombre, 'nuevo estado:', producto.estado);
    // Aquí puedes agregar lógica para guardar el cambio en la base de datos
  }
}
