const fs = require("fs")
const path = require("path")
const csvdata = require("csvdata")
const csvWriter = require("csv-write-stream")

/**
Combine the many CSVs into one big CSV.
*/
async function main() {
	const csvsPath = "csvs"
	
	// get csv file of csvsDir
	const csvsDir = await fs.promises.opendir(csvsPath)
	const csvEntries = filterGenerator(
		(e) => e.isFile() && e.name.endsWith(".csv"),
		getDirectoryEntries(csvsDir)
	)
	const csvNames = await asyncGeneratorToArray(direntName(csvEntries))
	
	// setup writer
	const writer = csvWriter({
		headers: [
			"Company Name",
			"Deskripsi",
			"Address",
			"Telephone Number",
			"Location"
		]
	})
	writer.pipe(fs.createWriteStream("data.csv"))
	
	const sortedCsvNames = csvNames.sort()
	for (let csvName of sortedCsvNames) {
		console.log(csvName)
		const fullPath = path.join(csvsPath, csvName)
		const csvData = await csvdata.load(fullPath, {log: false})
		
		for (let csvEntry of csvData) {
			const {
				'Company Name': companyName, 
				'Deskripsi': description, 
				'Address': address, 
				'Telephone Number': phone, 
				'Location': locationA
			} = csvEntry
			writer.write([companyName, description, address, phone, locationA])
		}
	}
}

/**
get the names of dirent.
*/
async function* direntName(direntAsyncGen) {
	for await (let dirent of direntAsyncGen) {
		yield dirent.name
	}
}

async function asyncGeneratorToArray(asyncGenerator) {
	const res = []
	for await (let el of asyncGenerator) {
		res.push(el)
	}
	
	return res
}

async function* filterGenerator(fn, asyncGenerator) {
	for await (let entry of asyncGenerator) {
		if (fn(entry)) {
			yield entry
		}
	}
}

async function* getDirectoryEntries(dir) {
	for await (let dirent of dir) {
		yield dirent
	}
}

main()
