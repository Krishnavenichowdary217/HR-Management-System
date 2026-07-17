import { useState, type FormEvent } from 'react'
import { useHR } from '../context/HRContext'
import { Modal } from '../components/Modal'
import type { Department } from '../types'

const emptyForm = { name: '', description: '' }

export function Departments() {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useHR()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (dept: Department) => {
    setEditing(dept)
    setForm({ name: dept.name, description: dept.description })
    setModalOpen(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      updateDepartment(editing.id, form)
    } else {
      addDepartment(form)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    const count = employees.filter((e) => e.departmentId === id).length
    if (count > 0) {
      alert(`Cannot delete "${name}" — ${count} employee(s) are assigned to this department.`)
      return
    }
    if (window.confirm(`Delete department "${name}"?`)) {
      deleteDepartment(id)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Departments</h1>
          <p className="page-subtitle">Organize teams and divisions</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          + Add Department
        </button>
      </header>

      <div className="dept-grid">
        {departments.length === 0 ? (
          <p className="empty-text">No departments yet. Create your first one.</p>
        ) : (
          departments.map((dept) => {
            const count = employees.filter((e) => e.departmentId === dept.id).length
            return (
              <div key={dept.id} className="dept-card">
                <div className="dept-card-icon">🏢</div>
                <h3>{dept.name}</h3>
                <p className="dept-desc">{dept.description || 'No description'}</p>
                <p className="dept-meta">{count} employee{count !== 1 ? 's' : ''}</p>
                <div className="dept-card-actions">
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEdit(dept)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(dept.id, dept.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Department' : 'Add Department'}
        onClose={() => setModalOpen(false)}
      >
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Department Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Engineering"
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the department"
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Save Changes' : 'Add Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
