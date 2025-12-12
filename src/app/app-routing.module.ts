import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { CvListComponent } from './components/cv-list/cv-list.component';
import { ContactCreateComponent } from './components/contact-create/contact-create.component';

export const routes: Routes = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' }, // Page d'accueil redirige vers projets
  { path: 'projects', component: ProjectListComponent },
  { path: 'profiles', component: ProfileListComponent },
  { path: 'cvs', component: CvListComponent },
  { path: 'contact', component: ContactCreateComponent },
  { path: '**', redirectTo: '/projects' } // fallback pour routes inconnues
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
