require('dotenv').config()
const { Pool } = require('pg')

const config = {
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    allowExitOnIdle: true
}

const pool = new Pool(config)

const getJoyas = async (nombre, values) => {
    try {
        const consulta = `SELECT * FROM inventario ${nombre};`
        const { rows } = await pool.query(consulta, values)
        return rows
    } catch (error) {
        return { code : 500, error, message: "Error en getJoyas" }
    }
}

const prepareClause = (queryStrings) => {
    try {
        let clause = ""
        const { limits, page, order_by } = queryStrings
        if (order_by) {
            const [campo, ordenamiento] = order_by.split("_")
            clause += `ORDER BY ${campo} ${ordenamiento}`
        }
        if (limits) clause += ` LIMIT ${limits}`
        if (page && limits) {
            const offset = (page * limits) - limits
            clause += ` OFFSET ${offset}`
        }
        return clause
    } catch (error) {
        return { code : 500, error, message: "Error en la clausula" }
    }
}

const prepareFilter = (queryStrings) => {
    try {
        let filter = []
        const values = []

        const addFilter = (campo, comprador, valor) => {
            values.push(valor)
            const { length } = filter
            filter.push(`${campo} ${comprador} $${length + 1}`)
        };

        const { precio_max, precio_min, categoria, metal } = queryStrings
        if (precio_max) addFilter('precio', '<=', precio_max)
        if (precio_min) addFilter('precio', '>=', precio_min)
        if (categoria) addFilter('categoria', '=', categoria)
        if (metal) addFilter('metal', '=', metal)
        filter = filter.join(" AND ")
        filter = `WHERE ${filter}`
        return [filter, values]
    } catch (error) {
        return { code : 500, error, message: "Error en el Filtro" }
    }
}

const prepareHATOAS = (joyas, includeDetails = false, includeTotals = false) => {
    try {
        const results = joyas.map((j) => ({
            name: j.nombre,
            href: `/joyas/joya/${j.id}`,
        }))

        if (includeDetails) {
            const detailedResults = joyas.map((j) => ({
                id: j.id,
                nombre: j.nombre,
                categoria: j.categoria,
                metal: j.metal,
                precio: j.precio,
                stock: j.stock,
            }))
            return detailedResults
        }

        if (includeTotals) {
            const totalJoyas = joyas.length;
            const stockTotal = joyas.reduce((a, b) => a + b.stock, 0);
            return {
                totalJoyas,
                stockTotal,
                results,
            }
        }

        return results;
    } catch (error) {
        return { code: 500, error, message: "Error en el HATOAS" }
    }
}

module.exports = { getJoyas, prepareClause, prepareFilter, prepareHATOAS }
