// create-project.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl, FormsModule } from '@angular/forms';
import { Project, ProjectImage } from '../../models/project.model';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule] // Ajoutez FormsModule ici
})
export class CreateProjectComponent implements OnInit {
  @Input() initialData?: Project;
  @Output() submitProject = new EventEmitter<Project>();
  @Output() cancel = new EventEmitter<void>();

  projectForm!: FormGroup;
  newImageUrl: string = '';
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.initialData?.id;
    this.initForm();
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      title: [this.initialData?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.initialData?.description || '', [Validators.required, Validators.minLength(10)]],
      technologies: [this.initialData?.technologies || '', Validators.required],
      images: this.fb.array(this.initialData?.images?.map(img => this.createImageFormGroup(img)) || [])
    });
  }

  get imagesFormArray(): FormArray {
    return this.projectForm.get('images') as FormArray;
  }

  private createImageFormGroup(image?: ProjectImage): FormGroup {
    return this.fb.group({
      id: [image?.id || Date.now()],
      imageUrl: [image?.imageUrl || '', Validators.required]
    });
  }

  addImage(): void {
    if (this.newImageUrl.trim()) {
      const newImage: ProjectImage = {
        id: Date.now(),
        imageUrl: this.newImageUrl.trim()
      };
      
      this.imagesFormArray.push(this.createImageFormGroup(newImage));
      this.newImageUrl = '';
    }
  }

  removeImage(index: number): void {
    this.imagesFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      
      const project: Project = {
        ...formValue,
        id: this.initialData?.id
      };

      this.submitProject.emit(project);
    } else {
      this.markFormGroupTouched(this.projectForm);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}