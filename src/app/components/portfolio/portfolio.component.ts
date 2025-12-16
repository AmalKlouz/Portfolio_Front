import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class PortfolioComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  errorMessage = '';
  
  // Variables pour le popup
  selectedProject: Project | null = null;
  currentImageIndex = 0;
  showPopup = false;
  
  // Gestion du focus pour l'accessibilité
  private previousFocusedElement: HTMLElement | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  // Gestion des touches clavier pour le popup
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.showPopup) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.prevImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
      case 'Escape':
        event.preventDefault();
        this.closePopup();
        break;
      case 'Tab':
        this.handleTabKey(event);
        break;
    }
  }

  // Gérer la navigation par tabulation dans le popup
  private handleTabKey(event: KeyboardEvent): void {
    const popup = document.querySelector('.popup-content');
    if (!popup) return;
    
    const focusableElements = Array.from(popup.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  // Charger les projets
  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement des projets';
        console.error('Erreur:', error);
        this.showErrorNotification(this.errorMessage);
      }
    });
  }

  // Afficher une notification d'erreur
  private showErrorNotification(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Convertir la chaîne technologies en tableau
  getTechnologiesArray(technologies: string): string[] {
    if (!technologies) return [];
    if (Array.isArray(technologies)) return technologies;
    
    try {
      const parsed = JSON.parse(technologies);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Traiter comme chaîne séparée par des virgules
      return technologies.split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);
    }
    
    return [];
  }

  // Récupérer seulement la première image d'un projet
  getFirstImage(project: Project): string {
    if (!project.images || project.images.length === 0) {
      return 'assets/no-image.png';
    }
    
    const image = project.images[0];
    const imageUrl = typeof image === 'string' ? image : image.imageUrl;
    
    if (!imageUrl) return 'assets/no-image.png';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `http://localhost:9000/api/projects/images/${encodeURIComponent(imageUrl)}`;
  }

  // Ouvrir le popup au double-clic
  openProjectPopup(project: Project): void {
    // Sauvegarder l'élément actuellement focus
    this.previousFocusedElement = document.activeElement as HTMLElement;
    
    this.selectedProject = project;
    this.currentImageIndex = 0;
    this.showPopup = true;
    
    // Empêcher le défilement
    document.body.classList.add('popup-open');
    
    // Masquer le contenu principal pour les lecteurs d'écran (sauf le popup)
    const mainContent = document.querySelector('.project-grid');
    if (mainContent) {
      this.renderer.setAttribute(mainContent, 'aria-hidden', 'true');
      this.renderer.setAttribute(mainContent, 'inert', '');
    }
    
    // Focus sur le bouton de fermeture
    setTimeout(() => {
      const closeBtn = document.querySelector('.popup-overlay .close-btn') as HTMLElement;
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  // Fermer le popup
  closePopup(): void {
    this.showPopup = false;
    this.selectedProject = null;
    this.currentImageIndex = 0;
    
    // Restaurer le défilement
    document.body.classList.remove('popup-open');
    
    // Restaurer l'accessibilité du contenu principal
    const mainContent = document.querySelector('.project-grid');
    if (mainContent) {
      this.renderer.removeAttribute(mainContent, 'aria-hidden');
      this.renderer.removeAttribute(mainContent, 'inert');
    }
    
    // Restaurer le focus
    if (this.previousFocusedElement) {
      setTimeout(() => {
        this.previousFocusedElement?.focus();
        this.previousFocusedElement = null;
      }, 50);
    }
  }

  // Éditer le projet
  editProject(project: Project): void {
    if (project.id) {
      this.closePopup();
      this.router.navigate(['/projects/edit', project.id]);
    }
  }

  // Supprimer le projet
  deleteProject(project: Project): void {
    if (!project.id) {
      console.error('No project id');
      return;
    }
    
    console.log('Deleting project:', project.id);
    
    this.projectService.delete(project.id).subscribe({
      next: () => {
        console.log('Project deleted successfully');
        
        this.snackBar.open('Projet supprimé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Retirer le projet de la liste
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.closePopup();
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        this.showErrorNotification('Erreur lors de la suppression du projet');
      }
    });
  }

  // Navigation dans le carrousel
  prevImage(): void {
    if (!this.selectedProject?.images || this.selectedProject.images.length <= 1) return;
    
    this.currentImageIndex--;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.selectedProject.images.length - 1;
    }
  }

  nextImage(): void {
    if (!this.selectedProject?.images || this.selectedProject.images.length <= 1) return;
    
    this.currentImageIndex++;
    if (this.currentImageIndex >= this.selectedProject.images.length) {
      this.currentImageIndex = 0;
    }
  }

  // Image courante
  get currentPopupImage(): string {
    if (!this.selectedProject?.images || this.selectedProject.images.length === 0) {
      return 'assets/no-image.png';
    }
    
    const image = this.selectedProject.images[this.currentImageIndex];
    const imageUrl = typeof image === 'string' ? image : image.imageUrl;
    
    if (!imageUrl) return 'assets/no-image.png';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `http://localhost:9000/api/projects/images/${encodeURIComponent(imageUrl)}`;
  }

  // Gestion des erreurs d'image
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/no-image.png';
    imgElement.onerror = null;
  }

  // Obtenir le texte de la description tronquée
  getTruncatedDescription(description: string, maxLength: number = 100): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  // Recharger les projets
  reloadProjects(): void {
    this.loadProjects();
  }
}