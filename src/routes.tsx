import { createBrowserRouter } from 'react-router-dom';
import InventoryEditor, { loader as inventoryEditorLoader, action as inventoryEditorAction } from './routes/InventoryEditor';
import ErrorPage from './routes/ErrorPage';
import MainMenu from './routes/MainMenu';
import Dashboard from './routes/Dashboard';
import MarketView from './routes/MarketView';
import CaravanEditor, { caravanEditorAction, caravanEditorLoader } from './routes/CaravanEditor';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainMenu />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/game",
        element: <Dashboard />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "market",
                element: <MarketView />,
            },
            {
                path: "cargo",
                element: <InventoryEditor />,
                loader: inventoryEditorLoader,
                action: inventoryEditorAction,
            },
            {
                path: "caravan",
                element: <CaravanEditor />,
                loader: caravanEditorLoader,
                action: caravanEditorAction,
            },
        ]
    },
]);