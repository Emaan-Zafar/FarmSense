import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTheme } from '@mui/material/styles';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    name: string;
  }[];
};

export function AnalyticsTasks({ title, subheader, list, ...other }: Props) {
  const theme = useTheme();
  const [selected, setSelected] = useState(['2']);
  const [tasks, setTasks] = useState(list);

  const handleClickComplete = (taskId: string) => {
    const tasksCompleted = selected.includes(taskId)
      ? selected.filter((value) => value !== taskId)
      : [...selected, taskId];
    setSelected(tasksCompleted);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const handleEditTask = (taskId: string, newName: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, name: newName } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <Card
      {...other}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: '#233a4a',
        boxShadow: theme.shadows[10],
        borderRadius: '16px',
        color: '#FFFFFF',
      }}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        titleTypographyProps={{ sx: { color: '#FFFFFF' } }}
        subheaderTypographyProps={{ sx: { color: '#FFFFFF' } }}
        sx={{ mb: 1 }}
      />

      <Scrollbar sx={{ minHeight: 304 }}>
        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />} sx={{ minWidth: 560 }}>
          {tasks.map((item) => (
            <Item
              key={item.id}
              item={item}
              checked={selected.includes(item.id)}
              onChange={() => handleClickComplete(item.id)}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ItemProps = BoxProps & {
  checked: boolean;
  item: Props['list'][number];
  onChange: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
};

function Item({ item, checked, onChange, onDelete, onEdit, sx, ...other }: ItemProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkComplete = useCallback(() => {
    onChange(item.id); // Toggle completion state
    handleClosePopover();
  }, [handleClosePopover, item.id, onChange]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    handleClosePopover();
  }, [handleClosePopover]);

  const handleSaveEdit = () => {
    onEdit(item.id, editedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(item.name);
    setIsEditing(false);
  };

  const handleDelete = useCallback(() => {
    setOpenDialog(true);
    handleClosePopover();
  }, [handleClosePopover]);

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setOpenDialog(false);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Box
        sx={{
          pl: 2,
          pr: 1,
          py: 1.5,
          display: 'flex',
          color: checked ? 'text.disabled' : '#FFFFFF',
          textDecoration: checked ? 'line-through' : 'none',
          ...sx,
        }}
        {...other}
      >
        {isEditing ? (
          <TextField
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            variant="outlined"
            size="small"
            autoFocus
            fullWidth
            sx={{
              m: 0,
              flexGrow: 1,
              color: '#FFFFFF',
              input: { color: '#FFFFFF' },
            }}
          />
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                disableRipple
                checked={checked}
                onChange={onChange}
                inputProps={{
                  name: item.name,
                  'aria-label': 'Checkbox demo',
                }}
              />
            }
            label={item.name}
            sx={{ m: 0, flexGrow: 1, color: '#FFFFFF' }}
          />
        )}

        {isEditing ? (
          <IconButton onClick={handleSaveEdit} sx={{ ml: 2, color: '#FFFFFF' }}>
            <Iconify icon="solar:check-circle-bold" />
          </IconButton>
        ) : (
          <IconButton
            color={openPopover ? 'inherit' : 'default'}
            onClick={handleOpenPopover}
            sx={{ alignSelf: 'flex-start' }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        )}
      </Box>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              pl: 1,
              pr: 2,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleMarkComplete}>
            <Iconify icon="solar:check-circle-bold" />
            Mark complete
          </MenuItem>

          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      <Dialog open={openDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this task?</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
