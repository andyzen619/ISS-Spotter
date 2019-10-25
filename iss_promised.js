const request = require('request-promise-native')


/**
 * Promise implementation instead of call back implementation,
 */
const fetchMyIp = function() {

  return new Promise((resolve, reject) => {
    const url = "https://api.ipify.org/?format=json";

    request.get(url, (err, req, body) => {

      if (req.statusCode !== 200) {
        const message = `Error when fetching IP address, Status code: ${req.statusCode}`;
        reject(Error(message));
      } else {
        const jsonObj = JSON.parse(body);
        const ip = jsonObj.ip;
        resolve(ip);
      }
    });
  });
}

/**
 * Fetch coordiants base on URL, promise edition
 * @param {string} ip 
 * @param {*} callback 
 */
const fetchCoordsByIP = function(ip) {
  const baseUrl = 'https://ipvigilante.com/';
  const query = baseUrl + ip;

  return new Promise((resolve, reject) => {
    request(query, (err, req, body) => {
      if (req.statusCode !== 200) {
        const message = `Error when fetching coordinates, Status code: ${req.statusCode}`;
        reject(Error(message));
      } else {
        resolve(body);
      }
    });

  });
};

const fetchISSFlyOverTimes = function(coords) {
  const baseUrl = 'http://api.open-notify.org/iss-pass.json?';
  const badUrl = 'http://api.open-notify.org/';
  const long = "lon=" + coords.data.longitude;
  const lat = "lat=" + coords.data.latitude;
  const query = `${baseUrl}${lat}&${long}`;
  return new Promise((resolve, reject) => {
    request(query, (err, req, body) => {

      if (req.statusCode !== 200) {
        const message = `There was an error, status code: ${req.statusCode}`;
        reject(Error(message));
      } else {
        const jsonObject = JSON.parse(body);
        const flyOverTimes = jsonObject.response;
        resolve(flyOverTimes);
      }
    });
  });
}

const nextISSTimesForMyLocation = function() {

  let ip = fetchMyIp();
  ip.then((ip) => {
      fetchCoordsByIP(ip).then((coords) => {
        const coordsJson = JSON.parse(coords);
        fetchISSFlyOverTimes(coordsJson).then((flyOverTimes) => {

          for (times of flyOverTimes) {
            const duration = times.duration;
            const risetime = new Date(times.risetime * 1000);
            const date = risetime.toDateString();
            console.log(`Next pass is ${date} for ${duration} seconds!`);
          }

        })
      }, (rejected) => {
        console.log(`There was an error: ${rejected}`);
      });
    },
    (rejected) => {
      console.log(`There was an error: ${rejected}`);
    });
}

module.exports = { nextISSTimesForMyLocation };