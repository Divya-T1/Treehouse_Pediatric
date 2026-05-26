import { GetActivities, GetChoiceBoard } from './ActivitiesSaver.js';

const { jsPDF } = require("jspdf");

const loadImageAsBase64 = (imgSrc) => {
  return new Promise((resolve, reject) => {
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
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (err) => {
      console.error('Image load error for:', imgSrc, err);
      reject(err);
    };

    if (typeof imgSrc === 'string' && imgSrc.startsWith('file://')) {
      fetch(imgSrc)
        .then(response => response.blob())
        .then(blob => { img.src = URL.createObjectURL(blob); })
        .catch(err => reject(err));
    } else {
      img.src = imgSrc;
    }
  });
};

const createPDF = async () => {
  const activities = await GetActivities();
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Activity Schedule", 105, 20, { align: 'center' });

  let yPos = 40;
  const pageHeight = doc.internal.pageSize.height;
  const iconSize = 13.5;

  if (activities.length === 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("No activities selected yet.", 20, yPos);
  } else {
    for (let index = 0; index < activities.length; index++) {
      const activity = activities[index];

      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Activity ${index + 1}: ${activity.name}`, 20, yPos);
      yPos += 10;

      const iconSource = typeof activity.icon === 'string' ? activity.icon : activity.icon?.uri;

      if (iconSource) {
        try {
          const base64Image = await loadImageAsBase64(iconSource);
          doc.setFillColor(232, 202, 202);
          doc.circle(35, yPos + 6, 10, 'F');
          doc.addImage(base64Image, 'PNG', 28, yPos, iconSize, iconSize);
        } catch (error) {
          console.warn(`Failed to load icon for activity ${index + 1}:`, error);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('[Icon]', 30, yPos + 10);
        }
      }

      if (activity.notes && activity.notes.trim() !== '') {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(activity.notes, 135);
        doc.text(splitNotes, 55, yPos + 8);
        yPos += iconSize + Math.max(0, (splitNotes.length - 1) * 6);
      } else {
        yPos += iconSize;
      }

      yPos += 10;
    }
  }

  await sharePDF(doc, "activity_schedule.pdf");
};

const createChoiceBoardPDF = async () => {
  const activities = await GetChoiceBoard();
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("Choice Board", 105, 20, { align: 'center' });

  const choiceBoardActivities = activities.slice(0, 3);

  if (choiceBoardActivities.length === 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("No activities selected for choice board.", 105, 50, { align: 'center' });
  } else {
    const iconSize = 25;
    const circleRadius = 20;
    const spacing = 60;
    const startX = 105 - ((choiceBoardActivities.length - 1) * spacing / 2);
    const yPos = 60;

    for (let index = 0; index < choiceBoardActivities.length; index++) {
      const activity = choiceBoardActivities[index];
      const xPos = startX + (index * spacing);

      doc.setFillColor(232, 202, 202);
      doc.circle(xPos, yPos, circleRadius, 'F');

      const iconSource = typeof activity.icon === 'string' ? activity.icon : activity.icon?.uri;

      if (iconSource) {
        try {
          const base64Image = await loadImageAsBase64(iconSource);
          doc.addImage(base64Image, 'PNG', xPos - (iconSize / 2), yPos - (iconSize / 2), iconSize, iconSize);
        } catch (error) {
          console.warn(`Failed to load icon for choice board activity ${index + 1}:`, error);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('[Icon]', xPos, yPos, { align: 'center' });
        }
      }

      if (activity.name) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const splitName = doc.splitTextToSize(activity.name, spacing - 5);
        doc.text(splitName, xPos, yPos + circleRadius + 10, { align: 'center' });
      }

      if (activity.notes && activity.notes.trim() !== '') {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(activity.notes, spacing - 5);
        doc.text(splitNotes, xPos, yPos + circleRadius + 20, { align: 'center' });
      }
    }
  }

  await sharePDF(doc, "choice_board.pdf");
};

const sharePDF = async (doc, filename) => {
  try {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Activity Schedule' });
    } else {
      doc.save(filename);
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    doc.save(filename);
  }
};

export { createPDF, createChoiceBoardPDF };
