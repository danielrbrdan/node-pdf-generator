import JSZip, { OutputType } from 'jszip';
import PDFDocument from 'pdfkit';
import { IPosition } from './interfaces/position.interface';
import {ITextInputPdf} from './interfaces/text-input-pdf.interface'
import { IPDFOptions } from './interfaces/pdf-options.interface';

export class PDFBuilder extends PDFDocument {
  margin = 12;
  pageWidth = 595 - this.margin * 2;
  pageHeight = 841 - this.margin * 2;

  inputHeight = 23;

  defaultInputFontSize = 9;
  defaultLabelFontSize = 5;
  defaultSmallFontSize = 5;
  defaultFontSize = 7;
  defaultMediumFontSize = 6;
  defaultBigFontSize = 10;

  defaultSmallGap = 2.5;
  defaultMediumGap = 5;
  defaultLargeGap = 15;

  defaultFont = 'Helvetica';
  defaultBoldFont = 'Helvetica-Bold';

  currentPageNumber = 1;
  totalPageNumber = 1;

  private buffers: Buffer[] = [];
  buffer!: Buffer;
  private waterMarkText?: string;

  constructor(options?: PDFKit.PDFDocumentOptions) {
    super(
      options ?? {
        size: 'A4',
        margin: 12,
      },
    );

    if (options?.margin) {
      this.margin = options.margin;
    }

    this.setHandlers();
    this.setNormalFontSize();
  }

  setHandlers(): void {
    this.on('data', this.buffers.push.bind(this.buffers));
  }

  async end(): Promise<this> {
    this.printWaterMark();

    return new Promise((resolve) => {
      this.on('end', () => {
        this.buffer = Buffer.concat(this.buffers);
        resolve(this);
      });

      super.end();
    });
  }

  setBigFontSize(): this {
    this.fontSize(this.defaultBigFontSize);
    return this;
  }

  setNormalFontSize(): this {
    this.fontSize(this.defaultFontSize);
    return this;
  }

  setSmallFontSize(): this {
    this.fontSize(this.defaultSmallFontSize);
    return this;
  }

  setNormalFontStyle(): this {
    return this.font(this.defaultFont);
  }

  setBoldFontStyle(): this {
    return this.font(this.defaultBoldFont);
  }

  getGapByAlign(
    text: string,
    width: number,
    gap: number,
    align?: 'center' | 'left' | 'right',
  ): number {
    if (align === 'center') {
      gap += (width - this.widthOfString(text)) / 2;
      return gap < 0 ? 0 : gap;
    }

    if (align === 'right') {
      gap = width - this.widthOfString(text) - gap;
      return gap < 0 ? 0 : gap;
    }

    return gap;
  }

  splitTextToLines(text: string, maxWidth: number): string[] {
    if (!text) return [];
    if (text.includes('\n')) {
      return text
        .split('\n')
        .map((line) => this.splitTextToLines(line, maxWidth))
        .flat();
    }

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word: string) => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = this.widthOfString(testLine);
      if (currentLine && testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    lines.push(currentLine);
    return lines;
  }

  printText(
    pos: IPosition,
    texts: string[],
    fontGap = this.defaultSmallGap,
  ): this {
    for (const text of texts) {
      this.text(text, pos.x, pos.y);

      pos.y += this.defaultFontSize + fontGap;
    }

    return this;
  }

  printInput(
    pos: IPosition,
    width: number,
    height = this.inputHeight,
    radius = 5,
    strokeOpacity = 1,
  ): this {
    this.moveTo(pos.x + radius, pos.y)
      .lineTo(pos.x + width - radius, pos.y)
      .quadraticCurveTo(pos.x + width, pos.y, pos.x + width, pos.y + radius)
      .lineTo(pos.x + width, pos.y + height - radius)
      .quadraticCurveTo(
        pos.x + width,
        pos.y + height,
        pos.x + width - radius,
        pos.y + height,
      )
      .lineTo(pos.x + radius, pos.y + height)
      .quadraticCurveTo(pos.x, pos.y + height, pos.x, pos.y + height - radius)
      .lineTo(pos.x, pos.y + radius)
      .quadraticCurveTo(pos.x, pos.y, pos.x + radius, pos.y)
      .lineWidth(0.1)
      .undash()
      .closePath()
      .strokeOpacity(strokeOpacity)
      .stroke();

    pos.y += height;

    return this;
  }

  printWaterMark(): this {
    if (!this.waterMarkText) {
      return this;
    }

    this.fontSize(48)
      .fillOpacity(0.2)
      .rotate(-90, { origin: [250, 421] })
      .text(this.waterMarkText, 72, 400);

    this.fillOpacity(1).rotate(90, { origin: [298, 421] });

    this.setNormalFontSize();
    this.setNormalFontStyle();

    return this;
  }

  setWaterMark(markText: string): this {
    this.waterMarkText = markText;
    return this;
  }

  drawCellBorders(
    pos: IPosition,
    width: number,
    height: number,
    options?: IPDFOptions,
  ): void {
    this.lineWidth(0.1);

    if (!options || options.horizontalBorder !== false) {
      this.moveTo(pos.x, pos.y)
        .lineTo(pos.x + width, pos.y)
        .stroke();

      this.moveTo(pos.x, pos.y + height)
        .lineTo(pos.x + width, pos.y + height)
        .stroke();
    }

    if (!options || options.verticalBorder !== false) {
      this.moveTo(pos.x, pos.y)
        .lineTo(pos.x, pos.y + height)
        .stroke();

      this.moveTo(pos.x + width, pos.y)
        .lineTo(pos.x + width, pos.y + height)
        .stroke();
    }
  }

  drawCell(
    text: string,
    pos: IPosition,
    width: number,
    height: number,
    options?: IPDFOptions,
    children?: string[],
    valueGapY = 0,
    valueGapX = 0,
  ): void {
    if (children) {
      children.forEach((child, index) => {
        this.drawCell(
          child,
          { x: pos.x + width * index, y: pos.y + height / 2 },
          width,
          height / 2,
          { ...options, verticalBorder: true, horizontalBorder: false },
        );
      });
    }

    const cellPadding = 1.5;
    this.drawCellBorders(
      { ...pos },
      width * (children?.length ?? 1),
      height,
      options,
    );

    if (children) {
      this.drawCellBorders(
        { ...pos },
        width * children.length,
        height / 2,
        options,
      );
    }

    options?.fontStyle == 'bold'
      ? this.setBoldFontStyle()
      : this.setNormalFontStyle();

    const fontSize = options?.inputFontSize ?? this.defaultLabelFontSize;

    this.fontSize(fontSize);
    this.splitTextToLines(text, width * (children?.length ?? 1)).forEach(
      (splitedText, index) => {
        this.text(
          splitedText,
          pos.x +
            this.getGapByAlign(
              splitedText,
              width * (children?.length ?? 1),
              options?.gap ?? 0,
              options?.align,
            ) +
            valueGapX,
          pos.y +
            cellPadding +
            index * fontSize +
            valueGapY +
            (height / 2 - fontSize),
        );
      },
    );
  }

  addPageIfNeeded(pos: IPosition, increment?: number): boolean {
    if (pos.y + (increment ?? 0) > this.pageHeight - this.margin) {
      this.addPage();
      this.setNormalFontStyle();
      this.setSmallFontSize();
      pos.y = this.margin;
      return true;
    }

    return false;
  }

  printTable(
    pos: IPosition,
    headers: {
      text: string;
      children?: string[];
      width: number;
      options?: IPDFOptions;
    }[],
    datas: { text: string; options?: IPDFOptions }[][],
    rowHeight = 13,
    finalBorder = true,
  ): this {
    let width = 0;
    this.setBoldFontStyle();
    this.setSmallFontSize();
    headers.forEach((header) => {
      this.drawCell(
        header.text,
        { x: pos.x + width, y: pos.y },
        header.width,
        rowHeight,
        header.options,
        header.children,
      );

      width += header.width * (header.children?.length ?? 1);
    });

    const plainHeaders = headers.flatMap((header) => {
      if (header.children) {
        return header.children.map((child) => ({
          text: child,
          width: header.width,
        }));
      }
      return { text: header.text, width: header.width };
    });

    pos.y += rowHeight;
    for (const row of datas) {
      width = 0;

      this.addPageIfNeeded(pos, rowHeight);

      for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
        const cell = row[cellIndex];
        this.drawCell(
          cell.text,
          {
            x: pos.x + width,
            y: pos.y,
          },
          plainHeaders[cellIndex]?.width ?? this.defaultLargeGap,
          rowHeight,
          cell.options,
        );

        width += plainHeaders[cellIndex]?.width ?? this.defaultLargeGap;
      }

      pos.y += rowHeight;
    }

    if (finalBorder) {
      const finalWidth =
        pos.x + plainHeaders.reduce((acc, header) => acc + header.width, 0);
      this.moveTo(pos.x, pos.y)
        .lineTo(finalWidth, pos.y)
        .lineWidth(0.1)
        .stroke();
    }

    return this;
  }

  addPage(): this {
    this.printWaterMark();
    super.addPage();
    this.currentPageNumber++;
    this.totalPageNumber++;
    return this;
  }

  printMultipleInputText(
    pos: IPosition,
    textInputsRows: ITextInputPdf[][],
  ): this {
    for (const textInputColumn of textInputsRows) {
      for (const textInput of textInputColumn) {
        this.printInputText(
          pos,
          textInput.label,
          textInput.value,
          textInput.width,
          textInput.height ?? this.inputHeight,
          textInput.options,
        );
        pos.x += textInput.width;
      }
      pos.x = this.margin;
      pos.y += this.inputHeight;
    }
    return this;
  }

  printInputText(
    pos: IPosition,
    label?: string,
    value?: string,
    width = 0,
    height = this.inputHeight,
    options?: IPDFOptions,
  ): this {
    this.addPageIfNeeded(pos, height - this.margin);

    this.setNormalFontStyle();
    this.fontSize(this.defaultInputFontSize);

    height = options?.fitOverflow
      ? (this.splitTextToLines(value ?? '', width).length + 1) *
        this.heightOfString('A')
      : height;
    height < this.inputHeight && (height = this.inputHeight);

    this.printInput({ ...pos }, width, height).printLabelAndValue(
      pos,
      height,
      label,
      value,
      width,
      options,
    );

    if (options?.fitOverflow) {
      pos.y += height;
    }

    return this;
  }

  printLabelAndValue(
    pos: IPosition,
    inputHeight: number,
    label?: string,
    value?: string,
    inputWidth?: number,
    options?: IPDFOptions,
  ): this {
    if (inputWidth) {
      inputWidth -= this.defaultSmallGap;
    }
    const labelGapX = this.defaultSmallGap;
    const labelGapY = this.defaultSmallGap;
    let valueGapY = 6;

    if (label) {
      valueGapY += this.defaultLabelFontSize;
    }

    options?.fontStyle == 'bold' && this.setBoldFontStyle();

    this.fontSize(this.defaultLabelFontSize)
      .text(label ?? '', pos.x + labelGapX, pos.y + labelGapY)
      .setNormalFontStyle();

    const textFontSize = options?.inputFontSize ?? this.defaultInputFontSize;

    this.fontSize(textFontSize);
    const valueGapX = this.getGapByAlign(
      value ?? '',
      inputWidth ?? 0,
      labelGapX,
      options?.align,
    );

    const textPos = { ...pos };
    const writeableWidth = inputHeight - this.defaultLabelFontSize;

    const splitedTexts = this.splitTextToLines(value ?? '', inputWidth ?? 0);
    for (let index = 0; index < splitedTexts.length; index++) {
      if (
        this.addPageIfNeeded(textPos, this.heightOfString(splitedTexts[index]))
      ) {
        this.setNormalFontStyle();
        this.fontSize(textFontSize);
      }
      const splitedText = splitedTexts[index];
      if (this.heightOfString(splitedText) * (index + 1) > writeableWidth) {
        break;
      }

      this.text(splitedText, textPos.x + valueGapX, textPos.y + valueGapY);
      textPos.y += textFontSize;
    }
    this.setNormalFontSize();

    return this;
  }
}
