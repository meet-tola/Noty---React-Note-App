import 'regenerator-runtime/runtime';
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsFillMicFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

import useCreateDate from "../components/useCreateDate";

const EditNote = ({ notes, setNotes }) => {
  const { id } = useParams();
  const note = notes.find((item) => item.id == id);
  const [title, setTitle] = useState(note.title);
  const [details, setDetails] = useState(note.details);
  const date = useCreateDate();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [previousTranscript, setPreviousTranscript] = useState("");
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleForm = (e) => {
    e.preventDefault();

    if (title && details) {
      const newNote = { ...note, title, details, date };

      const newNotes = notes.map((item) => {
        if (item.id == id) {
          item = newNote;
        }
        return item;
      });

      setNotes(newNotes);
    }

    // Redirect to Home Page
    navigate("/");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete?")) {
      const newNotes = notes.filter((item) => item.id != id);

      setNotes(newNotes);
      navigate("/");
    }
  };

  const startListening = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      resetTranscript();
      setPreviousTranscript(details); // Store manually edited text as previous transcript
      SpeechRecognition.startListening({ continuous: true });
      setIsRecording(true);
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
  };

  // Use useEffect to update the 'details' state with the combined transcript
  useEffect(() => {
    if (isRecording) {
      setDetails(previousTranscript + transcript);
    }
  }, [isRecording, transcript, previousTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <section>
      <header className="create-note__header">
        <Link to="/" className="btn">
          <IoIosArrowBack />
        </Link>
        <button className="btn lg primary" onClick={handleForm}>
          Save
        </button>
        <button className="btn lg danger" onClick={handleDelete}>
          <RiDeleteBin6Line />
        </button>
      </header>
      <form className="create-note__form" onSubmit={handleForm}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <textarea
          rows="28"
          placeholder="Note details..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        ></textarea>
      </form>
      <div className="btn add__btn" onClick={startListening}>
        <BsFillMicFill />
        {isRecording && <RecordingMessage />}
      </div>
    </section>
  );
};

const RecordingMessage = () => {
  return <div className="recording-message">Recording...</div>;
};

export default EditNote;