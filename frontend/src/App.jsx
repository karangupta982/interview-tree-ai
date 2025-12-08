import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx"
import {Routes, Route} from "react-router-dom"
import {Layout} from "./layout/Layout.jsx"
import {AuthenticationPage} from "./auth/AuthenticationPage.jsx";
import { TopicExplorer } from "./challenge/TopicExplorer.jsx"
import HomePage from "./components/homepage.jsx";
import './App.css'

function App() {
    return <ClerkProviderWithRoutes>
        <Routes>
            <Route path="/sign-in/*" element={<AuthenticationPage />} />
            <Route path="/sign-up" element={<AuthenticationPage />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
            </Route>
                <Route path="/explore" element={<TopicExplorer />} />
        </Routes>
    </ClerkProviderWithRoutes>
}

export default App
