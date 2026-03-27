const fs = require('fs');
const pdfLibrary = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`[pdfService] Extracting text from: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    
    // EXTREME DIAGNOSTIC LOGGING
    let parseFunction;
    if (typeof pdfLibrary === 'function') {
      console.log('[pdfService] pdf-parse is a direct function.');
      parseFunction = pdfLibrary;
    } else if (pdfLibrary && typeof pdfLibrary.default === 'function') {
      console.log('[pdfService] pdf-parse found in .default');
      parseFunction = pdfLibrary.default;
    } else if (pdfLibrary && typeof pdfLibrary.pdf === 'function') {
      console.log('[pdfService] pdf-parse found in .pdf property');
      parseFunction = pdfLibrary.pdf;
    } else {
      console.error('[pdfService] UNKNOWN pdf-parse structure!');
      console.error('[pdfService] typeof:', typeof pdfLibrary);
      console.error('[pdfService] Keys:', Object.keys(pdfLibrary || {}));
      
      // If it's an object with one function, just use that?
      const keys = Object.keys(pdfLibrary || {});
      const firstFuncKey = keys.find(k => typeof pdfLibrary[k] === 'function');
      if (firstFuncKey) {
        console.log(`[pdfService] Fallback: using first found function key: ${firstFuncKey}`);
        parseFunction = pdfLibrary[firstFuncKey];
      } else {
        throw new Error('pdf-parse library contains no functions');
      }
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
