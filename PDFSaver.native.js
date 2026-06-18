import { Alert } from 'react-native';
import { GetActivities, GetChoiceBoard } from './ActivitiesSaver.js';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system'; // SDK 54: File promoted from expo-file-system/next

const getImageAsBase64 = async (icon) => {
  try {
    if (!icon) return null;

    if (typeof icon === 'string') {
      if (icon.startsWith('data:')) return icon;
      const file = new File(icon);
      const base64 = await file.base64();
      const ext = icon.split('.').pop().toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    }

    // require() result — a number after JSON round-trip, or object with uri
    if (typeof icon === 'number' || (typeof icon === 'object' && icon !== null)) {
      const asset = Asset.fromModule(icon);
      await asset.downloadAsync();
      if (asset.localUri) {
        const file = new File(asset.localUri);
        const base64 = await file.base64();
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

    const base64Images = await Promise.all(
      activities.map(activity => getImageAsBase64(activity.icon))
    );

    let html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: -apple-system, sans-serif; padding: 20px; color: #333; }
        h1 { text-align: center; color: #2c3e50; font-size: 24px; margin-bottom: 30px; }
        .activity {
          display: flex; align-items: flex-start; margin-bottom: 20px;
          padding: 15px; background-color: #f9f9f9; border-radius: 10px;
        }
        .activity-icon { width: 70px; height: 70px; margin-right: 15px; flex-shrink: 0; position: relative; }
        .activity-icon svg { position: absolute; top: 0; left: 0; }
        .activity-icon img {
          width: 45px; height: 45px; object-fit: contain;
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .activity-content { flex: 1; }
        .activity-number { font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #2c3e50; }
        .activity-notes { font-size: 12px; color: #666; line-height: 1.4; }
        .empty { text-align: center; color: #666; font-size: 14px; margin-top: 50px; }
      </style></head><body>
      <h1>Activity Schedule</h1>
    `;

    if (activities.length === 0) {
      html += `<p class="empty">No activities selected yet.</p>`;
    } else {
      activities.forEach((activity, index) => {
        const img = base64Images[index];
        html += `
          <div class="activity">
            <div class="activity-icon">
              <svg width="70" height="70"><circle cx="35" cy="35" r="35" fill="#E8CACA"/></svg>
              ${img ? `<img src="${img}" />` : ''}
            </div>
            <div class="activity-content">
              <div class="activity-number">Activity ${index + 1}: ${activity.name || 'Unnamed Activity'}</div>
              ${activity.notes?.trim() ? `<div class="activity-notes">${activity.notes}</div>` : ''}
            </div>
          </div>
        `;
      });
    }

    html += `</body></html>`;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await shareFile(uri, 'application/pdf', 'Activity Schedule');
  } catch (error) {
    console.error('Error creating PDF:', error);
    Alert.alert('Error', 'Failed to create PDF. Please try again.', [{ text: 'OK' }]);
  }
};

const createChoiceBoardPDF = async () => {
  try {
    const activities = await GetChoiceBoard();

    const base64Images = await Promise.all(
      activities.map(activity => getImageAsBase64(activity.icon))
    );

    let html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body { font-family: -apple-system, sans-serif; padding: 20px; color: #333; }
        h1 { text-align: center; color: #2c3e50; font-size: 24px; margin-bottom: 40px; }
        .board-row { display: flex; justify-content: center; gap: 30px; margin-bottom: 50px; }
        .page-break { page-break-before: always; padding-top: 20px; }
        .item { text-align: center; width: 120px; }
        .icon { width: 100px; height: 100px; margin: 0 auto 10px; position: relative; }
        .icon svg { position: absolute; top: 0; left: 0; }
        .icon img {
          width: 65px; height: 65px; object-fit: contain;
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .name { font-weight: bold; font-size: 14px; margin-bottom: 5px; color: #2c3e50; }
        .notes { font-size: 11px; color: #666; line-height: 1.3; }
        .empty { text-align: center; color: #666; font-size: 14px; margin-top: 50px; }
      </style></head><body>
      <h1>Choice Board</h1>
    `;

    if (activities.length === 0) {
      html += `<p class="empty">No activities selected for choice board.</p>`;
    } else {
      for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const rowActivities = activities.slice(rowIndex * 3, rowIndex * 3 + 3);
        if (rowActivities.length === 0) break;

        const pageBreakClass = rowIndex === 2 ? ' page-break' : '';
        html += `<div class="board-row${pageBreakClass}">`;
        rowActivities.forEach((activity, i) => {
          const idx = rowIndex * 3 + i;
          const img = base64Images[idx];
          html += `
            <div class="item">
              <div class="icon">
                <svg width="100" height="100"><circle cx="50" cy="50" r="50" fill="#E8CACA"/></svg>
                ${img ? `<img src="${img}" />` : ''}
              </div>
              <div class="name">${activity.name || 'Unnamed Activity'}</div>
              ${activity.notes?.trim() ? `<div class="notes">${activity.notes}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
      }
    }

    html += `</body></html>`;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await shareFile(uri, 'application/pdf', 'Choice Board');
  } catch (error) {
    console.error('Error creating Choice Board PDF:', error);
    Alert.alert('Error', 'Failed to create PDF. Please try again.', [{ text: 'OK' }]);
  }
};

const shareFile = async (uri, mimeType, title) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: title, UTI: 'com.adobe.pdf' });
  } else {
    Alert.alert('PDF Created', `PDF saved to: ${uri}`, [{ text: 'OK' }]);
  }
};

export { createPDF, createChoiceBoardPDF };
