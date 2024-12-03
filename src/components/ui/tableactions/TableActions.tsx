/**
 * @file TableActions.tsx
 * @description Reusable table action buttons (edit/delete) with consistent styling and behavior
 */

import { Group, Button, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import type { MantineColor } from '@mantine/core';

type ElementType = 'button' | 'icon';

interface TableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  canDelete?: boolean;
  deleteTooltip?: string;
  size?: 'xs' | 'sm' | 'md';
  elementType?: ElementType;
  editIcon?: Icon;
  deleteIcon?: Icon;
  deleteColor?: MantineColor;
}

export function TableActions({ 
  onEdit,
  onDelete,
  canDelete = true,
  deleteTooltip,
  size = 'xs',
  elementType = 'button',
  editIcon: EditIcon = IconEdit,
  deleteIcon: DeleteIcon = IconTrash,
  deleteColor = 'red.6'
}: TableActionsProps) {
  const iconSize = size === 'xs' ? 16 : size === 'sm' ? 18 : 20;

  const deleteButton = elementType === 'icon' ? (
    <ActionIcon 
      variant="light"
      size={size}
      color={deleteColor}
      onClick={canDelete ? onDelete : undefined}
      disabled={!canDelete}
      title={!canDelete ? deleteTooltip : "Delete item"}
      style={!canDelete ? { opacity: 0.5 } : undefined}
    >
      <DeleteIcon size={iconSize} />
    </ActionIcon>
  ) : (
    <Button 
      variant="light"
      size={size}
      color={deleteColor}
      onClick={canDelete ? onDelete : undefined}
      disabled={!canDelete}
      title={!canDelete ? deleteTooltip : "Delete item"}
      leftSection={<DeleteIcon size={iconSize} />}
      style={!canDelete ? { opacity: 0.5 } : undefined}
    >
      Delete
    </Button>
  );

  if (elementType === 'icon') {
    return (
      <Group gap="xs">
        <ActionIcon 
          variant="light"
          size={size}
          onClick={onEdit}
          title="Edit item"
        >
          <EditIcon size={iconSize} />
        </ActionIcon>
        {!canDelete && deleteTooltip ? (
          <Tooltip label={deleteTooltip}>
            {deleteButton}
          </Tooltip>
        ) : deleteButton}
      </Group>
    );
  }

  return (
    <Group gap="xs">
      <Button 
        variant="light"
        size={size}
        onClick={onEdit}
        leftSection={<EditIcon size={iconSize} />}
      >
        Edit
      </Button>
      {!canDelete && deleteTooltip ? (
        <Tooltip label={deleteTooltip}>
          {deleteButton}
        </Tooltip>
      ) : deleteButton}
    </Group>
  );
} 