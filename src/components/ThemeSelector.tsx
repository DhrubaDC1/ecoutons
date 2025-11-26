import React from 'react';
import { Menu, MenuItem, IconButton, Tooltip, Typography } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import CircleIcon from '@mui/icons-material/Circle';
import { useAppTheme } from '../context/ThemeContext';
import { themeColors, type ThemeColor } from '../theme';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useAppTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (color: ThemeColor) => {
    setTheme(color);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change Theme">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <PaletteIcon sx={{ color: 'text.secondary' }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="theme-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            bgcolor: 'background.paper',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {Object.entries(themeColors).map(([name, { primary }]) => (
          <MenuItem key={name} onClick={() => handleThemeChange(name as ThemeColor)}>
            <CircleIcon sx={{ color: name === 'Dynamic' ? 'white' : primary, mr: 2, fontSize: 20 }} />
            <Typography variant="body2" fontWeight={currentTheme === name ? 'bold' : 'normal'}>
              {name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeSelector;
