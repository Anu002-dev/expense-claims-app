import React, { useState } from 'react'

const API_URL = 'http://localhost:8000'

export default function ClaimRow({ claim, onStatusChanged }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/claims/${claim.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to update claim')
      }

      onStatusChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isPending = claim.status === 'Pending'
  const statusClass = `status-${claim.status.toLowerCase()}`

  return (
    <tr className="claim-row">
      <td className="claim-id">{claim.id}</td>
      <td>{claim.employee_name}</td>
      <td>{claim.expense_type}</td>
      <td className="amount">${claim.amount.toFixed(2)}</td>
      <td>{claim.expense_date}</td>
      <td>
        <span className={`status-badge ${statusClass}`}>
          {claim.status}
        </span>
      </td>
      <td className="actions-cell">
        {isPending ? (
          <div className="action-buttons">
            <button
              className="btn-approve"
              onClick={() => handleStatusUpdate('Approved')}
              disabled={loading}
              title="Approve this claim"
            >
              {loading ? '...' : 'Approve'}
            </button>
            <button
              className="btn-reject"
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={loading}
              title="Reject this claim"
            >
              {loading ? '...' : 'Reject'}
            </button>
          </div>
        ) : (
          <span className="action-disabled">No actions available</span>
        )}
        {error && <div className="row-error">{error}</div>}
      </td>
    </tr>
  )
}
