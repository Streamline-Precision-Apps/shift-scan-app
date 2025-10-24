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
//# sourceMappingURL=location.d.ts.map