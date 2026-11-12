import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { JobForm } from './job-form';

describe('JobForm', () => {
  let fixture: ComponentFixture<JobForm>;
  let component: JobForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [JobForm] }).compileComponents();
    fixture = TestBed.createComponent(JobForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not emit when the form is invalid', () => {
    const spy = vi.fn();
    component.submitted.subscribe(spy);
    component.submit();
    expect(spy).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('emits a parsed job when the form is valid', () => {
    const spy = vi.fn();
    component.submitted.subscribe(spy);

    component.form.setValue({
      title: 'Frontend Developer',
      description: 'Build Angular interfaces for our platform.',
      skills: 'Angular, TypeScript, ',
    });
    component.submit();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Frontend Developer',
        skills: ['Angular', 'TypeScript'],
      }),
    );
  });

  it('fills the form and switches to edit mode when a job is provided', () => {
    fixture.componentRef.setInput('job', {
      id: 1,
      employerProfileId: 3,
      title: 'Backend Intern',
      description: 'Help build REST APIs daily.',
      companyName: 'SkillBridge',
      createdAt: '2026-10-01T00:00:00Z',
      requiredSkills: [
        { id: 4, name: 'Node.js' },
        { id: 5, name: 'SQL' },
      ],
    });
    fixture.detectChanges();

    expect(component.editing).toBe(true);
    expect(component.form.value.skills).toBe('Node.js, SQL');
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Save changes');
  });
});