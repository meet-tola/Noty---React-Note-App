import 'regenerator-runtime/runtime';
import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { BsFillMicFill } from 'react-icons/bs';
import { MdAutoAwesome } from 'react-icons/md';
import useCreateDate from "../components/useCreateDate";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Spinner from '../components/Spinner';

const API_KEY = import.meta.env.VITE_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const CreateNote = ({ setNotes }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const date = useCreateDate();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [previousTranscript, setPreviousTranscript] = useState("");
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

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

  useEffect(() => {
    if (isRecording) {
      setDetails(previousTranscript + ' ' + transcript);
    }
  }, [isRecording, transcript, previousTranscript]);

  const handleManualEdit = (e) => {
    const editedText = e.target.value;
    setDetails(editedText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title && details) {
      try {
        // Call the Gemini AI API to correct and punctuate the text
        setLoading(true); // Set loading to true before calling API
        const correctedText = await callGeminiAPI(details);
        setLoading(false); // Set loading to false after API call

        const note = { id: uuid(), title, details: correctedText, date };
        setNotes((prevNotes) => [note, ...prevNotes]);
        navigate("/");
      } catch (error) {
        setLoading(false); // Set loading to false if there's an error
        console.error("Error while handling the form submit:", error);
      }
    }
  };

  const callGeminiAPI = async (text) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 64,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: `You will be provided with statements, and your task is to rewrite them correctly in standard English. "${text}"` }],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage("");
      return result.response.text() || text;
    } catch (error) {
      console.error("Error calling Gemini AI API:", error);
      return text;
    }
  };

  const handleAICorrection = async () => {
    try {
      setLoading(true); 
      const correctedText = await callGeminiAPI(details);
      setLoading(false);
      setDetails(correctedText);
    } catch (error) {
      setLoading(false);
      console.error("Error while correcting text with AI:", error);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <section>
      <header className="create-note__header">
        <Link to="/" className="btn">
          <IoIosArrowBack />
        </Link>
        <button className="btn lg primary" onClick={handleSubmit}>
          Save
        </button>
      </header>
      <form className="create-note__form" onSubmit={handleSubmit}>
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
          onChange={handleManualEdit}
        ></textarea>
      </form>
      <div className="btn ai__btn" onClick={handleAICorrection}>
        {loading ? <Spinner /> : <MdAutoAwesome />}
      </div>
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


export default CreateNote;
