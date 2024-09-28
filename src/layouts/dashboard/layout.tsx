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
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
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
                <NavMobile
                  data={navData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                />
              </>
            ),
            rightArea: (
              <Box gap={1} display="flex" alignItems="center">
                <Searchbar />
                {/* <LanguagePopover data={_langs} /> */}
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
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop 
        data={navData} 
        layoutQuery={layoutQuery} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.3)', // Add your background color here
          color: theme.palette.success.contrastText, // Text color for better contrast
          height: '100vh', // Ensure the sidebar spans the full height
          padding: theme.spacing(2), // Optional: Add some padding
          backdropFilter: 'blur(10px)'
        }} 
      />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: 'var(--layout-nav-vertical-width)',
          },
        },
        ...sx,
        backgroundImage: `url('/assets/background/overlay7.jpg')`, // Add the path to your background image here
        backgroundSize: 'cover', // Ensure the image covers the entire dashboard
        backgroundPosition: 'center', // Center the background image
        backgroundRepeat: 'no-repeat', // Avoid repetition of the image
      }}
    >
      <Main>{children}</Main>
    </LayoutSection>
  );
}
