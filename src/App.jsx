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

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setWorkdays(JSON.parse(raw))
    }catch(e){console.error(e)}
  },[])

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workdays))
  },[workdays])

  function startWorkday(){
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

  function addTask(){
    if (!taskText.trim() || !currentDayId) return
    const time = new Date().toISOString()
    setWorkdays(prev => prev.map(d=> d.id===currentDayId ? {...d, tasks:[...d.tasks,{time, text:taskText}]} : d))
    setTaskText('')
  }

  function endWorkday(id){
    const end = new Date().toISOString()
    setWorkdays(prev => prev.map(d=> d.id===id ? {...d, end} : d))
    setCurrentDayId(null)
  }

  function deleteDay(id){
    setWorkdays(prev => prev.filter(d=> d.id!==id))
  }

  function hoursFor(day){
    if (!day.start) return 0
    const end = day.end ? new Date(day.end) : new Date()
    const start = new Date(day.start)
    return Math.max(0, (end - start)/3600000)
  }

  function totalHours(){
    return workdays.reduce((sum,d)=> sum + hoursFor(d), 0)
  }

  async function exportPDF(){
    // ensure the report is visible off-screen for capture
    const el = reportRef.current
    if (!el) return
    // give browser a frame to render
    await new Promise(r=> setTimeout(r,100))
    const canvas = await html2canvas(el, {scale: 2})
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p','pt','a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgProps = pdf.getImageProperties(img)
    const imgWidth = pageWidth - 40
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width
    let position = 20
    pdf.addImage(img, 'PNG', 20, position, imgWidth, imgHeight)
    pdf.save('work-summary.pdf')
  }

  return (
    <div className="app">
      <header>
        <h1>Worktracker</h1>
      </header>

      <section className="controls">
        <label>Workday date: <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} /></label>
        <button onClick={startWorkday}>Start Workday</button>
        <button onClick={exportPDF}>Export PDF</button>
        <div className="summary">Total hours (all days): <strong>{totalHours().toFixed(2)}</strong></div>
      </section>

      <section className="task-input">
        <h2>Current Day</h2>
        {workdays.length>0 && workdays[0].date===selectedDate && !workdays[0].end ? (
          <div>
            <div>Started: {formatTime(workdays[0].start)}</div>
            <input placeholder="Task description" value={taskText} onChange={e=>setTaskText(e.target.value)} />
            <button onClick={addTask}>Add Task</button>
            <button onClick={()=>endWorkday(workdays[0].id)}>End Workday</button>
            <ul>
              {workdays[0].tasks.map((t,i)=> <li key={i}>{formatTime(t.time)} — {t.text}</li>)}
            </ul>
          </div>
        ) : (
          <div>No active day for selected date.</div>
        )}
      </section>

      <section className="history">
        <h2>Work History</h2>
        <div className="list">
          {workdays.map(day => (
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
                  {day.tasks.map((t,idx)=> <li key={idx}>{formatTime(t.time)} — {t.text}</li>)}
                </ul>
              </div>
              <div className="actions">
                {!day.end && <button onClick={()=>endWorkday(day.id)}>End</button>}
                <button onClick={()=>deleteDay(day.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Offscreen report for PDF capture */}
      <div ref={reportRef} className="report" style={{position:'absolute', left:-2000, top:0, width:800, background:'#fff', padding:20}}>
        <h1>Worktracker Summary</h1>
        <div>Total hours (all days): {totalHours().toFixed(2)}</div>
        {workdays.map(d=> (
          <div key={d.id} style={{marginTop:12}}>
            <h3>{d.date}</h3>
            <div>Start: {formatTime(d.start)} — End: {d.end ? formatTime(d.end) : '-'}</div>
            <div>Hours: {hoursFor(d).toFixed(2)}</div>
            <div>Tasks:</div>
            <ul>
              {d.tasks.map((t,i)=> <li key={i}>{formatTime(t.time)} — {t.text}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
import React, { useEffect, useState, useRef } from 'react'

const STORAGE_KEY = 'worktracker_days_v1'

function fmtTime(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function hoursBetween(start, end) {
  if (!start || !end) return 0
  return Math.round(((new Date(end) - new Date(start)) / (1000 * 60 * 60)) * 100) / 100
}

export default function App() {
  const [days, setDays] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [taskText, setTaskText] = useState('')
  const exportRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDays(JSON.parse(raw))
    } catch (e) {
      console.error('Failed to load days', e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(days))
    } catch (e) {
      console.error('Failed to save days', e)
    }
  }, [days])

  const activeDay = days.find(d => !d.endTime)

  function startWorkday() {
    if (activeDay) return
    const startTime = new Date().toISOString()
    const day = { id: 'd_' + Date.now(), date: selectedDate, startTime, endTime: null, tasks: [] }
    setDays(prev => [day, ...prev])
  }

  function addTask() {
    if (!activeDay || !taskText.trim()) return
    const ts = new Date().toISOString()
    setDays(prev => prev.map(d => d.id === activeDay.id ? { ...d, tasks: [...d.tasks, { time: ts, text: taskText.trim() }] } : d))
    setTaskText('')
  }

  function endWorkday() {
    if (!activeDay) return
    const endTime = new Date().toISOString()
    setDays(prev => prev.map(d => d.id === activeDay.id ? { ...d, endTime, totalHours: hoursBetween(d.startTime, endTime) } : d))
  }

  function deleteDay(id) {
    if (!confirm('Delete this workday?')) return
    setDays(prev => prev.filter(d => d.id !== id))
  }

  async function exportPdf() {
    // Build printable content
    const printEl = document.createElement('div')
    printEl.style.padding = '20px'
    printEl.style.fontFamily = 'sans-serif'
    printEl.innerHTML = `<h1>Worktracker Summary</h1>`
    const total = days.reduce((s, d) => s + (d.totalHours || (d.endTime ? hoursBetween(d.startTime, d.endTime) : 0)), 0)
    printEl.innerHTML += `<h3>Total hours: ${total.toFixed(2)}</h3>`
    for (const d of days) {
      const hours = (d.totalHours || (d.endTime ? hoursBetween(d.startTime, d.endTime) : 0)).toFixed(2)
      printEl.innerHTML += `<h4>${d.date} — ${fmtTime(d.startTime)} to ${d.endTime ? fmtTime(d.endTime) : '-'} (${hours} h)</h4>`
      if (d.tasks && d.tasks.length) {
        printEl.innerHTML += '<ul>'
        for (const t of d.tasks) printEl.innerHTML += `<li>${new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${t.text}</li>`
        printEl.innerHTML += '</ul>'
      }
    }
    document.body.appendChild(printEl)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf().from(printEl).set({ margin: 10, filename: 'worktracker-summary.pdf', html2canvas: { scale: 2 } }).save()
    } catch (err) {
      alert('PDF export failed: ' + (err && err.message ? err.message : err))
    }
    document.body.removeChild(printEl)
  }

  const totalAll = days.reduce((s, d) => s + (d.totalHours || (d.endTime ? hoursBetween(d.startTime, d.endTime) : 0)), 0)

  return (
    <div className="app">
      <header>
        <h1>Worktracker — MVP</h1>
      </header>

      <section className="controls">
        <label>
          Date: <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </label>
        <div className="buttons">
          <button onClick={startWorkday} disabled={!!activeDay}>Start Workday</button>
          <button onClick={endWorkday} disabled={!activeDay}>End Workday</button>
          <button onClick={exportPdf} disabled={days.length === 0}>Export PDF</button>
        </div>
      </section>

      <section className="task-input">
        <input placeholder="Describe task..." value={taskText} onChange={e => setTaskText(e.target.value)} />
        <button onClick={addTask} disabled={!activeDay || !taskText.trim()}>Add Task</button>
      </section>

      {activeDay && (
        <section className="active-day">
          <h2>Active Day — {activeDay.date}</h2>
          <p>Started at: {fmtTime(activeDay.startTime)}</p>
          <h3>Tasks</h3>
          <ul>
            {activeDay.tasks.map((t, i) => (
              <li key={i}>{fmtTime(t.time)} — {t.text}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="history">
        <h2>History</h2>
        <div className="summary">Total hours (all days): <strong>{totalAll.toFixed(2)}</strong></div>
        {days.length === 0 && <p>No workdays recorded yet.</p>}
        <ul>
          {days.map(d => (
            <li key={d.id} className="day">
              <div className="day-header">
                <strong>{d.date}</strong>
                <span>{fmtTime(d.startTime)} — {d.endTime ? fmtTime(d.endTime) : '-'}</span>
                <span>{(d.totalHours || (d.endTime ? hoursBetween(d.startTime, d.endTime) : 0)).toFixed(2)} h</span>
                <button onClick={() => deleteDay(d.id)} className="trash">🗑</button>
              </div>
              {d.tasks && d.tasks.length > 0 && (
                <ul className="day-tasks">
                  {d.tasks.map((t, i) => (
                    <li key={i}>{fmtTime(t.time)} — {t.text}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
