import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Applicant,
  Department,
  Employee,
  JobOpening,
  LeaveRequest,
  PayrollRecord,
} from '../types'
import {
  calcNetPay,
  generateId,
  getApplicants,
  getDepartments,
  getEmployees,
  getJobOpenings,
  getLeaveRequests,
  getPayrollRecords,
  seedIfNeeded,
  setApplicants,
  setDepartments,
  setEmployees,
  setJobOpenings,
  setLeaveRequests,
  setPayrollRecords,
} from '../utils/storage'

interface HRContextValue {
  departments: Department[]
  employees: Employee[]
  leaveRequests: LeaveRequest[]
  payrollRecords: PayrollRecord[]
  jobOpenings: JobOpening[]
  applicants: Applicant[]
  addDepartment: (data: Omit<Department, 'id'>) => void
  updateDepartment: (id: string, data: Omit<Department, 'id'>) => void
  deleteDepartment: (id: string) => void
  addEmployee: (data: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, data: Omit<Employee, 'id'>) => void
  deleteEmployee: (id: string) => void
  addLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'status'>) => void
  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => void
  deleteLeaveRequest: (id: string) => void
  addPayrollRecord: (data: Omit<PayrollRecord, 'id' | 'netPay'>) => void
  updatePayrollRecord: (id: string, data: Omit<PayrollRecord, 'id' | 'netPay'>) => void
  updatePayrollStatus: (id: string, status: PayrollRecord['status']) => void
  deletePayrollRecord: (id: string) => void
  generatePayroll: (month: string) => number
  addJobOpening: (data: Omit<JobOpening, 'id'>) => void
  updateJobOpening: (id: string, data: Omit<JobOpening, 'id'>) => void
  deleteJobOpening: (id: string) => void
  addApplicant: (data: Omit<Applicant, 'id'>) => void
  updateApplicant: (id: string, data: Omit<Applicant, 'id'>) => void
  updateApplicantStatus: (id: string, status: Applicant['status']) => void
  deleteApplicant: (id: string) => void
  getDepartmentName: (id: string) => string
  getEmployeeName: (id: string) => string
  getJobTitle: (id: string) => string
}

const HRContext = createContext<HRContextValue | null>(null)

export function HRProvider({ children }: { children: ReactNode }) {
  seedIfNeeded()

  const [departments, setDepartmentsState] = useState<Department[]>(getDepartments)
  const [employees, setEmployeesState] = useState<Employee[]>(getEmployees)
  const [leaveRequests, setLeaveRequestsState] = useState<LeaveRequest[]>(getLeaveRequests)
  const [payrollRecords, setPayrollRecordsState] = useState<PayrollRecord[]>(getPayrollRecords)
  const [jobOpenings, setJobOpeningsState] = useState<JobOpening[]>(getJobOpenings)
  const [applicants, setApplicantsState] = useState<Applicant[]>(getApplicants)

  const persistDepartments = useCallback((next: Department[]) => {
    setDepartmentsState(next)
    setDepartments(next)
  }, [])

  const persistEmployees = useCallback((next: Employee[]) => {
    setEmployeesState(next)
    setEmployees(next)
  }, [])

  const persistLeaveRequests = useCallback((next: LeaveRequest[]) => {
    setLeaveRequestsState(next)
    setLeaveRequests(next)
  }, [])

  const persistPayrollRecords = useCallback((next: PayrollRecord[]) => {
    setPayrollRecordsState(next)
    setPayrollRecords(next)
  }, [])

  const persistJobOpenings = useCallback((next: JobOpening[]) => {
    setJobOpeningsState(next)
    setJobOpenings(next)
  }, [])

  const persistApplicants = useCallback((next: Applicant[]) => {
    setApplicantsState(next)
    setApplicants(next)
  }, [])

  const addDepartment = useCallback(
    (data: Omit<Department, 'id'>) => {
      persistDepartments([...departments, { ...data, id: generateId('dept') }])
    },
    [departments, persistDepartments],
  )

  const updateDepartment = useCallback(
    (id: string, data: Omit<Department, 'id'>) => {
      persistDepartments(departments.map((d) => (d.id === id ? { ...data, id } : d)))
    },
    [departments, persistDepartments],
  )

  const deleteDepartment = useCallback(
    (id: string) => {
      persistDepartments(departments.filter((d) => d.id !== id))
    },
    [departments, persistDepartments],
  )

  const addEmployee = useCallback(
    (data: Omit<Employee, 'id'>) => {
      persistEmployees([...employees, { ...data, id: generateId('emp') }])
    },
    [employees, persistEmployees],
  )

  const updateEmployee = useCallback(
    (id: string, data: Omit<Employee, 'id'>) => {
      persistEmployees(employees.map((e) => (e.id === id ? { ...data, id } : e)))
    },
    [employees, persistEmployees],
  )

  const deleteEmployee = useCallback(
    (id: string) => {
      persistEmployees(employees.filter((e) => e.id !== id))
      persistLeaveRequests(leaveRequests.filter((l) => l.employeeId !== id))
      persistPayrollRecords(payrollRecords.filter((p) => p.employeeId !== id))
    },
    [employees, leaveRequests, payrollRecords, persistEmployees, persistLeaveRequests, persistPayrollRecords],
  )

  const addLeaveRequest = useCallback(
    (data: Omit<LeaveRequest, 'id' | 'status'>) => {
      persistLeaveRequests([
        ...leaveRequests,
        { ...data, id: generateId('leave'), status: 'Pending' },
      ])
    },
    [leaveRequests, persistLeaveRequests],
  )

  const updateLeaveStatus = useCallback(
    (id: string, status: LeaveRequest['status']) => {
      persistLeaveRequests(
        leaveRequests.map((l) => (l.id === id ? { ...l, status } : l)),
      )
    },
    [leaveRequests, persistLeaveRequests],
  )

  const deleteLeaveRequest = useCallback(
    (id: string) => {
      persistLeaveRequests(leaveRequests.filter((l) => l.id !== id))
    },
    [leaveRequests, persistLeaveRequests],
  )

  const addPayrollRecord = useCallback(
    (data: Omit<PayrollRecord, 'id' | 'netPay'>) => {
      const record: PayrollRecord = {
        ...data,
        id: generateId('pay'),
        netPay: calcNetPay(data.baseSalary, data.bonus, data.deductions),
      }
      persistPayrollRecords([...payrollRecords, record])
    },
    [payrollRecords, persistPayrollRecords],
  )

  const updatePayrollRecord = useCallback(
    (id: string, data: Omit<PayrollRecord, 'id' | 'netPay'>) => {
      persistPayrollRecords(
        payrollRecords.map((p) =>
          p.id === id
            ? { ...data, id, netPay: calcNetPay(data.baseSalary, data.bonus, data.deductions) }
            : p,
        ),
      )
    },
    [payrollRecords, persistPayrollRecords],
  )

  const updatePayrollStatus = useCallback(
    (id: string, status: PayrollRecord['status']) => {
      persistPayrollRecords(
        payrollRecords.map((p) => (p.id === id ? { ...p, status } : p)),
      )
    },
    [payrollRecords, persistPayrollRecords],
  )

  const deletePayrollRecord = useCallback(
    (id: string) => {
      persistPayrollRecords(payrollRecords.filter((p) => p.id !== id))
    },
    [payrollRecords, persistPayrollRecords],
  )

  const generatePayroll = useCallback(
    (month: string) => {
      const activeEmployees = employees.filter((e) => e.status !== 'Inactive')
      const existing = new Set(
        payrollRecords.filter((p) => p.month === month).map((p) => p.employeeId),
      )
      const newRecords: PayrollRecord[] = activeEmployees
        .filter((e) => !existing.has(e.id))
        .map((e) => {
          const deductions = Math.round(e.salary * 0.1)
          return {
            id: generateId('pay'),
            employeeId: e.id,
            month,
            baseSalary: e.salary,
            bonus: 0,
            deductions,
            netPay: calcNetPay(e.salary, 0, deductions),
            status: 'Pending' as const,
          }
        })
      if (newRecords.length > 0) {
        persistPayrollRecords([...payrollRecords, ...newRecords])
      }
      return newRecords.length
    },
    [employees, payrollRecords, persistPayrollRecords],
  )

  const addJobOpening = useCallback(
    (data: Omit<JobOpening, 'id'>) => {
      persistJobOpenings([...jobOpenings, { ...data, id: generateId('job') }])
    },
    [jobOpenings, persistJobOpenings],
  )

  const updateJobOpening = useCallback(
    (id: string, data: Omit<JobOpening, 'id'>) => {
      persistJobOpenings(jobOpenings.map((j) => (j.id === id ? { ...data, id } : j)))
    },
    [jobOpenings, persistJobOpenings],
  )

  const deleteJobOpening = useCallback(
    (id: string) => {
      persistJobOpenings(jobOpenings.filter((j) => j.id !== id))
      persistApplicants(applicants.filter((a) => a.jobId !== id))
    },
    [jobOpenings, applicants, persistJobOpenings, persistApplicants],
  )

  const addApplicant = useCallback(
    (data: Omit<Applicant, 'id'>) => {
      persistApplicants([...applicants, { ...data, id: generateId('app') }])
    },
    [applicants, persistApplicants],
  )

  const updateApplicant = useCallback(
    (id: string, data: Omit<Applicant, 'id'>) => {
      persistApplicants(applicants.map((a) => (a.id === id ? { ...data, id } : a)))
    },
    [applicants, persistApplicants],
  )

  const updateApplicantStatus = useCallback(
    (id: string, status: Applicant['status']) => {
      persistApplicants(applicants.map((a) => (a.id === id ? { ...a, status } : a)))
    },
    [applicants, persistApplicants],
  )

  const deleteApplicant = useCallback(
    (id: string) => {
      persistApplicants(applicants.filter((a) => a.id !== id))
    },
    [applicants, persistApplicants],
  )

  const getDepartmentName = useCallback(
    (id: string) => departments.find((d) => d.id === id)?.name ?? 'Unknown',
    [departments],
  )

  const getEmployeeName = useCallback(
    (id: string) => {
      const emp = employees.find((e) => e.id === id)
      return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
    },
    [employees],
  )

  const getJobTitle = useCallback(
    (id: string) => jobOpenings.find((j) => j.id === id)?.title ?? 'Unknown',
    [jobOpenings],
  )

  const value = useMemo(
    () => ({
      departments,
      employees,
      leaveRequests,
      payrollRecords,
      jobOpenings,
      applicants,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLeaveRequest,
      updateLeaveStatus,
      deleteLeaveRequest,
      addPayrollRecord,
      updatePayrollRecord,
      updatePayrollStatus,
      deletePayrollRecord,
      generatePayroll,
      addJobOpening,
      updateJobOpening,
      deleteJobOpening,
      addApplicant,
      updateApplicant,
      updateApplicantStatus,
      deleteApplicant,
      getDepartmentName,
      getEmployeeName,
      getJobTitle,
    }),
    [
      departments,
      employees,
      leaveRequests,
      payrollRecords,
      jobOpenings,
      applicants,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLeaveRequest,
      updateLeaveStatus,
      deleteLeaveRequest,
      addPayrollRecord,
      updatePayrollRecord,
      updatePayrollStatus,
      deletePayrollRecord,
      generatePayroll,
      addJobOpening,
      updateJobOpening,
      deleteJobOpening,
      addApplicant,
      updateApplicant,
      updateApplicantStatus,
      deleteApplicant,
      getDepartmentName,
      getEmployeeName,
      getJobTitle,
    ],
  )

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>
}

export function useHR() {
  const ctx = useContext(HRContext)
  if (!ctx) throw new Error('useHR must be used within HRProvider')
  return ctx
}
