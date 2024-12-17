import { IPDFOptions } from "../interfaces/pdf-options.interface";

export type TTableHeader = {
    text: string;
    children?: string[];
    width: number;
    options?: IPDFOptions;
  }[];
  
export type TTableData = { text: string; options?: IPDFOptions }[][];