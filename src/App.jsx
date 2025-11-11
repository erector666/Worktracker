import React, { useEffect, useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const STORAGE_KEY = 'worktracker:workdays'

function formatTime(iso) {
if (!iso) return '-'
const d = new Date(iso)
return d.toLocaleTimeString()
}

function formatDate(isoDate) {
if (!isoDate) return '-'
const d = new Date(isoDate)
return d.toLocaleDateString()
}

export default function App() {
const [workdays, setWorkdays] = useState([])
const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10))
const [taskText, setTaskText] = useState('')
const [currentDayId, setCurrentDayId] = useState(null)
const reportRef = useRef()

useEffect(() => {
try {
const raw = localStorage.getItem(STORAGE_KEY)
if (raw) setWorkdays(JSON.parse(raw))
} catch (e) {
console.error('Failed to load days', e)
}
}, [])

useEffect(() => {
localStorage.setItem(STORAGE_KEY, JSON.stringify(workdays))
}, [workdays])

function startWorkday() {
if (currentDayId) {
alert('Please end your current workday before starting a new one.');
return;
}

const start = new Date().toISOString()
const day = {
id: Date.now().toString(),
date: selectedDate,
start,
end: null,
tasks: []
}
setWorkdays(prev => [day, ...prev])
setCurrentDayId(day.id)
}

function addTask() {
if (!taskText.trim() || !currentDayId) return
const time = new Date().toISOString()
setWorkdays(prev => prev.map(d => d.id === currentDayId ? { ...d, tasks: [...d.tasks, { time, text: taskText.trim() }] } : d))
setTaskText('')
}

function endWorkday(id) {
const end = new Date().toISOString()
setWorkdays(prev => prev.map(d => d.id === id ? { ...d, end } : d))
setCurrentDayId(null)
}

function deleteDay(id) {
setWorkdays(prev => prev.filter(d => d.id !== id))
}

function hoursFor(day) {
if (!day.start) return0
const end = day.end ? new Date(day.end) : new Date()
const start = new Date(day.start)
return Math.max(0, (end - start) /3600000)
}

function totalHours() {
return workdays.reduce((sum, d) => sum + hoursFor(d),0)
}

async function exportPDF() {
try {
// ensure the report is visible off-screen for capture
const el = reportRef.current
if (!el) return
// give browser a frame to render
await new Promise(r => setTimeout(r,100))
const canvas = await html2canvas(el, { scale:2 })
const img = canvas.toDataURL('image/png')
const pdf = new jsPDF('p', 'pt', 'a4')
const pageWidth = pdf.internal.pageSize.getWidth()
const pageHeight = pdf.internal.pageSize.getHeight()
const imgProps = pdf.getImageProperties(img)
const imgWidth = pageWidth -40
const imgHeight = (imgProps.height * imgWidth) / imgProps.width
let position =20
pdf.addImage(img, 'PNG',20, position, imgWidth, imgHeight)
pdf.save('work-summary.pdf')
} catch (error) {
console.error('Error exporting PDF:', error)
alert('Failed to export PDF. See console for details.')
}
}

// Sort workdays by date (descending)
const sortedWorkdays = [...workdays].sort((a, b) => new Date(b.date) - new Date(a.date))

return (
<div className="app">
<header>
<h1>Worktracker</h1>
</header>

<section className="controls">
<label>Workday date:<input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} /></label>
<button onClick={startWorkday}>Start Workday</button>
<button onClick={exportPDF}>Export PDF</button>
<div className="summary">Total hours (all days):<strong>{totalHours().toFixed(2)}</strong></div>
</section>

<section className="task-input">
<h2>Current Day</h2>
{workdays.length >0 && workdays[0].date === selectedDate && !workdays[0].end ? (
<div>
<div>Started: {formatTime(workdays[0].start)}</div>
<input
placeholder="Task description"
value={taskText}
onChange={e => setTaskText(e.target.value)}
/>
<button onClick={addTask}>Add Task</button>
<button onClick={() => endWorkday(workdays[0].id)}>End Workday</button>
<ul>
{workdays[0].tasks.map((t, i) => (
<li key={i}>{formatTime(t.time)} — {t.text}</li>
))}
</ul>
</div>
) : (
<div>No active day for selected date.</div>
)}
</section>

<section className="history">
<h2>Work History</h2>
<div className="list">
{sortedWorkdays.map(day => (
<div className="day" key={day.id}>
<div className="meta">
<div className="date">{day.date}</div>
<div>Start: {formatTime(day.start)}</div>
<div>End: {day.end ? formatTime(day.end) : '-'}</div>
<div>Hours: {hoursFor(day).toFixed(2)}</div>
</div>
<div className="tasks">
<strong>Tasks</strong>
<ul>
{day.tasks.map((t, idx) => (
<li key={idx}>{formatTime(t.time)} — {t.text}</li>
))}
</ul>
</div>
<div className="actions">
{!day.end &&<button onClick={() => endWorkday(day.id)}>End</button>}
<button onClick={() => deleteDay(day.id)}>Delete</button>
</div>
</div>
))}
</div>
</section>

{/* Offscreen report for PDF capture */}
<div ref={reportRef} className="report" style={{ position: 'absolute', left: -2000, top:0, width:800, background: '#fff', padding:20 }}>
<h1>Worktracker Summary</h1>
<div>Total hours (all days): {totalHours().toFixed(2)}</div>
{workdays.map(d => (
<div key={d.id} style={{ marginTop:12 }}>
<h3>{d.date}</h3>
<div>Start: {formatTime(d.start)} — End: {d.end ? formatTime(d.end) : '-'}</div>
<div>Hours: {hoursFor(d).toFixed(2)}</div>
<div>Tasks:</div>
<ul>
{d.tasks.map((t, i) => (
<li key={i}>{formatTime(t.time)} — {t.text}</li>
))}
</ul>
</div>
))}
</div>
</div>
)
}