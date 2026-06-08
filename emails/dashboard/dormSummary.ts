
export const convertToHTMLTable = (data: any[]) => {
  if (!data || data.length === 0) {
        return "<p>No summary data available for this period.</p>";
      }
  
      // Get headers from the keys of the first object
      const headers = ["title", "value", "description"];
  
      // Start building the HTML table with inline styles for email client compatibility
      let table = `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead>
          <tr>
    `;
  
      // Add table headers
      headers.forEach((header) => {
        table += `<th style="background-color: #4CAF50; color: white; padding: 12px; border: 1px solid #ddd; text-align: left;">${header}</th>`;
      });
  
      table += `
          </tr>
        </thead>
        <tbody>
    `;
  
      // Add table rows
      data.forEach((row, index) => {
        // Style for alternating row colors
        const backgroundColor = index % 2 === 0 ? "#f2f2f2" : "#ffffff";
        table += `<tr style="background-color: ${backgroundColor};">`;
        headers.forEach((header) => {
          table += `<td style="padding: 12px; border: 1px solid #ddd; text-align: left;">${row[header]}</td>`;
        });
        table += `</tr>`;
      });
  
      table += `
        </tbody>
      </table>
    `;
  
      return table;
};

export const generateEmailHtml = (reportTable: string, selected: any) => {
  return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Dormitory Summary Report</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hello everyone,</p>
          <p>Please see below for the latest dormitory summary report. This data provides key insights into our recent performance for this A.Y. ${selected?.academic_year} - ${selected?.semester} Semester.</p>
          <br>
          ${reportTable}
          <br>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Thank you!</p>
          <p><strong>VSU DormPay</strong></p>
        </div>
        <div style="background-color: #f2f2f2; color: #777; padding: 10px; text-align: center; font-size: 12px;">
          <p>This is an automated report. Generated on ${new Date().toLocaleDateString()}.</p>
        </div>
      </div>
    `;
};