const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  const url = "https://api.ipify.org/?format=json";

  request.get(url, (err, req, body) => {

    if (req.statusCode !== 200) {
      const message = `Error when fetching IP address, Status code: ${req.statusCode}, response: ${body}`;

      callback(Error(message), null);
    }

    const jsonObj = JSON.parse(body);
    const ip = jsonObj.ip;

    callback(null, ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  const baseUrl = 'https://ipvigilante.com/';
  const query = baseUrl + ip;
  request(query, (err, req, body) => {
    if (req.statusCode !== 200) {
      const message = `Error when fetching coordinates, Status code: ${req.statusCode}, response: ${body}`;
      callback(Error(message), null);
    } else {
      callback(null, body);
    }
  });
};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {
  const baseUrl = 'http://api.open-notify.org/iss-pass.json?';
  const long = "lon=" + coords.data.longitude;
  const lat = "lat=" + coords.data.latitude;
  const query = `${baseUrl}${lat}&${long}`;

  request(query, (err, req, body) => {
    const jsonObject = JSON.parse(body);
    const message = jsonObject.message + " Reason: " + jsonObject.reason;
    const flyOverTimes = jsonObject.response;
    if (req.statusCode !== 200) {
      callback(Error(message), null);
    } else {
      callback(null, flyOverTimes);
    }
  });
}

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  // empty for now

  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work!", error);
      return;
    }

    fetchCoordsByIP(ip, (error, data) => {
      if (!error) {
        const jsonObject = JSON.parse(data);

        fetchISSFlyOverTimes(jsonObject, (error, data) => {
          if (error === null) {
            //print fly over times ere
            // console.log("\n\nSpace station fly over times are: \n\n")
            // console.log(data);
            callback(null, data);
          }
          //Handle errors here
          // console.log(`It didn't work! \n${error}`);
          else {
            const errorMessage = `It didn't work! \n${error}`;
            callback(errorMessage, null);
          }
        });
      } else {
        callback(error, null);
      }
    });
  });
}

module.exports = { nextISSTimesForMyLocation };