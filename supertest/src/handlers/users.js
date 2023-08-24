const sendUsers = (req, res) => {
  const users = [...req.app.users];
  res.json(users);
};

const addUser = (req, res) => {
  const { users } = req.app;
  const { username } = req.body;

  users.add(username);
  res.status(201).end();
};

module.exports = { sendUsers, addUser };
