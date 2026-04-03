const { downloadRemoteFile } = require('../utils/downloadUtils');
const axios = require('axios');
const fs = require('fs');
const EventEmitter = require('events');
const os = require('os');
const path = require('path');

jest.mock('axios');
jest.mock('fs');
jest.mock('os');

describe('downloadUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
        os.tmpdir.mockReturnValue('/tmp');
    });

    describe('downloadRemoteFile', () => {
        it('should download and save a remote file successfully', async () => {
             const mockResponseStream = new EventEmitter();
             mockResponseStream.pipe = jest.fn();

             axios.mockResolvedValue({ data: mockResponseStream });

             const mockWriteStream = new EventEmitter();
             fs.createWriteStream.mockReturnValue(mockWriteStream);

             // Trigger the download and resolve the finish event on next tick
             const downloadPromise = downloadRemoteFile('http://example.com/file.pdf', 'test-prefix');
             
             // Wait for promises to settle so events attach
             await new Promise(resolve => setTimeout(resolve, 0));
             mockWriteStream.emit('finish');

             const resultPath = await downloadPromise;

             expect(axios).toHaveBeenCalledWith({
                 url: 'http://example.com/file.pdf',
                 method: 'GET',
                 responseType: 'stream',
                 timeout: 10000
             });
             expect(fs.createWriteStream).toHaveBeenCalled();
             
             expect(resultPath).toMatch(/[\\/]tmp[\\/]test-prefix-\d+-\d+\.pdf$/);
        });

        it('should handle write stream error', async () => {
            const mockResponseStream = new EventEmitter();
            mockResponseStream.pipe = jest.fn();
            axios.mockResolvedValue({ data: mockResponseStream });

            const mockWriteStream = new EventEmitter();
            fs.createWriteStream.mockReturnValue(mockWriteStream);

            const downloadPromise = downloadRemoteFile('http://example.com/file.pdf');
            
            await new Promise(resolve => setTimeout(resolve, 0));
            mockWriteStream.emit('error', new Error('Write Failed'));

            await expect(downloadPromise).rejects.toThrow('File Download Error: Could not fetch from URL. (Status: Unknown)');
        });

        it('should handle axios stream error', async () => {
            const mockResponseStream = new EventEmitter();
            mockResponseStream.pipe = jest.fn();
            axios.mockResolvedValue({ data: mockResponseStream });

            const mockWriteStream = new EventEmitter();
            fs.createWriteStream.mockReturnValue(mockWriteStream);

            const downloadPromise = downloadRemoteFile('http://abc.com/fail.pdf');
            
            await new Promise(resolve => setTimeout(resolve, 0));
            mockResponseStream.emit('error', new Error('Axios failed mid-stream'));

            await expect(downloadPromise).rejects.toThrow('File Download Error: Could not fetch from URL. (Status: Unknown)');
        });

        it('should handle http request failure (e.g. 404)', async () => {
            axios.mockRejectedValue({
                response: { status: 404 },
                message: 'Not Found'
            });

            await expect(downloadRemoteFile('http://example.com/404')).rejects.toThrow('File Download Error: Could not fetch from URL. (Status: 404)');
        });
    });
});
