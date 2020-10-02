const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const { pRateLimit } = require('p-ratelimit');

const ACCESS_TOKEN = '';

const writer = csvWriter({
  headers: [
    'Company Name',
    'Address',
    'Lattitude',
    'Longitude',
  ]
});

const rateLimit = pRateLimit({
  interval: 1000, // 1000 ms == 1 second
  rate: 10, // 30 API calls per interval
  concurrency: 1, // no more than 10 running at once
});

writer.pipe(fs.createWriteStream('address.csv'));

function readData() {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => reject(error));
  })
};

async function getLatLngFromAddress({address, companyName} = {}) {
  try {
    console.log('fetching', address);
    const encodedUri = encodeURIComponent(address);
    const data = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedUri}.json`, {
      params: {
        access_token: ACCESS_TOKEN,
      },
    });
    const center = data.data.features[0].center;
    writer.write([
      companyName,
      address,
      center[0],
      center[1],
    ]);
    return center;
  } catch (error) {
    console.error(error)
    return [0, 0]
  }
}

async function generate() {
  const data = await readData();
  const address = data.map(item => ({
    address: item.Address,
    companyName: item["Company Name"],
  }));

  const latLngFetch = address.map(item => {
    return rateLimit(() => getLatLngFromAddress(item));
  });
  await Promise.all(latLngFetch);
  return writer.end();
}

generate();
