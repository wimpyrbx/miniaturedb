import { Table } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

interface DataItem {
  id: number;
  [key: string]: any;
}

export function DataTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const { data } = await api.get('/data');
      return data as DataItem[];
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{JSON.stringify(item)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
