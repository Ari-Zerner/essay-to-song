'use client'

import { useState } from 'react'

interface ConversionResult {
  stylePrompt: string
  lyrics: string
}

export default function Home() {
  const [genreHints, setGenreHints] = useState('')
  const [userNotes, setUserNotes] = useState('')
  const [essayText, setEssayText] = useState('')
  const [stylePrompt, setStylePrompt] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert essay')
      }

      const result: ConversionResult = await response.json()
      
      setStylePrompt(result.stylePrompt)
      setLyrics(result.lyrics)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🎵 Essay to Song</h1>
        <p>Transform essays into ready-to-use Suno prompts</p>
      </header>

      <form onSubmit={handleSubmit} className="form-container">
        {error && (
          <div className="error">
            {error}
          </div>
        )}

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

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !essayText.trim()}
        >
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              Converting to Song...
            </div>
          ) : (
            'Convert to Song'
          )}
        </button>
      </form>

      {(stylePrompt || lyrics) && (
        <div className="form-container">
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