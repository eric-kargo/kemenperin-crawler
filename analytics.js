const fs = require("fs")
const path = require("path")
const csvdata = require("csvdata")

/**
analyze how many data point we have right now
*/
async function main() {
	const dataDir = "crawled-data-1"
	
	let total = 0
	// get subdirectory of dataDir, which is the data source
	const dir = await fs.promises.opendir(dataDir)
	const sources = filterGenerator((e) => e.isDirectory(), getDirectoryEntries(dir))
	const summaries = dataSourcesSummary(dir.path, sources)
	for await (let summary of summaries) {
		console.log(summary)
		total += summary.total
	}
	
	// special summary for data from kemenperin
	const currentDir = await fs.promises.opendir(".")
	const kemenperinPath = "crawled-data"
	// actually just contain kemenperin dirent
	const kemenperinSources = filterGenerator(
		(e) => e.name == kemenperinPath, 
		getDirectoryEntries(currentDir)
	)
	const kemenperinSummary = dataSourcesSummary(currentDir.path, kemenperinSources)
	for await (let summary of kemenperinSummary) {
		console.log(summary)
		for (let region of summary.entries) {
			console.log(region.numEntries)
		}
		total += summary.total
	}
	
	console.log(`total = ${total}`)
}

/** sourcesGenerator :: AsyncGenerator(Dirent) */
async function* dataSourcesSummary(mPath, sourcesGenerator) {
	for await (let source of sourcesGenerator) {
		const entries = await asyncGeneratorToArray(dataSourceSummary(path.join(mPath, source.name)))
		yield { name: source.name, entries, total: sum(entries.map(e => e.numEntries)) }
	}
}

function sum(arr) {
	let total = 0
	for (let el of arr) {
		total += el
	}
	
	return total
}

async function asyncGeneratorToArray(asyncGenerator) {
	const res = []
	for await (let el of asyncGenerator) {
		res.push(el)
	}
	
	return res
}

/**
Get summary of all CSVs of a data source

returns [{csv1, # of data (csv1)}, ...]
*/
async function* dataSourceSummary(sourcePath) {
	const dir = await fs.promises.opendir(sourcePath)
	
	// get all csvs of the directory
	const csvs = filterGenerator(
		(e) => e.name.endsWith(".csv"), 
		getDirectoryEntries(dir)
	)
	
	// for each csv, i want {name, # of data}
	for await (let csv of csvs) {
		const csvpath = path.join(sourcePath, csv.name)
		
		const csvData = await csvdata.load(csvpath, {log: false})
		const numEntries = csvData.length
		
		yield { name: csv.name, numEntries }
	}
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
