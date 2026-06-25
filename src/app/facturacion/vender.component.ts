import { Component } from '@angular/core';
import { MensajeFlotanteService } from '../shared/mensaje-flotante/mensaje-flotante.service';
import { VentasService } from '../reportes/services/ventas.service';
import { ReservasService } from '../modules/reservas/services/reservas.service';

interface Producto {
  id: number;
  nombre: string;
  detalle: string;
  precio: number;
  cantidad: number;
  stock: number;
  subtotal: number;
  estado: string;
  codigoBarras?: string;
}

interface ItemCarrito extends Producto {
  idCarrito: number;
}

interface Cliente {
  tipoDocumento: string;
  numeroDocumento: string;
  nombresApellidos: string;
  telefono: string;
  email: string;
  direccion: string;
  tipoHabitacion: string;
  numeroHabitacion: string;
  fechaIngreso: string;
  fechaSalida: string;
  estado: string;
}

@Component({
  selector: 'app-vender',
  standalone: false,
  templateUrl: './vender.component.html',
  styleUrl: './vender.component.css'
})
export class VenderComponent {
  currentUser = {
    name: 'Laly Melissa Ocas Vasquez'
  };

  // Formulario de búsqueda de cliente
  documentoBusqueda: string = '';
  clienteEncontrado: Cliente | null = null;
  mostrarDetallesCliente: boolean = false;

  // Control de visibilidad de secciones
  mostrarProductosSection: boolean = false;
  mostrarPagoSection: boolean = false;

  // Productos disponibles para vender (se cargarán desde registro-consumo)
  productos: Producto[] = [];
  
  // Cargar productos desde el registro de consumo
  cargarProductosDesdeRegistro(): void {
    try {
      // Intentar cargar desde localStorage o usar datos de ejemplo
      const productosGuardados = localStorage.getItem('hoteleria_productos');
      
      if (productosGuardados) {
        this.productos = JSON.parse(productosGuardados);
      } else {
        // Usar datos de ejemplo si no hay nada guardado (solo los 4 productos del registro)
        this.productos = [
          { id: 1, nombre: 'Agua Life', detalle: '250 ML', precio: 3.0, cantidad: 0, stock: 30, subtotal: 0, estado: 'Activo', codigoBarras: '7501051234567' },
          { id: 2, nombre: 'Cigarrillos', detalle: '10 UNID', precio: 3.5, cantidad: 0, stock: 40, subtotal: 0, estado: 'Activo', codigoBarras: '7798123456789' },
          { id: 3, nombre: 'Shammpo GH', detalle: '200 ML', precio: 2.5, cantidad: 0, stock: 20, subtotal: 0, estado: 'Activo', codigoBarras: '7702030456789' },
          { id: 4, nombre: 'Refresco Pocmas', detalle: '350 ML', precio: 1.5, cantidad: 0, stock: 18, subtotal: 0, estado: 'Activo', codigoBarras: '7756078901234' }
        ];
      }
      console.log('✅ Productos cargados:', this.productos.length, 'productos');
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      this.mensajeFlotanteService.mostrarError(
        'No se pudieron cargar los productos',
        'Error de Carga'
      );
    }
  }
  
  // Obtener productos con stock disponible
  get productosConStock(): Producto[] {
    return this.productos.filter(producto => producto.stock > 0 && producto.estado === 'Activo');
  }

  // Productos agregados al carrito
  carrito: ItemCarrito[] = [];
  totalVenta = 0;

  // Variables para el lector de código de barras
  codigoEscaneado: string = '';
  productoEncontrado: Producto | null = null;

  constructor(
    private mensajeFlotanteService: MensajeFlotanteService,
    private ventasService: VentasService,
    private reservasService: ReservasService
  ) {
    this.cargarProductosDesdeRegistro();
  }

  buscarCliente(): void {
    if (this.documentoBusqueda.length >= 8) {
      try {
        // Obtener clientes del localStorage
        const clientes = JSON.parse(localStorage.getItem('hoteleria_clientes') || '[]');
        
        // Buscar cliente por DNI
        const cliente = clientes.find((c: any) => 
          c.nro_documento === this.documentoBusqueda
        );
        
        if (cliente) {
          // Buscar reserva activa del cliente para obtener habitación
          this.reservasService.getReservas().subscribe({
            next: (reservas) => {
              const reservaActiva = reservas.find(r =>
                r.id_cliente === cliente.id_cliente &&
                (r.estado === 'Pagado' || r.estado === 'Pendiente')
              );

              const numeroHabitacion = reservaActiva ? reservaActiva.id_habitacion.toString() : 'Sin habitación';

              // Mapear datos del cliente al formato que usa el componente
              this.clienteEncontrado = {
                tipoDocumento: cliente.tipo_documento,
                numeroDocumento: cliente.nro_documento,
                nombresApellidos: cliente.nombres_apellidos,
                telefono: cliente.telefono,
                email: cliente.email || '',
                direccion: cliente.direccion || '',
                tipoHabitacion: '',
                numeroHabitacion: numeroHabitacion,
                fechaIngreso: reservaActiva ? reservaActiva.fecha : '',
                fechaSalida: reservaActiva ? reservaActiva.fecha : '',
                estado: cliente.estado
              };
              this.mostrarDetallesCliente = true;
              console.log('✅ Cliente encontrado:', this.clienteEncontrado.nombresApellidos);
              console.log('🏠 Habitación:', numeroHabitacion);
            },
            error: (err) => {
              console.error('❌ Error al buscar reserva:', err);
              // Si hay error al buscar reserva, usar datos del cliente sin habitación
              this.clienteEncontrado = {
                tipoDocumento: cliente.tipo_documento,
                numeroDocumento: cliente.nro_documento,
                nombresApellidos: cliente.nombres_apellidos,
                telefono: cliente.telefono,
                email: cliente.email || '',
                direccion: cliente.direccion || '',
                tipoHabitacion: '',
                numeroHabitacion: 'Sin habitación',
                fechaIngreso: '',
                fechaSalida: '',
                estado: cliente.estado
              };
              this.mostrarDetallesCliente = true;
              console.log('✅ Cliente encontrado (sin reserva):', this.clienteEncontrado.nombresApellidos);
            }
          });
        } else {
          this.mensajeFlotanteService.mostrarAdvertencia(
            'No se encontró un cliente con ese DNI',
            'Cliente No Encontrado'
          );
          this.clienteEncontrado = null;
          this.mostrarDetallesCliente = false;
        }
      } catch (error) {
        console.error('❌ Error al buscar cliente:', error);
        this.mensajeFlotanteService.mostrarError(
          'Error al buscar cliente en el sistema',
          'Error de Búsqueda'
        );
      }
    } else {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'Ingrese un DNI válido (mínimo 8 dígitos)',
        'DNI Inválido'
      );
    }
  }

  actualizarCantidad(producto: Producto, event: any): void {
    let nuevaCantidad = parseInt(event.target.value) || 0;
    
    // Validar que no exceda el stock disponible
    if (nuevaCantidad > producto.stock) {
      nuevaCantidad = producto.stock;
      this.mensajeFlotanteService.mostrarAdvertencia(
        `No puede solicitar más de ${producto.stock} unidades de este producto`,
        'Stock Insuficiente'
      );
    }
    
    producto.cantidad = nuevaCantidad;
    producto.subtotal = producto.cantidad * producto.precio;
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.cantidad <= 0) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'Debe especificar una cantidad válida',
        'Cantidad Inválida'
      );
      return;
    }
    
    if (producto.cantidad > producto.stock) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles`,
        'Stock Insuficiente'
      );
      return;
    }
    
    const itemCarrito: ItemCarrito = {
      ...producto,
      idCarrito: Date.now()
    };
    this.carrito.push(itemCarrito);
    
    // Reducir el stock disponible
    const productoOriginal = this.productos.find(p => p.id === producto.id);
    if (productoOriginal) {
      productoOriginal.stock -= producto.cantidad;
    }
    
    this.calcularTotal();
    
    // Resetear producto
    producto.cantidad = 0;
    producto.subtotal = 0;
    
    this.mensajeFlotanteService.mostrarInfo(
      `Producto agregado correctamente. Stock actualizado: ${productoOriginal?.stock || 0}`,
      'Producto Agregado'
    );
  }

  calcularTotal(): void {
    this.totalVenta = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }

  eliminarDelCarrito(item: ItemCarrito): void {
    // Devolver el stock al eliminar
    const productoOriginal = this.productos.find(p => p.id === item.id);
    if (productoOriginal) {
      productoOriginal.stock += item.cantidad;
    }
    
    this.carrito = this.carrito.filter(i => i.idCarrito !== item.idCarrito);
    this.calcularTotal();
    
    this.mensajeFlotanteService.mostrarInfo(
      `Producto eliminado. Stock restaurado: ${productoOriginal?.stock || 0}`,
      'Producto Eliminado'
    );
  }

  finalizarVenta(): void {
    console.log('🛒 Iniciando finalizarVenta()');
    console.log('🛒 Carrito:', this.carrito);
    console.log('🛒 Cliente encontrado:', this.clienteEncontrado);

    if (this.carrito.length === 0) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'Debe agregar productos al carrito',
        'Carrito Vacío'
      );
      return;
    }

    // Crear objeto de venta
    const venta = {
      id_venta: Date.now(),
      cliente: this.clienteEncontrado,
      productos: this.carrito,
      total: this.totalVenta,
      fecha: new Date().toISOString(),
      tipo: 'productos'
    };

    console.log('🛒 Venta creada:', venta);

    // Guardar venta en localStorage
    this.guardarVentaEnLocalStorage(venta);

    // Guardar venta en el servicio de reportes
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    const fechaLocal = `${year}-${month}-${day}`;

    const ventaParaReporte = {
      id: venta.id_venta,
      cliente: this.clienteEncontrado?.nombresApellidos || 'Cliente',
      habitacion: this.clienteEncontrado?.numeroHabitacion || 'Sin habitación',
      productos: this.carrito.map(p => p.nombre),
      total: this.totalVenta,
      fecha: fechaLocal,
      estado: 'pagado' as 'pagado'
    };

    console.log('📊 Guardando venta en reportes:', ventaParaReporte);
    this.ventasService.agregarVenta(ventaParaReporte);

    console.log('Venta finalizada:', venta);

    this.mensajeFlotanteService.mostrarInfo(
      'Venta procesada correctamente',
      'Venta Exitosa'
    );

    // Resetear todo
    this.carrito = [];
    this.totalVenta = 0;
    this.clienteEncontrado = null;
    this.mostrarDetallesCliente = false;
    this.mostrarProductosSection = false;
    this.mostrarPagoSection = false;
    this.documentoBusqueda = '';
  }

  private guardarVentaEnLocalStorage(venta: any): void {
    try {
      const ventas = JSON.parse(localStorage.getItem('hoteleria_ventas') || '[]');
      ventas.push(venta);
      localStorage.setItem('hoteleria_ventas', JSON.stringify(ventas));
      console.log('✅ Venta guardada en localStorage:', venta.id_venta);
    } catch (error) {
      console.error('❌ Error al guardar venta en localStorage:', error);
      this.mensajeFlotanteService.mostrarError(
        'No se pudo guardar la venta en el almacenamiento local',
        'Error de Guardado'
      );
    }
  }

  // Métodos para controlar la visibilidad de secciones
  mostrarComprarProductos(): void {
    this.mostrarProductosSection = true;
    this.mostrarPagoSection = false;
  }

  mostrarPagarServicio(): void {
    this.mostrarProductosSection = false;
    this.mostrarPagoSection = true;
    // Calcular total del servicio (habitación)
    this.calcularTotalServicio();
  }

  calcularTotalServicio(): void {
    // Lógica para calcular el costo de la habitación/servicio
    this.totalVenta = 150.00; // Ejemplo: $150 por noche
  }

  // Métodos para el lector de código de barras
  buscarProductoPorCodigo(): void {
    if (!this.codigoEscaneado.trim()) {
      return;
    }

    // VALIDACIÓN: Primero debe buscar cliente
    if (!this.clienteEncontrado) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        '⚠️ Primero debe buscar un cliente antes de escanear productos',
        'Cliente Requerido'
      );
      return;
    }

    const producto = this.productos.find(p => p.codigoBarras === this.codigoEscaneado.trim());
    
    if (producto) {
      this.productoEncontrado = producto;
      this.agregarDirectamenteAlCarrito(producto);
      this.codigoEscaneado = '';
      
      this.mensajeFlotanteService.mostrarInfo(
        `✅ Producto "${producto.nombre}" agregado para ${this.clienteEncontrado.nombresApellidos}`,
        'Producto Asociado al Cliente'
      );
    } else {
      this.mensajeFlotanteService.mostrarError(
        '❌ Producto no encontrado. Verifique el código de barras.',
        'Error de Búsqueda'
      );
      this.codigoEscaneado = '';
    }
  }

  agregarDirectamenteAlCarrito(producto: Producto): void {
    if (producto.stock > 0) {
      // Agregar cantidad por defecto de 1
      producto.cantidad = 1;
      producto.subtotal = producto.precio;
      
      this.agregarAlCarrito(producto);
      
      // Limpiar búsqueda
      this.codigoEscaneado = '';
      this.productoEncontrado = null;
    } else {
      this.mensajeFlotanteService.mostrarAdvertencia(
        `El producto "${producto.nombre}" no tiene stock disponible`,
        'Stock Agotado'
      );
    }
  }

  activarScanner(): void {
    this.mensajeFlotanteService.mostrarInfo(
      'Función de escáner en desarrollo. Use el teclado para ingresar el código.',
      'Escáner'
    );
  }

  cambiarCliente(): void {
    // Limpiar cliente actual
    this.clienteEncontrado = null;
    this.mostrarDetallesCliente = false;
    this.documentoBusqueda = '';
    this.codigoEscaneado = '';
    this.productoEncontrado = null;
    
    // Limpiar carrito también
    this.carrito = [];
    this.totalVenta = 0;
    
    this.mensajeFlotanteService.mostrarInfo(
      'Cliente cambiado. Puede buscar un nuevo cliente.',
      'Cliente Cambiado'
    );
  }
}
