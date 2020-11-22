let data = [];

async function loadData() {
    if (data.length === 0) {
        const response = await fetch('data/data.json');
        data = await response.json();
    }
    return data;
}

function getData(index) {
    return index > 0 ? data.slice(0, index) : data;
}


loadData();