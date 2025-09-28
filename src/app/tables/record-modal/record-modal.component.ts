import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { IncidentService } from "../../incident.service";

@Component({
  selector: "app-record-modal",
  templateUrl: "./record-modal.component.html",
  styleUrls: ["./record-modal.component.scss"],
})
export class RecordModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() incidentNumber: string; // Declare an input property
  private api = inject(IncidentService);
  fields: string[] = [];
  nonNullFields: string[] = [];

  constructor() {}
  closeModal(): void {
    this.close.emit();
  }

  ngOnInit(): void {
    // Load incident details using this.incidentNumber
    console.log("Loading details for incident:", this.incidentNumber);  
    this.api.getIncident(this.incidentNumber).subscribe({
      next: (res) => {
        console.log("Incident details:", res);
        ({ fields: this.fields, nonNullFields: this.nonNullFields } = extractNonNullFields(res));
        console.log("All fields:", this.fields);
        console.log("Non-null fields:", this.nonNullFields);
      },
      error: (err) => {
        console.error("Error fetching incident details:", err);
      },
    }); 
  }
}


// A function to pull out all fields and non null fields from incident record
function extractNonNullFields(incident: any): { fields: string[]; nonNullFields: string[] } {  
  let fields = [], nonNullFields = [];
  for (const key in incident) {
    if (incident[key] !== null && incident[key] !== undefined) {
      nonNullFields.push(key);
    }
    fields.push(key);
  }
  return { fields, nonNullFields };
}

// Essential fields are: