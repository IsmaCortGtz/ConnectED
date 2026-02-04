import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { store } from './store/store'
import { Provider } from 'react-redux'
import App from './App'
import './index.scss'
import './theme.scss'
import { AlertProvider } from './components/Alert'
import { ModalProvider } from './components/Modal'
import axios from "axios"

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ModalProvider>
        <AlertProvider>
            <App />
        </AlertProvider>
      </ModalProvider>
    </Provider>
  </StrictMode>
)
