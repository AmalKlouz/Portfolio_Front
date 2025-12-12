import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule // Pour les popups
  ]
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  errorMessage = '';
  errorDetails: any = null;
  
  // Variables pour le popup
  selectedProject: Project | null = null;
  currentImageIndex = 0;
  showPopup = false;

  constructor(
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';
    this.errorDetails = null;

    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
        console.log('Projets chargés avec succès:', this.projects);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement des projets';
        this.errorDetails = error;
        console.error('Erreur:', error);
      }
    });
  }

  // Convertir la chaîne technologies en tableau
  getTechnologiesArray(technologies: string): string[] {
    if (!technologies) return [];
    if (Array.isArray(technologies)) return technologies;
    return technologies.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
  }

  // URL complète d'une image
  getProjectImage(filename: string): string {
    if (!filename) return '';
    return `http://localhost:9000/api/projects/images/${encodeURIComponent(filename)}`;
  }

  // Récupérer seulement la première image
  getFirstImage(project: Project): string {
    if (!project.images || project.images.length === 0) {
      return 'assets/no-image.png'; // Image par défaut
    }
    return this.getProjectImage(project.images[0].imageUrl);
  }

  // Ouvrir le popup au double-clic
  openProjectPopup(project: Project): void {
    this.selectedProject = project;
    this.currentImageIndex = 0;
    this.showPopup = true;
  }

  // Fermer le popup
  closePopup(): void {
    this.showPopup = false;
    this.selectedProject = null;
    this.currentImageIndex = 0;
  }

  // Image courante dans le carrousel
  get currentPopupImage(): string {
    if (!this.selectedProject?.images || this.selectedProject.images.length === 0) {
      return 'assets/no-image.png';
    }
    return this.getProjectImage(this.selectedProject.images[this.currentImageIndex].imageUrl);
  }

  // Image précédente dans le carrousel
  prevImage(): void {
    if (!this.selectedProject?.images) return;
    
    this.currentImageIndex--;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.selectedProject.images.length - 1;
    }
  }

  // Image suivante dans le carrousel
  nextImage(): void {
    if (!this.selectedProject?.images) return;
    
    this.currentImageIndex++;
    if (this.currentImageIndex >= this.selectedProject.images.length) {
      this.currentImageIndex = 0;
    }
  }

  // Gestion des touches clavier dans le popup
  onKeydown(event: KeyboardEvent): void {
    if (!this.showPopup) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this.prevImage();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'Escape':
        this.closePopup();
        break;
    }
  }
}