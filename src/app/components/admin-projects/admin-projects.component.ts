// admin-projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-admin-projects',
  templateUrl: './admin-projects.component.html',
  styleUrls: ['./admin-projects.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDialogComponent] // Importez ConfirmDialogComponent ici
})
export class AdminProjectsComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  error: string | null = null;
  showConfirmDialog = false;
  projectToDelete: number | null = null;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des projets';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  confirmDelete(id: number): void {
    this.projectToDelete = id;
    this.showConfirmDialog = true;
  }

  onDeleteConfirmed(): void {
    if (this.projectToDelete !== null) {
      this.projectService.delete(this.projectToDelete).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.id !== this.projectToDelete);
          this.showConfirmDialog = false;
          this.projectToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showConfirmDialog = false;
          this.projectToDelete = null;
        }
      });
    }
  }

  onDeleteCancelled(): void {
    this.showConfirmDialog = false;
    this.projectToDelete = null;
  }
}