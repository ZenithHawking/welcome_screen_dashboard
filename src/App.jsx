import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { isLoggedIn } from './store/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateWelcomeScreen from './pages/welcomescreen/Create'
import EditWelcomeScreen from './pages/welcomescreen/Edit'
import DataSourcePage from './pages/welcomescreen/DataSource'
import MediaPage from './pages/Media'
import BuilderPage from './pages/welcomescreen/Builder'
import DisplayPage from './pages/Display'

function PrivateRoute({ children }) {
    return isLoggedIn() ? children : <Navigate to="/login" />
}

export default function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="welcomescreen/create" element={<CreateWelcomeScreen />} />
                    <Route path="welcomescreen/:id/edit" element={<EditWelcomeScreen />} />
                    <Route path="welcomescreen/:id/datasource" element={<DataSourcePage />} />
                    <Route path="media" element={<MediaPage />} />

                </Route>
                {/* Builder nằm ngoài Layout vì có UI riêng */}
                <Route path="/welcomescreen/:id/builder" element={
                    <PrivateRoute><BuilderPage /></PrivateRoute>
                } />
                <Route path="/display/:id" element={<DisplayPage />} />
            </Routes>
        </BrowserRouter>
    )
}