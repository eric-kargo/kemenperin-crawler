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

### Get lattitude and longitude from address

```sh
$ node geocoder.js
```

### Write .geojson file from lat and long

```
$ node transformer.js
```
