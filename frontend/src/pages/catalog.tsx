import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { CONFIG } from 'src/config-global';

import { DashboardContent } from 'src/layouts/dashboard';
import { useNavigate } from 'react-router-dom';
import { useRouter } from 'src/routes/hooks';

import FileUploader from 'src/components/file_upload/file_upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData } from 'src/components/table/table-no-data';
import { UserTableRow } from 'src/components/table/user-table-row';
import { UserTableHead } from 'src/components/table/user-table-head';
import { TableEmptyRows } from 'src/components/table/table-empty-rows';
import { UserTableToolbar } from 'src/components/table/user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from 'src/scripts/catalog_utils';
import type { UserProps } from 'src/components/table/user-table-row';
import axios from 'axios';

export default function Page() {
  const table = useTable();
  const [filterId, setFilterName] = useState('');
  const [cows, setCows] = useState<UserProps[]>([]);
  
  // File input references for Activity Levels and Symptoms
  const activityUploaderRef = useRef<HTMLInputElement>(null);
  const symptomsUploaderRef = useRef<HTMLInputElement>(null);

  const handleUploadComplete = (response: any) => {
    console.log("Upload response:", response);
  };

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/catalog');
        console.log('Fetched Data:', response.data);
        setCows(response.data);
      } catch (error) {
        console.error('Error fetching cows:', error);
      }
    };
    fetchCows();
  }, []);

  const navigate = useNavigate();
  const router = useRouter();

  const handleAddCow = useCallback(() => {
    router.push('/add-cow');
  }, [router]);

  const handleDeleteCow = (id: string) => {
    setCows((prevCows) => prevCows.filter(cow => cow.Id !== id));
  };

  const dataFiltered: UserProps[] = applyFilter({
    inputData: cows,
    comparator: getComparator(table.order, table.orderBy),
    filterId,
  });

  const notFound = !dataFiltered.length && !!filterId;

  return (
    <>
      <Helmet>
        <title>{`Cow Catalog - ${CONFIG.appName}`}</title>
      </Helmet>

      <DashboardContent>
        <Box display="flex" alignItems="center" mb={5} marginTop={2}>
          <Typography variant="h4" sx={{ color: 'white', flexGrow: 1 }}>
            Cattle Catalogue
          </Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }} // Change button color
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddCow}
          >
            New Cow
          </Button>
          <Button
            variant="contained"
            sx={{ ml: 2 , backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }} 
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => activityUploaderRef.current?.click()}
          >
            Activity Levels
          </Button>
          <Button
            variant="contained"
            sx={{ ml: 2 , backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }} 
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => symptomsUploaderRef.current?.click()}
          >
            Symptoms
          </Button>
        </Box>

        <Card sx={{
          backgroundColor: '#7b8687', // Semi-transparent background
          backdropFilter: 'blur(8px)', // Apply blur effect
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', // Add shadow
          borderRadius: '16px', // Optional: rounded corners
          color: 'white' // Set the default text color to white
        }}>
          <UserTableToolbar
            numSelected={table.selected.length}
            filterId={filterId}
            onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
              setFilterName(event.target.value);
              table.onResetPage();
            }}
          />

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800}}>
                <UserTableHead
                  order={table.order}
                  orderBy={table.orderBy}
                  rowCount={cows.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      cows.map((cow) => cow.Id)
                    )
                  }
                  headLabel={[
                    { id: 'id', label: 'ID', align: 'center', width: 50 },
                    { id: 'breed', label: 'Breed' },
                    { id: 'age', label: 'Age' },
                    { id: 'sex', label: 'Sex', align: 'center' },
                    { id: 'status', label: 'Status', align: 'center', width: 50 },
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <UserTableRow
                        key={row.Id}
                        row={row}
                        selected={table.selected.includes(row.Id)}
                        onSelectRow={() => table.onSelectRow(row.Id)}
                        onDeleteCow={handleDeleteCow}
                        index={index}
                      />
                    ))}

                  <TableEmptyRows
                    height={68}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, cows.length)}
                  />

                  {notFound && <TableNoData searchQuery={filterId} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            component="div"
            page={table.page}
            count={cows.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {/* File Upload Components */}
      <FileUploader
        type="activity"
        onUploadComplete={handleUploadComplete}
        ref={activityUploaderRef}
      />
      <FileUploader
        type="symptoms"
        onUploadComplete={handleUploadComplete}
        ref={symptomsUploaderRef}
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('id');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
