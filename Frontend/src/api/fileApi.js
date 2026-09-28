import { USE_MOCK_DATA, simulateDelay } from './client';

export const fileApi = {
  /**
   * Upload file client-side using FileReader DataURL for persistent visual preview
   * and storage in backend document/image string URL fields.
   * @param {File} file
   * @returns {Promise<{ url: string, fileName: string, fileSize: string, type: string }>}
   */
  async uploadFile(file) {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
    }

    return new Promise((resolve, reject) => {
      const fileSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result,
          fileName: file.name,
          fileSize,
          type: file.type,
        });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read upload file'));
      };
      reader.readAsDataURL(file);
    });
  }
};

