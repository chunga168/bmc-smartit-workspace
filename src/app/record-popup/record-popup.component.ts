import { CdkDragEnd } from "@angular/cdk/drag-drop";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { HelixITSMService } from "app/helix-itsm.service";
import { RecordBox } from "app/tables/RecordBox";

@Component({
  selector: "app-record-popup",
  templateUrl: "./record-popup.component.html",
  styleUrls: ["./record-popup.component.scss"],
})
export class RecordPopupComponent implements OnInit {
  @Output() close = new EventEmitter<RecordBox>();
  @Output() onDragEnd = new EventEmitter<CdkDragEnd>();
  @Output() bringToFront = new EventEmitter<RecordBox>();
  @Input() recordBox: RecordBox; // Declare an input property

  data = {}; // To hold record data

  private api = inject(HelixITSMService);
  fields: string[] = [];
  nonNullFields: string[] = [];

  fieldLayout: FieldLayout[] = getIncidentFieldLayout();
  renderFields: FieldLayout[][] = organizeFieldLayout(this.fieldLayout);

  constructor() {}

  closePopup() {
    this.close.emit(this.recordBox);
  }

  ngOnInit(): void {
    // Load record details using this.recordBox.id
    // TODO: Determine what type of record it is (e.g., incident, change) if needed
    this.api.getIncident(this.recordBox.id).subscribe({
      next: (res) => {
        console.log("Incident details:", res);
        this.data = res;
        // ({ fields: this.fields, nonNullFields: this.nonNullFields } =
        //   extractNonNullFields(res));          
      },
      error: (err) => {
        console.error("Error fetching incident details:", err);
      },
    });


  }

  dragEnded(ev: CdkDragEnd) {
    this.onDragEnd.emit(ev);
  }
  onMouseDown() {
    this.bringToFront.emit(this.recordBox);
  }
  onTouchStart() {
    this.bringToFront.emit(this.recordBox);
  }
}

// A function to pull out all fields and non null fields from incident record
function extractNonNullFields(incident: any): {
  fields: string[];
  nonNullFields: string[];
} {
  let fields = [],
    nonNullFields = [];
  for (const key in incident) {
    if (incident[key] !== null && incident[key] !== undefined) {
      nonNullFields.push(key);
    }
    fields.push(key);
  }
  return { fields, nonNullFields };
}

// Get an array of Field Layout and determine how many rows are needed
function organizeFieldLayout(fields: FieldLayout[])  {
  let rows: FieldLayout[][] = [];
  let currentRow: FieldLayout[] = [];
  let currentWidth = 0;

  // Sort fields by order
  fields.sort((a, b) => a.order - b.order);

  for (const field of fields) {
    if (currentWidth + field.size > 12) {
      // Start a new row
      rows.push(currentRow);
      currentRow = [field];
      currentWidth = field.size;
    } else {
      currentRow.push(field);
      currentWidth += field.size;
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  return rows;
}

function getIncidentFieldLayout() {
  return [
    {
      fieldName: "Incident Number",
      displayName: "Incident Number",
      order: 1,
      size: 6,
      inputType: "text",
      readOnly: true,
    },
    {
      fieldName: "Priority",
      displayName: "Prioity",
      order: 2,
      size: 3,
      inputType: "select",
      readOnly: true,
    },
    {
      fieldName: "Status",
      displayName: "Status",
      order: 3,
      size: 3,
      inputType: "select",
      readOnly: true,
    },
    {
      fieldName: "Submit Date",
      displayName: "Created",
      order: 4,
      size: 4,
      inputType: "date",
      readOnly: true,
    },
    {
      fieldName: "Last Modified Date",
      displayName: "Updated",
      order: 5,
      size: 4,
      inputType: "date",
      readOnly: true,
    },
    {
      fieldName: "Last Resolved Date",
      displayName: "Resolved",
      order: 6,
      size: 4,
      inputType: "date",
      readOnly: true,
    },
    {
      fieldName: "Description",
      displayName: "Summary",
      order: 7,
      size: 12,
      inputType: "text",      
    },    
{
      fieldName: "Detailed Decription",
      displayName: "Details",
      order: 8,
      size: 12,
      inputType: "textarea",   
      options: { rows: 5 },   
    },        
  ];
}
// Essential Field Layout information

type FieldLayout = {
  fieldName: string;
  displayName: string;
  order: number; // for ordering
  size: number; // for width percentage (from 1 to 12)
  inputType: string; // e.g., text, number, date, select
  options?: any; // for any type to hold additional params
  required?: boolean;
  readOnly?: boolean;
};
