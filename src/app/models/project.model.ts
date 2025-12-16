export interface Project {
  id?: number;
  title: string;
  description: string;
  technologies: string; // ou string[] selon votre API
  images: ProjectImage[];
}

export interface ProjectImage {
  id?: number;
  imageUrl: string;
}
