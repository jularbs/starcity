const html_to_pdf = require("html-pdf-node");

exports.download = async (req, res) => {
  const { salt, refId, ticketId } = req.params;
  let options = { format: "A4" };

  let file = {
    url: `https://starcity-website.herokuapp.com/accesspass?s=${salt}&r=${refId}&t=${ticketId}`,
  };

  let buffer = await html_to_pdf.generatePdf(file, options);

  // res.setHeader(`Content-Disposition", "attachment; filename=${ticketId}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
};
