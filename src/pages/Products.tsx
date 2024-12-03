import { Stack, Title, Text } from '@mantine/core';
import { DataTable } from '../components/ui/table/DataTable';
import { Table } from '@mantine/core';

const Products = () => {
  // Example usage in your component:
  const columns = [
    { key: 'name', label: 'Name', filterable: true },
    { key: 'location', label: 'Location', filterable: true },
    { key: 'actions', label: '' }
  ];

  const renderRow = (item: Mini) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.location}</Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <TableActions
            elementType="icon"
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Stack p="md">
      <Title>Products</Title>
      <Text>Coming soon</Text>
      <DataTable
        data={minis}
        columns={columns}
        rowComponent={renderRow}
        withPagination
        withFiltering
        pageSize={15}
      />
    </Stack>
  );
};

export default Products; 