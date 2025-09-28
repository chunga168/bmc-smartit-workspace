import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../environments/environment";
import { firstValueFrom, from, Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class HelixITSMService {
  private http = inject(HttpClient);

  // getIncident(incidentId: string) {
  //   return this.http.get<Record<string, unknown>>(
  //     `${environment.apiBaseUrl}/incident/${encodeURIComponent(incidentId)}`
  //   );
  // }

  // getIncidents(options = {}) {
  //   console.log('Fetching incidents with options:', options);
  //   return this.http.get<Record<string, unknown>[]>(
  //     `${environment.apiBaseUrl}/incident`, { params: options as any }
  //   );
  // }

  login(): Observable<string> {
    let body = new URLSearchParams();
    body.set("username", environment.helixUsername);
    body.set("password", environment.helixPassowrd);
    let headers = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    let url = `/helixitsmapi/api/jwt/login`;
    return new Observable<string>((observer) => {
      this.http.post(url, body.toString(), { headers, responseType: 'text' as 'json' })
        .subscribe({
          next: (res: string) => {            
            // Store the token if needed for future requests
            localStorage.setItem("authToken", res);
            observer.next(res);            
          },
          error: (err) => {
            console.error("Login failed:", err);
            // this.error = "Login failed: " + (err?.message ?? "Unknown error");
            observer.error(err);
          },
          complete: () => observer.complete(),
        });
    });
  }

  async getRecords(form:string, options: Record<string, string> = {}): Promise<any[]> {
    let token = localStorage.getItem("authToken");
    if (!token) {
      token = await firstValueFrom(this.login());
    }

    let headers = new HttpHeaders().set("Authorization", `AR-JWT ${localStorage.getItem("authToken") || ''}`);
    let url = `/helixitsmapi/api/arsys/v1/entry/${form}`;

    // Convert options to HttpParams
    let queryParams = new HttpParams();
    for (let key in options) {
      queryParams = queryParams.set(key, options[key]);
    }
    
    return new Promise<any>((resolve, reject) => {
      this.http.get<any>(url, { headers, params: queryParams }).subscribe({
        next: (res) => {
          resolve(res.entries);
        },
        error: (err) => {
          reject(err);
        },
      });      
    });
  }

  getIncident(incidentId: string) {
    return new Observable<any>((observer) => {
      let options = { "q": `'Incident Number'="${incidentId}"` };
      this.getRecords('HPD:Help Desk', options).then(res => {        
        if (res && res.length > 0) {
          observer.next(res[0].values);
        } else {  
          observer.error(new Error("Incident not found"));
        }
        observer.complete();
      });
    });
  }

  getIncidents(options: Record<string, string> = {}) {
    console.log('Fetching incidents with options:', options);
    options.fields = `values(${options.fields})`;
    options = { ...options, "limit": "20" }; // Limit to 20 records for demo

    return new Observable<any>((observer) => {
      this.http.get<Record<string, unknown>[]>(
        `${environment.apiBaseUrl}/incident`, { params: options as any }
      );
      this.getRecords('HPD:Help Desk', options).then(res => {        
        if (res && res.length > 0) {
          observer.next(res.map((r: any) => r.values));
        } else {  
          observer.error(new Error("Incident not found"));
        }
        observer.complete();
      });
    });
  }  
}
