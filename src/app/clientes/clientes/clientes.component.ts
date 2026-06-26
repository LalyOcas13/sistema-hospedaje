import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { ClientesService, CrearClienteRequest } from '../services/clientes.service';
import { MensajeFlotanteService } from '../../shared/mensaje-flotante/mensaje-flotante.service';
import { ConsultaDniService } from '../services/consulta-dni.service';

interface ClienteFrontend {
  id: number;
  tipo_documento: string;
  nro_documento: string;
  nombres_apellidos: string;
  acompanante: string;
  nacionalidad: string;
  procedencia: string;
  placa: string;
  tipoVehiculo: string;
  telefono: string;
  estado: string;
}

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  
  // Datos de clientes (se cargarán desde localStorage)
  clientes: ClienteFrontend[] = [];

  // Propiedades para el manejo de datos
  currentUser: any;
  searchTerm: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  filteredClientes: ClienteFrontend[] = [];
  showModal: boolean = false;

  // Propiedades del modal
  clienteForm!: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  clienteEditando: ClienteFrontend | null = null;
  consultandoDNI: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private mensajeFlotanteService: MensajeFlotanteService,
    private consultaDniService: ConsultaDniService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarClientes();
    this.initializeForm();
  }

  cargarClientes(): void {
    this.clientesService.getClientes().subscribe({
      next: (clientesBackend) => {
        // Mapear clientes del backend al formato del frontend
        this.clientes = clientesBackend.map(cliente => ({
          id: cliente.id_cliente,
          tipo_documento: cliente.tipo_documento,
          nro_documento: cliente.nro_documento,
          nombres_apellidos: cliente.nombres_apellidos,
          acompanante: cliente.acompanante || '',
          nacionalidad: cliente.nacionalidad || '',
          procedencia: cliente.procedencia || '',
          placa: cliente.placa || '',
          tipoVehiculo: cliente.tipoVehiculo || '',
          telefono: cliente.telefono,
          estado: cliente.estado
        }));
        this.filteredClientes = [...this.clientes];
        console.log('✅ Clientes cargados desde localStorage:', this.clientes.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar clientes:', err);
        this.filteredClientes = [];
      }
    });
  }

  // Métodos para el manejo del modal
  showAgregarClienteModal(): void {
    console.log('showAgregarClienteModal llamado');
    this.showModal = true;
  }

  hideAgregarClienteModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.clienteEditando = null;
    this.resetForm();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.hideAgregarClienteModal();
    }
  }

  private initializeForm(): void {
    this.clienteForm = this.fb.group({
      tipo_documento: ['', [Validators.required]],
      nro_documento: ['', [Validators.required]],
      nombres_apellidos: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      acompanante: [''],
      nacionalidad: [''],
      procedencia: [''],
      placa: [''],
      tipoVehiculo: [''],
      estado: ['Activo']
    });
  }

  get f() {
    return this.clienteForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.clienteForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.clienteEditando) {
      // Modo edición: actualizar cliente existente
      const clienteActualizado = {
        tipo_documento: this.clienteForm.get('tipo_documento')?.value,
        nro_documento: this.clienteForm.get('nro_documento')?.value,
        nombres_apellidos: this.clienteForm.get('nombres_apellidos')?.value,
        telefono: this.clienteForm.get('telefono')?.value,
        acompanante: this.clienteForm.get('acompanante')?.value || '',
        nacionalidad: this.clienteForm.get('nacionalidad')?.value || '',
        procedencia: this.clienteForm.get('procedencia')?.value || '',
        placa: this.clienteForm.get('placa')?.value || '',
        tipoVehiculo: this.clienteForm.get('tipoVehiculo')?.value || '',
        estado: this.clienteForm.get('estado')?.value || 'Activo'
      };

      this.clientesService.actualizarCliente(this.clienteEditando.id, clienteActualizado).subscribe({
        next: (clienteActualizadoBackend) => {
          // Actualizar cliente en la lista local
          const index = this.clientes.findIndex(c => c.id === this.clienteEditando!.id);
          if (index > -1) {
            this.clientes[index] = {
              ...this.clientes[index],
              ...clienteActualizado
            };
            this.filterClientes();
          }
          
          this.isLoading = false;
          this.hideAgregarClienteModal();
          console.log('✅ Cliente actualizado exitosamente');
          
          // Mostrar mensaje flotante de éxito
          this.mensajeFlotanteService.mostrarInfo(
            'Cliente actualizado exitosamente',
            'Actualización Completada'
          );
        },
        error: (err) => {
          console.error('❌ Error al actualizar cliente:', err);
          this.mensajeFlotanteService.mostrarError(
            'Error al actualizar el cliente: ' + err.message,
            'Error'
          );
          this.isLoading = false;
        }
      });
    } else {
      // Modo creación: crear nuevo cliente
      const nuevoClienteRequest: CrearClienteRequest = {
        tipo_documento: this.clienteForm.get('tipo_documento')?.value,
        nro_documento: this.clienteForm.get('nro_documento')?.value,
        nombres_apellidos: this.clienteForm.get('nombres_apellidos')?.value,
        telefono: this.clienteForm.get('telefono')?.value,
        acompanante: this.clienteForm.get('acompanante')?.value || '',
        nacionalidad: this.clienteForm.get('nacionalidad')?.value || '',
        procedencia: this.clienteForm.get('procedencia')?.value || '',
        placa: this.clienteForm.get('placa')?.value || '',
        tipoVehiculo: this.clienteForm.get('tipoVehiculo')?.value || ''
      };

      // Guardar en localStorage usando el servicio
      this.clientesService.crearCliente(nuevoClienteRequest).subscribe({
        next: (clienteCreado) => {
          // Convertir a formato del frontend y agregar a la lista
          const clienteFrontend: ClienteFrontend = {
            id: clienteCreado.id_cliente,
            tipo_documento: clienteCreado.tipo_documento,
            nro_documento: clienteCreado.nro_documento,
            nombres_apellidos: clienteCreado.nombres_apellidos,
            telefono: clienteCreado.telefono,
            estado: clienteCreado.estado,
            acompanante: this.clienteForm.get('acompanante')?.value || '',
            nacionalidad: this.clienteForm.get('nacionalidad')?.value || '',
            procedencia: this.clienteForm.get('procedencia')?.value || '',
            placa: this.clienteForm.get('placa')?.value || '',
            tipoVehiculo: this.clienteForm.get('tipoVehiculo')?.value || ''
          };

          this.clientes.push(clienteFrontend);
          this.filterClientes();
          this.isLoading = false;
          this.hideAgregarClienteModal();
          
          console.log('✅ Cliente guardado permanentemente en localStorage');
        },
        error: (err) => {
          console.error('❌ Error al guardar cliente:', err);
          this.mensajeFlotanteService.mostrarError(
            'Error al guardar el cliente: ' + err.message,
            'Error'
          );
          this.isLoading = false;
        }
      });
    }
  }

  private resetForm(): void {
    this.submitted = false;
    this.clienteForm.reset({
      tipo_documento: '',
      nro_documento: '',
      nombres_apellidos: '',
      telefono: '',
      acompanante: '',
      nacionalidad: '',
      procedencia: '',
      placa: '',
      tipoVehiculo: '',
      estado: 'Activo'
    });
  }

  // Métodos para el manejo de la tabla
  onSearchChange(): void {
    this.filterClientes();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.filterClientes();
  }

  private filterClientes(): void {
    if (!this.searchTerm) {
      this.filteredClientes = [...this.clientes];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClientes = this.clientes.filter(cliente => 
        cliente.nombres_apellidos.toLowerCase().includes(term) ||
        cliente.tipo_documento.toLowerCase().includes(term) ||
        cliente.nro_documento.toLowerCase().includes(term) ||
        cliente.telefono.toLowerCase().includes(term)
      );
    }
  }

  // Métodos para la paginación
  get totalPages(): number {
    return Math.ceil(this.filteredClientes.length / this.pageSize);
  }

  get paginatedClientes(): ClienteFrontend[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredClientes.slice(startIndex, endIndex);
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

  // Métodos para las acciones
  editCliente(cliente: ClienteFrontend): void {
    console.log('Editar cliente:', cliente);
    
    // Activar modo edición
    this.isEditMode = true;
    this.clienteEditando = cliente;
    
    // Cargar datos del cliente en el formulario
    this.clienteForm.patchValue({
      tipo_documento: cliente.tipo_documento,
      nro_documento: cliente.nro_documento,
      nombres_apellidos: cliente.nombres_apellidos,
      telefono: cliente.telefono,
      acompanante: cliente.acompanante,
      nacionalidad: cliente.nacionalidad,
      procedencia: cliente.procedencia,
      placa: cliente.placa,
      tipoVehiculo: cliente.tipoVehiculo,
      estado: cliente.estado
    });
    
    // Mostrar el modal
    this.showModal = true;
  }

  async deleteCliente(cliente: ClienteFrontend): Promise<void> {
    const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
      `¿Estás seguro de que deseas eliminar al cliente ${cliente.nombres_apellidos}?`,
      'Eliminar Cliente'
    );
    
    if (confirmado) {
      console.log('Eliminar cliente:', cliente);
      
      // Eliminar usando el servicio
      this.clientesService.eliminarCliente(cliente.id).subscribe({
        next: () => {
          const index = this.clientes.findIndex(c => c.id === cliente.id);
          if (index > -1) {
            this.clientes.splice(index, 1);
            this.filterClientes();
          }
          console.log('✅ Cliente eliminado permanentemente');
        },
        error: (err) => {
          console.error('❌ Error al eliminar cliente:', err);
          this.mensajeFlotanteService.mostrarError(
            'Error al eliminar el cliente',
            'Error'
          );
        }
      });
    }
  }

  consultarDNI(): void {
    const dni = this.clienteForm.get('nro_documento')?.value;
    
    // Validar que el DNI tenga 8 dígitos
    if (!dni || dni.length !== 8) {
      this.mensajeFlotanteService.mostrarAdvertencia(
        'El DNI debe tener 8 dígitos',
        'DNI Inválido'
      );
      return;
    }

    this.consultandoDNI = true;

    this.consultaDniService.consultarDNI(dni).subscribe({
      next: (datos) => {
        if (datos.error) {
          this.mensajeFlotanteService.mostrarAdvertencia(
            datos.error,
            'Error en Consulta'
          );
        } else {
          // Autocompletar el formulario con los datos del DNI
          this.clienteForm.patchValue({
            nombres_apellidos: datos.nombre_completo
          });
          
          this.mensajeFlotanteService.mostrarInfo(
            'Datos del DNI cargados correctamente',
            'Consulta Exitosa'
          );
        }
        this.consultandoDNI = false;
      },
      error: (err) => {
        console.error('❌ Error al consultar DNI:', err);
        this.mensajeFlotanteService.mostrarError(
          'Error al consultar el DNI. Verifique su conexión a internet.',
          'Error'
        );
        this.consultandoDNI = false;
      }
    });
  }
}
