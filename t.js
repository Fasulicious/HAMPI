const node_xj = require('xls-to-json')
import {
  createMedication
} from './db/queries/medication'
import db from './db'

node_xj({
  input: './Catalogo_Productos.xls',
  output: 'o.json',
  sheet: 'Sheet1',
  rowsToSkip: 0,
  allowEmptyKey: false
}, async (err, res) => {
  if (err) console.log(err)
  else {
    await db()
    console.log('MongoDB connected')
    for (const med of res) {
      await createMedication({
        product_code: med.Cod_Prod.trim(),
        product_name: med.Nom_Prod.trim(),
        concentration: med.Concent.trim() || '-',
        drugstore_name: med.Nom_Form_Farm.trim(),
        simplified_drugstore_name: med.Nom_Form_Farm_Simplif.trim(),
        display: med.Presentac.trim(),
        portion: med.Fracciones.trim(),
        laboratory: med.Nom_Titular.trim()
      })
      console.log('ok')
    }
    console.log('ended')
  }
})