import { USE_MOCK_DATA, simulateDelay, API_BASE_URL } from './client';

export const fileApi = {
  /**
   * Upload file to backend (/api/files/upload) or simulate file upload in mock mode
   * @param {File} file
   * @returns {Promise<{ url: string, fileName: string, fileSize: string }>}
   */
  async uploadFile(file) {
    if (!USE_MOCK_DATA) {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('petnexus_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
      }

      return await response.json();
    }

    // Mock Upload Implementation (Converts image to DataURL for persistent visual preview)
    await simulateDelay(400);

    return new Promise((resolve, reject) => {
      const fileSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      // Read as DataURL so it renders in <img> tags cleanly
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
