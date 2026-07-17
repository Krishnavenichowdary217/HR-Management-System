import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HRProvider } from './context/HRContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Employees } from './pages/Employees'
import { Departments } from './pages/Departments'
import { LeaveRequests } from './pages/LeaveRequests'
import { Payroll } from './pages/Payroll'
import { Recruitment } from './pages/Recruitment'

export default function App() {
  return (
    <HRProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="leave" element={<LeaveRequests />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HRProvider>
  )
}
