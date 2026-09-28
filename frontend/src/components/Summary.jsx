import React from 'react'

export default function Summary({ summary }) {
  if (!summary) return null

  return (
    <div className="summary-container">
      <div className="summary-title">Claims Summary</div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Claims</div>
          <div className="summary-value">{summary.total_count}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Approved Amount</div>
          <div className="summary-value">${summary.total_approved_amount.toFixed(2)}</div>
        </div>
        <div className="summary-card status-pending">
          <div className="summary-label">Pending</div>
          <div className="summary-value">{summary.pending_count}</div>
        </div>
        <div className="summary-card status-approved">
          <div className="summary-label">Approved</div>
          <div className="summary-value">{summary.approved_count}</div>
        </div>
        <div className="summary-card status-rejected">
          <div className="summary-label">Rejected</div>
          <div className="summary-value">{summary.rejected_count}</div>
        </div>
      </div>
    </div>
  )
}
