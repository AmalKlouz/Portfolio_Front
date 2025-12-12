import { Component, OnInit } from '@angular/core';
import { CvFileService } from '../../services/cv-file.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-cv-list',
  templateUrl: './cv-list.component.html',
    styleUrls: ['./cv-list.component.css'], // ← Assurez-vous que c'est présent

    standalone: true,
    imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatIcon
]
})
export class CvListComponent implements OnInit {
  cvs: any[] = [];
  selectedPdf?: SafeResourceUrl;

  constructor(
    private cvFileService: CvFileService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cvFileService.getAll().subscribe(data => {
      this.cvs = data;
    });
  }

  viewPdf(filename: string) {
    const url = `http://localhost:9000/api/cvfiles/download/${encodeURIComponent(filename)}`;
    this.selectedPdf = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

closeViewer(): void {
  this.selectedPdf = undefined;
}
}
