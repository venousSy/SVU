const fs = require('fs');
const pdfParse = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`[pdfService] Extracting text from: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    
    // Handle different export styles of pdf-parse
    const parseFunction = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    
    if (typeof parseFunction !== 'function') {
      console.error('[pdfService] pdf-parse export is not a function:', typeof pdfParse);
      throw new Error('pdf-parse library loaded incorrectly');
    }

    const data = await parseFunction(dataBuffer);
    
    // Heuristics to clean up text (Remove headers/footers/page numbers)
    const lines = data.text.split('\n');
    const cleanedLines = lines.filter(line => {
      const stripped = line.trim();
      if (!stripped) return true; // Keep spacing
      if (/^\d+$/.test(stripped)) return false; // Skip page numbers
      if (/^Page \d+( of \d+)?$/i.test(stripped)) return false; // Skip Page X
      return true;
    });

    const cleanedText = cleanedLines.join('\n');
    console.log(`[pdfService] Extraction successful. Text length: ${cleanedText.length}`);
    return cleanedText;
  } catch (error) {
    console.error(`[pdfService] Extraction failed: ${error.message}`);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
};
