// Un "guard" en Angular es una clase especial que protege rutas.
// Sirve para permitir o bloquear el acceso a ciertas páginas

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
// Se usa para proteger rutas del router.
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('AuthGuard: Verificando autenticación');
    console.log('AuthGuard: Usuario autenticado?', this.authService.isAuthenticated());

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: Redirigiendo al login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Verificar si la ruta requiere un rol específico
    const rolRequerido = route.data['rol'];
    const usuario = this.authService.getCurrentUser();

    if (rolRequerido && usuario) {
      console.log('AuthGuard: Rol requerido:', rolRequerido);
      console.log('AuthGuard: Rol del usuario:', usuario.role);

      // Si requiere rol admin y el usuario no es admin, denegar acceso
      if (rolRequerido === 'admin' && usuario.role !== 'admin') {
        console.log('AuthGuard: Acceso denegado - Se requiere rol admin');
        this.router.navigate(['/recepcion']);
        return false;
      }
    }

    console.log('AuthGuard: Acceso permitido');
    return true;
  }
}
