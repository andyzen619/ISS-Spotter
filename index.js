const { nextISSTimesForMyLocation } = require('./iss');

nextISSTimesForMyLocation((error, passTimes) => {
  if (error) {
    console.log("It didn't work!", error);
    return;
  }

  for (times of passTimes) {
    const duration = times.duration;
    const risetime = new Date(times.risetime * 1000);
    const date = risetime.toDateString();
    console.log(`Next pass is ${date} for ${duration} seconds!`);
  }
});