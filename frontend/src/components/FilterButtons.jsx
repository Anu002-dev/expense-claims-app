import React from 'react'

export default function FilterButtons({ currentFilter, onFilterChange }) {
  const filters = [
    { value: null, label: 'All Claims' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ]

  return (
    <div className="filter-buttons">
      {filters.map(filter => (
        <button
          key={filter.value || 'all'}
          className={`filter-btn ${currentFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
