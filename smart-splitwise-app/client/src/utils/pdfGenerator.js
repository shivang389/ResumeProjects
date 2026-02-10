import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateExpenseReport = (groupName, expenses) => {
  const doc = new jsPDF();

  // 1. Header Section
  doc.setFillColor(15, 15, 26); // Dark Background
  doc.rect(0, 0, 210, 40, 'F'); // Draw Header Box

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(groupName || "Expense Report", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text("SmartSplitWise AI", 160, 30);

  // 2. Summary Cards (Total Spent)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("Summary", 14, 50);

  // Draw a simple box for total
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 55, 60, 25, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Total Expenses", 20, 65);
  
  doc.setFontSize(16);
  doc.setTextColor(34, 197, 94); // Green Color
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  doc.text(`Rs. ${total.toLocaleString()}`, 20, 75);

  // 3. Expense Table
  const tableColumn = ["Date", "Description", "Category", "Paid By", "Amount"];
  const tableRows = [];

  expenses.forEach(exp => {
    const expenseData = [
      new Date(exp.date).toLocaleDateString(),
      exp.description,
      exp.category,
      exp.paidBy?.name || "Me",
      `Rs. ${exp.amount}`
    ];
    tableRows.push(expenseData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: 'grid',
    headStyles: { fillColor: [109, 40, 217] }, // Purple Header
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // 4. Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("End of Report", 14, finalY);

  // 5. Save
  doc.save(`${groupName}_Report_${new Date().toISOString().slice(0,10)}.pdf`);
};