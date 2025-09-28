
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private http = inject(HttpClient);

  getIncident(incidentId: string) {
    return this.http.get<Record<string, unknown>>(
      `${environment.apiBaseUrl}/incident/${encodeURIComponent(incidentId)}`
    );
  }

  getIncidents(options = {}) {
    // console.log('Fetching incidents with options:', options);
    return this.http.get<Record<string, unknown>[]>(
      `${environment.apiBaseUrl}/incident`, { params: options as any }
    );
  }
}

