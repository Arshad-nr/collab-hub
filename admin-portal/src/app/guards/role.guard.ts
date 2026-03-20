import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for the initial session restore to complete
  await auth.ready;

  if (auth.currentUser()?.role === 'admin') {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
