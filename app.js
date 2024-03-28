const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

const usersFilePath = path.join(__dirname, 'users.json');

fs.access(usersFilePath)
  .then(() => console.log('users.json file exists'))
  .catch(async () => {
    console.log('users.json file does not exist. Creating...');
    await fs.writeFile(usersFilePath, '[]');
    console.log('users.json file created successfully');
  });

const fetchUsers = async () => {
  const usersJson = await fs.readFile(usersFilePath);
  return JSON.parse(usersJson);
};

const updateUsers = async (users) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    const users = await fetchUsers();
    users.push(newUser);
    await updateUsers(users)
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const users = await fetchUsers();
    const userId = req.params.id;
    const user = users.find(user => user.id == userId);
    if (!user) {
      res.status(404).send('User not found');
    } else {
      res.json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const users = await fetchUsers();
    const userId = req.params.id;
    const updateUser = req.body;
    const index = users.findIndex(user => user.id == userId);
    if (index === -1) {
      res.status(404).send('User not found');
    } else {
      users[index].name = updateUser?.name;
      await updateUsers(users)
      res.json(users[index]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const users = await fetchUsers();
    const userId = req.params.id;
    const index = users.findIndex(user => user.id == userId);
    if (index === -1) {
      res.status(404).send('User not found');
    } else {
      const deletedUser = users.splice(index, 1);
      await updateUsers(users)
      res.json(deletedUser);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
