import 'regenerator-runtime/runtime';
import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { BsFillMicFill } from 'react-icons/bs';
import { MdAutoAwesome } from 'react-icons/md';

import useCreateDate from "../components/useCreateDate";

const API_KEY = "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"; // secure -> environment variable

const CreateNote = ({ setNotes }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
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

  // Use useEffect to update the 'details' state with the combined transcript
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
        // Call the OpenAI API to correct and punctuate the text
        const correctedText = await callOpenAIAPI(details);

        const note = { id: uuid(), title, details: correctedText, date };
        setNotes((prevNotes) => [note, ...prevNotes]);
        navigate("/");
      } catch (error) {
        console.error("Error while handling the form submit:", error);
      }
    }
  };

  const callOpenAIAPI = async (text) => {
    const APIBody = {
      "model": "text-davinci-003",
      "prompt": "Correct the following text: " + text,
      "temperature": 0,
      "max_tokens": 60,
      "top_p": 1.0,
      "frequency_penalty": 0.0,
      "presence_penalty": 0.0
    };
  
    try {
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY
        },
        body: JSON.stringify(APIBody)
      });
  
      if (!response.ok) {
        throw new Error("OpenAI API request failed with status: " + response.status);
      }
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].text.trim();
      } else {
        console.error("Empty or invalid response from OpenAI API.");
        return text; // Return the original text in case of an empty or invalid response
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return text; // Return the original text in case of an error
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
      <div className="btn ai__btn" onClick={handleSubmit}>
        <MdAutoAwesome />
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
