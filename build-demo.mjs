#!/usr/bin/env node

const OneDay = 24 * 60 * 60 * 1000
const TwoYears = 2 * 365 * OneDay

const DateEnd = new Date().valueOf()
const DateSta = DateEnd - TwoYears

console.log('date,weight')

let weight = 180
let date = DateSta
for (let i=0; i<365*2; i++) {
  date += OneDay

  const change = Math.round(Math.random() * 4) - 2
  weight += change

  const printDate = new Date(date).toISOString().slice(0,10)
  const line = `${printDate},${weight}`

  console.log(line)
}
