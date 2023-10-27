import { BrowserRouter, Routes, Route } from "react-router-dom"
import Note from "./pages/Note"
import CreateNote from "./pages/CreateNote"
import EditNote from "./pages/EditNote"
// import dummyNotes from "./dummy_notes"

import { useEffect, useState } from "react"

const App = () => {

  const [notes, setNotes] = useState(JSON.parse(localStorage.getItem('notes')) || [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  return (
    <main id="app">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Note notes={notes}/>}></Route>
        <Route path="/create-note" element={<CreateNote setNotes={setNotes} />}></Route>
        <Route path="/edit-note/:id" element={<EditNote notes={notes} setNotes={setNotes} /> }></Route>
      </Routes>
    </BrowserRouter>
    </main>
  )
}

export default App
