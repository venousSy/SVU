const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Downloads a remote file to a temporary directory.
 * @param {string} fileUrl - The URL of the file to download
 * @param {string} prefix - Prefix for the temp file name
 * @returns {Promise<string>} The path to the downloaded local temporary file
 */
const downloadRemoteFile = async (fileUrl, prefix = 'file') => {
  console.log(`[downloadUtils] Downloading remote file: ${fileUrl}`);
  try {
    const response = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000, 
    });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const tempFilePath = path.join(os.tmpdir(), `${prefix}-${uniqueSuffix}.pdf`);
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', (err) => {
        console.error(`[downloadUtils] WriteStream error for ${fileUrl}:`, err.message);
        reject(err);
      });
      response.data.on('error', (err) => {
        console.error(`[downloadUtils] Axios stream error for ${fileUrl}:`, err.message);
        reject(err);
      });
    });

    console.log(`[downloadUtils] Successfully downloaded file to: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error(`[downloadUtils] Failed to download file from ${fileUrl}:`, error.message);
    if (error.response) {
      console.error(`[downloadUtils] HTTP Status: ${error.response.status}`);
    }
    throw new Error(`File Download Error: Could not fetch from URL. (Status: ${error.response?.status || 'Unknown'})`);
  }
};

module.exports = {
  downloadRemoteFile,
};
