exports.paymayaSuccess = (req, res) => {
  console.log("BODY: ", req.body);
  console.log("PARAMS: ", req.params);
  console.log("QUERY: ", req.query);
  res.json({ success: "true" });
};
