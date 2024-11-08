import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { _langs, _notifications } from 'src/_mock';

import { Iconify } from 'src/components/iconify';

import { NavMobile, NavDesktop } from 'src/components/navbar/nav';
import { navData } from 'src/components/navbar/config-nav-dashboard';
import { Main } from './main';
import { layoutClasses } from '../classes';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AccountPopover } from '../components/account-popover';
import { NotificationsPopover } from '../components/notifications-popover';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();

  const [navOpen, setNavOpen] = useState(false);

  const layoutQuery: Breakpoint = 'lg';

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', color: '#FFFFFF' }}> {/* Ensures font color is white globally */}
      {/* Sidebar */}
      <NavDesktop
        data={navData}
        layoutQuery={layoutQuery}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '100vh',
          background: '#122333',
          color: '#FFFFFF', // Set text color to white in the sidebar
          overflow: 'hidden',
          padding: theme.spacing(2),
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* Main Content Wrapper */}
      <Box
        sx={{
          marginLeft: '300px', // Offset for sidebar
          width: 'calc(100% - 300px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevents the whole page from scrolling
        }}
      >
        {/* Header */}
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={{
            position: 'fixed',
            top: 0,
            width: 'calc(100% - 300px)', // Adjust width to exclude sidebar
            zIndex: 1,
            background: '#122333',
            color: '#FFFFFF', // Ensures text in header is white
            padding: theme.spacing(2),
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
          }}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0, color: '#FFFFFF' }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile data={navData} open={navOpen} onClose={() => setNavOpen(false)} />
              </>
            ),
            rightArea: (
              <Box gap={1} display="flex" alignItems="center">
                <Searchbar />
                <NotificationsPopover data={_notifications} />
                <AccountPopover
                  data={[
                    {
                      label: 'Home',
                      href: '/',
                      icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
                    },
                    {
                      label: 'Profile',
                      href: '#',
                      icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
                    },
                    {
                      label: 'Settings',
                      href: '#',
                      icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
                    },
                  ]}
                />
              </Box>
            ),
          }}
        />

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            marginTop: '64px', // Offset for header height
            padding: theme.spacing(3),
            overflowY: 'auto', // Enable scrolling for content only
            height: 'calc(100vh - 64px)', // Full height minus header height
            background: '#122333',
            color: '#FFFFFF', // Ensures main content text is white
          }}
        >
          <Main>{children}</Main>
        </Box>
      </Box>
    </Box>
  );
}
