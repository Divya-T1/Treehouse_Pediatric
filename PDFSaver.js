import { jsPDF } from "jspdf";
import { GetActivities, SaveActivities } from './ActivitiesSaver.js';

// Helper function to load image as base64
const loadImageAsBase64 = (imageSource) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    // Convert require() source to URL if needed
    const imgSrc = typeof imageSource === 'string' ? imageSource : imageSource.uri || imageSource;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = reject;
    img.src = imgSrc;
  });
};

const createPDF = async (iconMap = {}) => {


  var activities = await GetActivities();
  console.log(activities);

  // Create a new document for each PDF generation
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text("Activity Schedule", 105, 20, { align: 'center' });

  // Starting Y position for activities
  let yPos = 40;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;
  const iconSize = 13.5; // Size of icon in PDF (mm)

  if (activities.length === 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("No activities selected yet.", 20, yPos);
  } else {
    for (let index = 0; index < activities.length; index++) {
      const activity = activities[index];

      // Check if we need a new page
      if (yPos > pageHeight - marginBottom - 50) {
        doc.addPage();
        yPos = 20;
      }

      // Activity number label
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Activity ${index + 1}:`, 20, yPos);
      yPos += 10;

      // Try to add the icon image
      const iconSource = iconMap[activity.filePath];
      if (iconSource) {
        try {
          const base64Image = await loadImageAsBase64(iconSource);
          // Draw circular background (simulated with a square)
          doc.setFillColor(232, 202, 202); // #E8CACA
          doc.circle(35, yPos + 6, 10, 'F');
          // Add image on top
          doc.addImage(base64Image, 'PNG', 28, yPos, iconSize, iconSize);
        } catch (error) {
          console.warn(`Failed to load icon for ${activity.filePath}:`, error);
          // Fallback: just show activity name
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text('[Icon]', 30, yPos + 10);
        }
      }

      // Notes to the right of icon
      if (activity.notes && activity.notes.trim() !== '') {
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const splitNotes = doc.splitTextToSize(activity.notes, 135);
        doc.text(splitNotes, 55, yPos + 8);
        yPos += iconSize + Math.max(0, (splitNotes.length - 1) * 6);
      } else {
        yPos += iconSize;
      }

      // Add spacing between activities
      yPos += 10;
    }
  }

  doc.save("activity_schedule.pdf");
};

export { createPDF };
