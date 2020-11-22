let lastTestResults = {};
document.getElementById('result-table').style.display = 'none';
document.getElementById('redraw-btn').style.display = 'none';
document.getElementById('save-btn').style.display = 'none';
document.getElementById('file').addEventListener('change', (e) => {
    importData(e.target.files[0]);
});

function start() {
    const result = {
      filterLocation: [],
      filterFullText: [],
      filterTimeRange: [],
      lunrJsIndex: [],
      lunrJsLocation: [],
      lunrJsFullText: [],
      fuseJsIndex: [],
      fuseJsLocation: [],
      fuseJsFullText: [],
    };

    const maxItemLength = getData(0).length;
    for (let i = 1; i <= maxItemLength; i++) {
        const p0 = performance.now();
        const data = getData(i);
        // --- Array.filter
        const filterLocation = useFilterLocation(data);
        const filterFullText = useFilterFullText(data);
        const {time: filterTrTime} = useFilterTimeRange(data);
        result.filterLocation.push(filterLocation.time);
        result.filterFullText.push(filterFullText.time);
        result.filterTimeRange.push(filterTrTime);
        // --- Lunr.js
        const {time: lunrIdxTime, index: lunrIndex} = getLunrIndex(data);
        const lunrLocation = useLunrLocation(data, lunrIndex);
        const lunrFullText = useLunrFullText(data, lunrIndex);
        result.lunrJsIndex.push(lunrIdxTime);
        result.lunrJsLocation.push(lunrLocation.time);
        result.lunrJsFullText.push(lunrFullText.time);
        // --- Fuse.js
        const {time: fuseIdxTime, index: fuseIndex} = getFuseIndex(data)
        const fuseLocation = useFuseLocation(data, fuseIndex);
        const fuseFullText = useFuseFullText(data, fuseIndex);
        result.fuseJsIndex.push(fuseIdxTime);
        result.fuseJsLocation.push(fuseLocation.time);
        result.fuseJsFullText.push(fuseFullText.time);

        const p1 = performance.now();
        console.log(`Progress: ${i} / ${maxItemLength} in ${Math.round((p1 - p0) * 1000) / 1000} ms`);

        if (i !== maxItemLength) {
            continue;
        }

        const diffFilterLunrLoc = getDiffOfArrays(filterLocation.items, lunrLocation.items.map(i => data.find(d => d.id == i.ref)));
        const diffFilterFuseLoc = getDiffOfArrays(filterLocation.items, fuseLocation.items.map(i => i.item));
        const diffFilterLunrFt = getDiffOfArrays(filterFullText.items, lunrFullText.items.map(i => data.find(d => d.id == i.ref)));
        const diffFilterFuseFt = getDiffOfArrays(filterFullText.items, fuseFullText.items.map(i => i.item));

        if (diffFilterLunrLoc.a.length > 0 || diffFilterLunrLoc.b.length > 0) {
            console.log('LocationDiff FilterLunr', diffFilterLunrLoc);
        }
        if (diffFilterFuseLoc.a.length > 0 || diffFilterFuseLoc.b.length > 0) {
            console.log('LocationDiff FilterFuse', diffFilterFuseLoc);
        }
        if (diffFilterLunrFt.a.length > 0 || diffFilterLunrFt.b.length > 0 ) {
            console.log('FullTextDiff FilterLunr', diffFilterLunrFt);
        }
        if (diffFilterFuseFt.a.length > 0 || diffFilterFuseFt.b.length > 0 ) {
            console.log('FullTextDiff FilterFuse', diffFilterFuseFt);
        }
    }

    lastTestResults = result;
    showResults(result);
}

function showResults(result) {
    // Array.filter()
    document.getElementById('filter-location').innerHTML = `${getAverageInMs(result.filterLocation)} ms`;
    document.getElementById('filter-fullText').innerHTML = `${getAverageInMs(result.filterFullText)} ms`;
    document.getElementById('filter-timeRange').innerHTML = `${getAverageInMs(result.filterTimeRange)} ms`;
    // Lunr.js
    document.getElementById('lunr-location').innerHTML = `${getAverageInMs(result.lunrJsLocation)} ms`;
    document.getElementById('lunr-fullText').innerHTML = `${getAverageInMs(result.lunrJsFullText)} ms`;
    document.getElementById('lunr-index').innerHTML = `${getAverageInMs(result.lunrJsIndex)} ms`;
    // Fuse.js
    document.getElementById('fuse-location').innerHTML = `${getAverageInMs(result.fuseJsLocation)} ms`;
    document.getElementById('fuse-fullText').innerHTML = `${getAverageInMs(result.fuseJsFullText)} ms`;
    document.getElementById('fuse-index').innerHTML = `${getAverageInMs(result.fuseJsIndex)} ms`;

    filterPlot();
    document.getElementById('result-table').style.display = 'inline-block';
    document.getElementById('redraw-btn').style.display = 'inline-block';
    document.getElementById('save-btn').style.display = 'inline-block';
}

function filterPlot() {
    const checkboxes =
        Array.from(document.getElementsByTagName('input'))
        .filter(i => i.type === 'checkbox' && i.checked);
    const filter = checkboxes.map(cb => cb.value);

    plotResults(lastTestResults, true, filter);
    plotResults(getSortedResults(lastTestResults), false, filter);
}

function getAverageInMs(data) {
    const avg = data.reduce((sum, val) => sum + val) / data.length;
    return Math.round((avg + Number.EPSILON) * 1000) / 1000;
}

function getSortedResults(results) {
    const copy = JSON.parse(JSON.stringify(results));
    Object.keys(copy).forEach(k => copy[k].sort((a,b) => a-b));
    return copy;
}

function getDiffOfArrays(a, b) {
    const diff = a.filter(x => !b.includes(x)).concat(b.filter(x => !a.includes(x)));
    return {
        a: diff.filter(i => a.some(ai => ai.id === i.id)),
        b: diff.filter(i => b.some(bi => bi.id === i.id))
    }
}

function saveData() {
    const zip = new JSZip();
    zip.file('rawData.csv', getResultsAsCsvString(lastTestResults));
    zip.file('rawSortedData.csv', getResultsAsCsvString(getSortedResults(lastTestResults)));
    zip.file('calculatedAverages.csv', getResultAveragesAsCsvString(lastTestResults));

    zip.generateAsync({type: 'blob'}).then(function (blob) {
        const a = document.createElement('a');
        a.style = 'display:none';
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'TestResults.zip'
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

function getResultsAsCsvString(results) {
    const values = Object.values(results);
    const dataCount = values[0].length;
    const csvData = [
        '"' + Object.keys(results).join('";"') + '"',
    ];

    for (let i = 0; i < dataCount; i++) {
        const tmp = [];
        for(let j = 0; j < values.length; j++) {
            tmp.push(values[j][i].toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 12 }));
        }
        csvData.push(tmp.join(';'));
    }

    return csvData.join('\n');
}

function getResultAveragesAsCsvString(results) {
    const keys = Object.keys(results);
    const csvData = [
        '"' + Object.keys(results).join('";"') + '"',
        keys.map((k) => getAverageInMs(results[k]).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 12 })).join(';'),
    ];

    return csvData.join('\n');
}

async function importData(zipFile) {
    const jsZip = new JSZip();
    const rawDataCsvString = await (await jsZip.loadAsync(zipFile)).file('rawData.csv').async("string");
    const csvLines = rawDataCsvString.split('\n');
    const objectKeys = csvLines.splice(0, 1)[0].replace(/"/g, '').split(';');

    lastTestResults = {};
    for (let i = 1; i < csvLines.length; i++) {
        const tmp = csvLines[i].split(';');
        objectKeys.forEach((key, index) => {
            if (!Array.isArray(lastTestResults[key])) {
                lastTestResults[key] = [];
            }
            lastTestResults[key].push(Number(tmp[index].replace(',', '.')));
        });
    }
    showResults(lastTestResults);
}