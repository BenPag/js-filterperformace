function search(item, searchQuery) {
    return item.title.some((x) => x.toLowerCase().includes(searchQuery))
        || item.artists.some((x) => x.name.toLowerCase().includes(searchQuery)
            || x.alternativeName.toLowerCase().includes(searchQuery)
            || x.remarks.toLowerCase().includes(searchQuery))
        || item.location.some((x) => x.toLowerCase().includes(searchQuery))
        || item.endDate.toString().includes(searchQuery)
        || item.startDate.toString().includes(searchQuery)
        || item.id.toString().includes(searchQuery);
}

function useFilterLocation(data) {
    const p1 = performance.now();
    let res = data.filter(
        (item) => Array.isArray(item.location) && item.location.includes('Weimar')
    );
    const p2 = performance.now();

    return {
        time: (p2 - p1),
        items: res,
        count: res.length,
    };
}

function useFilterFullText(data) {
    const p1 = performance.now();
    let res = data.filter((d) => search(d, 'paulus'));
    const p2 = performance.now();

    return {
        time: (p2 - p1),
        items: res,
        count: res.length,
    };
}

function useFilterTimeRange(data) {
    const p1 = performance.now();
    let res = data.filter((item) => {
            const date = item.sortingDate ? Math.floor(item.sortingDate) : item.startDate;
            return date >= 1520 && date <= 1548;
        }
    );
    const p2 = performance.now();

    return {
        time: (p2 - p1),
        items: res,
        count: res.length,
    };
}
