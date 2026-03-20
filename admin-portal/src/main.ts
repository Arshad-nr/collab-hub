import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_ROUTES } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES),
    provideAnimations(),
    provideHttpClient(withFetch()),
  ],
}).catch(err => console.error(err));
