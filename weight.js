async function buildCharts() {

  const data = await getData()
  const { min: minWeight, max: maxWeight } = getMinMaxWeight(data)
  const totalSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'recent',
    data,
    vconcat: [
      {
        height: 300,
        width: 'container',
        encoding: {
          x: { field: 'date',  type: 'temporal' /*, timeUnit: 'yearmonthdate' */ },
          tooltip: [
            { field: 'date',   type: 'temporal' /*, timeUnit: 'yearmonthdate' */  },
            { field: 'weight', type: 'quantitative' },
          ]
        },
        layer: [
          {
            mark: { type: 'area', interpolate: 'monotone', fill:"#0000", stroke: "blue" },
            encoding: {
              x: { field: 'date',   type: 'temporal' /*, timeUnit: 'yearmonthdate' */ , scale: { domain: { param: 'brush' }} },
              y: { field: 'weight', type: 'quantitative', scale: { domain: [minWeight, maxWeight] }}, // { zero: false }}
            },
          },
          {
            mark: { type: 'line', color: 'red', interpolate: 'monotone' },
            // transform: [ { regression: 'weight', on: 'date' } ],
            transform: [ { loess: 'weight', on: 'date', bandwidth: 0.0 } ],
            encoding: {
              x: { field: 'date',   type: 'temporal' /*, timeUnit: 'yearmonthdate' */ , scale: { domain: { param: 'brush' }} },
              y: { field: 'weight', type: 'quantitative', scale: { domain: [minWeight, maxWeight] }},// { zero: false }}
            }
          },
        ]
      },
      {
        height: 50,
        width: 'container',
        layer: [
          {
            mark: { type: 'line', interpolate: 'monotone', stroke: "blue"},
            params: [{ name: 'brush', select: { type: 'interval', encodings: ['x'] }}],
            encoding: {
              x: { field: 'date',   type: 'temporal' /*, timeUnit: 'yearmonthdate' */  },
              y: { field: 'weight', type: 'quantitative', scale: { zero: false }},
            }
          },
          {
            mark: { type: 'line', color: 'red', interpolate: 'monotone' },
            // transform: [ { regression: 'weight', on: 'date' } ],
            transform: [ { loess: 'weight', on: 'date', bandwidth: 0.0 } ],
            encoding: {
              x: { field: 'date',   type: 'temporal' /*, timeUnit: 'yearmonthdate' */  },
              y: { field: 'weight', type: 'quantitative', scale: { zero: false }},
            }
          },
        ]
      },
    ]
  }

  const msForFourWeeks = 1000 * 60 * 60 * 24 * 7 * 4
  const dateNow = Date.now()
  
  const recentSpec = JSON.parse(JSON.stringify(totalSpec))
  recentSpec.data.values = totalSpec.data.values.filter( ({ date, weight }) => 
    dateNow - date.valueOf() < msForFourWeeks 
  )
  
  //vegaEmbed('#graph-recent', recentSpec);
  vegaEmbed('#graph-total',  totalSpec);

  //console.log(recentSpec)
  //console.log(totalSpec)
}


function getMinMaxWeight(data) {
  const { values } = data
  const weights = values.map(d => d.weight)

  const min = next10Down(Math.min(...weights))
  const max = next10Up(  Math.max(...weights))
  return { min, max }
}

function next10Up(number) {
  const tenth = Math.floor(number / 10)
  return (tenth + 1) * 10
}

function next10Down(number) {
  const tenth = Math.floor(number / 10)
  return (tenth - 1) * 10
}

async function getData() {
  const values = (await getDataCSV())
    .split('\n')
    .map(    l => l.trim())
    .filter( l => l)
    .map(    l => l.split(','))
    .filter(([date, weight]) => (date && weight))
    .map(   ([date, weight]) => ([new Date(date), Number(weight)]))
    .filter(([date, weight]) => !isNaN(date) && !isNaN(weight))
    .map(   ([date, weight]) => ({ date, weight }))

  return { values }
}

async function getDataCSV() {
  let resp
  try {
    resp = await fetch('./weight-demo.csv')
  } catch (err) {
    console.log('file weight.csv not found, looking for weight-demo.csv instead')
    resp = await fetch('./weight-demo.csv')
  }

  const body = await resp.text()
  return body.trim()
}
