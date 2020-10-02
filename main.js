const axios = require('axios');
const cheerio = require ('cheerio');
const fs = require('fs');
const csvWriter = require('csv-write-stream');

const writer = csvWriter({
  headers: [
    'Company Name',
    'Address',
    'Telephone Number',
    'Other Data',
    'Commodity',
    'Business Field',
  ]
});

const DEFAULT_AXIOS_PARAMS = {
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
  },
};

const KEMENPERIN_EXPORTER_URL = 'https://kemenperin.go.id/direktori-eksportir';
const PROVINCE = 31 // DKI Jakarta

writer.pipe(fs.createWriteStream('./crawled-data/bangka-belitung.csv'));

async function crawl(page = 1) {
  console.log(`[Fetching] page = ${page}`);
  const data = await axios.get(KEMENPERIN_EXPORTER_URL, {
    ...DEFAULT_AXIOS_PARAMS,
    ...{
      params: {
        what: ' ',
        prov: PROVINCE,
        hal: page,
      },
    }
  });

  extractData(data.data, page);
}

function removeNewLine(text) {
  return text.split('\n').map(str => str.trim()).join();
}

function extractData(htmlString, currentPage) {
  console.log(`[Extracting] page = ${currentPage}`);
  const $ = cheerio.load(htmlString);
  const rowResults = $('table#newspaper-a tbody tr');

  if (rowResults.find('td').length === 1) {
    return writer.end();
  }

  rowResults.map((idx, rowItem) => {
    const commodity = removeNewLine($(rowItem).find('td').eq(2).text());
    const field = removeNewLine($(rowItem).find('td').eq(3).text());

    const companyCell = $(rowItem).find('td').eq(1);
    const companyData = companyCell.html().split('<br>');
    const companyName = $(companyData[0]).text();
    const address = removeNewLine(companyData[1]);
    const telephoneNumber = `${companyData[2].toLowerCase().replace('telp.', '').trim()}`;
    const otherData = $(`<p>${removeNewLine(companyData.slice(3).join(' '))}</p>`).text();

    writer.write([
      companyName,
      address,
      telephoneNumber,
      otherData,
      commodity,
      field,
    ])
  });

  return crawl(currentPage + 1);
}

crawl(1);
