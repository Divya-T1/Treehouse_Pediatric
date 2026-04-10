import { Platform, Alert } from 'react-native';
import { GetActivities, GetChoiceBoard, SaveActivities } from './ActivitiesSaver.js';

// Only import jsPDF on web platform
let jsPDF = null;
if (Platform.OS === 'web') {
  const jsPDFModule = require("jspdf");
  jsPDF = jsPDFModule.jsPDF;
}



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

const createPDF = async () => {
  // PDF export only works on web platform
  if (Platform.OS !== 'web') {
    Alert.alert(
      'Not Available',
      'PDF export is only available on the web version of this app.',
      [{ text: 'OK' }]
    );
    return;
  }

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
      doc.text(`Activity ${index + 1}: ${activity.name}`, 20, yPos);
      yPos += 10;

      const iconSource = typeof(activity.icon) === "string" ? activity.icon : activity.icon.uri;

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

  await sharePDF(doc, "activity_schedule.pdf");
};

const createChoiceBoardPDF = async () => {
  // PDF export only works on web platform
  if (Platform.OS !== 'web') {
    Alert.alert(
      'Not Available',
      'PDF export is only available on the web version of this app.',
      [{ text: 'OK' }]
    );
    return;
  }

  var activities = await GetChoiceBoard();
  console.log('Choice Board Activities:', activities);

  // Create a new document for choice board
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text("Choice Board", 105, 20, { align: 'center' });

  // Choice boards typically show only the first 3 activities
  const choiceBoardActivities = activities.slice(0, 3);

  if (choiceBoardActivities.length === 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("No activities selected for choice board.", 105, 50, { align: 'center' });
  } else {
    // Layout activities horizontally in a grid
    const iconSize = 25; // Larger icons for choice board
    const circleSize = 40;
    const spacing = 60; // Space between icons
    const startX = 105 - ((choiceBoardActivities.length - 1) * spacing / 2); // Center the activities
    let yPos = 60;

    for (let index = 0; index < choiceBoardActivities.length; index++) {
      const activity = choiceBoardActivities[index];
      const xPos = startX + (index * spacing);

      // Draw background circle
      doc.setFillColor(232, 202, 202); // #E8CACA
      doc.circle(xPos, yPos, circleSize / 2, 'F');

      const iconSource = typeof(activity.icon) === "string" ? activity.icon : activity.icon.uri;

      if (iconSource) {
        try {
          const base64Image = await loadImageAsBase64(iconSource);
          // Add image centered in circle
          doc.addImage(base64Image, 'PNG', xPos - (iconSize / 2), yPos - (iconSize / 2), iconSize, iconSize);
        } catch (error) {
          console.warn(`Failed to load icon for ${activity.filePath}:`, error);
          // Fallback: show text
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text('[Icon]', xPos, yPos, { align: 'center' });
        }
      }

      // Activity name below icon
      if (activity.name) {
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        const splitName = doc.splitTextToSize(activity.name, spacing - 5);
        doc.text(splitName, xPos, yPos + circleSize / 2 + 10, { align: 'center' });
      }

      // Notes below name (if any)
      if (activity.notes && activity.notes.trim() !== '') {
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const splitNotes = doc.splitTextToSize(activity.notes, spacing - 5);
        doc.text(splitNotes, xPos, yPos + circleSize / 2 + 20, { align: 'center' });
      }
    }
  }

  await sharePDF(doc, "choice_board.pdf");
};

const sharePDF = async (doc, filename) => {
  try {
    // 1. Generate the PDF as an ArrayBuffer (Blob)
    const pdfBlob = doc.output('blob');
    
    // 2. Create a File object from the Blob
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    // 3. Check if the browser supports sharing files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Activity Schedule',
        text: 'Check out my activity schedule!',
      });
      console.log('Success');
    } else {
      console.error('Error sharing PDF:');
      // Fallback for browsers that don't support file sharing (like older desktop)
      doc.save(filename);
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    // Final fallback: attempt a standard save if share fails/is cancelled
    doc.save(filename);
  }
};

export { createPDF, createChoiceBoardPDF };