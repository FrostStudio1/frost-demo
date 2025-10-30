importScripts('https://unpkg.com/idb@7.0.1/build/umd.js'); // Enklaste idb

self.addEventListener('sync', async event => {
  if (event.tag === 'syncTimeReports') {
    const db = await idb.openDB('frost-db', 1, {
      upgrade(db) { db.createObjectStore('offline_reports', { keyPath: 'id', autoIncrement: true }) }
    })
    const reports = await db.getAll('offline_reports')
    for (const report of reports) {
      await fetch('/api/time-report/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      })
      await db.delete('offline_reports', report.id)
    }
  }
})

self.addEventListener('install', function (event) {
  self.skipWaiting()
})
