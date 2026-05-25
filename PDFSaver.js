// Fallback — platform-specific files (PDFSaver.web.js / PDFSaver.native.js)
// should be resolved by Metro before this file is reached.
import { Alert } from 'react-native';

const createPDF = async () => {
  Alert.alert('Not Available', 'PDF export is not supported on this platform.', [{ text: 'OK' }]);
};

const createChoiceBoardPDF = async () => {
  Alert.alert('Not Available', 'PDF export is not supported on this platform.', [{ text: 'OK' }]);
};

export { createPDF, createChoiceBoardPDF };
