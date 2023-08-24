const sendUsers = (req, res) => {
  const users = [...req.app.users];
  res.json(users);
};

module.exports = { sendUsers };
