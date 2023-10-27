import { useEffect, useState } from 'react'
import {CiSearch} from 'react-icons/ci'
import {MdClose} from 'react-icons/md'
import { BsPlusLg } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import NoteItem from '../components/NoteItem'

const Note = ({notes}) => {
  
  const [showSearch, setShowSearch] = useState(false);
  const [text, setText] = useState('')
  const [filteredNote, setFilteredNote] = useState(notes)

  const handleSearch = () => {
    setFilteredNote(notes.filter(note => {
      if(note.title.toLowerCase().match(text.toLocaleLowerCase())) {
        return note;
      }
    }))
  }

  useEffect(handleSearch, [text])

  return (
    <section>
        <header className="notes__header">
            {!showSearch && <h2>My Notes</h2>}
            {showSearch && <input type="text" autoFocus placeholder='Keyword...' value={text} onChange={(e) => {setText(e.target.value); handleSearch()}} />}
            <button className="btn" onClick={() => setShowSearch(prevState => !prevState)}>{showSearch ? <MdClose/> : <CiSearch />}</button>
        </header>
        <div className="notes__container">
          {filteredNote.length == 0 && <p className='empty__notes'>No Notes Found</p>}
            {
                filteredNote.map(note => <NoteItem key={note.id} note={note} />)
            }
        </div>
        <Link to="/create-note" className='btn add__btn'><BsPlusLg /></Link>
    </section>
  )
}

export default Note
