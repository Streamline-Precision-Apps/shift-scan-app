export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    permission: string;
    companyId: string;
    clockedIn: boolean;
}
export interface AuthSession {
    user: AuthUser;
    expiresAt: Date;
}
//# sourceMappingURL=auth.d.ts.map