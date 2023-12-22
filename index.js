import xls from 'xls-to-json'
import fsp from 'node:fs/promises'
import deferred from './deferred.js'

const input = process.env.XLS_FILE_PATH
const outputFull = './output/full.json'
const outputMin = './output/min.json'

const { promise, resolve, reject } = deferred()
console.time('total')
console.time('parse')
xls(
  {
    input
  },
  function (err, result) {
    if (err) {
      reject(err)
    } else {
      resolve(result)
    }
  }
)

const data = await promise
console.timeEnd('parse')
console.time('process')
const fullData = data.map(row => {
  const parent_list = []
  const obj = {
    id_category: row.Идентификатор_подраздела,
    url_category: row.Адрес_подраздела,
    parent_list
  }
  if (row.Категория1) parent_list.push(row.Категория1)
  if (row.Категория2) parent_list.push(row.Категория2)
  if (row.Категория3) parent_list.push(row.Категория3)
  if (row.Категория4) parent_list.push(row.Категория4)
  return obj
})

const minData = fullData.map(({ id_category: value, parent_list }) => ({
  value,
  label: parent_list.at(-1)
}))

console.timeEnd('process')

await fsp.writeFile(outputFull, JSON.stringify(fullData))
await fsp.writeFile(outputMin, JSON.stringify(minData))
console.timeEnd('total')
