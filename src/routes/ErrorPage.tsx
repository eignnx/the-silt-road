import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError() as any;
    console.error(error);

    return (
        <div>
            <h1>Error</h1>
            <p>We encountered an unhandled error.</p>
            <details>
                <summary>Details</summary>
                <pre>{error.statusText}</pre>
                <pre>{error.message}</pre>
                <pre>{error.stack}</pre>
            </details>
        </div>
    );
}