import express from 'express'
import mysql from 'mysql2/promise' // <--- 1. CAMBIO CLAVE: Usar /promise

const app = express()
const PORT = process.env.PORT || 3000
const SALUDO = process.env.SALUDO || '¡Hola desde Node.js dentro de docker!🐋'


async function conectar() { 
try {
  const conexion = await mysql.createConnection({
    host: 'mi-mysql', //Entre contenedores
    user: 'root',
    password: 'admin',
    database: 'miBBDD',
    port: '3306' //Entre contenedores
  });
  console.log('Conexión exitosa a MySQL ✅');
  return conexion;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    // Aquí puedes decidir si quieres relanzar el error o retornar null
    throw error; 
  }
}

app.get('/',(req,res) =>
{
    res.json(
        {
            mensaje: SALUDO,
            hostname: process.env.HOSTNAME, //el id del contenedor
            timestamp: new Date().toISOString(),
        }
    )
})

app.get('/lista', async (req, res) => { // 1. Añade 'async' aquí
    try {
        // 2. Añade 'await' para "desempaquetar" la promesa y obtener la conexión real
        const conexion = await conectar(); 

        // Ahora sí, ya puedes usarla con total normalidad y autocompletado
        const [rows] = await conexion.execute('SELECT * FROM ARTICULOS');

        // Recuerda cerrar la conexión cuando termines de usarla en la petición
        await conexion.end();

        res.json(rows); // Envías el resultado al cliente

        console.log('listando articulos hot reload 🔥');

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los artículos' });
    }
});
//Enpoint de salud, util para HEALTHCHECK y orquestadores
app.get('/health',(req,res) =>
{
    console.log('Hola estoy en la peticion get /health tomaya')
    res.status(200).json({status:'ok'})
})

app.get('/conectar',(req,res) =>
{
  let conexion = conectar(); 
  res.status(200).json({status:'ok'})
})





app.listen(PORT,() =>
{
    console.log(`🚀 Server listening on http://localhost:${PORT}`)
})



