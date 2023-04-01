// @mui
import { Theme } from '@mui/material/styles';
import {
  Box,
  Switch,
  SxProps,
  TablePagination,
  FormControlLabel,
  TablePaginationProps,
} from '@mui/material';
//

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  safe?: boolean;
  onChangeSafe?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  safe,
  onChangeSafe,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  sx,
  ...other
}: Props & TablePaginationProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'flex-end',
        ...sx,
      }}
    >
      {onChangeSafe && (
        <FormControlLabel
          label="Safe"
          control={<Switch checked={safe} onChange={onChangeSafe} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
          }}
        />
      )}

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
          }}
        />
      )}
      <Box sx={{ flexGrow: 1 }} />
      <TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" {...other} />
    </Box>
  );
}
