import React from 'react'
import ClaimRow from './ClaimRow'

export default function ClaimsList({ claims, onStatusChanged }) {
  return (
    <div className="claims-list-container">
      <table className="claims-table">
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Employee Name</th>
            <th>Expense Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(claim => (
            <ClaimRow
              key={claim.id}
              claim={claim}
              onStatusChanged={onStatusChanged}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
