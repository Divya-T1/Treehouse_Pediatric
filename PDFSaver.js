import { Alert } from 'react-native';
import { GetActivities, GetChoiceBoard } from './ActivitiesSaver.js';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system/next';

// Convert an image (bundled asset or URI) to base64 data URL
const getImageAsBase64 = async (icon) => {
  try {
    if (!icon) return null;

    // If it's a string URI (custom image from device)
    if (typeof icon === 'string') {
      const file = new File(icon);
      const base64 = await file.base64();
      // Determine mime type from extension
      const ext = icon.split('.').pop().toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    }

    // If it's a require() result (bundled asset) - returns a number in React Native
    if (typeof icon === 'number' || (typeof icon === 'object' && icon !== null)) {
      const asset = Asset.fromModule(icon);
      await asset.downloadAsync();

      if (asset.localUri) {
        const file = new File(asset.localUri);
        const base64 = await file.base64();
        // Determine mime type from extension
        const ext = (asset.localUri || asset.uri || '').split('.').pop().toLowerCase();
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        return `data:${mimeType};base64,${base64}`;
      }
    }

    return null;
  } catch (error) {
    console.warn('Failed to convert image to base64:', error);
    return null;
  }
};

const createPDF = async () => {
  try {
    const activities = await GetActivities();
    console.log('Activities for PDF:', activities);

    // Pre-load all images as base64
    const imagePromises = activities.map(activity => getImageAsBase64(activity.icon));
    const base64Images = await Promise.all(imagePromises);

    // Build HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #2c3e50;
              font-size: 24px;
              margin-bottom: 30px;
            }
            .activity {
              display: flex;
              align-items: flex-start;
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 10px;
            }
            .activity-number {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 5px;
              color: #2c3e50;
            }
            .activity-icon {
              width: 70px;
              height: 70px;
              margin-right: 15px;
              flex-shrink: 0;
              position: relative;
            }
            .activity-icon svg {
              position: absolute;
              top: 0;
              left: 0;
            }
            .activity-icon img {
              width: 45px;
              height: 45px;
              object-fit: contain;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .activity-content {
              flex: 1;
            }
            .activity-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .activity-notes {
              font-size: 12px;
              color: #666;
              line-height: 1.4;
            }
            .empty-message {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 50px;
            }
          </style>
        </head>
        <body>
          <h1>Activity Schedule</h1>
    `;

    if (activities.length === 0) {
      htmlContent += `<p class="empty-message">No activities selected yet.</p>`;
    } else {
      activities.forEach((activity, index) => {
        const base64Image = base64Images[index];
        htmlContent += `
          <div class="activity">
            <div class="activity-icon">
              <svg width="70" height="70"><circle cx="35" cy="35" r="35" fill="#E8CACA"/></svg>
              ${base64Image ? `<img src="${base64Image}" />` : ''}
            </div>
            <div class="activity-content">
              <div class="activity-number">Activity ${index + 1}: ${activity.name || 'Unnamed Activity'}</div>
              ${activity.notes && activity.notes.trim() !== ''
                ? `<div class="activity-notes">${activity.notes}</div>`
                : ''}
            </div>
          </div>
        `;
      });
    }

    htmlContent += `
        </body>
      </html>
    `;

    // Create PDF using expo-print
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });
    console.log('PDF created at:', uri);

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Activity Schedule',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert(
        'PDF Created',
        `PDF saved to: ${uri}`,
        [{ text: 'OK' }]
      );
    }

  } catch (error) {
    console.error('Error creating PDF:', error);
    Alert.alert(
      'Error',
      'Failed to create PDF. Please try again.',
      [{ text: 'OK' }]
    );
  }
};

const createChoiceBoardPDF = async () => {
  try {
    const activities = await GetChoiceBoard();
    console.log('Choice Board Activities for PDF:', activities);

    // Choice boards typically show only the first 3 activities
    const choiceBoardActivities = activities.slice(0, 3);

    // Pre-load all images as base64
    const imagePromises = choiceBoardActivities.map(activity => getImageAsBase64(activity.icon));
    const base64Images = await Promise.all(imagePromises);

    // Build HTML content for the choice board PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #2c3e50;
              font-size: 24px;
              margin-bottom: 40px;
            }
            .choice-board {
              display: flex;
              justify-content: center;
              gap: 30px;
              flex-wrap: wrap;
            }
            .choice-item {
              text-align: center;
              width: 120px;
            }
            .choice-icon {
              width: 100px;
              height: 100px;
              margin: 0 auto 10px auto;
              position: relative;
            }
            .choice-icon svg {
              position: absolute;
              top: 0;
              left: 0;
            }
            .choice-icon img {
              width: 65px;
              height: 65px;
              object-fit: contain;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .choice-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
              color: #2c3e50;
            }
            .choice-notes {
              font-size: 11px;
              color: #666;
              line-height: 1.3;
            }
            .empty-message {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 50px;
            }
          </style>
        </head>
        <body>
          <h1>Choice Board</h1>
    `;

    if (choiceBoardActivities.length === 0) {
      htmlContent += `<p class="empty-message">No activities selected for choice board.</p>`;
    } else {
      htmlContent += `<div class="choice-board">`;
      choiceBoardActivities.forEach((activity, index) => {
        const base64Image = base64Images[index];
        htmlContent += `
          <div class="choice-item">
            <div class="choice-icon">
              <svg width="100" height="100"><circle cx="50" cy="50" r="50" fill="#E8CACA"/></svg>
              ${base64Image ? `<img src="${base64Image}" />` : ''}
            </div>
            <div class="choice-name">${activity.name || 'Unnamed Activity'}</div>
            ${activity.notes && activity.notes.trim() !== ''
              ? `<div class="choice-notes">${activity.notes}</div>`
              : ''}
          </div>
        `;
      });
      htmlContent += `</div>`;
    }

    htmlContent += `
        </body>
      </html>
    `;

    // Create PDF using expo-print
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });
    console.log('Choice Board PDF created at:', uri);

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Choice Board',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert(
        'PDF Created',
        `PDF saved to: ${uri}`,
        [{ text: 'OK' }]
      );
    }

  } catch (error) {
    console.error('Error creating Choice Board PDF:', error);
    Alert.alert(
      'Error',
      'Failed to create PDF. Please try again.',
      [{ text: 'OK' }]
    );
  }
};

export { createPDF, createChoiceBoardPDF };
