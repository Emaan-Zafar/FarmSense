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
import axios from 'axios';

export type UserProps = {
  Id: string;
  Breed: string;
  Sex: string;
  Age: string;
  Weight: number;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteCow: (id: string) => void;
  index: number;
};

export function UserTableRow({ row, selected, onSelectRow, onDeleteCow, index }: UserTableRowProps) {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getAvatar = (avatarIndex: number) => { // Renamed 'index' to 'avatarIndex'
    const adjustedIndex = (avatarIndex % 4) + 1; // Cycles through 1 to 4
    const avatarExtension = adjustedIndex === 2 ? 'webp' : 'jpg'; // 'avatar-2' is a .webp, others are .jpg
    return `/assets/images/avatar/avatar-${adjustedIndex}.${avatarExtension}`;
  };

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
 
  // confirm delete
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/catalog/${row.Id}`); // Your delete API endpoint
      
      // If the delete was successful, call the passed onDeleteCow function to update the state
      onDeleteCow(row.Id); 
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting cow:', error); // Log error for debugging
    }
  };
  
  const handleViewCowDetails = useCallback(() => {
    navigate(`/cow-details/${row.Id}`, { state: { cowData: row } });
  }, [navigate, row]);

  const healthStatus = row.Weight > 200 ? 'healthy' : 'unhealthy';

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        {/* Only this TableCell will handle the cow details navigation */}
        <TableCell component="th" scope="row" onClick={handleViewCowDetails} sx={{ cursor: 'pointer' }}>
          <Box gap={2} display="flex" alignItems="center" paddingLeft={5} paddingRight={10}>
          <Avatar alt={row.Id} src={getAvatar(index)} /> 
            {row.Id}
          </Box>
        </TableCell>

        <TableCell>{row.Breed}</TableCell>
        <TableCell>{row.Age}</TableCell>
        <TableCell align="center">{row.Sex}</TableCell>
        <TableCell sx={{ paddingLeft: 5 }}>
        <Label color={healthStatus === 'unhealthy' ? 'error' : 'success'}>{healthStatus}</Label>
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
