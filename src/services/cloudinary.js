import { cloudinaryConfig } from '@/config/cloudinary'

class CloudinaryService {
  /**
   * Upload an image file to Cloudinary and return the secure URL plus metadata.
   * @param {File|Blob|string} file - image file, blob or data URL to upload.
   * @param {Object} options - extra Cloudinary upload options.
   * @returns {Promise<{url: string, publicId: string, width: number, height: number, format: string, bytes: number}>}
   */
  async uploadImage(file, options = {}) {
    if (!file) {
      throw new Error('No file provided for upload')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset)

    if (cloudinaryConfig.folder) {
      formData.append('folder', cloudinaryConfig.folder)
    }

    // Allow custom folder / tags / context overrides.
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value)
      }
    })

    const response = await fetch(cloudinaryConfig.uploadUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorBody}`)
    }

    const result = await response.json()

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  }
}

const cloudinaryService = new CloudinaryService()

export default cloudinaryService
