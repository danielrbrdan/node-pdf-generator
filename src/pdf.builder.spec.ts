import { IPosition } from '../interfaces/position.interface';
import { IPDFOptions } from './interfaces/pdf-options.interface';
import { ITextInputPdf } from './interfaces/text-input-pdf.interface';
import { PDFBuilder } from './pdf-builder';

describe('PDFBuilder', () => {
  let pdfBuilder: PDFBuilder;

  beforeEach(() => {
    pdfBuilder = new PDFBuilder();
  });

  it('should be defined', () => {
    expect(pdfBuilder).toBeDefined();
  });

  it('should initialize with default settings', () => {
    expect(pdfBuilder.defaultFontSize).toBe(7);
    expect(pdfBuilder.pageWidth).toBe(595 - pdfBuilder.margin * 2);
  });

  it('should set big font size', () => {
    const spy = jest.spyOn(pdfBuilder, 'fontSize');
    pdfBuilder.setBigFontSize();

    expect(spy).toHaveBeenCalledWith(pdfBuilder.defaultBigFontSize);
  });

  it('should set small font size', () => {
    const spy = jest.spyOn(pdfBuilder, 'fontSize');
    pdfBuilder.setSmallFontSize();

    expect(spy).toHaveBeenCalledWith(pdfBuilder.defaultSmallFontSize);
  });

  it('should set Normal font size', () => {
    jest.spyOn(pdfBuilder, 'font');

    pdfBuilder.setNormalFontStyle();

    expect(pdfBuilder.font).toHaveBeenCalledWith('Helvetica');
  });

  it('should set Bold font size', () => {
    jest.spyOn(pdfBuilder, 'font');
    pdfBuilder.setBoldFontStyle();

    expect(pdfBuilder.font).toHaveBeenCalledWith('Helvetica-Bold');
  });

  it('should calculate the gap for center alignment', () => {
    const text = 'Hello';
    const width = 100;
    const gap = 10;
    jest.spyOn(pdfBuilder, 'widthOfString').mockReturnValue(50);

    const result = pdfBuilder.getGapByAlign(text, width, gap, 'center');

    expect(result).toBe(35);
  });

  it('should calculate the gap for left alignment', () => {
    const text = 'Hello';
    const width = 100;
    const gap = 10;
    jest.spyOn(pdfBuilder, 'widthOfString').mockReturnValue(50);

    const result = pdfBuilder.getGapByAlign(text, width, gap, 'left');

    expect(result).toBe(10);
  });

  it('should calculate the gap for right alignment', () => {
    const text = 'Hello';
    const width = 100;
    const gap = 10;
    jest.spyOn(pdfBuilder, 'widthOfString').mockReturnValue(50);

    const result = pdfBuilder.getGapByAlign(text, width, gap, 'right');

    expect(result).toBe(40);
  });

  it('should calculate the gap for center alignment and return 0', () => {
    const text = 'Hello';
    const width = 100;
    const gap = -1000;
    jest.spyOn(pdfBuilder, 'widthOfString').mockReturnValue(50);

    const result = pdfBuilder.getGapByAlign(text, width, gap, 'center');

    expect(result).toBe(0);
  });

  it('should calculate the gap for right alignment and return 0', () => {
    const text = 'Hello';
    const width = 100;
    const gap = 1000;
    jest.spyOn(pdfBuilder, 'widthOfString').mockReturnValue(50);

    const result = pdfBuilder.getGapByAlign(text, width, gap, 'right');

    expect(result).toBe(0);
  });

  it('should split text into lines', () => {
    const text =
      'This is a long text that\nneeds to be split into multiple lines';
    const maxWidth = 50;
    jest
      .spyOn(pdfBuilder, 'widthOfString')
      .mockImplementation((line: string) => line.length * 5);

    const result = pdfBuilder.splitTextToLines(text, maxWidth);

    expect(result).toEqual([
      'This is a',
      'long text',
      'that',
      'needs to',
      'be split',
      'into',
      'multiple',
      'lines',
    ]);
  });

  it('should split empty text into lines', () => {
    const text = null as any;
    const maxWidth = 50;
    jest
      .spyOn(pdfBuilder, 'widthOfString')
      .mockImplementation((line: string) => line.length * 5);

    const result = pdfBuilder.splitTextToLines(text, maxWidth);

    expect(result).toEqual([]);
  });

  it('should print multiple lines of text', () => {
    const pos: IPosition = { x: 50, y: 100 };
    const texts = ['Line 1', 'Line 2', 'Line 3'];
    const fontGap = 5;

    const textSpy = jest.spyOn(pdfBuilder, 'text');

    pdfBuilder.printText(pos, texts, fontGap);

    expect(textSpy).toHaveBeenCalledWith(texts[0], 50, 100);
    expect(textSpy).toHaveBeenCalledWith(texts[1], 50, 112);
    expect(textSpy).toHaveBeenCalledWith(texts[2], 50, 124);
  });

  it('should print multiple lines of text with default font gap', () => {
    const pos: IPosition = { x: 50, y: 100 };
    const texts = ['Line 1', 'Line 2', 'Line 3'];
    const fontGap = undefined;

    const textSpy = jest.spyOn(pdfBuilder, 'text');

    pdfBuilder.printText(pos, texts, fontGap);

    expect(textSpy).toHaveBeenCalledWith(texts[0], 50, 100);
    expect(textSpy).toHaveBeenCalledWith(texts[1], 50, 109.5);
    expect(textSpy).toHaveBeenCalledWith(texts[2], 50, 119);
  });

  it('should print input rectangle', () => {
    const pos: IPosition = { x: 50, y: 100 };
    const width = 150;
    const height = 30;

    const lineWidthSpy = jest.spyOn(pdfBuilder, 'lineWidth');
    const undashSpy = jest.spyOn(pdfBuilder, 'undash');
    const closePathSpy = jest.spyOn(pdfBuilder, 'closePath');
    const strokeSpy = jest.spyOn(pdfBuilder, 'stroke');

    pdfBuilder.printInput(pos, width, height);

    expect(lineWidthSpy).toHaveBeenCalledWith(0.1);
    expect(undashSpy).toHaveBeenCalled();
    expect(closePathSpy).toHaveBeenCalled();
    expect(strokeSpy).toHaveBeenCalled();
    expect(pos.y).toBe(100 + height);
  });

  it('should print input rectangle with default height', () => {
    const pos: IPosition = { x: 50, y: 100 };
    const width = 150;
    const height = undefined;

    const lineWidthSpy = jest.spyOn(pdfBuilder, 'lineWidth');
    const undashSpy = jest.spyOn(pdfBuilder, 'undash');
    const closePathSpy = jest.spyOn(pdfBuilder, 'closePath');
    const strokeSpy = jest.spyOn(pdfBuilder, 'stroke');

    pdfBuilder.printInput(pos, width, height);

    expect(lineWidthSpy).toHaveBeenCalledWith(0.1);
    expect(undashSpy).toHaveBeenCalled();
    expect(closePathSpy).toHaveBeenCalled();
    expect(strokeSpy).toHaveBeenCalled();
    expect(pos.y).toBe(123);
  });

  it('should print table', () => {
    const pos: IPosition = { x: 50, y: 100 };
    const headers = [
      { text: 'Header 1', width: 50 },
      {
        text: 'Header 2',
        width: 100,
        options: { horizontalBorder: false, verticalBorder: false },
      },
      {
        text: 'Header 3',
        children: ['Header 3-1', 'Header 3-2'],
        width: 75,
        options: { gap: 2, align: 'center', fontStyle: 'bold' },
      },
    ] as {
      text: string;
      children?: string[];
      width: number;
      options?: IPDFOptions;
    }[];

    const datas = [
      [
        { text: 'Data 1-1' },
        { text: 'Data 1-2' },
        { text: 'Data 1-3' },
        { text: 'Data 1-4' },
      ],
      [
        { text: 'Data 2-1' },
        { text: 'Data 2-2' },
        { text: 'Data 2-3' },
        { text: 'Data 2-4' },
      ],
      [
        { text: 'Data 3-1' },
        { text: 'Data 3-2' },
        { text: 'Data 3-3' },
        { text: 'Data 3-4' },
        { text: 'Data 3-4' },
      ],
    ] as { text: string; options?: IPDFOptions }[][];

    const drawCellSpy = jest.spyOn(pdfBuilder, 'drawCell');
    const drawCellBordersSpy = jest.spyOn(pdfBuilder, 'drawCellBorders');

    pdfBuilder.printTable(pos, headers, datas);

    expect(drawCellSpy).toHaveBeenCalledTimes(18);
    expect(drawCellBordersSpy).toHaveBeenCalledTimes(19);
  });

  describe('addPageIfNeeded', () => {
    it('should add a new page if pos.y exceeds page height', () => {
      const pos: IPosition = { x: 1, y: 1000 };
      const increment = 10;

      const result = pdfBuilder.addPageIfNeeded(pos, increment);

      expect(pos.y).toBe(12);
      expect(result).toBe(true);
    });

    it('should not add a new page if pos.y does not exceed page height', () => {
      const pos: IPosition = { x: 1, y: 80 };
      const increment = 10;

      const result = pdfBuilder.addPageIfNeeded(pos, increment);

      expect(result).toBe(false);
    });

    it('should handle the case when increment is not provided', () => {
      const pos: IPosition = { x: 1, y: 90 };

      const result = pdfBuilder.addPageIfNeeded(pos);

      expect(result).toBe(false);
    });
  });

  describe('watermark', () => {
    it('should print watermark', () => {
      const watermark = 'Watermark';

      const fontSizeSpy = jest.spyOn(pdfBuilder, 'fontSize');
      const textSpy = jest.spyOn(pdfBuilder, 'text');
      const rotateSpy = jest.spyOn(pdfBuilder, 'rotate');
      const fillOpacitySpy = jest.spyOn(pdfBuilder, 'fillOpacity');
      pdfBuilder.setWaterMark(watermark);
      pdfBuilder.printWaterMark();

      expect(textSpy).toHaveBeenCalledWith(watermark, 72, 400);
      expect(fontSizeSpy).toHaveBeenCalledWith(48);
      expect(rotateSpy).toHaveBeenCalledWith(-90, { origin: [250, 421] });
      expect(fillOpacitySpy).toHaveBeenCalledWith(0.2);
    });
  });

  describe('printMultipleInputText', () => {
    it('should print multiple input texts horizontally', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const textInputsRows = [
        [
          { label: 'Label 1', value: 'Value 1', width: 50 },
          { label: 'Label 2', value: 'Value 2', width: 100 },
          { label: 'Label 3', value: 'Value 3', width: 75 },
        ],
        [
          { label: 'Label 4', value: 'Value 4', width: 80 },
          { label: 'Label 5', value: 'Value 5', width: 60 },
          { label: 'Label 6', value: 'Value 6', height: 10 },
        ],
      ] as ITextInputPdf[][];

      const printInputTextSpy = jest.spyOn(pdfBuilder, 'printInputText');
      pdfBuilder.printMultipleInputText(pos, textInputsRows);

      expect(printInputTextSpy).toHaveBeenCalledTimes(6);
      expect(pos.y).toBe(100 + pdfBuilder.inputHeight * 2);
      expect(pos.x).toBe(pdfBuilder.margin);
      expect(printInputTextSpy).toHaveBeenNthCalledWith(
        1,
        pos,
        'Label 1',
        'Value 1',
        50,
        pdfBuilder.inputHeight,
        undefined,
      );
      expect(printInputTextSpy).toHaveBeenNthCalledWith(
        5,
        pos,
        'Label 5',
        'Value 5',
        60,
        pdfBuilder.inputHeight,
        undefined,
      );
      expect(printInputTextSpy).toHaveBeenNthCalledWith(
        6,
        pos,
        'Label 6',
        'Value 6',
        undefined,
        10,
        undefined,
      );

      expect(pos.y).toBe(146);
    });
  });

  describe('printInputText', () => {
    it('should print input text with label and value', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const label = 'Label';
      const value = 'Value';
      const width = 150;
      const height = 30;
      const options: IPDFOptions = { align: 'center', fontStyle: 'bold' };

      const printInputSpy = jest.spyOn(pdfBuilder, 'printInput');
      const printLabelAndValueSpy = jest.spyOn(
        pdfBuilder,
        'printLabelAndValue',
      );
      pdfBuilder.printInputText(pos, label, value, width, height, options);

      expect(printInputSpy).toHaveBeenCalledWith(
        { x: 50, y: 130 },
        width,
        height,
      );
      expect(printLabelAndValueSpy).toHaveBeenCalledWith(
        pos,
        height,
        label,
        value,
        width,
        options,
      );
    });

    it('should print input text with label and value with default height', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const label = 'Label';
      const value = 'Value';
      const width = 150;
      const height = undefined;
      const options: IPDFOptions = { align: 'center', fontStyle: 'bold' };

      const printInputSpy = jest.spyOn(pdfBuilder, 'printInput');
      const printLabelAndValueSpy = jest.spyOn(
        pdfBuilder,
        'printLabelAndValue',
      );
      pdfBuilder.printInputText(pos, label, value, width, height, options);

      expect(printInputSpy).toHaveBeenCalledWith({ x: 50, y: 123 }, width, 23);
      expect(printLabelAndValueSpy).toHaveBeenCalledWith(
        pos,
        pdfBuilder.inputHeight,
        label,
        value,
        width,
        options,
      );
    });

    it('should print input text with label only', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const label = 'Label';
      const value = undefined;
      const width = 150;
      const height = 30;
      const options: IPDFOptions = { align: 'center', fontStyle: 'bold' };

      const printInputSpy = jest.spyOn(pdfBuilder, 'printInput');
      const printLabelAndValueSpy = jest.spyOn(
        pdfBuilder,
        'printLabelAndValue',
      );
      pdfBuilder.printInputText(pos, label, value, width, height, options);

      expect(printInputSpy).toHaveBeenCalledWith(
        { x: 50, y: 130 },
        width,
        height,
      );
      expect(printLabelAndValueSpy).toHaveBeenCalledWith(
        pos,
        height,
        label,
        value,
        width,
        options,
      );
    });

    it('should print input text with value only', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const label = undefined;
      const value = 'Value';
      const width = 150;
      const height = 30;
      const options: IPDFOptions = { align: 'center', fontStyle: 'bold' };

      const printInputSpy = jest.spyOn(pdfBuilder, 'printInput');
      const printLabelAndValueSpy = jest.spyOn(
        pdfBuilder,
        'printLabelAndValue',
      );
      pdfBuilder.printInputText(pos, label, value, width, height, options);

      expect(printInputSpy).toHaveBeenCalledWith(
        { x: 50, y: 130 },
        width,
        height,
      );
      expect(printLabelAndValueSpy).toHaveBeenCalledWith(
        pos,
        height,
        label,
        value,
        width,
        options,
      );
    });
  });

  describe('printLabelAndValue', () => {
    it('should print label and value', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const label = 'Label:';
      const value = 'Value';
      const inputWidth = 200;
      const options: IPDFOptions = {
        fontStyle: 'bold',
        align: 'center',
        inputFontSize: 12,
      };

      const fontSizeSpy = jest.spyOn(pdfBuilder, 'fontSize');
      const textSpy = jest.spyOn(pdfBuilder, 'text');
      const getGapByAlignSpy = jest
        .spyOn(pdfBuilder, 'getGapByAlign')
        .mockReturnValue(10);

      pdfBuilder.printLabelAndValue(
        pos,
        pdfBuilder.inputHeight,
        label,
        value,
        inputWidth,
        options,
      );

      expect(fontSizeSpy).toHaveBeenCalledWith(pdfBuilder.defaultLabelFontSize);
      expect(textSpy).toHaveBeenCalledWith(label, pos.x + 2.5, pos.y + 2.5);
      expect(fontSizeSpy).toHaveBeenCalledWith(options.inputFontSize);
      expect(getGapByAlignSpy).toHaveBeenCalledWith(
        value,
        197.5,
        2.5,
        options.align,
      );
      expect(textSpy).toHaveBeenCalledWith(
        value,
        pos.x + 10,
        pos.y + 6 + pdfBuilder.defaultLabelFontSize,
      );
    });

    it('should print label and value without inputWidth', () => {
      const pos: IPosition = { x: 50, y: 100 };
      const label = 'Label:';
      const value = 'Value';
      const inputWidth = undefined;
      const options: IPDFOptions = {
        fontStyle: 'bold',
        align: 'center',
        inputFontSize: 12,
      };

      const fontSizeSpy = jest.spyOn(pdfBuilder, 'fontSize');
      const textSpy = jest.spyOn(pdfBuilder, 'text');

      pdfBuilder.printLabelAndValue(
        pos,
        pdfBuilder.inputHeight,
        label,
        value,
        inputWidth,
        options,
      );

      expect(fontSizeSpy).toHaveBeenCalledWith(pdfBuilder.defaultLabelFontSize);
      expect(fontSizeSpy).toHaveBeenCalledWith(options.inputFontSize);
      expect(textSpy).toHaveBeenCalledWith(label, pos.x + 2.5, pos.y + 2.5);
      expect(textSpy).toHaveBeenCalledWith(value, 50, 111);
    });
  });

  describe('zipPdf', () => {
    it('should merge multiple PDF buffers into one', async () => {
      const pdfBuilder = new PDFBuilder();
      pdfBuilder.text('Foo', 1, 1);
      await pdfBuilder.end();

      const result = await PDFBuilder.zipPdfs([
        {
          buffer: pdfBuilder.buffer,
          name: 'test.pdf',
        },
      ]);

      expect(result).toBeDefined();
    });
  });
});
