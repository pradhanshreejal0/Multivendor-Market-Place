import sharp from 'sharp';

export const compressImage = async (buffer, { maxWidth = 1200, maxHeight = 1200, quality = 80 } = {}) => {
  try {
    const compressedBuffer = await sharp(buffer)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true })
      .toBuffer();

    return compressedBuffer;
  } catch (error) {
    console.error('Image compression failed:', error);
    return buffer; // Fallback to original buffer if compression fails
  }
};
