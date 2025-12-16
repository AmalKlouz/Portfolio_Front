import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { CvListComponent } from './components/cv-list/cv-list.component';
import { ContactCreateComponent } from './components/contact-create/contact-create.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './auth/AuthGuard';
import { AppComponent } from './app.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  // Route d'accueil
  { path: '', component: AppComponent },
  
  // Routes spécifiques
  { path: 'projects', component: ProjectListComponent },
  { path: 'profiles', component: ProfileListComponent },
  { path: 'cvs', component: CvListComponent },
  { path: 'contact', component: ContactCreateComponent },
  { path: 'profile', component: ProfileComponent },


    {
        path: 'projects',
        component: ProjectsComponent,
        data: { title: 'Gestion des Projets' }
      },
        { path: 'portfolio', component: PortfolioComponent },

      {
        path: 'projects/new',
        component: ProjectFormComponent,
        data: { title: 'Créer un Projet', mode: 'create' }
      },
      {
        path: 'projects/edit/:id',
        component: ProjectFormComponent,
        data: { title: 'Modifier le Projet', mode: 'edit' }
      },
   
  // Authentification
  { path: 'login', component: LoginComponent },
  
  // Dashboard (protégé)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard] 
  },
  
  // UNE SEULE route wildcard À LA FIN
  { path: '**', redirectTo: '' } // ← UNIQUEMENT ICI, À LA FIN
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }