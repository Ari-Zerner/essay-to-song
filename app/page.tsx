'use client'

import { useState, useEffect } from 'react'

interface ConversionResult {
  stylePrompt: string
  lyrics: string
}

interface Version {
  id: number
  stylePrompt: string
  lyrics: string
  timestamp: Date
}

export default function Home() {
  const [genreHints, setGenreHints] = useState('')
  const [userNotes, setUserNotes] = useState('')
  const [essayText, setEssayText] = useState('')
  const [stylePrompt, setStylePrompt] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // API key state
  const [apiKey, setApiKey] = useState('')
  const [needsApiKey, setNeedsApiKey] = useState(false)
  
  // Refinement mode state
  const [isRefinementMode, setIsRefinementMode] = useState(false)
  const [refinementInstructions, setRefinementInstructions] = useState('')
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)

  // Check if API key is available on page load
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-api-key')
        const data = await response.json()
        setNeedsApiKey(!data.hasApiKey)
      } catch (error) {
        // If check fails, assume we need an API key
        setNeedsApiKey(true)
      }
    }
    
    checkApiKey()
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setEssayText(text)
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!essayText.trim()) {
      setError('Please enter some essay text to convert.')
      return
    }
    
    if (isRefinementMode && !refinementInstructions.trim()) {
      setError('Please enter refinement instructions.')
      return
    }
    
    if (isRefinementMode && (!stylePrompt || !lyrics)) {
      setError('No existing content to refine. Switch to "New Conversion" mode.')
      return
    }
    
    if (needsApiKey && !apiKey.trim()) {
      setError('Please enter your Anthropic API key.')
      return
    }

    setIsLoading(true)
    setError('')
    setStylePrompt('')
    setLyrics('')

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genreHints: genreHints.trim(),
          userNotes: userNotes.trim(),
          essayText: essayText.trim(),
          isRefinementMode,
          refinementInstructions: refinementInstructions.trim(),
          currentStylePrompt: isRefinementMode ? stylePrompt : '',
          currentLyrics: isRefinementMode ? lyrics : '',
          apiKey: apiKey.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Check if we need an API key
        if (response.status === 401 && errorData.needsApiKey) {
          setNeedsApiKey(true)
          throw new Error('Please provide your Anthropic API key')
        }
        throw new Error(errorData.error || 'Failed to convert essay')
      }

      const result: ConversionResult = await response.json()
      
      // Create new version and add to history
      const newVersion: Version = {
        id: Date.now(),
        stylePrompt: result.stylePrompt,
        lyrics: result.lyrics,
        timestamp: new Date()
      }
      
      const newVersions = [...versions, newVersion]
      setVersions(newVersions)
      setCurrentVersionIndex(newVersions.length - 1)
      
      setStylePrompt(result.stylePrompt)
      setLyrics(result.lyrics)
      
      // Clear refinement instructions after successful refinement
      if (isRefinementMode) {
        setRefinementInstructions('')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToVersion = (index: number) => {
    if (index >= 0 && index < versions.length) {
      const version = versions[index]
      setCurrentVersionIndex(index)
      setStylePrompt(version.stylePrompt)
      setLyrics(version.lyrics)
    }
  }

  const clearAll = () => {
    setStylePrompt('')
    setLyrics('')
    setVersions([])
    setCurrentVersionIndex(-1)
    setIsRefinementMode(false)
    setRefinementInstructions('')
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🎵 Agendrify</h1>
        <p>Transform essays into ready-to-use Suno prompts</p>
      </header>

      <form onSubmit={handleSubmit} className="form-container">
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        
        {/* API Key Input - only show if needed */}
        {needsApiKey && (
          <div className="form-group">
            <label htmlFor="apiKey">
              Anthropic API Key *
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Anthropic API key..."
              className="api-key-input"
              disabled={isLoading}
              required
            />
            <div className="api-key-help">
              <small>
                🔒 Your API key is sent securely and not stored. Get your key from{' '}
                <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                  console.anthropic.com
                </a>
              </small>
            </div>
          </div>
        )}
        
        {/* Mode Toggle */}
        <div className="form-group">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-button ${!isRefinementMode ? 'active' : ''}`}
              onClick={() => setIsRefinementMode(false)}
              disabled={isLoading}
            >
              🆕 New Conversion
            </button>
            <button
              type="button"
              className={`mode-button ${isRefinementMode ? 'active' : ''}`}
              onClick={() => setIsRefinementMode(true)}
              disabled={isLoading || (!stylePrompt && !lyrics)}
            >
              ✨ Refine Current
            </button>
          </div>
        </div>

        {!isRefinementMode && (
          <div className="form-group">
            <label htmlFor="genreHints">
              Genre Hints (optional)
            </label>
            <input
              id="genreHints"
              type="text"
              value={genreHints}
              onChange={(e) => setGenreHints(e.target.value)}
              placeholder="e.g., folk, indie rock, acoustic ballad..."
              disabled={isLoading}
            />
          </div>
        )}

        {!isRefinementMode && (
          <div className="form-group">
            <label htmlFor="userNotes">
              Additional Notes (optional)
            </label>
            <textarea
              id="userNotes"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Any specific instructions, mood, or style preferences..."
              className="user-notes-input"
              disabled={isLoading}
            />
          </div>
        )}
        
        {isRefinementMode && (
          <div className="form-group">
            <label htmlFor="refinementInstructions">
              Refinement Instructions * 
              {versions.length > 0 && (
                <span className="refinement-version-indicator">
                  (Refining version {currentVersionIndex + 1})
                </span>
              )}
            </label>
            <textarea
              id="refinementInstructions"
              value={refinementInstructions}
              onChange={(e) => setRefinementInstructions(e.target.value)}
              placeholder="e.g., 'Make the chorus catchier', 'Add a bridge section', 'More upbeat style', 'Improve rhyming in verse 2'..."
              className="refinement-input"
              disabled={isLoading}
              required
            />
          </div>
        )}

        {!isRefinementMode && (
          <div className="form-group">
            <label htmlFor="essayText">
              Essay Text *
            </label>
          <div className="file-upload-section">
            <input
              type="file"
              id="fileUpload"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="file-input"
            />
            <label htmlFor="fileUpload" className="file-upload-button">
              📁 Upload File
            </label>
            <span className="file-upload-text">or paste text below</span>
          </div>
            <textarea
              id="essayText"
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Paste your essay text here..."
              className="essay-input"
              disabled={isLoading}
              required
            />
          </div>
        )}

        <div className="button-group">
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || (!isRefinementMode && !essayText.trim()) || (isRefinementMode && (!refinementInstructions.trim() || (!stylePrompt && !lyrics)))}
          >
            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                {isRefinementMode ? 'Refining...' : 'Converting to Song...'}
              </div>
            ) : (
              isRefinementMode ? '✨ Refine Song' : '🎵 Convert to Song'
            )}
          </button>
          
          {(stylePrompt || lyrics) && (
            <button
              type="button"
              className="clear-button"
              onClick={clearAll}
              disabled={isLoading}
            >
              🗑️ Clear All
            </button>
          )}
        </div>
      </form>

      {(stylePrompt || lyrics) && (
        <div className="form-container">
          {/* Version History Navigation */}
          {versions.length > 1 && (
            <div className="version-navigation">
              <div className="version-info">
                <span>Version {currentVersionIndex + 1} of {versions.length}</span>
                <span className="version-timestamp">
                  {versions[currentVersionIndex]?.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="version-controls">
                <button
                  type="button"
                  className="version-button"
                  onClick={() => navigateToVersion(currentVersionIndex - 1)}
                  disabled={currentVersionIndex <= 0}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="version-button"
                  onClick={() => navigateToVersion(currentVersionIndex + 1)}
                  disabled={currentVersionIndex >= versions.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <div className="output-header">
              <label htmlFor="stylePromptOutput">
                Style Prompt (for Suno)
              </label>
              <button
                type="button"
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(stylePrompt)}
                disabled={!stylePrompt}
              >
                📋 Copy
              </button>
            </div>
            <textarea
              id="stylePromptOutput"
              value={stylePrompt}
              readOnly
              className="output-area style-output"
              placeholder="Style prompt will appear here..."
            />
          </div>
          
          <div className="form-group">
            <div className="output-header">
              <label htmlFor="lyricsOutput">
                Lyrics (for Suno)
              </label>
              <button
                type="button"
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(lyrics)}
                disabled={!lyrics}
              >
                📋 Copy
              </button>
            </div>
            <textarea
              id="lyricsOutput"
              value={lyrics}
              readOnly
              className="output-area lyrics-output"
              placeholder="Lyrics will appear here..."
            />
          </div>
        </div>
      )}
    </div>
  )
}