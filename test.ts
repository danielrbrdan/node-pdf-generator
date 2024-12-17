import { IPDFOptions } from "./src/interfaces/pdf-options.interface";
import { PDFBuilder } from "./src/pdf-builder";
import * as fs from 'fs';
import { TTableData, TTableHeader } from "./src/types/pdf-table-types";

async function main() {
  const pdf = new PDFBuilder();
  const headers: TTableHeader = [
      { text: 'Header 1', width: 100 , options: { gap: 2 }},
      {
        text: 'Header 2',
        width: 100,
        options: { horizontalBorder: false, verticalBorder: false, gap: 2 },
      },
      {
        text: 'Header 3',
        children: ['Header 3-1', 'Header 3-2'],
        width: 100,
        options: { gap: 2, align: 'center', fontStyle: 'bold' },
      },
    ];

    const customHeaderOptions = { gap: 2 };
    const datas: TTableData = [
      [
        { text: 'Data 1-1', options: customHeaderOptions },
        { text: 'Data 1-2', options: customHeaderOptions },
        { text: 'Data 1-3', options: customHeaderOptions },
        { text: 'Data 1-4', options: customHeaderOptions },
      ],
      [
        { text: 'Data 2-1', options: customHeaderOptions },
        { text: 'Data 2-2', options: customHeaderOptions },
        { text: 'Data 2-3', options: customHeaderOptions },
        { text: 'Data 2-4', options: customHeaderOptions },
      ],
      [
        { text: 'Data 3-1', options: customHeaderOptions },
        { text: 'Data 3-2', options: customHeaderOptions },
        { text: 'Data 3-3', options: customHeaderOptions },
        { text: 'Data 3-4', options: {...customHeaderOptions, fontStyle: 'bold', inputFontSize: 6 } },
      ],
    ];

  pdf.printTable({
      x: 10,
      y: 10
  }, headers, datas);

  await pdf.end();

  fs.writeFileSync('test.pdf', pdf.buffer);
}

main();