const fs = require('fs');
const csv = require('csv-parser');
const csvWriter = require('csv-write-stream');

const writer = csvWriter({
  headers: [
    'Company Name',
    'Address',
  ]
});

function getAddressWithLatLng() {
  const res = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('address.csv')
      .pipe(csv())
      .on('data', (data) => res.push(data))
      .on('end', () => {
        resolve(res.map(item => item.Address));
      });
  });
}

function getFullAddress() {
  const res = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('data.csv')
      .pipe(csv())
      .on('data', (data) => res.push(data))
      .on('end', () => {
        resolve(res.map(item => ({address: item.Address, company: item["Company Name"]})));
      });
  })
}

async function getDistinct() {
  const addressWithLatLng = await getAddressWithLatLng();
  const addressWithoutLatLng = await getFullAddress();

  writer.pipe(fs.createWriteStream('dirty.csv'));
  addressWithoutLatLng.forEach(item => {
    if (!addressWithLatLng.includes(item.address)) {
      writer.write([
        item.company,
        item.address,
      ])
    }
  });
  writer.end();

  console.log(addressWithLatLng.length, addressWithoutLatLng.length);
}

function writeGeoJson() {
  const results = [];
  fs.createReadStream('address.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const geoJsonObj = {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
          }
        },
      };
      const features = results.map(item => (
        {
          geometry: {
            coordinates: [Number(item.Lattitude), Number(item.Longitude)],
            type: 'Point',
          },
          properties: {
            company: item["Company Name"],
            address: item.Address,
            mag: Math.floor(Math.random() * 3) + 1,
          },
          type: 'Feature'
        }
      ));
      geoJsonObj.features = features;
      fs.writeFileSync('points.geojson', JSON.stringify(geoJsonObj, null, 2));
    })
}

writeGeoJson();
