/**
 * @fileoverview Models for lead capture and Enhanced Conversions for Leads (ECL).
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

export interface LeadAddress {
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
}

export interface Lead {
  lead_id: string;
  email: string;
  phone_number: string;
  address: LeadAddress;
  company?: string;
  inquiry_type: string;
  estimated_value: number;
  currency: string;
  created_at: string;
}

export interface LeadUserDataPayload {
  email: string;
  phone_number: string;
  address: {
    first_name: string;
    last_name: string;
    street: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
  };
}

export interface GenerateLeadEvent {
  event: 'generate_lead';
  lead_id: string;
  value: number;
  currency: string;
  user_data: LeadUserDataPayload;
}
