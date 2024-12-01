import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import NavbarExample from './components/ui/Navbar';
import { DataTable } from './components/DataTable';
import './styles/main.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavbarExample />
      <div className="container mt-4">
        <h1>Welcome to miniaturedb</h1>
        <DataTable />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
