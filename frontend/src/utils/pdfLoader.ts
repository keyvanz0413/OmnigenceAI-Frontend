import * as pdfjs from 'pdfjs-dist';

// Point to the worker on a CDN for easy setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const convertPdfToImage = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1); // Usually we only need the first page for templates

  const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better AI recognition
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Could not create canvas context');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  } as any).promise;

  return canvas.toDataURL('image/png');
};
