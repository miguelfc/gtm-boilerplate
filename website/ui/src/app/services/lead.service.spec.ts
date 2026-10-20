/**
 * @fileoverview Unit tests for LeadService.
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

import { TestBed } from '@angular/core/testing';
import { LeadService } from './lead.service';
import { EcommerceEventsService } from './ecommerce-events.service';
import { Lead } from '../models/lead';

describe('LeadService', () => {
  let service: LeadService;
  let ecommerceEventsServiceSpy: jasmine.SpyObj<EcommerceEventsService>;

  const mockLead: Lead = {
    lead_id: 'test-lead-1234',
    email: 'jane.lead@example.com',
    phone_number: '+16505550199',
    address: {
      first_name: 'Jane',
      last_name: 'Lead',
      street: '1600 Amphitheatre Pkwy',
      city: 'Mountain View',
      region: 'CA',
      postal_code: '94043',
      country: 'US',
    },
    company: 'Acme Corp',
    inquiry_type: 'Product Demo',
    estimated_value: 250,
    currency: 'USD',
    created_at: '2026-10-20T12:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    const spy = jasmine.createSpyObj('EcommerceEventsService', [
      'sendGenerateLeadEvent',
    ]);

    TestBed.configureTestingModule({
      providers: [
        LeadService,
        { provide: EcommerceEventsService, useValue: spy },
      ],
    });

    service = TestBed.inject(LeadService);
    ecommerceEventsServiceSpy = TestBed.inject(
      EcommerceEventsService
    ) as jasmine.SpyObj<EcommerceEventsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit lead, store it in state, and trigger ecommerce lead event', () => {
    service.submitLead(mockLead);

    expect(service.latestSubmittedLead).toEqual(mockLead);
    expect(ecommerceEventsServiceSpy.sendGenerateLeadEvent).toHaveBeenCalledWith(
      mockLead
    );

    const storedLeads = service.getStoredLeads();
    expect(storedLeads.length).toBe(1);
    expect(storedLeads[0].lead_id).toBe('test-lead-1234');
  });

  it('should generate Google Ads ECL compliant CSV content', () => {
    service.submitLead(mockLead);
    const csv = service.exportLeadsCsv();

    expect(csv).toContain(
      'Email,Phone Number,First Name,Last Name,Country Code,Postal Code,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID'
    );
    expect(csv).toContain('jane.lead@example.com');
    expect(csv).toContain('+16505550199');
    expect(csv).toContain('Jane');
    expect(csv).toContain('Lead');
    expect(csv).toContain('US');
    expect(csv).toContain('94043');
    expect(csv).toContain('Qualified Lead');
    expect(csv).toContain('250');
    expect(csv).toContain('USD');
    expect(csv).toContain('test-lead-1234');
  });

  it('should clear stored leads from storage', () => {
    service.submitLead(mockLead);
    expect(service.getStoredLeads().length).toBe(1);

    service.clearStoredLeads();
    expect(service.getStoredLeads().length).toBe(0);
  });
});
