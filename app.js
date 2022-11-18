const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// GET API

app.get("/players/", async (request, response) => {
  const dbQuery = `
    SELECT
    *
    FROM
    cricket_team;`;
  const playerArray = await db.all(dbQuery);
  let dataBase = [];
  for (let object of playerArray) {
    const dbObject = {
      playerId: object.player_id,
      playerName: object.player_name,
      jerseyNumber: object.jersey_number,
      role: object.role,
    };
    dataBase.push(dbObject);
  }
  response.send(dataBase);
});

//POST API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetails = `
  INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayerDetails);
  const player_id = dbResponse.lastID;
  await response.send("Player Added to Team");
});

// GET player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT 
    *
    FROM
    cricket_team
    WHERE
    player_id=${playerId};`;
  const dbArray = await db.get(playerQuery);
  const dbObject = {
    playerId: dbArray.player_id,
    playerName: dbArray.player_name,
    jerseyNumber: dbArray.jersey_number,
    role: dbArray.role,
  };
  await response.send(dbObject);
});

// PUT API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerdetails = request.body;
  const { playerName, jerseyNumber, role } = playerdetails;

  const dbQuery = `
    UPDATE
     cricket_team
    SET
     player_name='${playerName}',
     jersey_number=${jerseyNumber},
     role='${role}'
    WHERE
    player_id=${playerId};`;
  await db.run(dbQuery);
  response.send("Player Details Updated");
});

// DELETE API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteplayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deleteplayerQuery);
  response.send("Player Removed");
});

module.exports = app;
