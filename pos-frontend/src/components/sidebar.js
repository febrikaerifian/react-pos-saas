import React from 'react';
import { Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Products', path: '/products' },
    { text: 'Transactions', path: '/transactions' },
  ];

  if (user?.role === 'owner') {
    menuItems.push({ text: 'Branches', path: '/branches' });
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' }
      }}
    >
      <List>
        {menuItems.map((item, index) => (
          <ListItemButton key={index} onClick={() => navigate(item.path)}>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;