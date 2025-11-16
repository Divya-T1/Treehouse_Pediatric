// PDFSaver.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Saves text as a PDF and optionally opens the share dialog.
 * @param {string} text - The text content to include in the PDF.
 * @returns {Promise<string>} URI of the generated PDF.
 */
export async function saveTextAsPDF(text) {
  try {
    // Basic HTML template
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Helvetica, Arial, sans-serif;
              padding: 20px;
              font-size: 16px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          ${text.replace(/\n/g, "<br/>")}
        </body>
      </html>
    `;

    // Generate PDF file
    const { uri } = await Print.printToFileAsync({ html });

    console.log("PDF generated at:", uri);

    // Open system share/save dialog if available
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

    return uri;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
