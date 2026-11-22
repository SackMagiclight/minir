import { rename, rm, writeFile } from 'node:fs/promises'

const tableFamilies = ['st', 'sl', 'dpst', 'dp', 'sn', 'so', 'sr']
const tablePaths = ['score_sub.json', 'score.json'].flatMap((file) =>
    tableFamilies.map((family) => `${family}/${file}`),
)
const indexUrl = new URL('../src/static/stellaverse-charts.json', import.meta.url)
const temporaryUrl = new URL(`stellaverse-charts.${process.pid}.tmp`, indexUrl)

async function fetchCharts(path) {
    const url = `https://stellabms.xyz/${path}`
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`)

    const rows = await response.json()
    if (!Array.isArray(rows)) throw new Error(`${url} did not return a chart list`)

    const charts = rows.flatMap((row) => {
        const hash = row?.sha256
        const id = row?.id
        if (typeof hash !== 'string' || !/^[0-9a-f]{64}$/i.test(hash) || !Number.isSafeInteger(id) || id <= 0) return []
        return [[hash.toLowerCase(), id]]
    })
    if (!charts.length) throw new Error(`${url} did not contain any chart IDs`)
    console.log(`${path}: ${charts.length} charts`)
    return charts
}

const tables = await Promise.all(tablePaths.map(fetchCharts))
// Official table IDs take precedence when tables share a SHA-256.
const charts = new Map(tables.flat())
const index = Object.fromEntries([...charts].sort(([left], [right]) => left.localeCompare(right)))

try {
    await writeFile(temporaryUrl, JSON.stringify(index, null, 2) + '\n')
    await rename(temporaryUrl, indexUrl)
} finally {
    await rm(temporaryUrl, { force: true })
}

console.log(`Updated the Stellaverse index with ${charts.size} charts.`)
