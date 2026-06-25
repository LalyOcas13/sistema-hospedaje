import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../models/user.model';
import { MensajeFlotanteService } from '../../shared/mensaje-flotante/mensaje-flotante.service';
import { UsuariosService, Usuario } from '../usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  // Datos de usuarios
  users: User[] = [];

  // Propiedades para el manejo de datos
  currentUser: any;
  searchTerm: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  filteredUsers: User[] = [];
  showModal: boolean = false;
  showEditModal: boolean = false;
  isEditMode: boolean = false;
  usuarioEditando: User | null = null;
  editandoIndex: number = -1;

  constructor(
    private authService: AuthService,
    private mensajeFlotanteService: MensajeFlotanteService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.users = usuarios.map((u: Usuario) => ({
          id: u.id,
          name: u.nombre,
          email: u.email,
          role: u.rol === 'admin' ? 'Administrador' : 'Empleado',
          status: 'Activo'
        }));
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mensajeFlotanteService.mostrarError('Error al cargar usuarios', 'Error');
      }
    });
  }

  // Métodos para el manejo del modal
  showAgregarUsuarioModal(): void {
    this.showModal = true;
  }

  hideAgregarUsuarioModal(): void {
    this.showModal = false;
  }

  hideEditModal(): void {
    this.showEditModal = false;
    this.isEditMode = false;
    this.usuarioEditando = null;
    this.editandoIndex = -1;
  }

  onUsuarioGuardado(nuevoUsuario: User): void {
    // Agregar el nuevo usuario a través del servicio
    const usuarioParaGuardar: Omit<Usuario, 'id'> = {
      nombre: nuevoUsuario.name,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.role === 'Administrador' ? 'admin' : 'empleado'
    };

    this.usuariosService.crearUsuario(usuarioParaGuardar).subscribe({
      next: (usuarioCreado: Usuario) => {
        this.cargarUsuarios();
        this.mensajeFlotanteService.mostrarInfo('Usuario creado exitosamente', 'Éxito');
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.mensajeFlotanteService.mostrarError('Error al crear usuario', 'Error');
      }
    });
  }

  // Métodos para el manejo de la tabla
  onSearchChange(): void {
    this.filterUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.filterUsers();
  }

  private filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.status.toLowerCase().includes(term)
      );
    }
  }

  // Métodos para la paginación
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
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
  editUser(user: User): void {
    console.log('Editar usuario:', user);
    
    // Activar modo edición
    this.isEditMode = true;
    this.usuarioEditando = user;
    
    // Mostrar el modal de edición
    this.showEditModal = true;
  }

  async deleteUser(user: User): Promise<void> {
    const confirmado = await this.mensajeFlotanteService.mostrarConfirmacion(
      `¿Estás seguro de que deseas eliminar al usuario ${user.name}?`,
      'Eliminar Usuario'
    );

    if (confirmado) {
      this.usuariosService.eliminarUsuario(user.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.mensajeFlotanteService.mostrarInfo('Usuario eliminado exitosamente', 'Éxito');
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.mensajeFlotanteService.mostrarError('Error al eliminar usuario', 'Error');
        }
      });
    }
  }

  // Métodos para los nuevos botones de acción
  actualizarUsuario(usuarioActualizado: User): void {
    if (this.usuarioEditando) {
      const usuarioParaActualizar: Partial<Usuario> = {
        nombre: usuarioActualizado.name,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.role === 'Administrador' ? 'admin' : 'empleado'
      };

      this.usuariosService.actualizarUsuario(this.usuarioEditando.id, usuarioParaActualizar).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.mensajeFlotanteService.mostrarInfo('Usuario actualizado exitosamente', 'Éxito');
          this.hideEditModal();
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.mensajeFlotanteService.mostrarError('Error al actualizar usuario', 'Error');
        }
      });
    }
  }

  guardarCambios(): void {
    console.log('Guardar cambios en usuarios');
    // Aquí puedes implementar la lógica para guardar los cambios
  }

  cancelar(): void {
    console.log('Cancelar operación');
    // Aquí puedes implementar la lógica para cancelar
  }
}
