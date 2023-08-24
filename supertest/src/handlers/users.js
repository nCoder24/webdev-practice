const sendUsers = (req, res) => {
  const users = [...req.app.users];
  res.json(users);
};

const addUser = (req, res) => {
  const users = req.app.users;
  
  users.add(req.body.username);
  res.status(201).end();
}

module.exports = { sendUsers, addUser };
