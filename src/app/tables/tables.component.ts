import { Component, EventEmitter, inject, OnInit, Output } from "@angular/core";

import { HelixITSMService } from "../helix-itsm.service";
import { environment } from "../../environments/environment";
import { CdkDragEnd } from "@angular/cdk/drag-drop";
import { RecordBox } from "./RecordBox";

declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: "app-tables",
  templateUrl: "./tables.component.html",
  styleUrls: ["./tables.component.css"],
})
export class TablesComponent implements OnInit {
  public tableData1: TableData;
  private helixITSMAPI = inject(HelixITSMService);

  incidentId = environment.defaultIncident || "";

  objectData: Record<string, any> = {};
  error: string | null = null;
  loading = false;

  showedFields = [
    "Incident Number",
    "Submitter",
    "Description",
    "Submit Date",
    "Status",
    "Priority",
  ];

  constructor() {}

  ngOnInit() {

    // let params = {
    //   fields: this.showedFields.join(","),
    // };
    // this.helixITSMAPI.getIncidents(params).subscribe({
    //   next: (res) => {
    //     console.log('incidents from HelixITSM API:', res);
    //   },
    //   error: (err) => (this.error = err?.message ?? "Request failed"),
    //   complete: () => {
    //     this.loading = false;
    //   },
    // });

    this.tableData1 = {
      headerRow: ["ID", "Name", "Country", "City", "Salary"],
      dataRows: [
      ],
    };

    this.load();
  }

  load() {
    this.loading = true;

    let params = {
      fields: this.showedFields.join(","),
    };
    this.helixITSMAPI.getIncidents(params).subscribe({
      next: (res) => {
        let dataRows = [];

        if (!Array.isArray(res) || res.length === 0) {
          this.error = "No incidents found";
        } else {
          // console.log(res);
          for (let i = 0; i < res.length; i++) {
            let row = [];
            for (let j = 0; j < this.showedFields.length; j++) {
              const field = this.showedFields[j];
              row.push(res[i][field] || "N/A");
            }
            dataRows.push(row);
          }
          this.tableData1 = {
            headerRow: this.showedFields,
            dataRows: dataRows,
          };
        }
      },
      error: (err) => (this.error = err?.message ?? "Request failed"),
      complete: () => {
        this.loading = false;
      },
    });
  }

  onRowClick(cell: string) {
    // console.log("Row clicked:", cell);
    // You can add more logic here, such as navigating to a detail page
    // or displaying more information about the clicked row.
    this.incidentId = cell;

    // TODO: Check if incident already being edited
    this.addRecordBox(cell);
  }

  recordBoxes: RecordBox[] = [];
  recordBoxesBackup: RecordBox[] = [];

  addRecordBox(recordID: string) {
    // Find further z access
    let maxZ = 0;
    for (let box of this.recordBoxes) {
      if (box.z && box.z > maxZ) maxZ = box.z;
    }

    const newBox: RecordBox = {
      id: recordID,
      x: 100 + this.recordBoxes.length * 20,
      y: 0 + this.recordBoxes.length * 20,
      z: maxZ + 1,
      width: 900,
      height: 700,
      isNarrow: false,
      visible: true,
    };
    this.recordBoxes.push(newBox);
  }

  closeBox(box: RecordBox) {
    const index = this.recordBoxes.findIndex((b) => b.id === box.id);

    if (index !== -1) {
      this.recordBoxes.splice(index, 1);
    }
  }

  closeAll() {
    this.recordBoxes = [];
  }

  // Keep track of the top z-index for bring-to-front
  private zCounter = 10;

  // Option: snap to grid (set to 0 to disable)
  readonly GRID = 16; // e.g. 16 to enable snap-to-16px grid

  // Fired when the user finishes dragging a box
  onDragEnd(event: CdkDragEnd, item: RecordBox) {
    const { x, y } = event.source.getFreeDragPosition();
    item.x = this.snap(x);
    item.y = this.snap(y);

    // console.log(`Box: ${item.id} moved to`, item.x, item.y);
  }

  // Optional: bring a box to the front on mousedown
  bringToFront(item: RecordBox) {
    item.z = ++this.zCounter;
  }

  private snap(n: number): number {
    return this.GRID > 0 ? Math.round(n / this.GRID) * this.GRID : n;
  }

  rearrangeRecords() {
    let x = 0,
      y = 0;
    const margin = 20;
    const minBoxWidth = 500;
    const boxHeight = 700;
    const screenWidth = window.innerWidth;
    const numberOfBoxesPerRow = Math.floor(
      (screenWidth - margin) / (minBoxWidth + margin)
    );
    const boxWidth = Math.min(minBoxWidth, screenWidth - margin * 2);

    // Remember old settings
    this.recordBoxesBackup = JSON.parse(JSON.stringify(this.recordBoxes));

    // Set it all to narrow
    let rows = 0,
      col = 0;
    console.log("Number of boxes per row:", numberOfBoxesPerRow);
    for (let box of this.recordBoxes) {
      box.isNarrow = true;
      box.width = boxWidth;
      box.height = boxHeight;
      if (col >= numberOfBoxesPerRow) {
        col = 0;
        rows++;
      }
      box.x = col++ * (box.width + margin) + margin;
      box.y = rows * (box.height + margin) + margin;
    }
  }
  restoreRecords() {
    // Restore from backup
    if (this.recordBoxesBackup.length > 0) {
      this.recordBoxes = JSON.parse(JSON.stringify(this.recordBoxesBackup));
      this.recordBoxesBackup = [];
    }
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

// Essential fields are:
