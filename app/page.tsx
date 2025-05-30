'use client'

import { useState } from 'react'

interface ConversionResult {
  stylePrompt: string
  lyrics: string
}

export default function Home() {
  const [genreHints, setGenreHints] = useState('')
  const [essayText, setEssayText] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!essayText.trim()) {
      setError('Please enter some essay text to convert.')
      return
    }

    setIsLoading(true)
    setError('')
    setOutput('')

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genreHints: genreHints.trim(),
          essayText: essayText.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to convert essay')
      }

      const result: ConversionResult = await response.json()
      
      // Format the output nicely
      const formattedOutput = `STYLE PROMPT:\n${result.stylePrompt}\n\nLYRICS:\n${result.lyrics}`
      setOutput(formattedOutput)
      
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
        <p>Transform your essays into beautiful songs with AI</p>
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
          <label htmlFor="essayText">
            Essay Text *
          </label>
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

      {output && (
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="output">
              Generated Song (Ready for Suno)
            </label>
            <textarea
              id="output"
              value={output}
              readOnly
              className="output-area"
              placeholder="Your converted song will appear here..."
            />
          </div>
        </div>
      )}
    </div>
  )
}