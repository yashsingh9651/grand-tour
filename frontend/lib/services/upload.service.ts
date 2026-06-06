/**
 * Service to handle file uploads to the backend.
 */

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    public_id: string;
    format: string;
    resource_type: string;
    original_name: string;
    size: number;
  };
}

export const uploadFile = async (
  file: File,
  token: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    xhr.open("POST", `${apiUrl}/api/upload`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error("Failed to parse server response"));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.message || "Upload failed"));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error occurred during upload"));
    };

    xhr.send(formData);
  });
};
