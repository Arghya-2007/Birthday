/**
 * Draw an ImageBitmap to a canvas with object-fit: cover behavior.
 * Centers the image and scales it to fully cover the canvas, cropping overflow.
 * Clears the canvas before drawing.
 * 
 * Only call when the frame actually changes — not on a RAF loop.
 */
export function drawFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  frame: ImageBitmap,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Clear before drawing
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const imgWidth = frame.width
  const imgHeight = frame.height

  // object-fit: cover — scale to fill, crop overflow
  const scaleX = canvasWidth / imgWidth
  const scaleY = canvasHeight / imgHeight
  const scale = Math.max(scaleX, scaleY)

  const scaledWidth = imgWidth * scale
  const scaledHeight = imgHeight * scale

  // Center the image
  const offsetX = (canvasWidth - scaledWidth) / 2
  const offsetY = (canvasHeight - scaledHeight) / 2

  ctx.drawImage(frame, offsetX, offsetY, scaledWidth, scaledHeight)
}
