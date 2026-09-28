import React, { useState, useEffect } from 'react'
import ClaimForm from './components/ClaimForm'
import ClaimsList from './components/ClaimsList'
import Summary from './components/Summary'
import FilterButtons from './components/FilterButtons'
import './App.css'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [claims, setClaims] = useState([])
  const [summary, setSummary] = useState(null)
  const [filter, setFilter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClaims()
    fetchSummary()
  }, [])

  const fetchClaims = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = filter
        ? `${API_URL}/claims?status=${filter}`
        : `${API_URL}/claims`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch claims')
      const data = await response.json()
      setClaims(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/claims/summary`)
      if (!response.ok) throw new Error('Failed to fetch summary')
      const data = await response.json()
      setSummary(data)
    } catch (err) {
      console.error('Summary error:', err)
    }
  }

  const handleFilterChange = (status) => {
    setFilter(status)
  }

  const handleClaimSubmitted = () => {
    fetchClaims()
    fetchSummary()
  }

  const handleClaimStatusChanged = () => {
    fetchClaims()
    fetchSummary()
  }

  useEffect(() => {
    fetchClaims()
  }, [filter])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Expense Claims Management</h1>
        <p>Submit and manage expense claims</p>
      </header>

      <main className="app-main">
        {summary && <Summary summary={summary} />}

        <section className="form-section">
          <h2>Submit New Claim</h2>
          <ClaimForm onSuccess={handleClaimSubmitted} />
        </section>

        <section className="claims-section">
          <h2>Claims</h2>
          <FilterButtons currentFilter={filter} onFilterChange={handleFilterChange} />

          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading claims...</div>}

          {!loading && claims.length === 0 && !error && (
            <div className="no-claims">No claims found</div>
          )}

          {!loading && claims.length > 0 && (
            <ClaimsList
              claims={claims}
              onStatusChanged={handleClaimStatusChanged}
            />
          )}
        </section>
      </main>
    </div>
  )
}
