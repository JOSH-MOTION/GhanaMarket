export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

/**
 * Upload a file to Cloudinary using unsigned preset.
 * You must set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET in env.
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfff3hdrf';
  const unsignedPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;

  if (!unsignedPreset) {
    throw new Error('Missing VITE_CLOUDINARY_UNSIGNED_PRESET environment variable');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', unsignedPreset);
  if (folder) formData.append('folder', folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Cloudinary upload failed: ${resp.status} ${text}`);
  }

  return (await resp.json()) as CloudinaryUploadResult;
}
