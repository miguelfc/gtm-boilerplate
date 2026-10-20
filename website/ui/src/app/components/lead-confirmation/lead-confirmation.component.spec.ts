/**
 * @fileoverview Unit tests for LeadConfirmationComponent.
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
import { Router } from '@angular/router';
import { LeadConfirmationComponent } from './lead-confirmation.component';
import { LeadService } from '../../services/lead.service';
import { Lead } from '../../models/lead';

describe('LeadConfirmationComponent', () => {
  let component: LeadConfirmationComponent;
  let fixture: ComponentFixture<LeadConfirmationComponent>;
  let leadServiceSpy: jasmine.SpyObj<LeadService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLead: Lead = {
    lead_id: 'test-conf-1234',
    email: 'conf.lead@example.com',
    phone_number: '+16505550199',
    address: {
      first_name: 'Confirm',
      last_name: 'User',
      street: '123 Main St',
      city: 'Austin',
      region: 'TX',
      postal_code: '78701',
      country: 'US',
    },
    inquiry_type: 'Request a Quote',
    estimated_value: 300,
    currency: 'USD',
    created_at: '2026-10-20T12:00:00.000Z',
  };

  beforeEach(async () => {
    leadServiceSpy = jasmine.createSpyObj('LeadService', [
      'getStoredLeads',
      'downloadLeadsCsv',
      'clearStoredLeads',
    ]);
    leadServiceSpy.getStoredLeads.and.returnValue([mockLead]);
    (leadServiceSpy as any).latestSubmittedLead = mockLead;

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LeadConfirmationComponent],
      providers: [
        { provide: LeadService, useValue: leadServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load lead data on init', () => {
    expect(component).toBeTruthy();
    expect(component.currentLead).toEqual(mockLead);
    expect(component.storedLeads.length).toBe(1);
    expect(component.dataLayerSnippet).toContain('generate_lead');
    expect(component.dataLayerSnippet).toContain('conf.lead@example.com');
  });

  it('should trigger CSV download when downloadCsv is called', () => {
    component.downloadCsv();
    expect(leadServiceSpy.downloadLeadsCsv).toHaveBeenCalledWith('Qualified Lead');
  });

  it('should navigate to /contact when submitNewLead is called', () => {
    component.submitNewLead();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/contact']);
  });

  it('should clear stored leads when clearLeads is called', () => {
    component.clearLeads();
    expect(leadServiceSpy.clearStoredLeads).toHaveBeenCalled();
    expect(component.currentLead).toBeNull();
    expect(component.storedLeads.length).toBe(0);
  });
});
