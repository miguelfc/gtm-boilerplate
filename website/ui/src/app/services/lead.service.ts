/**
 * @fileoverview A service to manage lead capture, local CRM storage,
 * and offline conversion export for Enhanced Conversions for Leads (ECL).
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

import { Injectable } from '@angular/core';
import { Lead } from '../models/lead';
import { EcommerceEventsService } from './ecommerce-events.service';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private readonly STORAGE_KEY = 'gtm_boilerplate_leads';
  latestSubmittedLead: Lead | null = null;

  constructor(private ecommerceEventsService: EcommerceEventsService) {}

  /**
   * Submit a lead: saves to local CRM state and fires generate_lead event to GTM dataLayer.
   * @param lead The lead object.
   */
  submitLead(lead: Lead): void {
    this.latestSubmittedLead = lead;
    const leads = this.getStoredLeads();
    leads.unshift(lead);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save lead to localStorage', e);
    }
    this.ecommerceEventsService.sendGenerateLeadEvent(lead);
  }

  /**
   * Retrieve all captured leads from localStorage.
   */
  getStoredLeads(): Lead[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as Lead[];
      }
    } catch (e) {
      console.error('Failed to read leads from localStorage', e);
    }
    return [];
  }

  /**
   * Clear all leads from localStorage.
   */
  clearStoredLeads(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear leads from localStorage', e);
    }
  }

  /**
   * Generates a Google Ads Enhanced Conversions for Leads formatted CSV string.
   * Headers and format strictly adhere to Google Ads documentation:
   * Email,Phone Number,First Name,Last Name,Country Code,Postal Code,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID
   */
  exportLeadsCsv(conversionName = 'Qualified Lead'): string {
    const headers = [
      'Email',
      'Phone Number',
      'First Name',
      'Last Name',
      'Country Code',
      'Postal Code',
      'Conversion Name',
      'Conversion Time',
      'Conversion Value',
      'Conversion Currency',
      'Order ID',
    ];

    const leads = this.getStoredLeads();
    const rows = leads.map((lead) => {
      // Format conversion time to "yyyy-mm-dd hh:mm:ss+00:00"
      const date = new Date(lead.created_at || Date.now());
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+00:00`;

      return [
        this.escapeCsv(lead.email.trim().toLowerCase()),
        this.escapeCsv(lead.phone_number.trim()),
        this.escapeCsv(lead.address.first_name.trim()),
        this.escapeCsv(lead.address.last_name.trim()),
        this.escapeCsv(lead.address.country.trim().toUpperCase()),
        this.escapeCsv(lead.address.postal_code.trim()),
        this.escapeCsv(conversionName),
        this.escapeCsv(timeStr),
        lead.estimated_value.toString(),
        this.escapeCsv(lead.currency || 'USD'),
        this.escapeCsv(lead.lead_id),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Trigger browser file download of the Google Ads ECL CSV file.
   */
  downloadLeadsCsv(conversionName = 'Qualified Lead'): void {
    const csvContent = this.exportLeadsCsv(conversionName);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `google_ads_ecl_upload_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private escapeCsv(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
