import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../models/user.model';

@Component({
  selector: 'app-agregar-usuario',
  standalone: false,
  templateUrl: './agregar-usuario.component.html',
  styleUrl: './agregar-usuario.component.css'
})
export class AgregarUsuarioComponent implements OnInit {
  
  @Input() isVisible: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() usuarioGuardado = new EventEmitter<User>();

  usuarioForm!: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('AgregarUsuarioComponent inicializado, isVisible:', this.isVisible);
    this.initializeForm();
  }

  ngOnChanges(): void {
    console.log('Cambios en AgregarUsuarioComponent, isVisible:', this.isVisible);
  }

  private initializeForm(): void {
    this.usuarioForm = this.fb.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]],
      estado: ['Activo', [Validators.required]]
    });
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

    // Simular guardado
    setTimeout(() => {
      const nuevoUsuario: User = {
        id: Date.now(), // ID temporal
        name: this.usuarioForm.value.nombres + ' ' + this.usuarioForm.value.apellidos,
        email: this.usuarioForm.value.email,
        role: this.usuarioForm.value.rol,
        status: this.usuarioForm.value.estado
      };

      this.usuarioGuardado.emit(nuevoUsuario);
      this.isLoading = false;
      this.closeModal();
      this.resetForm();
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
    this.usuarioForm.reset({
      nombres: '',
      apellidos: '',
      email: '',
      rol: '',
      estado: 'Activo'
    });
  }
}
