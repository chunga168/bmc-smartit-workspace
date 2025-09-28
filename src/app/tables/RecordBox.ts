export type RecordBox = {
  id: string;
  x: number; // current left
  y: number; // current top
  z?: number; // for bring-to-front
  width?: number; // optional, for resizing
  height?: number; // optional, for resizing
  visible?: boolean; // optional, for visibility
  isNarrow?: boolean; // optional, for narrow layout
};
