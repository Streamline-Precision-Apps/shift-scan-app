import type { Location } from "../models/location.js";
export declare function fetchLatestLocation(userId: string): Promise<Location | null>;
export declare function fetchLocationHistory(userId: string): Promise<Location[]>;
export declare function validateLocationPayload(payload: Partial<Location>): string | null;
export declare function saveUserLocation(userId: string, coords: Location["coords"], device?: Location["device"]): Promise<boolean>;
//# sourceMappingURL=locationService.d.ts.map