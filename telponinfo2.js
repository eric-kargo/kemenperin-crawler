const axios = require("axios")
const cheerio = require("cheerio")
const csvWriter = require("csv-write-stream")
const fs = require("fs")

const DEFAULT_AXIOS_HEADERS = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36"
}
const PAGINATION_URL_PREFIX = "http://telpon.info/location/jakarta/page-"

let writer = null

function debug(s) {
    console.log(`[DEBUG] ${s}`)
}

function debugObj(o) {
	debug(JSON.stringify(o))
}

/**
get the page URL for a page number.
page number here start from 1
*/
function getPaginationUrl(pageNumber) {
    return PAGINATION_URL_PREFIX + pageNumber + ".html"
}

/**
Scrap the website on a specific page.
To save memory, we will stream the data directly to file.

returns the last page.
*/
async function processPage(paging) {
    const url = getPaginationUrl(paging + 1)
	debug("scraping " + url)
    const data = await axios.get(url, {
		headers: DEFAULT_AXIOS_HEADERS
    })

    return extractData(data.data, paging)
}

/**
Extract data from html string and write to CSV on the process.

Returns the last page.

global variable:
- writer: to write to CSV
*/
function extractData(htmlString, paging) {
    const $ = cheerio.load(htmlString)
    const extractionBlock = $("div.companies-listings")
	
	const dataBlocks = extractionBlock.find("div.company-listing")
	
	/*
	the dataBlocks variable isn't an array. the map function isn't really a map
	but more similar to a forEach.
	*/
	const extractedData = []
	dataBlocks.map((_idx, domDataBlock) => {
		
		// wrap as jQueryable to use find function
		dataBlock = $(domDataBlock)
		
		const companyName = dataBlock.find("div.listing-title a").eq(0).text().trim()
		const description = dataBlock.find("div.listing-text").eq(0).text().trim()
		const address = dataBlock.find("div.detail.address").eq(0).text().trim()
		const locationA = dataBlock.find("div.listing-rating a").eq(0).text().trim()
		const phone = dataBlock.find("div.detail.phone nomor").eq(0).text().trim()
	
		extractedData.push({ companyName, description, address, phone, locationA })
	})
	
	extractedData.forEach(({ companyName, description, address, phone, locationA }) => {
		writer.write([companyName, description, address, phone, locationA])
	})
	
	return extractLastPage(extractionBlock)
}

/**
extract last page from extraction block
*/
function extractLastPage(extractionBlock) {
	const lastPageLink = extractionBlock
		.find("#paginasi div.pagination-buttons a.last")
		.eq(0)
		.attr("href")
	
	return getLastPageFromLastPageLink(lastPageLink)
}

function getLastPageFromLastPageLink(lastPageLink) {
	// extract x.html from http://.../page-x.html
	const part = lastPageLink.substring(PAGINATION_URL_PREFIX.length)
	
	// extract x from x.html
	const pageString = part.substring(0, part.indexOf(".html"))
	
	return Number.parseInt(pageString)
}

/**
we are trying to scrap some contact from this page
http://telpon.info/distributor-produk-makanan/jakarta/page-1.html

because the website has bad implementation of pagination, you should clean data from
last page manually.
*/
async function main() {
	// setup writer
	writer = csvWriter({
		headers: [
			"Company Name",
			"Deskripsi",
			"Address",
			"Telephone Number",
			"Location"
		]
	})
	writer.pipe(fs.createWriteStream("data.csv"))
	
	let lastPage = -1
	let currentPage = 2727
	while (lastPage == -1 || currentPage < lastPage) {
		lastPage = await processPage(currentPage)
		currentPage += 1
	}
	
	writer.end()
}

main()
