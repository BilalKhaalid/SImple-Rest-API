const express = require("express");
const app = express();
const PORT = 5000;
const fs = require("node:fs");
const users = require("./MOCK_DATA.json");

// ! Middleware Plugin
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(express.json());

//* Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ! Get all users
app.get("/api/users", (req, res) => {
  return res.json(users);
});

app.post("/api/users/", (req, res) => {
  const body = req.body;
  users.push({ id: users.length + 1, ...body });
  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
    if (err) {
      console.log(err);
    } else {
      return res.send({ status: "success", id: users.length });
    }
  });
});

// ! Get user by their id
app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    return res.json(user);
  })
  .patch((req, res) => {
    const userId = req.params.id;
    const updates = req.body;
    console.log("User ID: ", userId);

    // Find the user in the array by their ID
    const userToUpdate = users.find((user) => user.id == userId);
    console.log("User to Update:", userToUpdate);
    if (!userToUpdate) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    // Override the existing fields with the new values
    Object.keys(updates).forEach((key) => {
      if (userToUpdate.hasOwnProperty(key)) {
        userToUpdate[key] = updates[key];
      }
    });

    // Write the updated array back to the file
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to write data to file" });
      } else {
        return res.json({ status: "success", user: userToUpdate });
      }
    });
  })
  .delete((req, res) => {
    const userId = Number(req.params.id); //* Convert userId to a number
    console.log("Deleting user with ID:", userId);

    //? Find the index of the user in the array by their ID
    const userIndex = users.findIndex((user) => user.id === userId);
    console.log(userIndex);
    if (userIndex === -1) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    //? Remove the user from the array
    const deletedUser = users.splice(userIndex, 1)[0];

    //? Write the updated array back to the file
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status: "error", message: "Failed to write data to file" });
      } else {
        return res.json({ status: "success", deletedUser });
      }
    });
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
