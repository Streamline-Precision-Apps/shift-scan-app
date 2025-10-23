import type { MulterFile } from "../MulterFile";
import "express";

export declare module "express-serve-static-core" {
  interface Request {
    file?: MulterFile;
  }
}
