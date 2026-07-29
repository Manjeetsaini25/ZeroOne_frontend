import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, NavLink } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';

const DotIcon = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="5" />
  </svg>
);

const CheckCircleIcon = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
    <path d="M5 8.2l1.8 1.8L11.2 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossCircleIcon = (
  <svg viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15" />
    <path d="M5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3.5l7 4.5-7 4.5v-9z" />
  </svg>
);

const SendIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 1.5L7 9" />
    <path d="M14.5 1.5L10 14.5L7 9L1.5 6L14.5 1.5z" />
  </svg>
);

const BackIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L5 8l5 5" />
  </svg>
);

const TAG_META = {
  array: { label: 'Array', color: '#3b82f6' },
  linkedList: { label: 'Linked List', color: '#8b5cf6' },
  tree: { label: 'Tree', color: '#ec4899' },
  dp: { label: 'DP', color: '#f97316' },
  greedy: { label: 'Greedy', color: '#eab308' },
};

const getTagMeta = (tag) => TAG_META[tag] || { label: tag || 'General', color: '#64748b' };

const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'hard': return '#f43f5e';
    default: return '#64748b';
  }
};

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  const [theme, setTheme] = useState(
    () => localStorage.getItem('zo-theme') || 'light'
  );
  const dark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('zo-theme', theme);
  }, [theme]);

  // ---- theme tokens (mirrors Homepage) ----
  const bg = dark ? 'bg-[#0a0e1a]' : 'bg-[#f7f8fb]';
  const surface = dark ? 'bg-[#111827]' : 'bg-white';
  const surfaceAlt = dark ? 'bg-[#0f1420]' : 'bg-[#f1f4f9]';
  const border = dark ? 'border-[#1f2937]' : 'border-slate-200';
  const textPrimary = dark ? 'text-slate-100' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-500' : 'text-slate-400';
  const textSub = dark ? 'text-slate-400' : 'text-slate-500';
  const accent = '#3b82f6';

  // Fetch problem data
const LANGUAGE_MAP = {
  'c++': 'cpp',
  'java': 'java',
  'javascript': 'javascript',
};

const getStartCodeForLanguage = (startCode, lang) => {
  return startCode.find(
    (sc) => LANGUAGE_MAP[sc.language?.toLowerCase()] === lang
  )?.initialCode || '';
};

useEffect(() => {
  const fetchProblem = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      setProblem(response.data);
      setCode(getStartCodeForLanguage(response.data.startCode, selectedLanguage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching problem:', error);
      setLoading(false);
    }
  };
  fetchProblem();
}, [problemId]);

// Update code when language changes
useEffect(() => {
  if (problem) {
    setCode(getStartCodeForLanguage(problem.startCode, selectedLanguage));
  }
}, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      const testCases = response.data;

      let success = true;
      let runtime = 0;
      let memory = 0;

      for (const tc of testCases) {
        runtime += parseFloat(tc.time || 0);
        memory = Math.max(memory, tc.memory || 0);

        if (tc.status_id !== 3) {
          success = false;
        }
      }

      setRunResult({
        success,
        runtime,
        memory,
        testCases,
      });
      setLoading(false);
      setActiveRightTab('testcase');
      console.log(response);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Internal server error' });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      const data = response.data;

      setSubmitResult({
        accepted: data.status === "accepted",
        passedTestCases: data.testCasesPassed,
        totalTestCases: data.testCasesTotal,
        runtime: data.runtime,
        memory: data.memory,
        error: data.errorMessage,
      });
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  if (loading && !problem) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${accent} 70%, transparent)`,
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const diffColor = getDifficultyColor(problem?.difficulty);
  const tagMeta = getTagMeta(problem?.tags);

  const leftTabs = [
    { id: 'description', label: 'Description' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'submissions', label: 'Submissions' },
    { id: 'chat', label:'Ai Chat'}
  ];

  const rightTabs = [
    { id: 'code', label: 'Code' },
    { id: 'testcase', label: 'Testcase' },
    { id: 'result', label: 'Result' },
  ];

  return (
    <div className={`h-screen flex flex-col ${bg} transition-colors duration-300`}>
      {/* Top Nav — mirrors Homepage */}
      <nav className={`shrink-0 backdrop-blur-md ${dark ? 'bg-[#0a0e1a]/80' : 'bg-white/80'} border-b ${border}`}>
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center overflow-hidden font-mono text-white text-[13px] font-bold leading-none tracking-tighter shadow-lg shadow-blue-500/20">
                <span className="transition-transform duration-300 ease-out group-hover:-translate-x-[3px]">0</span>
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-[3px]">1</span>
              </div>
            </NavLink>
            <span className={`w-px h-5 ${border} border-l shrink-0`} />
            <NavLink
              to="/"
              className={`flex items-center gap-1.5 text-sm font-medium ${textSub} hover:text-blue-500 transition-colors shrink-0`}
            >
              <span className="w-3.5 h-3.5">{BackIcon}</span>
              Problems
            </NavLink>
            {problem && (
              <>
                <span className={`hidden sm:inline w-px h-5 ${border} border-l shrink-0`} />
                <h1 className={`hidden sm:block font-semibold truncate ${textPrimary}`}>{problem.title}</h1>
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md shrink-0"
                  style={{ color: diffColor, backgroundColor: `${diffColor}1a` }}
                >
                  <span className="w-2.5 h-2.5">{DotIcon}</span>
                  {problem.difficulty}
                </span>
              </>
            )}
          </div>

          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className={`relative w-14 h-8 rounded-full border ${border} ${surfaceAlt} transition-colors shrink-0`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${
                dark ? 'translate-x-6 bg-slate-800' : 'translate-x-0 bg-white shadow'
              }`}
            >
              {dark ? (
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-blue-400" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-amber-500" fill="currentColor">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-9.9a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 9a1 1 0 100 2h1a1 1 0 100-2h-1zM4.464 4.05a1 1 0 010 1.414l-.707.707A1 1 0 012.343 4.75l.707-.707a1 1 0 011.414 0zM3 9a1 1 0 100 2H2a1 1 0 100-2h1zm2.05 8.536a1 1 0 001.414 0l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 000 1.414zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
                </svg>
              )}
            </span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        <div className={`w-1/2 flex flex-col border-r ${border} min-h-0`}>
          {/* Left Tabs */}
          <div className={`flex gap-1 px-4 pt-3 border-b ${border} ${surface}`}>
            {leftTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLeftTab(tab.id)}
                className={`relative px-3 pb-3 text-sm font-medium transition-colors ${
                  activeLeftTab === tab.id ? textPrimary : `${textMuted} hover:${textSub}`
                }`}
              >
                {tab.label}
                {activeLeftTab === tab.id && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className={`flex-1 overflow-y-auto p-6 ${surface}`}>
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      <h1 className={`text-2xl font-bold ${textPrimary}`}>{problem.title}</h1>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md"
                        style={{ color: diffColor, backgroundColor: `${diffColor}1a` }}
                      >
                        <span className="w-2.5 h-2.5">{DotIcon}</span>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md"
                        style={{ color: tagMeta.color, backgroundColor: `${tagMeta.color}14` }}
                      >
                        {tagMeta.label}
                      </span>
                    </div>

                    <div className={`whitespace-pre-wrap text-sm leading-relaxed ${textSub}`}>
                      {problem.description}
                    </div>

                    <div className="mt-8">
                      <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Examples</h3>
                      <div className="space-y-3">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className={`rounded-2xl border ${border} ${surfaceAlt} p-4`}>
                            <h4 className={`font-semibold mb-2 text-sm ${textPrimary}`}>Example {index + 1}</h4>
                            <div className={`space-y-1.5 text-xs font-mono ${textSub}`}>
                              <div><span className={`font-semibold ${textPrimary}`}>Input:</span> {example.input}</div>
                              <div><span className={`font-semibold ${textPrimary}`}>Output:</span> {example.output}</div>
                              <div><span className={`font-semibold ${textPrimary}`}>Explanation:</span> {example.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${textPrimary}`}>Editorial</h2>
                    <div className={`whitespace-pre-wrap text-sm leading-relaxed ${textSub}`}>
                      {'Editorial is here for the problem'}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${textPrimary}`}>Solutions</h2>
                    <div className="space-y-5">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className={`rounded-2xl border ${border} overflow-hidden`}>
                          <div className={`${surfaceAlt} px-4 py-2.5 border-b ${border}`}>
                            <h3 className={`font-semibold text-sm ${textPrimary}`}>
                              {problem?.title} <span className={textMuted}>· {solution?.language}</span>
                            </h3>
                          </div>
                          <div className="p-4">
                            <pre className={`${surfaceAlt} p-4 rounded-xl text-xs overflow-x-auto ${textSub}`}>
                              <code>{solution?.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      )) || <p className={textMuted}>Solutions will be available after you solve the problem.</p>}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${textPrimary}`}>My Submissions</h2>
                    <div className="text-gray-500">
                    <SubmissionHistory problemId={problemId} /></div>
                  </div>
                )}
                {activeLeftTab === 'chat' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col min-h-0">
          {/* Right Tabs */}
          <div className={`flex gap-1 px-4 pt-3 border-b ${border} ${surface}`}>
            {rightTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={`relative px-3 pb-3 text-sm font-medium transition-colors ${
                  activeRightTab === tab.id ? textPrimary : `${textMuted} hover:${textSub}`
                }`}
              >
                {tab.label}
                {activeRightTab === tab.id && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Language Selector */}
                <div className={`flex justify-between items-center p-3 border-b ${border} ${surface}`}>
                  <div className="flex gap-1.5">
                    {LANGUAGES.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleLanguageChange(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                          selectedLanguage === value
                            ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                            : `${surfaceAlt} ${textSub} hover:brightness-95`
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={dark ? 'vs-dark' : 'light'}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className={`p-3 border-t ${border} ${surface} flex justify-between items-center`}>
                  <button
                    onClick={() => setActiveRightTab('testcase')}
                    className={`text-sm font-medium ${textSub} hover:text-blue-500 transition-colors`}
                  >
                    Console
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRun}
                      disabled={loading}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border ${border} ${surfaceAlt} ${textPrimary} hover:brightness-95 transition disabled:opacity-50`}
                    >
                      <span className="w-3.5 h-3.5">{PlayIcon}</span>
                      Run
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500 text-white shadow-sm shadow-blue-500/30 hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      <span className="w-3.5 h-3.5">{SendIcon}</span>
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'testcase' && (
              <div className={`flex-1 p-4 overflow-y-auto ${surface}`}>
                <h3 className={`font-semibold mb-4 ${textPrimary}`}>Test Results</h3>
                {runResult ? (
                  <div
                    className="rounded-2xl border p-4 mb-4"
                    style={{
                      borderColor: runResult.success ? '#10b98155' : '#f43f5e55',
                      backgroundColor: runResult.success ? '#10b9810f' : '#f43f5e0f',
                    }}
                  >
                    {runResult.success ? (
                      <div>
                        <h4 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
                          <span className="w-4 h-4 text-emerald-500">{CheckCircleIcon}</span>
                          All test cases passed
                        </h4>
                        <p className={`text-sm mt-2 ${textSub}`}>Runtime: {runResult.runtime + " sec"}</p>
                        <p className={`text-sm ${textSub}`}>Memory: {runResult.memory + " KB"}</p>

                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className={`${surfaceAlt} p-3 rounded-xl text-xs`}>
                              <div className={`font-mono space-y-1 ${textSub}`}>
                                <div><span className={`font-semibold ${textPrimary}`}>Input:</span> {tc.stdin}</div>
                                <div><span className={`font-semibold ${textPrimary}`}>Expected:</span> {tc.expected_output}</div>
                                <div><span className={`font-semibold ${textPrimary}`}>Output:</span> {tc.stdout}</div>
                                <div className="text-emerald-500 font-semibold flex items-center gap-1">
                                  <span className="w-3 h-3">{CheckCircleIcon}</span> Passed
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className={`font-bold flex items-center gap-2 ${textPrimary}`}>
                          <span className="w-4 h-4 text-rose-500">{CrossCircleIcon}</span>
                          Error
                        </h4>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className={`${surfaceAlt} p-3 rounded-xl text-xs`}>
                              <div className={`font-mono space-y-1 ${textSub}`}>
                                <div><span className={`font-semibold ${textPrimary}`}>Input:</span> {tc.stdin}</div>
                                <div><span className={`font-semibold ${textPrimary}`}>Expected:</span> {tc.expected_output}</div>
                                <div><span className={`font-semibold ${textPrimary}`}>Output:</span> {tc.stdout}</div>
                                <div className={`font-semibold flex items-center gap-1 ${tc.status_id == 3 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  <span className="w-3 h-3">{tc.status_id == 3 ? CheckCircleIcon : CrossCircleIcon}</span>
                                  {tc.status_id == 3 ? 'Passed' : 'Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={textMuted}>Click "Run" to test your code with the example test cases.</div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className={`flex-1 p-4 overflow-y-auto ${surface}`}>
                <h3 className={`font-semibold mb-4 ${textPrimary}`}>Submission Result</h3>
                {submitResult ? (
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: submitResult.accepted ? '#10b98155' : '#f43f5e55',
                      backgroundColor: submitResult.accepted ? '#10b9810f' : '#f43f5e0f',
                    }}
                  >
                    {submitResult.accepted ? (
                      <div>
                        <h4 className={`font-bold text-lg flex items-center gap-2 ${textPrimary}`}>
                          <span className="w-5 h-5 text-emerald-500">{CheckCircleIcon}</span>
                          Accepted
                        </h4>
                        <div className={`mt-3 space-y-1.5 text-sm ${textSub}`}>
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + " KB"}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className={`font-bold text-lg flex items-center gap-2 ${textPrimary}`}>
                          <span className="w-5 h-5 text-rose-500">{CrossCircleIcon}</span>
                          {submitResult.error}
                        </h4>
                        <div className={`mt-3 space-y-1.5 text-sm ${textSub}`}>
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={textMuted}>Click "Submit" to submit your solution for evaluation.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;