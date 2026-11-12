import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Job, JobInput } from '../../models/company.model';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './job-form.html',
  styleUrl: './job-form.css',
})
export class JobForm {
  private fb = inject(FormBuilder);

  editing = false;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    skills: ['', Validators.required],
  });

  @Input() set job(job: Job | null | undefined) {
    if (!job) return;
    this.editing = true;
    this.form.patchValue({
      title: job.title,
      description: job.description,
      skills: job.requiredSkills.map(skill => skill.name).join(', '),
    });
  }

  @Output() submitted = new EventEmitter<JobInput>();

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitted.emit({
      title: v.title.trim(),
      description: v.description.trim(),
      skills: v.skills.split(',').map(s => s.trim()).filter(Boolean),
    });
  }
}