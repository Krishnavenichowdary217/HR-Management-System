import { useMemo, useState, type FormEvent } from 'react'
import { useHR } from '../context/HRContext'
import { Modal } from '../components/Modal'
import type { PayrollRecord } from '../types'

const currentMonth = new Date().toISOString().slice(0, 7)

const emptyForm = {
  employeeId: '',
  month: currentMonth,
  baseSalary: '',
  bonus: '0',
  deductions: '0',
  status: 'Pending' as PayrollRecord['status'],
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function Payroll() {
  const {
    payrollRecords,
    employees,
    addPayrollRecord,
    updatePayrollRecord,
    updatePayrollStatus,
    deletePayrollRecord,
    generatePayroll,
    getEmployeeName,
  } = useHR()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PayrollRecord | null>(null)
  const [form, setForm] = useState(emptyForm)

  const months = useMemo(() => {
    const set = new Set(payrollRecords.map((p) => p.month))
    set.add(currentMonth)
    return [...set].sort().reverse()
  }, [payrollRecords])

  const filtered = payrollRecords.filter((p) => p.month === selectedMonth)

  const totalNet = filtered.reduce((sum, p) => sum + p.netPay, 0)
  const paidCount = filtered.filter((p) => p.status === 'Paid').length
  const pendingCount = filtered.filter((p) => p.status === 'Pending').length

  const openAdd = () => {
    const emp = employees.find((e) => e.status !== 'Inactive')
    setEditing(null)
    setForm({
      ...emptyForm,
      month: selectedMonth,
      employeeId: emp?.id ?? '',
      baseSalary: emp ? String(emp.salary) : '',
      deductions: emp ? String(Math.round(emp.salary * 0.1)) : '0',
    })
    setModalOpen(true)
  }

  const openEdit = (record: PayrollRecord) => {
    setEditing(record)
    setForm({
      employeeId: record.employeeId,
      month: record.month,
      baseSalary: String(record.baseSalary),
      bonus: String(record.bonus),
      deductions: String(record.deductions),
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const data = {
      employeeId: form.employeeId,
      month: form.month,
      baseSalary: Number(form.baseSalary),
      bonus: Number(form.bonus),
      deductions: Number(form.deductions),
      status: form.status,
    }
    if (editing) {
      updatePayrollRecord(editing.id, data)
    } else {
      addPayrollRecord(data)
    }
    setModalOpen(false)
  }

  const handleGenerate = () => {
    const count = generatePayroll(selectedMonth)
    if (count === 0) {
      alert('All active employees already have payroll records for this month.')
    }
  }

  const handleMarkAllPaid = () => {
    filtered
      .filter((p) => p.status === 'Pending')
      .forEach((p) => updatePayrollStatus(p.id, 'Paid'))
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete payroll record for "${name}"?`)) {
      deletePayrollRecord(id)
    }
  }

  const netPreview =
    Number(form.baseSalary || 0) + Number(form.bonus || 0) - Number(form.deductions || 0)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Payroll</h1>
          <p className="page-subtitle">Manage employee salaries and payments</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost" onClick={handleGenerate}>
            Generate Payroll
          </button>
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            + Add Record
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="filter-tabs">
          {months.map((month) => (
            <button
              key={month}
              type="button"
              className={`filter-tab ${selectedMonth === month ? 'active' : ''}`}
              onClick={() => setSelectedMonth(month)}
            >
              {formatMonth(month)}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-teal">
          <span className="stat-icon">💰</span>
          <div>
            <p className="stat-label">Total Payout</p>
            <p className="stat-value">${totalNet.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-icon">✅</span>
          <div>
            <p className="stat-label">Paid</p>
            <p className="stat-value">{paidCount}</p>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <span className="stat-icon">⏳</span>
          <div>
            <p className="stat-label">Pending</p>
            <p className="stat-value">{pendingCount}</p>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <span className="stat-icon">👥</span>
          <div>
            <p className="stat-label">Records</p>
            <p className="stat-value">{filtered.length}</p>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="toolbar">
          <button type="button" className="btn btn-success" onClick={handleMarkAllPaid}>
            Mark All as Paid ({pendingCount})
          </button>
        </div>
      )}

      <div className="card">
        {filtered.length === 0 ? (
          <p className="empty-text">
            No payroll records for {formatMonth(selectedMonth)}. Click &quot;Generate Payroll&quot; to
            create records for active employees.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{getEmployeeName(record.employeeId)}</strong>
                    </td>
                    <td>${record.baseSalary.toLocaleString()}</td>
                    <td>${record.bonus.toLocaleString()}</td>
                    <td>${record.deductions.toLocaleString()}</td>
                    <td>
                      <strong>${record.netPay.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`badge badge-${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {record.status === 'Pending' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => updatePayrollStatus(record.id, 'Paid')}
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => openEdit(record)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(record.id, getEmployeeName(record.employeeId))
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Payroll Record' : 'Add Payroll Record'}
        onClose={() => setModalOpen(false)}
      >
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Employee
            <select
              required
              value={form.employeeId}
              onChange={(e) => {
                const emp = employees.find((em) => em.id === e.target.value)
                setForm({
                  ...form,
                  employeeId: e.target.value,
                  baseSalary: emp ? String(emp.salary) : form.baseSalary,
                  deductions: emp ? String(Math.round(emp.salary * 0.1)) : form.deductions,
                })
              }}
            >
              {employees
                .filter((e) => e.status !== 'Inactive')
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Month
            <input
              type="month"
              required
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label>
              Base Salary ($)
              <input
                type="number"
                required
                min={0}
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              />
            </label>
            <label>
              Bonus ($)
              <input
                type="number"
                min={0}
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Deductions ($)
              <input
                type="number"
                min={0}
                value={form.deductions}
                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as PayrollRecord['status'] })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </label>
          </div>
          <p className="net-preview">
            Net Pay: <strong>${netPreview.toLocaleString()}</strong>
          </p>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
