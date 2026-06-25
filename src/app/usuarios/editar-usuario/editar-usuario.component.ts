import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../models/user.model';

@Component({
  selector: 'app-editar-usuario',
  standalone: false,
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit, OnChanges {
  
  @Input() isVisible: boolean = false;
  @Input() usuario: User | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() usuarioActualizado = new EventEmitter<User>();

  usuarioForm!: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('EditarUsuarioComponent inicializado');
    this.initializeForm();
  }

  ngOnChanges(): void {
    console.log('Cambios en EditarUsuarioComponent, usuario:', this.usuario);
    if (this.usuario) {
      this.cargarDatosUsuario();
    }
  }

  private initializeForm(): void {
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      status: ['Activo', [Validators.required]]
    });
  }

  private cargarDatosUsuario(): void {
    console.log('cargarDatosUsuario llamado con usuario:', this.usuario);
    if (this.usuario) {
      console.log('Datos a cargar:', {
        name: this.usuario.name,
        email: this.usuario.email,
        role: this.usuario.role,
        status: this.usuario.status
      });
      this.usuarioForm.patchValue({
        name: this.usuario.name,
        email: this.usuario.email,
        role: this.usuario.role,
        status: this.usuario.status
      });
      console.log('Formulario después de patchValue:', this.usuarioForm.value);
    }
  }

  get f() {
    return this.usuarioForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.usuarioForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Simular actualización
    setTimeout(() => {
      const usuarioActualizado: User = {
        id: this.usuario!.id,
        ...this.usuarioForm.value
      };

      this.usuarioActualizado.emit(usuarioActualizado);
      this.isLoading = false;
      this.closeModal();
    }, 1500);
  }

  closeModal(): void {
    this.isVisible = false;
    this.closeModalEvent.emit();
    this.resetForm();
  }

  onOverlayClick(event: MouseEvent): void {
    // Cerrar modal solo si se hace clic en el overlay, no en el contenido
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private resetForm(): void {
    this.submitted = false;
    if (this.usuarioForm) {
      this.usuarioForm.reset({
        name: '',
        email: '',
        role: '',
        status: 'Activo'
      });
    }
  }
}
