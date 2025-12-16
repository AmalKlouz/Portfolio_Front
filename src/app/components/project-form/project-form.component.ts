import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ]
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  loading = false;
  error: string | null = null;
  formError: string | null = null;
  isSubmitting = false;
  mode: 'create' | 'edit' = 'create';
  projectId?: number;

  // Propriétés pour la gestion des images
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: { imageUrl: string, id?: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialisation du formulaire principal
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      technologies: ['', [Validators.required]],
      images: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mode = 'edit';
      this.projectId = +id;
      this.loadProject(this.projectId);
    } else {
      this.mode = 'create';
    }
  }

  // Getter pour le FormArray des images (pour compatibilité avec le template existant)
  get imagesFormArray(): FormArray {
    return this.projectForm.get('images') as FormArray;
  }

  // Charger un projet existant
  // In project-form.component.ts, update the loadProject method:

loadProject(id: number): void {
  this.loading = true;
  this.error = null;

  this.projectService.getById(id).subscribe({
    next: (project) => {
      // Gestion des technologies
      let technologiesString = '';
      if (project.technologies) {
        if (Array.isArray(project.technologies)) {
          technologiesString = project.technologies.join(', ');
        } else {
          try {
            const parsed = JSON.parse(project.technologies);
            if (Array.isArray(parsed)) {
              technologiesString = parsed.join(', ');
            } else {
              technologiesString = project.technologies;
            }
          } catch (e) {
            technologiesString = project.technologies;
          }
        }
      }

      // Charger les images existantes
      this.existingImages = [];
      if (project.images && Array.isArray(project.images)) {
        project.images.forEach((image: any) => {
          let imageUrl = '';
          let imageId = undefined;
          
          if (typeof image === 'string') {
            // Si c'est juste un nom de fichier
            imageUrl = `http://localhost:9000/api/projects/images/${image}`;
          } else if (image && image.imageUrl) {
            // Si c'est un objet avec imageUrl
            imageId = image.id;
            // Vérifier si l'URL est complète ou juste un nom de fichier
            if (image.imageUrl.startsWith('http')) {
              imageUrl = image.imageUrl;
            } else {
              imageUrl = `http://localhost:9000/api/projects/images/${image.imageUrl}`;
            }
          }
          
          if (imageUrl) {
            this.existingImages.push({ 
              imageUrl: imageUrl,
              id: imageId
            });
          }
        });
      }

      // Mettre à jour les valeurs du formulaire
      this.projectForm.patchValue({
        title: project.title,
        description: project.description,
        technologies: technologiesString
      });

      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading project:', error);
      this.error = 'Erreur lors du chargement du projet';
      this.loading = false;
    }
  });
}
  // Gestion de la sélection d'images
  onImageSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validation du type de fichier
        if (!file.type.match('image.*')) {
          this.snackBar.open(`Le fichier ${file.name} n'est pas une image`, 'Fermer', {
            duration: 3000
          });
          continue;
        }

        // Validation de la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.snackBar.open(`L'image ${file.name} dépasse la taille maximale de 5MB`, 'Fermer', {
            duration: 3000
          });
          continue;
        }

        // Vérifier si le fichier n'est pas déjà sélectionné
        const isDuplicate = this.selectedFiles.some(
          selectedFile => selectedFile.name === file.name && selectedFile.size === file.size
        );
        
        if (isDuplicate) {
          this.snackBar.open(`L'image ${file.name} est déjà sélectionnée`, 'Fermer', {
            duration: 3000
          });
          continue;
        }

        this.selectedFiles.push(file);
        
        // Créer un aperçu
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
      
      // Réinitialiser l'input pour permettre la sélection des mêmes fichiers
      event.target.value = '';
    }
  }

  // Supprimer une image sélectionnée
  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // Supprimer une image existante
  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  // Formater la taille du fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Gestion des erreurs d'image
 onExistingImageError(event: any): void {
  // Simple gray placeholder as base64
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
  event.target.onerror = null; // Prevent infinite loop
}

onImageError(event: any): void {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
  event.target.onerror = null; // Prevent infinite loop
}
  // Soumettre le formulaire
  onSubmit(): void {
    // Réinitialiser les erreurs
    this.formError = null;
    
    // Validation des images
    const hasImages = this.selectedFiles.length > 0 || 
                     (this.mode === 'edit' && this.existingImages.length > 0);
    
    if (!hasImages) {
      this.formError = 'Veuillez ajouter au moins une image pour le projet';
      return;
    }

    if (this.projectForm.valid) {
      this.isSubmitting = true;

      // Préparer les données
      const formData = this.projectForm.value;
      
      // Convertir les technologies en tableau
      const technologiesArray = formData.technologies
        .split(',')
        .map((tech: string) => tech.trim())
        .filter((tech: string) => tech.length > 0);

      // Préparer les images pour l'envoi
      // Pour la création : seulement les nouvelles images
      // Pour l'édition : images existantes + nouvelles images
      const imagesToSend = this.mode === 'edit' ? this.existingImages : [];

      const projectData: Project = {
        id: this.mode === 'edit' ? this.projectId : undefined,
        title: formData.title,
        description: formData.description,
       technologies: technologiesArray.join(', '),
        images: imagesToSend
      };

      // Appeler le service avec les fichiers
      const request = this.mode === 'edit' && this.projectId
        ? this.projectService.update(this.projectId, projectData, this.selectedFiles)
        : this.projectService.create(projectData, this.selectedFiles);

      request.subscribe({
        next: (response) => {
          this.snackBar.open(
            `Projet ${this.mode === 'edit' ? 'mis à jour' : 'créé'} avec succès`,
            'Fermer',
            { duration: 3000 }
          );
          this.router.navigate(['/projects']);
        },
        error: (error) => {
          console.error('Error saving project:', error);
          this.formError = 'Erreur lors de la sauvegarde du projet. Veuillez réessayer.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Marquer tous les champs comme touchés
      this.markAllAsTouched();
      this.formError = 'Veuillez corriger les erreurs dans le formulaire';
    }
  }

  // Marquer tous les champs comme touchés
  markAllAsTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormArray) {
        control.controls.forEach(group => {
          if (group instanceof FormGroup) {
            Object.keys(group.controls).forEach(subKey => {
              group.get(subKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  // Annuler
  cancel(): void {
    this.router.navigate(['/projects']);
  }
}