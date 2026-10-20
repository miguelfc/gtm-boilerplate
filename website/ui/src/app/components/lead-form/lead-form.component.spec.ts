/**
 * @fileoverview Unit tests for LeadFormComponent.
 *
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeadFormComponent } from './lead-form.component';
import { LeadService } from '../../services/lead.service';

describe('LeadFormComponent', () => {
  let component: LeadFormComponent;
  let fixture: ComponentFixture<LeadFormComponent>;
  let leadServiceSpy: jasmine.SpyObj<LeadService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    leadServiceSpy = jasmine.createSpyObj('LeadService', ['submitLead']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LeadFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: LeadService, useValue: leadServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize an invalid form', () => {
    expect(component).toBeTruthy();
    expect(component.leadForm.valid).toBeFalse();
  });

  it('should patch persona values when loadPersona is called', () => {
    component.loadPersona('us');
    expect(component.leadForm.get('email')?.value).toBe('jane.doe@example.com');
    expect(component.leadForm.get('firstName')?.value).toBe('Jane');
    expect(component.leadForm.get('country')?.value).toBe('US');
    expect(component.leadForm.valid).toBeTrue();
  });

  it('should submit lead and navigate to lead-confirmation when valid', () => {
    component.loadPersona('us');
    component.onSubmit();

    expect(leadServiceSpy.submitLead).toHaveBeenCalled();
    const passedLead = leadServiceSpy.submitLead.calls.mostRecent().args[0];
    expect(passedLead.email).toBe('jane.doe@example.com');
    expect(passedLead.address.first_name).toBe('Jane');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/lead-confirmation']);
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(leadServiceSpy.submitLead).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
