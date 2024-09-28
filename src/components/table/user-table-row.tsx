import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export type UserProps = {
  id: string;
  breed: string;
  sex: string;
  age: string;
  avatarUrl: string;
  status: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteCow: (id: string) => void;
};

export function UserTableRow({ row, selected, onSelectRow, onDeleteCow }: UserTableRowProps) {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditCow = useCallback(() => {
    navigate('/edit-cow', { state: { cowData: row } });
  }, [navigate, row]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent row click from firing
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Open the delete dialog
  const handleOpenDeleteDialog = () => {
    handleClosePopover(); // Close the popover
    setOpenDialog(true);
  };

  // Close the delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDialog(false);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    onDeleteCow(row.id); // Call the delete function passed from the parent
    handleCloseDeleteDialog();
  };

  const handleViewCowDetails = useCallback(() => {
    navigate(`/cow-details/${row.id}`, { state: { cowData: row } });
  }, [navigate, row]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        {/* Only this TableCell will handle the cow details navigation */}
        <TableCell component="th" scope="row" onClick={handleViewCowDetails} sx={{ cursor: 'pointer' }}>
          <Box gap={2} display="flex" alignItems="center" paddingLeft={5} paddingRight={10}>
            <Avatar alt={row.id} src={row.avatarUrl} />
            {row.id}
          </Box>
        </TableCell>

        <TableCell>{row.breed}</TableCell>
        <TableCell>{row.age}</TableCell>
        <TableCell align="center">{row.sex}</TableCell>
        <TableCell sx={{ paddingLeft: 5 }}>
          <Label color={row.status === 'underweight' ? 'error' : 'success'}>{row.status}</Label>
        </TableCell>

        <TableCell align="right">
          {/* Prevent row click from firing when interacting with the popover */}
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={() => { handleEditCow(); handleClosePopover(); }}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this cow? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
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
