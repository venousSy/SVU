const { extractTextFromPDF } = require('../services/pdfService');
const fs = require('fs');
const pdf = require('pdf-parse');

jest.mock('fs');
jest.mock('pdf-parse', () => jest.fn());

describe('pdfService - extractTextFromPDF', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
    });

    it('should extract text and clean out page numbers', async () => {
        const mockPdfRawText = "Hello World\n1\nMore Text\nPage 2\nPage 3 of 4\nEnding";
        fs.readFileSync.mockReturnValue('mock buffer');
        pdf.mockResolvedValue({ text: mockPdfRawText });

        const result = await extractTextFromPDF('dummy.pdf');

        expect(fs.readFileSync).toHaveBeenCalledWith('dummy.pdf');
        expect(pdf).toHaveBeenCalledWith('mock buffer');
        
        // Ensure "1", "Page 2", and "Page 3 of 4" were filtered out
        expect(result).not.toContain('Page 2');
        expect(result).not.toContain('Page 3 of 4');
        expect(result).toBe("Hello World\nMore Text\nEnding");
    });

    it('should throw error if readFileSync throws', async () => {
        fs.readFileSync.mockImplementation(() => {
            throw new Error('File not found');
        });

        await expect(extractTextFromPDF('missing.pdf')).rejects.toThrow('Failed to extract text: File not found');
    });

    it('should throw error if pdf parser throws', async () => {
         fs.readFileSync.mockReturnValue('mock buffer');
         pdf.mockRejectedValue(new Error('Parser crash'));

         await expect(extractTextFromPDF('corrupt.pdf')).rejects.toThrow('Failed to extract text: Parser crash');
    });
});
