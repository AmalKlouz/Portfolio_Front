import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Models
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  isEditMode = false;
  currentProfile?: Profile;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      title: ['', [Validators.required, Validators.minLength(2)]],
      bio: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getAll().subscribe({
      next: (profiles) => {
        if (profiles && profiles.length > 0) {
          this.currentProfile = profiles[0];
          this.isEditMode = true;
          this.populateForm(this.currentProfile);
          
          // Charger la photo actuelle
          if (this.currentProfile.photoUrl) {
            this.previewUrl = this.getPhotoUrl(this.currentProfile.photoUrl);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.showNotification('Erreur lors du chargement du profil', 'error');
      }
    });
  }

  populateForm(profile: Profile): void {
    this.profileForm.patchValue({
      fullName: profile.fullName,
      title: profile.title,
      bio: profile.bio
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Vérifier le type de fichier
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        this.showNotification('Veuillez sélectionner une image (JPG, PNG, GIF)', 'error');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showNotification('L\'image ne doit pas dépasser 5MB', 'error');
        return;
      }
      
      this.selectedFile = file;
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.showNotification('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    if (!this.selectedFile && !this.isEditMode) {
      this.showNotification('Veuillez sélectionner une photo de profil', 'error');
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.currentProfile?.id) {
      this.updateProfile();
    } else {
      this.createProfile();
    }
  }

  createProfile(): void {
    if (!this.selectedFile) {
      this.showNotification('Veuillez sélectionner une photo', 'error');
      this.loading = false;
      return;
    }

    const profileData: Profile = this.profileForm.value;

    this.profileService.create(profileData, this.selectedFile).subscribe({
      next: (response) => {
        this.showNotification('Profil créé avec succès', 'success');
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating profile:', error);
        this.showNotification('Erreur lors de la création du profil', 'error');
        this.loading = false;
      }
    });
  }

updateProfile(): void {
  if (!this.currentProfile?.id) return;

  const profileData: Profile = {
    ...this.profileForm.value,
    photoUrl: this.currentProfile.photoUrl // Conserver l'ancienne photo par défaut
  };

  // Si une nouvelle photo est sélectionnée
  if (this.selectedFile) {
    this.profileService.updateWithPhoto(this.currentProfile.id, profileData, this.selectedFile).subscribe({
      next: (response) => {
        this.onUpdateSuccess('Profil et photo mis à jour avec succès');
      },
      error: (error) => {
        this.onUpdateError(error, 'Erreur lors de la mise à jour du profil');
      }
    });
  } else {
    // Mise à jour sans changer la photo
    this.profileService.update(this.currentProfile.id, profileData).subscribe({
      next: (response) => {
        this.onUpdateSuccess('Profil mis à jour avec succès');
      },
      error: (error) => {
        this.onUpdateError(error, 'Erreur lors de la mise à jour du profil');
      }
    });
  }
}

private onUpdateSuccess(message: string): void {
  this.showNotification(message, 'success');
  this.loading = false;
  this.selectedFile = null;
  
  // Redirection vers dashboard après 1.5 secondes
  setTimeout(() => {
    this.router.navigate(['/dashboard']);
  }, 1500);
}

private onUpdateError(error: any, message: string): void {
  console.error('Error updating profile:', error);
  this.showNotification(message, 'error');
  this.loading = false;
}

  getPhotoUrl(photoUrl: string): string {
    if (!photoUrl) return '';
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    
    return this.profileService.getPhotoUrl(photoUrl);
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: [type === 'success' ? 'success-snackbar' : 'error-snackbar']
    });
  }

  // Getters pour les erreurs de formulaire
  get fullNameError(): string {
    const control = this.profileForm.get('fullName');
    if (control?.hasError('required')) return 'Le nom complet est requis';
    if (control?.hasError('minlength')) return 'Le nom doit contenir au moins 2 caractères';
    return '';
  }

  get titleError(): string {
    const control = this.profileForm.get('title');
    if (control?.hasError('required')) return 'Le titre est requis';
    if (control?.hasError('minlength')) return 'Le titre doit contenir au moins 2 caractères';
    return '';
  }

  get bioError(): string {
    const control = this.profileForm.get('bio');
    if (control?.hasError('required')) return 'La biographie est requise';
    if (control?.hasError('minlength')) return 'La biographie doit contenir au moins 10 caractères';
    return '';
  }
}