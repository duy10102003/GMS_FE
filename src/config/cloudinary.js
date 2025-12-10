/**
 * Cloudinary configuration helper.
 * Reads settings from Vite environment variables and exposes them via a class.
 */
class CloudinaryConfig {
  
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || ''
    this.folder = import.meta.env.VITE_CLOUDINARY_FOLDER || ''
  }

  /**
   * Validate that required config values exist.
   */
  validate() {
    if (!this.cloudName) {
      throw new Error('Missing Cloudinary config: VITE_CLOUDINARY_CLOUD_NAME')
    }
    if (!this.uploadPreset) {
      throw new Error('Missing Cloudinary config: VITE_CLOUDINARY_UPLOAD_PRESET')
    }
  }

  /**
   * Base upload URL derived from the cloud name.
   */
  get uploadUrl() {
    this.validate()
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`
  }
}

export const cloudinaryConfig = new CloudinaryConfig()
