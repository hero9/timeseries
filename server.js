const Influx = require("influx");
const express = require("express");
const http = require("http");
const os = require("os");
const path = require('path');

const app = express();

const influx = new Influx.InfluxDB({
  database: "Labview",
  host: "80.241.40.230",
  port: 8086,
  username: "",
  password: "",
  schema: [
    {
      measurement: "unit1",
      fields: {
        engine_pcd: Influx.FieldType.INTEGER
      },
      tags: ["user-X8SIE"]
    }
  ]
});

influx
  .getDatabaseNames()
  .then(() => {
    http.createServer(app).listen(3000, () => {
      console.log("Listening on port 3000");
    });
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
	});
	
app.use(express.static(path.join(__dirname, './build/default')));

app.get("/data", (req, res) => {
  influx
    .query(
      `
	SELECT mean("engine_pcd") AS "y" 
	FROM "Labview"."autogen"."unit1" 
	WHERE time > now() - 1h 
	GROUP BY time(10s) FILL(null)
  `
    )
    .then(result => {
			res.json(result);
    })
    .catch(err => {
      res.status(500).send(err.stack);
    });
});
