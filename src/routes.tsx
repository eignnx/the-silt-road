import { createBrowserRouter } from 'react-router-dom';
import InventoryEditor, { loader as inventoryEditorLoader, action as inventoryEditorAction } from './routes/InventoryEditor';
import ErrorPage from './routes/ErrorPage';
import MainMenu from './routes/MainMenu';
import Dashboard, { dashboardLoader } from './routes/Dashboard';
import MarketView, { marketViewAction, marketViewLoader } from './routes/MarketView';
import CaravanEditor, { caravanEditorAction, caravanEditorLoader } from './routes/CaravanEditor';
import EmployeesView, { employeesViewAction, employeesViewLoader } from './routes/EmployeesView';
import MapView, { mapViewAction, mapViewLoader } from './routes/MapView';
import WagonShopPage, { wagonShopAction, wagonShopLoader } from './routes/WagonShop';

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
        loader: dashboardLoader,
        children: [
            {
                path: "market",
                element: <MarketView />,
                loader: marketViewLoader,
                action: marketViewAction,
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
            {
                path: "employees",
                element: <EmployeesView />,
                loader: employeesViewLoader,
                action: employeesViewAction,
            },
            {
                path: "map",
                element: <MapView />,
                loader: mapViewLoader,
                action: mapViewAction,
            },
            {
                path: "wagon-shop",
                element: <WagonShopPage />,
                loader: wagonShopLoader,
                action: wagonShopAction,
            },
        ]
    },
]);