import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactMessageService } from '../../services/contact-message.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-create',
  templateUrl: './contact-create.component.html',
    styleUrls: ['./contact-create.component.css'], // ← Assurez-vous que c'est présent

  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,    CommonModule, // ← TRÈS IMPORTANT pour *ngIf, *ngFor, etc.

]
})
export class ContactCreateComponent implements OnInit {
   contactForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder, 
    private contactService: ContactMessageService
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  submitMessage(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      this.contactService.create(this.contactForm.value).subscribe({
        next: () => {
          this.successMessage = 'Message sent successfully! I\'ll get back to you soon.';
          this.contactForm.reset();
          this.isSubmitting = false;
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (err) => {
          console.error('Error sending message:', err);
          alert('Failed to send message. Please try again.');
          this.isSubmitting = false;
        }
      });
    }
  }
}
