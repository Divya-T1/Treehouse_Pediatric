import { jsPDF } from "jspdf";

// Default export is a4 paper, portrait, using millimeters for units
const doc = new jsPDF();

const createPDF = (text) => {
    doc.text(text, 10, 10);
    doc.save("notes.pdf");
}

export{createPDF};
