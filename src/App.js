import React, { useState, useRef } from 'react';

// Icon components
const Upload = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const Download = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17,8 12,13 7,8"/>
    <line x1="12" y1="2" x2="12" y2="13"/>
  </svg>
);

const Sun = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const Moon = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Copy = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const Check = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

export default function TempShare() {
  const [isDark, setIsDark] = useState(true);
  const [code, setCode] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileCode, setFileCode] = useState('');
  const [duration, setDuration] = useState('');
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef();

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCurrentFile(file);
      setShowDurationModal(true);
    }
  };

  const handleDurationSelect = async (selectedDuration) => {
    setDuration(selectedDuration);
    setShowDurationModal(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      formData.append('duration', selectedDuration);

      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setFileCode(result.code);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      // Fallback for demo - generate code locally
      const newCode = generateCode();
      setFileCode(newCode);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (code.length === 5) {
      try {
        const response = await fetch(`/.netlify/functions/download?code=${code}`);
        const result = await response.json();
        
        if (result.success) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = result.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('File not found or expired');
        }
      } catch (error) {
        alert('Demo mode - File retrieval not available yet');
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(fileCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetToMain = () => {
    setCurrentFile(null);
    setFileCode('');
    setCode('');
    setDuration('');
  };

  const downloadCurrentFile = async () => {
    try {
      const response = await fetch(`/.netlify/functions/download?code=${fileCode}`);
      const result = await response.json();
      
      if (result.success) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      alert('Demo download - Backend functions will be available once deployed');
    }
  };

  if (fileCode && currentFile) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              TempShare
            </h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 shadow-lg'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="max-w-lg mx-auto">
            <div className={`rounded-2xl p-8 shadow-xl border transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold mb-4">Your File Code</h2>
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-mono text-2xl font-bold ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <span className="text-blue-500">{fileCode}</span>
                  <button
                    onClick={copyCode}
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share this code to allow downloads
                </p>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{currentFile.name}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB • Expires in {duration}
                </p>
              </div>

              <button 
                onClick={downloadCurrentFile}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download File
              </button>

              <button
                onClick={resetToMain}
                className={`w-full mt-4 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            TempShare
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-lg'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="max-w-lg mx-auto">
          <div className={`rounded-2xl p-8 shadow-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${
                isDark 
                  ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Share files securely with temporary links
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="relative mb-6">
              <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 text-sm ${
                isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
              }`}>
                OR
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Code:</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  onKeyDown={(e) => e.key === 'Enter' && code.length === 5 && handleCodeSubmit(e)}
                  className={`w-full px-4 py-3 rounded-xl border font-mono text-lg text-center tracking-wider transition-all duration-300 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="ENTER CODE"
                />
              </div>
              <button
                onClick={handleCodeSubmit}
                disabled={code.length !== 5}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                Access File
              </button>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-lg font-semibold">Uploading file...</span>
              </div>
            </div>
          </div>
        )}

        {showDurationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`rounded-2xl p-8 max-w-sm w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-semibold mb-6 text-center">How long should the file be available?</h3>
              <div className="space-y-3">
                {[
                  { value: '1hr', label: '1 Hour' },
                  { value: '5hr', label: '5 Hours' },
                  { value: '1d', label: '1 Day' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDurationSelect(option.value)}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-blue-600 text-white' 
                        : 'bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
