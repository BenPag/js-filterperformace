function getFuseIndex(data) {
    const keys = ['startDate', 'endDate', 'title', 'artists', 'location', 'alternativeName', 'remarks'];

    const p1 = performance.now();
    const index = Fuse.createIndex(keys, data)
    const fuse = new Fuse(data, {keys, useExtendedSearch: true}, index);
    const p2 = performance.now();

    return {
        time: (p2 - p1),
        index: fuse,
    };
}

function useFuseLocation(data, index) {
    const p1 = performance.now();
    let res = index.search("'Weimar");
    const p2 = performance.now();

    return {
        time: (p2 - p1),
        items: res,
        count: res.length,
    };
}

function useFuseFullText(data, index) {
    const p1 = performance.now();
    let res = index.search("'Paulus");
    const p2 = performance.now();

    return {
        time: (p2 - p1),
        items: res,
        count: res.length,
    };
}
