import React, { useState } from 'react'

const API_URL = 'http://localhost:8000'

export default function ClaimForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    employee_name: '',
    expense_type: '',
    amount: '',
    expense_date: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    setApiError(null)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.employee_name.trim()) {
      newErrors.employee_name = 'Employee name is required'
    }

    if (!formData.expense_type.trim()) {
      newErrors.expense_type = 'Expense type is required'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero'
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'Expense date is required'
    } else {
      const selectedDate = new Date(formData.expense_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate > today) {
        newErrors.expense_date = 'Expense date cannot be in the future'
      }
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setApiError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`${API_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to submit claim')
      }

      setSuccessMessage('Claim submitted successfully!')
      setFormData({
        employee_name: '',
        expense_type: '',
        amount: '',
        expense_date: ''
      })
      setErrors({})

      setTimeout(() => {
        setSuccessMessage(null)
        onSuccess()
      }, 1500)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="claim-form" onSubmit={handleSubmit}>
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {apiError && (
        <div className="error-message">{apiError}</div>
      )}

      <div className="form-group">
        <label htmlFor="employee_name">Employee Name</label>
        <input
          type="text"
          id="employee_name"
          name="employee_name"
          value={formData.employee_name}
          onChange={handleChange}
          className={errors.employee_name ? 'input-error' : ''}
          placeholder="Enter employee name"
          disabled={loading}
        />
        {errors.employee_name && (
          <span className="error-text">{errors.employee_name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="expense_type">Expense Type</label>
        <input
          type="text"
          id="expense_type"
          name="expense_type"
          value={formData.expense_type}
          onChange={handleChange}
          className={errors.expense_type ? 'input-error' : ''}
          placeholder="e.g., Travel, Meals, Office Supplies"
          disabled={loading}
        />
        {errors.expense_type && (
          <span className="error-text">{errors.expense_type}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount ($)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className={errors.amount ? 'input-error' : ''}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={loading}
        />
        {errors.amount && (
          <span className="error-text">{errors.amount}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="expense_date">Expense Date</label>
        <input
          type="date"
          id="expense_date"
          name="expense_date"
          value={formData.expense_date}
          onChange={handleChange}
          className={errors.expense_date ? 'input-error' : ''}
          disabled={loading}
        />
        {errors.expense_date && (
          <span className="error-text">{errors.expense_date}</span>
        )}
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Claim'}
      </button>
    </form>
  )
}
