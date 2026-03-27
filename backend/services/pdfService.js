const { spawn } = require('child_process');
const path = require('path');

const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, '../scripts/extract_pdf.py');
    
    // Call Python script with the file path as an argument
    const pythonProcess = spawn('python3', [pythonScriptPath, filePath]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${errorString}`));
      }

      try {
        const result = JSON.parse(dataString);
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result.content);
      } catch (parseError) {
        reject(new Error(`Failed to parse Python output: ${parseError.message}. Raw output: ${dataString}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
};

module.exports = {
  extractTextFromPDF,
};
