export interface JwtUserPayload {
  id: string;
  username: string;
  permission: "USER" | "MANAGER" | "ADMIN" | "SUPERADMIN";
  firstName: string;
  lastName: string;
  truckView: boolean;
  tascoView: boolean;
  laborView: boolean;
  mechanicView: boolean;
  accountSetup: boolean;
}
