import React, { useState } from 'react';
import { FiUpload, FiFileText, FiBook, FiGlobe, FiLayers, FiBookOpen, FiUser, FiYoutube, FiCpu, FiGrid, FiEdit3 } from 'react-icons/fi';
import MermaidRenderer from './MermaidRenderer';
import HandwrittenNotes from './HandwrittenNotes';

const PDFProcessor = () => {
  const [mode, setMode] = useState('questions');
  const [text, setText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [followUpQ, setFollowUpQ] = useState('');
  const [followUpA, setFollowUpA] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [humanizedText, setHumanizedText] = useState('');
  const [mindmapCode, setMindmapCode] = useState('');
  const [diagramCode, setDiagramCode] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart');
  const [handwrittenText, setHandwrittenText] = useState('');
  const [handwrittenStyle, setHandwrittenStyle] = useState('neat');

  const clearContentStates = () => {
    setText('');
    setUrlInput('');
    setYoutubeUrlInput('');
    setFileToUpload(null);
    setResult(null);
    setScore(null);
    setUserAnswers({});
    setFollowUpA('');
    setFollowUpQ('');
    setFlashcards([]);
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setVocabularyList([]);
    setHumanizedText('');
    setMindmapCode('');
    setDiagramCode('');
    setHandwrittenText('');
  };

  const handleTextChange = (e) => {
    clearContentStates();
    setText(e.target.value);
  };

  const handleUrlChange = (e) => {
    clearContentStates();
    setUrlInput(e.target.value);
  };

  const handleYoutubeUrlChange = (e) => {
    clearContentStates();
    setYoutubeUrlInput(e.target.value);
  };

  const handleFileChange = (e) => {
    clearContentStates();
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
    } else {
      setFileToUpload(null);
    }
  };

  const handleSubmitAnswers = () => {
    let correct = 0;
    if (result && result.questions) {
      result.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) {
          correct++;
        }
      });
      setScore(correct);
    }
  };

  const handleGenerate = async () => {
    setProcessing(true);
    clearContentStates();

    let contentToProcess = ''; 
    const API_BASE = 'https://arush1234sharma-querio-backend.hf.space';

    if (youtubeUrlInput.trim()) {
      try {
        const response = await fetch(`${API_BASE}/api/fetch-youtube-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ youtube_url: youtubeUrlInput }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`YouTube extraction failed: ${errorData.detail || 'Unknown error'}`);
        }
        const data = await response.json();
        contentToProcess = data.extracted_text;
        setText(contentToProcess);
        setYoutubeUrlInput('');
        if (!contentToProcess.trim()) {
          setResult({ error: "No readable content found from the provided YouTube URL." });
          setProcessing(false);
          return;
        }
      } catch (err) {
        console.error('YouTube processing error:', err.message);
        setResult({ error: `YouTube processing error: ${err.message}` });
        setProcessing(false);
        return;
      }
    } else if (urlInput.trim()) {
      try {
        const response = await fetch(`${API_BASE}/api/fetch-and-extract-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlInput }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`URL extraction failed: ${errorData.detail || 'Unknown error'}`);
        }
        const data = await response.json();
        contentToProcess = data.extracted_text;
        setText(contentToProcess);
        setUrlInput('');
        if (!contentToProcess.trim()) {
          setResult({ error: "No readable text found from the provided URL." });
          setProcessing(false);
          return;
        }
      } catch (err) {
        console.error('URL processing error:', err.message);
        setResult({ error: `URL processing error: ${err.message}` });
        setProcessing(false);
        return;
      }
    } else if (fileToUpload) {
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        const uploadResponse = await fetch(`${API_BASE}/api/upload-and-extract`, {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(`File extraction failed: ${errorData.detail || 'Unknown error'}`);
        }
        const uploadResult = await uploadResponse.json();
        contentToProcess = uploadResult.extracted_text;
        setText(contentToProcess);
        setFileToUpload(null);
        if (!contentToProcess.trim()) {
          setResult({ error: "No readable text found in the uploaded file." });
          setProcessing(false);
          return;
        }
      } catch (err) {
        console.error('File processing error:', err.message);
        setResult({ error: `File processing error: ${err.message}` });
        setProcessing(false);
        return;
      }
    } else {
      contentToProcess = text;
    }

    if (!contentToProcess.trim()) {
      setResult({ error: "No content to process." });
      setProcessing(false);
      return;
    }

    try {
      let endpoint = '';
      let payload = {};

      switch (mode) {
        case 'questions':
          endpoint = `${API_BASE}/api/generate-questions`;
          payload = { text: contentToProcess, difficulty, count: questionCount };
          break;
        case 'summary':
          endpoint = `${API_BASE}/api/summarize`;
          payload = { text: contentToProcess };
          break;
        case 'flashcards':
          endpoint = `${API_BASE}/api/generate-flashcards`;
          payload = { text: contentToProcess };
          break;
        case 'vocabulary':
          endpoint = `${API_BASE}/api/generate-vocabulary`;
          payload = { text: contentToProcess };
          break;
        case 'humanize':
          endpoint = `${API_BASE}/api/humanize-text`;
          payload = { text: contentToProcess };
          break;
        case 'mindmap':
          endpoint = `${API_BASE}/api/generate-mindmap`;
          payload = { text: contentToProcess };
          break;
        case 'diagram':
          endpoint = `${API_BASE}/api/generate-diagram`;
          payload = { text: contentToProcess, diagram_type: diagramType };
          break;
        case 'handwritten':
          endpoint = `${API_BASE}/api/generate-handwritten`;
          payload = { text: contentToProcess, style: handwrittenStyle };
          break;
        default:
          setResult({ error: "Invalid mode selected." });
          setProcessing(false);
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();

      switch (mode) {
        case 'questions':
        case 'summary':
          setResult(data);
          break;
        case 'flashcards':
          if (data.flashcards?.length > 0) {
            setFlashcards(data.flashcards);
            setCurrentFlashcardIndex(0);
            setIsFlipped(false);
          } else {
            setResult({ error: "No flashcards could be generated." });
          }
          break;
        case 'vocabulary':
          if (data.vocabulary?.length > 0) {
            setVocabularyList(data.vocabulary);
          } else {
            setResult({ error: "No vocabulary words could be generated." });
          }
          break;
        case 'humanize':
          if (data.humanized_text) {
            setHumanizedText(data.humanized_text);
          } else {
            setResult({ error: "Failed to humanize the provided text." });
          }
          break;
        case 'mindmap':
          if (data.mermaid_code) {
            setMindmapCode(data.mermaid_code);
          } else {
            setResult({ error: "Failed to generate mind map." });
          }
          break;
        case 'diagram':
          if (data.mermaid_code) {
            setDiagramCode(data.mermaid_code);
          } else {
            setResult({ error: "Failed to generate diagram." });
          }
          break;
        case 'handwritten':
          if (data.handwritten_text) {
            setHandwrittenText(data.handwritten_text);
          } else {
            setResult({ error: "Failed to generate handwritten notes." });
          }
          break;
        default:
          break;
      }

    } catch (err) {
      console.error('Error:', err.message);
      setResult({ error: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQ || !result?.summary) return;
    setFollowUpA('');

    try {
      const response = await fetch('https://arush1234sharma-querio-backend.hf.space/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: result.summary,
          question: followUpQ
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Follow-up API Error: ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      setFollowUpA(data.answer);
    } catch (err) {
      console.error('Follow-up error:', err.message);
      setFollowUpA(`Error: ${err.message}`);
    }
  };

  const goToNextFlashcard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const goToPreviousFlashcard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const baseText = 'text-white';
  const inputBg = 'bg-gray-900 border-gray-700';
  const inputBorder = 'border-gray-700';
  const inputPlaceholder = 'placeholder-gray-400';
  const glassEffectPrimary = 'bg-gray-800 bg-opacity-30 backdrop-blur-lg';

  return (
    <div className={`font-inter relative z-10 bg-black`}>
      <div className="lumin-landing-bg"></div>

      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 relative z-20">
        <div className="flex justify-between items-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient">NexNotes AI</h1>
        </div>

        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-shadow-lg text-white">
            Your one stop AI-powered study solution
          </h2>
          <p className="text-base sm:text-xl text-gray-300 max-w-4xl mx-auto opacity-90">
            NexNotes AI instantly helps you revise your study
            material without actually wasting time going through
            whole docs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <div className={`${glassEffectPrimary} rounded-3xl p-6 sm:p-8`}>
              

              <div className="flex items-center my-4 sm:my-6">
                <div className={`flex-grow border-t ${inputBorder} opacity-50`}></div>
                <span className={`flex-shrink mx-3 sm:mx-4 text-gray-400 text-base sm:text-lg font-semibold`}> </span>
                <div className={`flex-grow border-t ${inputBorder} opacity-50`}></div>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className={`flex items-center ${inputBg} ${inputBorder} rounded-3xl p-3 sm:p-4 ${baseText} ${inputPlaceholder} focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300`}>
                  <FiGlobe className={`text-xl sm:text-2xl mr-3 sm:mr-4 text-gray-400`} />
                  <input
                    type="text"
                    className="flex-grow bg-transparent outline-none text-base sm:text-lg"
                    placeholder="Paste any other web page URL here"
                    value={urlInput}
                    onChange={handleUrlChange}
                  />
                </div>
              </div>

              <div className="flex items-center my-4 sm:my-6">
                <div className={`flex-grow border-t ${inputBorder} opacity-50`}></div>
                <span className={`flex-shrink mx-3 sm:mx-4 text-gray-400 text-base sm:text-lg font-semibold`}>OR</span>
                <div className={`flex-grow border-t ${inputBorder} opacity-50`}></div>
              </div>

              <textarea
                className={`w-full h-64 sm:h-80 ${inputBg} ${inputBorder} rounded-3xl p-4 sm:p-6 ${baseText} ${inputPlaceholder} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-y text-base sm:text-lg`}
                placeholder="Paste your notes or text here"
                value={text}
                onChange={handleTextChange}
              />

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8 flex-wrap">
                <label className="flex-1 min-w-[160px] sm:min-w-[200px]">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className={`${glassEffectPrimary} rounded-3xl p-4 sm:p-5 text-center cursor-pointer hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${baseText} text-base sm:text-lg font-medium transform hover:scale-102`}>
                    <FiUpload className="text-xl sm:text-2xl" />
                    <span>Upload File ({fileToUpload ? fileToUpload.name : 'PDF/Word/PPT/TXT'})</span>
                  </div>
                </label>

                <div className={`${glassEffectPrimary} rounded-3xl p-2 flex flex-wrap gap-2 flex-1 min-w-[200px] sm:min-w-[250px]`}>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'questions' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('questions')}
                  >
                    <FiFileText className="text-base sm:text-lg" />
                    Questions
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'summary' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('summary')}
                  >
                    <FiBook className="text-base sm:text-lg" />
                    Summary
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'flashcards' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('flashcards')}
                  >
                    <FiLayers className="text-base sm:text-lg" />
                    Cards
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'vocabulary' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('vocabulary')}
                  >
                    <FiBookOpen className="text-base sm:text-lg" />
                    Vocab
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'humanize' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('humanize')}
                  >
                    <FiUser className="text-base sm:text-lg" />
                    Humanize
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'mindmap' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('mindmap')}
                  >
                    <FiCpu className="text-base sm:text-lg" />
                    Mind Map
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'diagram' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('diagram')}
                  >
                    <FiGrid className="text-base sm:text-lg" />
                    Diagram
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex-grow font-semibold text-sm sm:text-base transform hover:scale-105 ${mode === 'handwritten' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setMode('handwritten')}
                  >
                    <FiEdit3 className="text-base sm:text-lg" />
                    Handwritten
                  </button>
                </div>
              </div>

              {mode === 'questions' && (
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-1">
                    <label htmlFor="difficulty" className={`block text-sm sm:text-md ${baseText} mb-1 sm:mb-2 font-medium`}>Select Difficulty</label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className={`${inputBg} p-2 sm:p-3 rounded-xl w-full ${baseText} ${inputBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-base sm:text-lg`}
                    >
                      <option value="easy" className="bg-gray-800">Easy</option>
                      <option value="medium" className="bg-gray-800">Medium</option>
                      <option value="hard" className="bg-gray-800">Hard</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="questionCount" className={`block text-sm sm:text-md ${baseText} mb-1 sm:mb-2 font-medium`}>Number of Questions</label>
                    <input
                      type="number"
                      id="questionCount"
                      value={questionCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setQuestionCount('');
                        } else {
                          const parsedValue = parseInt(value, 10);
                          if (isNaN(parsedValue) || parsedValue < 1) {
                            setQuestionCount(1);
                          } else {
                            setQuestionCount(parsedValue);
                          }
                        }
                      }}
                      min="1"
                      max="10"
                      className={`${inputBg} p-2 sm:p-3 rounded-xl w-full ${baseText} ${inputBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-base sm:text-lg`}
                    />
                  </div>
                </div>
              )}

              {mode === 'diagram' && (
                <div className="mt-6 sm:mt-8">
                  <label htmlFor="diagramType" className={`block text-sm sm:text-md ${baseText} mb-1 sm:mb-2 font-medium`}>Diagram Type</label>
                  <select
                    id="diagramType"
                    value={diagramType}
                    onChange={(e) => setDiagramType(e.target.value)}
                    className={`${inputBg} p-2 sm:p-3 rounded-xl w-full ${baseText} ${inputBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-base sm:text-lg`}
                  >
                    <option value="flowchart" className="bg-gray-800">Flowchart</option>
                    <option value="sequence" className="bg-gray-800">Sequence Diagram</option>
                    <option value="class" className="bg-gray-800">Class Diagram</option>
                    <option value="state" className="bg-gray-800">State Diagram</option>
                    <option value="entity" className="bg-gray-800">Entity Relationship</option>
                  </select>
                </div>
              )}

              {mode === 'handwritten' && (
                <div className="mt-6 sm:mt-8">
                  <label htmlFor="handwrittenStyle" className={`block text-sm sm:text-md ${baseText} mb-1 sm:mb-2 font-medium`}>Handwriting Style</label>
                  <select
                    id="handwrittenStyle"
                    value={handwrittenStyle}
                    onChange={(e) => setHandwrittenStyle(e.target.value)}
                    className={`${inputBg} p-2 sm:p-3 rounded-xl w-full ${baseText} ${inputBorder} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-base sm:text-lg`}
                  >
                    <option value="neat" className="bg-gray-800">Neat</option>
                    <option value="casual" className="bg-gray-800">Casual</option>
                    <option value="messy" className="bg-gray-800">Messy</option>
                  </select>
                </div>
              )}

              {/* Generate Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl py-4 sm:py-5 mt-8 sm:mt-10 font-bold text-lg sm:text-xl text-white flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-102 transition-all duration-300"
                onClick={handleGenerate}
                disabled={processing || (!text.trim() && !fileToUpload && !urlInput.trim() && !youtubeUrlInput.trim())}
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>Generate {
                    mode === 'questions' ? 'Questions' :
                    mode === 'summary' ? 'Summary' :
                    mode === 'flashcards' ? 'Flashcards' :
                    mode === 'vocabulary' ? 'Vocabulary' :
                    mode === 'mindmap' ? 'Mind Map' :
                    mode === 'diagram' ? 'Diagram' :
                    'Handwritten Notes'
                  }</>
                )}
              </button>
            </div>
          </div>

          {/* Results Display Area */}
          <div className={`${glassEffectPrimary} rounded-3xl p-6 sm:p-8 lg:h-[calc(100vh-14rem)] h-auto overflow-y-auto min-h-[300px]`}>
            {/* Conditional message when no results yet */}
            {!result && flashcards.length === 0 && vocabularyList.length === 0 && 
             !humanizedText && !mindmapCode && !diagramCode && !handwrittenText && !processing && (
              <div className="h-full flex items-center justify-center text-gray-400 text-base sm:text-lg">
                Generated {
                  mode === 'questions' ? 'questions' :
                  mode === 'summary' ? 'summary' :
                  mode === 'flashcards' ? 'flashcards' :
                  mode === 'vocabulary' ? 'vocabulary' :
                  mode === 'humanize' ? 'humanized text' :
                  mode === 'mindmap' ? 'mind map' :
                  mode === 'diagram' ? 'diagram' :
                  'handwritten notes'
                } will appear here
              </div>
            )}

            {/* Error display */}
            {result?.error && (
              <div className="text-red-400 mt-4 text-center text-base sm:text-lg font-medium">Error: {result.error}</div>
            )}

            {/* Display Summary */}
            {result && !result.error && mode === 'summary' && (
              <div className={`prose max-w-none prose-invert`}>
                <div className={`${glassEffectPrimary} rounded-3xl p-4 sm:p-6`}>
                  <p className="whitespace-pre-wrap text-base sm:text-lg">{result.summary}</p>
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
                    <h4 className="font-semibold text-lg sm:text-xl mb-3 sm:mb-4">Ask a follow-up question:</h4>
                    <input
                      type="text"
                      value={followUpQ}
                      onChange={(e) => setFollowUpQ(e.target.value)}
                      placeholder="Ask something based on the summary..."
                      className={`w-full p-2 sm:p-3 ${inputBg} ${inputBorder} rounded-xl ${baseText} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 mb-3 sm:mb-4 text-base sm:text-lg`}
                    />
                    <button
                      onClick={handleFollowUp}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
                      disabled={!followUpQ}
                    >
                      Ask
                    </button>
                    {followUpA && (
                      <div className={`mt-4 sm:mt-6 bg-gray-800 bg-opacity-40 p-4 sm:p-5 rounded-xl border border-gray-700 ${baseText}`}>
                        <strong className="text-base sm:text-lg block mb-1 sm:mb-2">Answer:</strong>
                        <p className="text-base sm:text-lg">{followUpA}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Display Questions */}
            {result && !result.error && mode === 'questions' && Array.isArray(result.questions) && (
              <div className="space-y-6 sm:space-y-8">
                {result.questions.map((q, index) => (
                  <div key={index} className={`${inputBorder} rounded-xl p-4 sm:p-6 bg-gray-800 bg-opacity-30`}>
                    <p className="font-semibold mb-3 sm:mb-4 text-lg sm:text-xl">{index + 1}. {q.text}</p>
                    <ul className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                      {q.options.map((opt, i) => (
                        <li
                          key={i}
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 text-base sm:text-lg cursor-pointer transition-all duration-200 ${
                            score !== null && userAnswers[index] === opt && opt === q.answer ? 'bg-green-800 font-bold' : ''
                          } ${
                            score !== null && userAnswers[index] === opt && opt !== q.answer ? 'bg-red-800 font-bold' : ''
                          } ${
                            score === null ? 'hover:bg-gray-700 hover:bg-opacity-50' : ''
                          }`}
                          onClick={() => score === null && setUserAnswers({ ...userAnswers, [index]: opt })}
                        >
                          <input
                            type="radio"
                            name={`q-${index}`}
                            value={opt}
                            checked={userAnswers[index] === opt}
                            onChange={() => setUserAnswers({ ...userAnswers, [index]: opt })}
                            className="form-radio text-blue-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                            disabled={score !== null}
                          />
                          <span className="flex-grow">{String.fromCharCode(65 + i)}. {opt}</span>
                          {score !== null && userAnswers[index] === opt && opt === q.answer && (
                            <span className="ml-2 text-green-300 font-extrabold text-lg sm:text-xl">✓</span>
                          )}
                          {score !== null && userAnswers[index] === opt && opt !== q.answer && (
                            <span className="ml-2 text-red-300 font-extrabold text-lg sm:text-xl">✗</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {score !== null && (
                      <p className="text-green-400 font-medium mt-3 sm:mt-4 text-base sm:text-lg">
                        Correct Answer: <span className="font-bold">{q.answer}</span>
                      </p>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSubmitAnswers}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-102"
                  disabled={score !== null || Object.keys(userAnswers).length !== result.questions.length}
                >
                  Submit Answers
                </button>
                {score !== null && (
                  <div className="text-green-400 font-extrabold mt-4 sm:mt-6 text-2xl sm:text-3xl text-center">
                    Your Score: {score} / {result.questions.length}
                  </div>
                )}
              </div>
            )}

            {/* Display Flashcards */}
            {mode === 'flashcards' && flashcards.length > 0 && (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div
                  className={`relative w-full max-w-md h-64 sm:h-80 ${glassEffectPrimary} rounded-3xl cursor-pointer flex items-center justify-center p-6`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {isFlipped ? (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-lg sm:text-xl font-semibold">
                      {flashcards[currentFlashcardIndex]?.back || "Loading..."}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-lg sm:text-xl font-semibold">
                      {flashcards[currentFlashcardIndex]?.front || "Loading..."}
                    </div>
                  )}
                </div>

                <div className="flex justify-between w-full max-w-md mt-4">
                  <button
                    onClick={goToPreviousFlashcard}
                    disabled={flashcards.length <= 1}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300 text-lg">
                    {currentFlashcardIndex + 1} / {flashcards.length}
                  </span>
                  <button
                    onClick={goToNextFlashcard}
                    disabled={flashcards.length <= 1}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Display Vocabulary List */}
            {mode === 'vocabulary' && vocabularyList.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gradient mb-4">Vocabulary</h3>
                {vocabularyList.map((item, index) => (
                  <div key={index} className={`${inputBorder} rounded-xl p-4 bg-gray-800 bg-opacity-30`}>
                    <p className="font-semibold text-lg mb-1">{item.word}</p>
                    <p className="text-gray-300 text-base">{item.definition}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Display Humanized Text */}
            {mode === 'humanize' && humanizedText && (
              <div className={`prose max-w-none prose-invert`}>
                <h3 className="text-2xl font-bold text-gradient mb-4">Humanized Text</h3>
                <div className={`${glassEffectPrimary} rounded-3xl p-4 sm:p-6`}>
                  <p className="whitespace-pre-wrap text-base sm:text-lg">{humanizedText}</p>
                </div>
              </div>
            )}

            {/* Display Mind Map */}
            {mode === 'mindmap' && mindmapCode && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gradient mb-4">Mind Map</h3>
                <div className={`${inputBorder} rounded-xl p-4 bg-gray-800 bg-opacity-30 overflow-hidden`}>
                  <MermaidRenderer code={mindmapCode} type="mindmap" />
                </div>
              </div>
            )}

            {/* Display Diagram */}
            {mode === 'diagram' && diagramCode && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gradient mb-4">
                  {diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram
                </h3>
                <div className={`${inputBorder} rounded-xl p-4 bg-gray-800 bg-opacity-30 overflow-hidden`}>
                  <MermaidRenderer code={diagramCode} type={diagramType} />
                </div>
              </div>
            )}

            {/* Display Handwritten Notes */}
            {mode === 'handwritten' && handwrittenText && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gradient mb-4">Handwritten Notes ({handwrittenStyle})</h3>
                <div className={`${inputBorder} rounded-xl bg-gray-800 bg-opacity-30 overflow-hidden`}>
                  <HandwrittenNotes text={handwrittenText} style={handwrittenStyle} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFProcessor;