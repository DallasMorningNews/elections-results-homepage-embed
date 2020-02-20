export default function (raceData, questionChoices) {
  return new Promise((resolve, reject) => {
    // filter our races down to just ballot races
    const ballotRaces = raceData.filter(race => race.ballotMeasure);
    // fetch the results for each ballot race
    const ballotFetches = ballotRaces.map((race) => {
      return fetch(`https://s3.amazonaws.com/elections.dallasnews.com${race.url}`)
        .then(response => response.json())
        .then((data) => {
          // assign the results to the race object
          Object.assign(race, data);
          // iterate over candidate totals for each race, assigning them to race object candidates value
          data.candidateTotals.forEach((choice) => {
            const choiceId = choice.candidateId;
            const choiceDetails = questionChoices.find(answer => answer.id === choiceId);

            if (race.candidates) {
              race.candidates.push(choiceDetails);
            } else {
              race.candidates = [];
              race.candidates.push(choiceDetails);
            }
          });
        });
    });

    // once we've found the results to all of the ballot races, fold those ballot prop races
    // back into the over all race data, and return that data
    Promise.all(ballotFetches).then(() => {
      // iterate over the race data, if it's a ballot measure, find the race in the ballotRaces data
      // and assign that object to the correspoinding race object in raceData
      raceData.forEach((race) => {
        if (race.ballotMeasure) {
          const targetBallotRace = ballotRaces.find(target => target.id === race.id);
          if (!targetBallotRace) {
            reject(Error('Could not find ballot race'));
          } else {
            Object.assign(race, targetBallotRace);
          }
        }
      });
      // once this has been done, resolve the promise
      resolve(raceData);
    });
  });
}
