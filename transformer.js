const fs = require('fs');
const csv = require('csv-parser');

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
          company: item.CompanyName,
          address: item.Address,
          mag: Math.floor(Math.random() * 12) + 1,
        },
        type: 'Feature'
      }
    ));
    geoJsonObj.features = features;
    fs.writeFileSync('points.geojson', JSON.stringify(geoJsonObj, null, 2));
  })


