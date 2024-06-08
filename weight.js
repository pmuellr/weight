async function buildCharts() {

  const msForOneWeek = 7 * 24 * 60 * 60 * 1000
  const currentDate = new Date()
  const recentDate  = new Date(currentDate.valueOf() - msForOneWeek * 8)

  const data = await getData()
  const recentData = { 
    values: data.values.filter(({ date }) => date.valueOf() > recentDate.valueOf())
  }

  const { min: minWeight, max: maxWeight } = getMinMaxWeightBounds(data)

  const tooltip = [
    { field: 'date',   type: 'temporal' },
    { field: 'weight', type: 'quantitative' },
  ]

  const lineColor  = 'green'
  const loessColor = 'red'

  const pointSize = 100
  const areaMark   = { type: 'area', interpolate: 'monotone', stroke: lineColor , fill:'#0000' }
  const lineMark   = { type: 'line', interpolate: 'monotone', stroke: lineColor, point: { size: pointSize } }
  const loessMark  = { type: 'line', interpolate: 'monotone', color:  loessColor }

  // https://vega.github.io/vega-lite/docs/scale.html
  // https://vega.github.io/vega/docs/schemes/#reference
  const recentScale = { scheme: 'rainbow' }
  // const recentScale = { scheme: 'category10' }
  // const recentScale = { scheme: 'tableau10' }
  
  const recentChart = [
    {
      mark: { ...lineMark, stroke: undefined } ,
      encoding: {
        ...encoding('none', 'zero-false'),
        color: { field: 'date', type: 'nominal', timeUnit: 'week', scale: recentScale },
      },
    },
    {
      mark: loessMark,
      transform: [ { loess: 'weight', on: 'date', bandwidth: 0.0 } ],
      encoding: encoding('none', 'zero-false')
    }
  ]

  const dowChart = [
    {
      mark: { type: 'line', interpolate: 'monotone', point: { size: pointSize } },
      encoding: {
        x: { field: 'date',   type: 'nominal', timeUnit: 'day' },
        y: { field: 'weight', type: 'quantitative', scale: { zero: false } },
        color: { field: 'date', type: 'nominal', timeUnit: 'week', legend: { title: 'week'}, scale: recentScale },
      }
    },
  ]

  const totalChart = [
    {
      mark: areaMark,
      encoding: encoding('brush', 'min-max')
    },
    {
      mark: loessMark,
      transform: [ { loess: 'weight', on: 'date', bandwidth: 0.0 } ],
      encoding: encoding('brush', 'min-max')
    }
  ]

  const brushChart = [
    {
      mark: { ...lineMark, point: false },
      params: [{ name: 'brush', select: { type: 'interval', encodings: ['x'] }}],
      encoding: encoding('none', 'min-max')
    },
    {
      mark: loessMark,
      transform: [ { loess: 'weight', on: 'date', bandwidth: 0.0 } ],
      encoding: encoding('none', 'min-max')
    },
  ]

  width = 700

  const config = {
    axisX: { titleFontSize: 16, labelFontSize: 16 },
    axisY: { titleFontSize: 16, labelFontSize: 16 },
  }

  const chartSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'recent',
    config,
    data,
    hconcat: [
      {
        vconcat: [
          {
            data: recentData,
            height: 400, width,
            encoding: { x: { field: 'date',  type: 'temporal' }, tooltip },
            layer: recentChart,
          },
          {
            data: recentData,
            height: 400, width,
            encoding: { x: { field: 'date',  type: 'temporal' }, tooltip },
            layer: dowChart,
          },
        ],
      },
      {
        vconcat: [
          {
            height: 600, width,
            encoding: { x: { field: 'date',  type: 'temporal' }, tooltip },
            layer: totalChart,
          },
          {
            height: 100, width,
            encoding: { x: { field: 'date',  type: 'temporal' }, tooltip },
            layer: brushChart
          },
        ],
      },
    ]
  }

  vegaEmbed('#chart',  chartSpec)

  /** @type { (xScale: 'brush' | 'none', yScale: 'zero-false' | 'min-max') => any } */
  function encoding(xScale, yScale) {
    const result = {
      x: { field: 'date',   type: 'temporal' },
      y: { field: 'weight', type: 'quantitative' },
    }

    if (xScale === 'brush')       result.x.scale = { domain: { param: 'brush' }}
    // if (xScale === 'recent')      result.x.scale = { domain: [ recentDate, currentDate ] }
    if (yScale === 'zero-false')  result.y.scale = { zero: false }
    if (yScale === 'min-max')     result.y.scale = { domain: [ minWeight, maxWeight ] }

    return result
  }
}

function getMinMaxWeightBounds(data) {
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
  const tenth = Math.floor((number - 1) / 10)
  return (tenth) * 10
}

async function getData() {
  const values = (await getDataCSV())
    .split('\n')
    .map(    l => l.trim())
    .filter( l => l)
    .filter( l => !(`${l}`.startsWith("#")))
    .map(    l => l.split('#')[0])
    .map(    l => l.split(','))
    .filter(([date, weight]) => (date && weight))
    .map(   ([date, weight]) => ([new Date(`${date}T00:00:00.000`), Number(weight)]))
    .filter(([date, weight]) => !isNaN(date) && !isNaN(weight))
    .map(   ([date, weight]) => ({ date, weight }))

  return { values }
}

async function getDataCSV() {
  let resp
  let body

  try {
    resp = await fetch('./weight.csv')
    if (!resp.ok) throw new Error(`error getting CSV: ${resp.status} ${resp.statusText}`)

    body = await resp.text()
    return body.trim()
  } catch (err) {
    console.log('file weight.csv not found, looking for weight-demo.csv instead')
  }

  resp = await fetch('./weight-demo.csv')
  body = await resp.text()
  return body.trim()
}
