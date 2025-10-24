// look of the location data model stored in Firestore
export interface Location {
  uid: string;
  ts: Date;
  coords: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number | null;
    heading?: number | null;
  };
  device?: {
    platform?: string | null;
  };
}
