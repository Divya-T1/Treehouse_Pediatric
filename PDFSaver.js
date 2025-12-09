import { jsPDF } from "jspdf";
import { GetActivities, SaveActivities } from './ActivitiesSaver.js';



const isAbsoluteURI = (path) => {
    return path.startsWith('file://') ||
           path.startsWith('http://') ||
           path.startsWith('https://') ||
           path.startsWith('content://') || 
           path.startsWith('blob:');
};

const getImageSource = (filePath, iconMap) => {
  if (iconMap[filePath]) {
    // For built-in activities, we need to resolve the require() to an actual URL
    // In web environment, webpack/metro bundler resolves these to URLs
    const requireResult = iconMap[filePath];

    // Check if it's already a URL string (bundler may have resolved it)
    if (typeof requireResult === 'string') {
      return requireResult;
    }

    // If it's a number/object, try to get the URI property (some bundlers use this)
    if (requireResult && typeof requireResult === 'object' && requireResult.uri) {
      return requireResult.uri;
    }

    // Fallback: try to use it directly (might work in some bundler configs)
    return requireResult;
  } else if (isAbsoluteURI(filePath)) {
    // For custom activities, extract the actual path from the file:// URI
    return filePath;
  } else {
    return null; // or a default image
  }
};

// Helper function to load image as base64
const loadImageAsBase64 = (imgSrc) => {
  return new Promise((resolve, reject) => {
    // Handle different image source types
    if (!imgSrc) {
      reject(new Error('No image source provided'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

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

    img.onerror = (err) => {
      console.error('Image load error for:', imgSrc, err);
      reject(err);
    };

    // Convert file:// URIs to blob URLs for local files (if possible)
    // Note: file:// URIs are blocked by browsers for security reasons
    if (typeof imgSrc === 'string' && imgSrc.startsWith('file://')) {
      // Try to load via fetch and convert to blob URL
      fetch(imgSrc)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          img.src = blobUrl;
        })
        .catch(err => {
          console.error('Failed to load file:// URI:', err);
          reject(err);
        });
    } else {
      // For regular URLs and bundled assets
      img.src = imgSrc;
    }
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

      const iconSource = getImageSource(activity.filePath, iconMap);

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
