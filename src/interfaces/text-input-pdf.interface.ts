import { IPDFOptions } from './pdf-options.interface';

export interface ITextInputPdf {
  label?: string;
  value?: string;
  width: number;
  height?: number;
  options?: IPDFOptions;
}
