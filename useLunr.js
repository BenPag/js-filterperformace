function getLunrIndex(data) {
  const fields = ['startDate', 'endDate', 'title', 'artists', 'location', 'alternativeName', 'remarks'];

  const p1 = performance.now();
  const index = lunr(function () {
    this.ref('id');

    fields.forEach(function (fieldName) {
      this.field(fieldName);
    }, this);

    data.forEach(function (doc) {
      this.add(doc);
    }, this);
  });
  const p2 = performance.now();

  return {
    time: (p2 - p1),
    index
  };
}

function useLunrLocation(data, index) {
  const p1 = performance.now();
  let res = index.search('location:*Weimar*');
  const p2 = performance.now();

  return {
    time: (p2 - p1),
    items: res,
    count: res.length,
  };
}

function useLunrFullText(data, index) {
  const p1 = performance.now();
  let res = index.search('*Paulus*');
  const p2 = performance.now();

  return {
    time: (p2 - p1),
    items: res,
    count: res.length,
  };
}
