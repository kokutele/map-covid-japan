const fs = require('fs')
const xlsx = require('node-xlsx')
const { exit } = require('process')

const filename = process.argv[2]

if( !filename ) {
  const proc = process.argv[1].split("/").slice(-1)
  console.log(`usage - node ${proc} [filename]`)
  exit(-1)
}

try {
  const workSheets = xlsx.parse(`${__dirname}/${filename}`) //20210428.xls`)

  const beds = workSheets[0].data.filter( item => {
    return (
      item instanceof Array
    &&  item.length > 0
    &&  typeof item[0] === 'number' 
    && item[1] === undefined 
    && !!item[2]
  )}).map( (item, idx) => {
    const ratioInpatient = typeof item[7] === 'number' ?
      item[7] :
      parseInt( item[7].match(/(\d+)/)[0] )
    const ratioHeavyInpatient = typeof item[12] === 'number' ?
      item[12] :
      parseInt( item[12].match(/(\d+)/)[0] )
    const ratioAccomInpatient = typeof item[17] === 'number' ?
      item[17] :
      parseInt( item[17].match(/(\d+)/)[0] )

    return {
      prefectureId: idx+1,
      name: item[2],
      numPositive: item[3],
      numInpatient: item[4],
      numBed: item[6],
      ratioInpatient: ratioInpatient < 1 ? parseInt(ratioInpatient * 100) : ratioInpatient,
      numHeavyInpatient: item[9],
      numHeavyBed: item[11],
      ratioHeavyInpatient: ratioHeavyInpatient < 1 ? parseInt(ratioHeavyInpatient * 100): ratioHeavyInpatient,
      numAccomInpatient: item[14],
      numAccom: item[16],
      ratioAccomInpatient: ratioAccomInpatient < 1 ? parseInt(ratioAccomInpatient * 100): ratioAccomInpatient,
      numHomeInpatient: item[19],
      numSocialInpatient: item[20],
      numConfirmingInpatient: item[21],
    }
  })

  console.log( JSON.stringify(beds, null, 2) )
} catch( err ) {
  console.error( err.message )
  exit(-1)
}