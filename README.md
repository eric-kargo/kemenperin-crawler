# SME Crawler

Welcome to git repository for SME crawler project. For historical reason, it is called
Kemenperin crawler instead of SME crawler. Now it can crawl multiple websites. Supported
websites are listed in [this google sheet](https://docs.google.com/spreadsheets/d/1K6fTEbXD2mxuw7OlV7sMMkPwWCpLooOhYJBCDhUt55I/edit?usp=sharing).
The statistics for each site can be seen on [the same sheet](https://docs.google.com/spreadsheets/d/1K6fTEbXD2mxuw7OlV7sMMkPwWCpLooOhYJBCDhUt55I/edit?usp=sharing).

# Crawling Result

The result of crawling Kemenperin site is stored in `crawled-data` directory. While
the result of crawling from other sites are stored in `crawled-data-1`.

# kemenperin-crawler
Exporter Crawler for Kemenperin Site. Built using NodeJS with axios + cheerio.

## Prerequisites

* NodeJS version >= 8

## Preparation

```sh
$ npm install
```

## Generating data

### Crawl raw data into csv

```sh
$ npm start
```

Data will be generated at `data.csv`

## Generating Heatmap

These two process are used to generate the data to produce heatmap.

### Get lattitude and longitude from address

```sh
$ node geocoder.js
```

### Write .geojson file from lat and long

```sh
$ node transformer.js
```

# Indonetwork Crawler

The sourcecode of Indonetwork crawler are included in `scrapy_indonetwork` directory.

# Telpon Info Crawler

Telpon info crawler are contained in `telponinfo.js`, to run it use 

```sh
$ npm run telpon
```

# Analytics

To have more visibility on the result of the crawling, you can use the `analytics.js`
to analyze the CSVs. It simply count the number of data for each CSVs from the crawling
result. To run it, use the following command:

```sh
$ npm run analytics
```
