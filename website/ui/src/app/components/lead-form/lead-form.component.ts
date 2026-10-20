/**
 * @fileoverview Lead generation form component for capturing leads and
 * triggering Google Ads Enhanced Conversions for Leads (ECL).
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

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '../../models/lead';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements OnInit {
  leadForm!: FormGroup;

  inquiryOptions = [
    'Request a Quote',
    'Schedule Product Demo',
    'Enterprise Consultation',
    'Partner Program',
  ];

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.leadForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[1-9]\d{6,14}$/)],
      ],
      company: [''],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      region: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['US', [Validators.required, Validators.maxLength(2)]],
      inquiryType: [this.inquiryOptions[0], [Validators.required]],
      estimatedValue: [150, [Validators.required, Validators.min(1)]],
    });
  }

  loadPersona(persona: 'us' | 'uk' | 'latam'): void {
    if (persona === 'us') {
      this.leadForm.patchValue({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '+16505550199',
        company: 'Acme Technologies Inc.',
        street: '1600 Amphitheatre Pkwy',
        city: 'Mountain View',
        region: 'CA',
        postalCode: '94043',
        country: 'US',
        inquiryType: 'Request a Quote',
        estimatedValue: 250,
      });
    } else if (persona === 'uk') {
      this.leadForm.patchValue({
        firstName: 'Oliver',
        lastName: 'Smith',
        email: 'oliver.smith@example.co.uk',
        phoneNumber: '+442079460991',
        company: 'British Retail Ltd',
        street: '1 St Giles High St',
        city: 'London',
        region: 'Greater London',
        postalCode: 'WC2H 8AG',
        country: 'GB',
        inquiryType: 'Schedule Product Demo',
        estimatedValue: 350,
      });
    } else if (persona === 'latam') {
      this.leadForm.patchValue({
        firstName: 'Carlos',
        lastName: 'Silva',
        email: 'carlos.silva@example.com.br',
        phoneNumber: '+5511987654321',
        company: 'Logistica Brasil S.A.',
        street: 'Av. Paulista, 1000',
        city: 'Sao Paulo',
        region: 'SP',
        postalCode: '01310-100',
        country: 'BR',
        inquiryType: 'Enterprise Consultation',
        estimatedValue: 500,
      });
    }
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    const val = this.leadForm.value;
    const lead: Lead = {
      lead_id: uuidv4(),
      email: val.email,
      phone_number: val.phoneNumber,
      address: {
        first_name: val.firstName,
        last_name: val.lastName,
        street: val.street,
        city: val.city,
        region: val.region,
        postal_code: val.postalCode,
        country: val.country,
      },
      company: val.company || undefined,
      inquiry_type: val.inquiryType,
      estimated_value: Number(val.estimatedValue) || 0,
      currency: 'USD',
      created_at: new Date().toISOString(),
    };

    this.leadService.submitLead(lead);
    this.router.navigate(['/lead-confirmation']);
  }
}
