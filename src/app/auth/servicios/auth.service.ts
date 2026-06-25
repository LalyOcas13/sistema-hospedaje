import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    rol: string;
  };
}

interface LoginRequest {
  nombre: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // URL base de tu API NestJS
private apiUrl = 'http://localhost:3007/auth';
  
  // Subject para manejar el estado de autenticación
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Método para obtener el usuario almacenado
  private getUserFromStorage(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Login con la API
  login(nombre: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { nombre, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token
          localStorage.setItem('access_token', response.access_token);
          
          // Guardar usuario
          const userData = {
            id: response.user.id,
            nombre: response.user.nombre,
            rol: response.user.rol
          };
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          // Actualizar el subject
          this.currentUserSubject.next(userData);
        })
      );
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verificar si está autenticado
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    return !this.isTokenExpired(token);
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Obtener usuario actual
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Verificar si el token ha expirado
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }
}
