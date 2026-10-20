/**
 * @fileoverview Lead confirmation and Mini-CRM component.
 * Displays submitted lead details, dataLayer payload, and offers
 * 1-click Google Ads ECL CSV export.
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
import { Router } from '@angular/router';
import { Lead } from '../../models/lead';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-confirmation',
  templateUrl: './lead-confirmation.component.html',
  styleUrl: './lead-confirmation.component.css',
})
export class LeadConfirmationComponent implements OnInit {
  currentLead: Lead | null = null;
  storedLeads: Lead[] = [];
  dataLayerSnippet = '';

  constructor(public leadService: LeadService, private router: Router) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.storedLeads = this.leadService.getStoredLeads();
    this.currentLead =
      this.leadService.latestSubmittedLead ||
      (this.storedLeads.length > 0 ? this.storedLeads[0] : null);

    if (this.currentLead) {
      this.dataLayerSnippet = JSON.stringify(
        {
          event: 'generate_lead',
          lead_id: this.currentLead.lead_id,
          value: this.currentLead.estimated_value,
          currency: this.currentLead.currency || 'USD',
          user_data: {
            email: this.currentLead.email,
            phone_number: this.currentLead.phone_number,
            address: {
              first_name: this.currentLead.address.first_name,
              last_name: this.currentLead.address.last_name,
              street: this.currentLead.address.street,
              city: this.currentLead.address.city,
              region: this.currentLead.address.region,
              postal_code: this.currentLead.address.postal_code,
              country: this.currentLead.address.country,
            },
          },
        },
        null,
        2
      );
    }
  }

  downloadCsv(): void {
    this.leadService.downloadLeadsCsv('Qualified Lead');
  }

  clearLeads(): void {
    this.leadService.clearStoredLeads();
    this.currentLead = null;
    this.storedLeads = [];
    this.dataLayerSnippet = '';
  }

  submitNewLead(): void {
    this.router.navigate(['/contact']);
  }
}
