import { Prospect } from "../types";

export const downloadCSV = (data: Prospect[], filename: string = 'prospects.csv') => {
  if (!data || data.length === 0) return;

  const headers = ["Name", "Phone Number", "Company", "Email", "Address"];
  
  // Map internal keys to the order of headers
  const mapRow = (p: Prospect) => [
    p.Name,
    p.PhoneNumber,
    p.Company,
    p.Email,
    p.Address
  ];

  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      mapRow(row).map(field => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringField = String(field || '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};