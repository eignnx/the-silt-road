import { createBrowserRouter } from 'react-router-dom';
import InventoryEditor, { loader as rootLoader, action as rootAction } from './routes/InventoryEditor';
import ErrorPage from './routes/ErrorPage';
import MainMenu from './routes/MainMenu';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainMenu />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/inventory",
        element: <InventoryEditor />,
        errorElement: <ErrorPage />,
        loader: rootLoader,
        action: rootAction,
    },
]);