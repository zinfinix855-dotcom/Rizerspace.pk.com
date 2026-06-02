const cloudinary = require("cloudinary").v2;

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.warn("⚠️ Cloudinary credentials missing. Fallback mock upload simulator active.");
}

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      // Simulate file upload delay and return clean anime-themed placeholders
      setTimeout(() => {
        const mockUrls = [
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500", // Cyber Action Figure
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500", // Neon Mech Model
          "https://images.unsplash.com/photo-1563089145-599997674d42?w=500", // Hologram artwork
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500"  // Cyberpunk design
        ];
        const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
        resolve(randomUrl);
      }, 300);
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "rizerspace" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadToCloudinary };
