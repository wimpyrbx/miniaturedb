/**
 * @file ProductModal.tsx
 * @description Reusable modal for adding/editing companies, product lines, and sets
 */

import { Modal, TextInput, Button, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';

type EntityType = 'company' | 'line' | 'set';

interface ProductModalProps {
  type: EntityType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  parentId?: number; // company_id for lines, product_line_id for sets
}

export function ProductModal({ type, isOpen, onClose, onSubmit, initialData, parentId }: ProductModalProps) {
  console.log('ProductModal render:', { type, isOpen, initialData, parentId });
  
  const [name, setName] = useState(initialData?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when initialData changes or modal opens/closes
  useEffect(() => {
    console.log('ProductModal useEffect - isOpen changed:', isOpen);
    if (isOpen) {
      setName(initialData?.name || '');
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    console.log('ProductModal handleClose');
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ProductModal handleSubmit:', { name, type, parentId });
    setIsLoading(true);

    try {
      const data = {
        name,
        ...(type === 'line' && { company_id: parentId }),
        ...(type === 'set' && { product_line_id: parentId })
      };

      await onSubmit(data);
      handleClose();
    } catch (error) {
      console.error('ProductModal submit error:', error);
      setIsLoading(false);
    }
  };

  const titles = {
    company: initialData ? 'Edit Company' : 'Add Company',
    line: initialData ? 'Edit Product Line' : 'Add Product Line',
    set: initialData ? 'Edit Product Set' : 'Add Product Set'
  };

  return (
    <Modal 
      opened={isOpen} 
      onClose={handleClose}
      title={titles[type]}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${type} name`}
            required
            data-autofocus
          />

          <Button 
            type="submit" 
            loading={isLoading}
            fullWidth
          >
            {initialData ? 'Save Changes' : 'Add'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
} 