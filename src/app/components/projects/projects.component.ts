// projects.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { ProjectService } from '../../services/project.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'; 
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatChipsModule
  ]
})
export class ProjectsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  projects: Project[] = [];
  displayedColumns: string[] = ['id', 'title', 'technologies', 'images', 'actions'];
  loading = false;
  searchTerm = '';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.snackBar.open('Erreur lors du chargement des projets', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  createProject(): void {
    this.router.navigate(['/new'], { relativeTo: this.route });
  }

  editProject(projectId: number): void {
    this.router.navigate(['/edit', projectId], { relativeTo: this.route });
  }

  viewProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  deleteProject(projectId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.delete(projectId).subscribe({
          next: () => {
            this.snackBar.open('Projet supprimé avec succès', 'Fermer', {
              duration: 3000
            });
            this.loadProjects();
          },
          error: (error) => {
            console.error('Error deleting project:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  getTechnologiesDisplay(project: Project): string {
    if (!project.technologies) return '';
    
    if (Array.isArray(project.technologies)) {
      return project.technologies.join(', ');
    }
    
    return project.technologies;
  }

  getImagesCount(project: Project): number {
    if (!project.images || !Array.isArray(project.images)) return 0;
    return project.images.length;
  }

  get filteredProjects(): Project[] {
    if (!this.searchTerm.trim()) {
      return this.projects;
    }
    
    const search = this.searchTerm.toLowerCase();
    return this.projects.filter(project => 
      project.title.toLowerCase().includes(search) ||
      project.description.toLowerCase().includes(search) ||
      this.getTechnologiesDisplay(project).toLowerCase().includes(search)
    );
  }

  getTechnologiesArray(project: Project): string[] {
    if (!project.technologies) return [];
    
    if (Array.isArray(project.technologies)) {
      return project.technologies;
    }
    
    try {
      const parsed = JSON.parse(project.technologies);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      return project.technologies.split(',').map(tech => tech.trim());
    }
    
    return [];
  }
}