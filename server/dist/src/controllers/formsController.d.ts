import express from "express";
export declare const getUserSubmissions: (req: any, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
export declare const getEmployeeRequests: (req: any, res: express.Response) => Promise<express.Response<any, Record<string, any>>>;
export declare const getForms: (req: express.Request, res: express.Response) => Promise<void>;
export declare const createFormSubmission: (req: express.Request, res: express.Response) => Promise<void>;
export declare const deleteFormSubmission: (req: express.Request, res: express.Response) => Promise<void>;
export declare const saveDraft: (req: express.Request, res: express.Response) => Promise<void>;
export declare const saveDraftToPending: (req: express.Request, res: express.Response) => Promise<void>;
export declare const savePending: (req: express.Request, res: express.Response) => Promise<void>;
export declare const createFormApproval: (req: express.Request, res: express.Response) => Promise<void>;
export declare const updateFormApproval: (req: express.Request, res: express.Response) => Promise<void>;
export declare const getFormDraft: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
export declare const getTeamSubmission: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
export declare const getFormSubmission: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
export declare const getManagerFormApproval: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
export declare const getFormTemplate: (req: express.Request, res: express.Response) => Promise<express.Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=formsController.d.ts.map